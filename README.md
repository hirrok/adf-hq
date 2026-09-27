# Aurora Digital Foundry — Canonical HQ

**Status:** CANONICAL — ACTIVE  
**Repository:** `hirrok/adf-hq`  
**Public site:** https://hirrok.github.io/adf-hq/

Aurora Digital Foundry manufactures business infrastructure. This repository is the active headquarters and public system of record for ADF website development, acquisition surfaces, Insights, Field Notes, publishing automation, simulator registry, store surfaces, Foundry Ops, and reusable infrastructure assets.

## Repository roles

- `/` — canonical public ADF site
- `/insights/` — public proof and field intelligence
- `/store/` — commercial product surfaces
- `/simulators/` — reusable public ADF simulator library
- `/ops/` — non-indexed Foundry operations and operating standards
- `/ops/FACTORY_REGISTRY.md` — sanitized current commercial product-state projection; private authority remains in `hirrok/adf-data-spine`
- `/src/` — source for Foundry operational interfaces

## Private operational spine

ADF operational truth lives in the private companion repository `hirrok/adf-data-spine`.

`adf-hq` may contain public schemas and sanitized projections, but never canonical private prospect, client, revenue, contact, or activity records.

See `ops/DATA_SPINE_STANDARD_v3.0.md`.

## Prospect and client builds

Bespoke prospect demonstrations and client-specific builds do **not** live inside the reusable simulator library by default.

They use independent repositories and deployments, then feed reusable patterns back into ADF HQ after the engagement resolves.

See:

- `ops/OPPORTUNITY_TO_ASSET_LOOP_v1.0.md`
- `ops/SIMULATOR_STANDARD.md`

## Retired mirror

`hirrok/aurora-digital-foundry-site` is retired historical evidence and is not an authoritative ADF source.

Do not route active development, publishing, or new dependencies to the retired mirror.
