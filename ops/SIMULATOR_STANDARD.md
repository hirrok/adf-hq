# ADF Simulator Standard

Version: 2026.09-v1.1  
Status: CANONICAL — ACTIVE  
Effective: 2026-09-27

ADF simulators are inspectable business-system prototypes, not deployed client businesses.

## Two simulator classes

### 1. Reusable ADF simulators

These are generic or sanitized proof assets intended for the ADF showroom and Pattern Library.

- Reusable public simulators live under `/simulators/` in `hirrok/adf-hq`.
- Public prototype pages use `noindex, follow`.
- Operator prototype pages use `noindex, nofollow`.
- Canonical reusable simulator URLs use `https://hirrok.github.io/adf-hq/simulators/...`.
- Every active surface loads the shared ADF simulator identity layer.
- Operator pages present a clear “Launch Operator Simulation” interaction and identify records as sample data.
- Simulator forms are demonstrations; they do not create production intake.
- Individual prototype brands retain their own visual identity.
- Shared ADF provenance does not replace the local simulator brand.
- `crumbly-crust-cafe` is legacy and excluded from the Pages artifact.

### 2. Prospect / client-specific demonstrations

These are bespoke sales assets created for a named opportunity.

- Default to an independent repository such as `adf-prospect-<id>`; do not place prospect source code inside the reusable ADF simulator library.
- Keep the repository slug generic where practical.
- The deployed demo must be unlisted and use `noindex, nofollow`.
- Clearly label the build as an unofficial concept demonstration when the prospect has not commissioned ADF.
- Use public business information and mock operational data only.
- Never expose private customer, lead, revenue, credential, or account data.
- Do not imply live integrations that do not exist.
- The prospect repo is not automatically a showroom asset.

## Resolution law

When the opportunity resolves:

**Won**
- The prospect build may become the production ancestor.
- Production data, accounts, ownership, and security follow ADF production doctrine.

**Lost / Dormant / Parked**
- Run a Harvest Review.
- Strip prospect-specific identity and private context.
- Extract reusable workflows, UI components, data patterns, and operational lessons.
- Promote only genuinely reusable assets into the ADF simulator library or Pattern Library.
- Archive or retire the prospect repo after extraction unless there is a documented reason to retain it.

A lost sale may still produce Foundry capital. It must not produce permanent repo entropy.

## Shared assets

- `/assets/adf-simulator.css`
- `/assets/adf-simulator.js`
- `/assets/adf-simulator-mark.svg`

## Authority

`hirrok/adf-hq` is the canonical public ADF repository and site source.

See `OPPORTUNITY_TO_ASSET_LOOP_v1.0.md` for the acquisition-to-harvest workflow.
