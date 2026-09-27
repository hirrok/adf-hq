# ADF Factory Registry — Sanitized Projection

**Status:** CURRENT-STATE PROJECTION  
**Authority:** `hirrok/adf-data-spine/data/factory-registry.json`  
**Reviewed:** 2026-09-27  
**Privacy rule:** This file contains no canonical prospect, client, contact, payment, or revenue records.

If this projection conflicts with the private Data Spine, the private Data Spine wins.

## Commercial products

| Product | ID | State | Public surface | Evidence state | Next milestone | K / C / E |
|---|---|---|---|---|---|---|
| Website Conversion Audit | `ADF-PROD-WCA-001` | LIVE_UNVALIDATED | `/store/` | Live USD 39 order surface and commissioning sample; no canonical revenue record yet | First independently verified external paid order, fulfillment, and usefulness evidence | UNDECIDED — awaiting external paid evidence |
| Opportunity Intelligence Brief | `ADF-PROD-OI-001` | VALIDATION | `/store/opportunity-intelligence.html` | Live USD 79 founding pilot with attribution-aware intake; no canonical revenue record yet | Reach the documented external paid evidence gate | CONTINUE — remain in validation until gate or redesign/park trigger |

## Boundary

The simulator fleet is proof infrastructure, not this commercial product registry. Its current public state remains in `SIMULATOR_STATUS.md`.

The canonical revenue ledger remains private. A form submission, order reference, or payment intent is not revenue until independently verified and recorded in the private Data Spine.
