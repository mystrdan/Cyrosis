import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "../_lib/supabaseAdmin";
type RequestLike = { method?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown; rawBody?: Buffer | string };
type ResponseLike = { status: (code: number) => { json: (body: unknown) => void } };
function header(req: RequestLike, name: string) { const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()]; return Array.isArray(value) ? value[0] : value; }
function rawPayload(req: RequestLike) { if (req.rawBody) return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody); return Buffer.from(JSON.stringify(req.body ?? {})); }
function validSignature(payload: Buffer, signature: string, secret: string) { const expected = createHmac("sha512", secret).update(payload).digest("hex"); const a = Buffer.from(expected); const b = Buffer.from(signature); return a.length === b.length && timingSafeEqual(a, b); }
export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  const signature = header(req, "x-paystack-signature");
  if (!secret || !signature || !validSignature(rawPayload(req), signature, secret)) { res.status(401).json({ error: "Invalid webhook signature." }); return; }
  const event = req.body as { event?: string; data?: { reference?: string; status?: string; amount?: number; currency?: string } } | undefined;
  if (event?.event !== "charge.success" || !event.data?.reference) { res.status(200).json({ received: true }); return; }
  try {
    const admin = getSupabaseAdmin();
    const { data: payment, error } = await admin.from("cyro_payments").select("id,user_id,plan_id,billing_interval,amount_ghs,status").eq("provider_reference", event.data.reference).maybeSingle();
    if (error) throw error;
    if (!payment) { res.status(200).json({ received: true }); return; }
    if (payment.status === "success") { res.status(200).json({ received: true, duplicate: true }); return; }
    if (event.data.currency !== "GHS" || Number(event.data.amount ?? -1) !== Math.round(Number(payment.amount_ghs) * 100)) {
      await admin.from("cyro_payments").update({ status: "failed" }).eq("id", payment.id);
      res.status(400).json({ error: "Payment amount or currency mismatch." }); return;
    }
    await admin.from("cyro_payments").update({ status: "success" }).eq("id", payment.id);
    const now = new Date();
    const ends = new Date(now);
    if (payment.billing_interval === "yearly") ends.setUTCFullYear(ends.getUTCFullYear() + 1); else ends.setUTCDate(ends.getUTCDate() + 1);
    const { error: subscriptionError } = await admin.from("cyro_subscriptions").upsert({ user_id: payment.user_id, plan_id: payment.plan_id, status: "active", billing_interval: payment.billing_interval, starts_at: now.toISOString(), ends_at: ends.toISOString(), provider: "paystack", provider_reference: event.data.reference, updated_at: now.toISOString() }, { onConflict: "user_id" });
    if (subscriptionError) throw subscriptionError;
    res.status(200).json({ received: true });
  } catch (error) { res.status(500).json({ error: error instanceof Error ? error.message : "Webhook processing failed." }); }
}
