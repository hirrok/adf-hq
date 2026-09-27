# ADF Payment Flow Standard v1.0

Version: 2026.09-v1.0  
Status: ACTIVE  
Effective: 2026-09-27  
Canonical operational authority: `hirrok/adf-data-spine`

## Mission

Close the commercial loop from accepted proposal to received cash without exposing private financial records on the public ADF surface.

## Active rails

1. **Veem — PRIMARY_INTERNATIONAL_B2B — VERIFIED**
   - Historical successful payment route confirmed by the operator.
   - Public ADF payment page routes an issued invoice/payment request to Veem.
2. **PayPal — FALLBACK — AVAILABLE**
   - Public payment URL: https://www.paypal.com/paypalme/hirro
   - Use when Veem is inconvenient or unavailable to the payer.
   - Status remains AVAILABLE until an ADF receive/settlement event is independently confirmed.

Crypto/stablecoin rails remain deferred until demand and a reliable regulated receive/settlement route are proven.

## Commercial state machine

`PROPOSAL_ACCEPTED → INVOICE_SENT → PAYMENT_PENDING → PAID → DELIVERY → CLOSED`

A payment does not replace scope approval, project authorization, or delivery acceptance.

## Revenue record contract

Canonical revenue records are private. Minimum commercial fields:

- `rev_id`
- `prospect_id`
- `client_id`
- `commercial_state`
- `invoice_id`
- `invoice_amount`
- `currency`
- `payment_method`
- `payment_rail_id`
- `payment_reference`
- `gross_received`
- `fees`
- `net_received`
- `invoiced_at`
- `paid_at`
- `delivery_state`
- `notes`

Exact schema: private Data Spine `schema/revenue-record.schema.json`.

## Public/private boundary

Public ADF may expose supported payment methods, payment capability/status, a client payment page, and generic payment instructions.

Public ADF must never expose client identity, invoice amount, revenue totals, transaction references, private PayPal identifiers, account credentials, or settlement data.

## Invoice payment block

> **Preferred payment:** Veem  
> **Payment page:** https://hirrok.github.io/adf-hq/pay/  
> **Fallback:** PayPal — https://www.paypal.com/paypalme/hirro  
> Include the invoice/reference ID with the payment when the rail permits.

## Reconciliation rule

Mark a commercial record `PAID` only after receipt is confirmed in the payment provider. Record provider reference, fees, net received, and `paid_at` before moving to `DELIVERY`.

## End state

ADF can move a qualified opportunity through:

`Lead → Proposal → Invoice → Cash → Delivery → Closed`

with private canonical financial state and a controlled public payment surface.
