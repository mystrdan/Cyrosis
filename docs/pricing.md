# Cyro pricing

Cyro's paying customer market is **Ghana**. The product, research engine and knowledgebase are **not limited to Ghana**: users can research Ghana, Africa, or anywhere in the world.

## Plans

Cyro supports **daily billing** and **yearly billing**. Yearly billing is discounted by **25%** versus paying the daily rate for 365 days.

| Plan | Daily | Yearly (25% off) | Position |
|---|---:|---:|---|
| Essential | ₵0.50/day | **₵136.88/year** | Everyday research |
| Research | ₵1.00/day | **₵273.75/year** | More frequent research and saved knowledge |
| Deep Research | ₵2.00/day | **₵547.50/year** | Heavier research workloads |

### Annual savings

- Essential: ₵182.50 → **₵136.88**, saving about ₵45.62/year
- Research: ₵365.00 → **₵273.75**, saving ₵91.25/year
- Deep Research: ₵730.00 → **₵547.50**, saving ₵182.50/year

The ₵0.50/day Essential plan remains the minimum paid access level.

Payment-provider integration is separate from product pricing so Cyro can support Ghanaian payment rails first and other payment methods later.

Prices are product configuration and may change before public launch.


## Ghana payment flow

For Ghana checkout, Cyro will prioritize **Mobile Money prompt payments**. The customer enters their MoMo phone number and network, then receives an authorization prompt on the phone. This matches the local checkout experience supported by Ghana mobile-money payment APIs. citeturn0search6turn0search7

Initial supported network choices:
- MTN
- AirtelTigo / ATMoney
- Telecel

Cyro will keep the payment provider behind a server-side adapter so we can start with an aggregator such as Paystack or integrate MTN's MoMo APIs directly later. MTN officially provides collection APIs for remote payment requests. citeturn0search0turn0search5

The customer's phone number is payment information and should be stored securely; payment secrets must remain server-side.
