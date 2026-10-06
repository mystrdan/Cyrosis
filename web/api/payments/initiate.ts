import { getSupabaseAdmin } from "../_lib/supabaseAdmin";

type RequestLike = { method?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown };
type ResponseLike = { status: (code: number) => { json: (body: unknown) => void } };
const PROVIDERS = new Set(["mtn", "atl", "vod"]);
function bearer(req: RequestLike) { const value = req.headers?.authorization ?? req.headers?.Authorization; return Array.isArray(value) ? value[0] : value; }
function normalizePhone(value: string) { const digits = value.replace(/\D/g, ""); if (digits.startsWith("233") && digits.length === 12) return "0" + digits.slice(3); return digits; }
function annualPrice(daily: number) { return Number((daily * 365 * 0.75).toFixed(2)); }
async function paystackCharge(email: string, amountGhs: number, phone: string, provider: string, reference: string) {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) throw new Error("MoMo payments are not configured yet.");
  const response = await fetch("https://api.paystack.co/charge", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: Math.round(amountGhs * 100), currency: "GHS", reference, mobile_money: { phone, provider }, metadata: { cyro_reference: reference } }),
  });
  const data = await response.json() as { status?: boolean; message?: string; data?: { reference?: string; status?: string; display_text?: string } };
  if (!response.ok || !data.status || !data.data?.reference) throw new Error(data.message || "Payment provider rejected the request.");
  return data.data;
}
export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const token = bearer(req);
  if (!token?.startsWith("Bearer ")) { res.status(401).json({ error: "Authentication required." }); return; }
  const body = req.body as { plan_id?: unknown; billing_interval?: unknown; momo_phone?: unknown; momo_provider?: unknown } | undefined;
  const planId = typeof body?.plan_id === "string" ? body.plan_id : "";
  const interval = body?.billing_interval === "yearly" ? "yearly" : body?.billing_interval === "daily" ? "daily" : "";
  const phone = typeof body?.momo_phone === "string" ? normalizePhone(body.momo_phone) : "";
  const provider = typeof body?.momo_provider === "string" ? body.momo_provider : "";
  if (!planId || !interval || !phone || !PROVIDERS.has(provider)) { res.status(400).json({ error: "Plan, billing interval, MoMo phone number and network are required." }); return; }
  if (!/^0\d{9}$/.test(phone)) { res.status(400).json({ error: "Enter a valid Ghana mobile number." }); return; }
  try {
    const admin = getSupabaseAdmin();
    const authResult = await admin.auth.getUser(token.slice(7));
    if (authResult.error || !authResult.data.user) { res.status(401).json({ error: "Authentication required." }); return; }
    const user = authResult.data.user;
    const { data: plan, error: planError } = await admin.from("cyro_plans").select("id,name,daily_price_ghs,annual_price_ghs").eq("id", planId).single();
    if (planError || !plan) { res.status(400).json({ error: "Invalid Cyro plan." }); return; }
    const amount = interval === "yearly" ? Number(plan.annual_price_ghs ?? annualPrice(Number(plan.daily_price_ghs))) : Number(plan.daily_price_ghs);
    const paymentId = crypto.randomUUID();
    const reference = "cyro_" + paymentId.replaceAll("-", "");
    const { error: insertError } = await admin.from("cyro_payments").insert({ id: paymentId, user_id: user.id, plan_id: plan.id, billing_interval: interval, amount_ghs: amount, provider: "paystack", provider_reference: reference, momo_phone: phone, momo_provider: provider, status: "pending" });
    if (insertError) throw insertError;
    try {
      const charge = await paystackCharge(user.email ?? "customer@cyro.local", amount, phone, provider, reference);
      await admin.from("cyro_payments").update({ status: charge.status === "success" ? "success" : "processing" }).eq("id", paymentId);
      res.status(200).json({ payment_id: paymentId, reference: charge.reference, status: charge.status || "pay_offline", display_text: charge.display_text || "Check your phone and approve the MoMo payment.", amount_ghs: amount, plan: plan.name, billing_interval: interval });
    } catch (error) {
      await admin.from("cyro_payments").update({ status: "failed" }).eq("id", paymentId);
      throw error;
    }
  } catch (error) { res.status(502).json({ error: error instanceof Error ? error.message : "Payment initiation failed." }); }
}
