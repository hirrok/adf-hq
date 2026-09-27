# ADF Opportunity-to-Asset Loop v1.0

**Version:** 2026.09-v1.0  
**Status:** CANONICAL — ACTIVE  
**Effective:** 2026-09-27  
**Authority:** ADF Master Canon v2.0, Product Factory OS v1.0, Recon Engine, Foundry CRM, Simulator Standard

## Mission

Convert external business opportunities into one or more of:

- client revenue,
- production infrastructure,
- maintenance revenue,
- reusable simulator assets,
- Pattern Library improvements,
- industry intelligence.

The loop binds Opportunity Forge discovery to the existing ADF lifecycle. It does not create a parallel CRM or a second product factory.

## System boundary

**Opportunity Forge** discovers, researches, and frames opportunities.

**ADF** assumes authority over an opportunity only after it is promoted into the ADF client lane.

ADF then owns:

`Lead → Recon → Assessment → Qualification → Outreach → Blueprint → Prototype → Presentation → Conversion → Production → Maintenance → Harvest`

Opportunity Forge remains free to hunt other opportunity classes without inheriting ADF-specific workflow.

## Intake contract

Every promoted ADF opportunity should carry:

- Opportunity ID
- Business name
- Industry
- Location
- Website / public presence
- Decision-maker or contact path when publicly available
- Source
- Observable value leak
- Recon evidence
- ADF opportunity score
- Priority
- Next action

ADF HQ / Data Spine is the system of record after promotion.

## Qualification gate

A prospect is not “hot” merely because its website looks weak.

A qualified ADF opportunity must show all four:

1. **Observable value leak** — a concrete acquisition, conversion, operational, retention, visibility, data, or decision-quality problem.
2. **Buyer access** — a plausible route to the owner or decision-maker.
3. **Demonstrable intervention** — ADF can visibly show a better future state.
4. **Economic plausibility** — the likely business value can justify ADF effort.

Use the existing Recon opportunity score:

- 40–50 — Immediate
- 30–39 — High
- 20–29 — Medium
- 0–19 — Low

Default action:

- Immediate / High + gate passed → outreach candidate.
- Medium → validate cheaply or park.
- Low → park unless strategic evidence overrides.

A high score authorizes the next experiment, not a large build.

## Canonical prospect stages

New writes use:

`New Lead → Recon → Assessment → Qualified → Contacted → Interested → Blueprint → Prototype → Demo Sent → Presentation → Proposal → Conversion → Production → Maintenance`

Branch states:

- Lost
- Parked
- Harvested
- Archived

Legacy values such as `Pre-Outreach` and `Concept` may remain for historical records but must not be used for new writes.

## Outreach gate

Default law:

**Do not build a bespoke prospect repository before positive commercial signal.**

Normal flow:

`Recon → Qualified → Contacted → Interested → Build Demo`

Exception — **Preemptive Demo**:

A demo may be built before reply when:

- an existing pattern makes marginal build cost very low,
- the intervention is unusually visual,
- the prospect is Immediate / High,
- the build can be completed without delaying higher-leverage work.

Targeted one-to-one outreach may operate under current standing ADF outreach authority.

Bulk or campaign-scale outreach requires explicit operator authorization.

A clear negative response ends outreach.

## Prospect demo law

When a demo is justified:

1. Create an independent prospect repository.
2. Use a neutral repo identifier where practical, e.g. `adf-prospect-0042`.
3. Deploy an unlisted GitHub Pages demonstration.
4. Apply `noindex, nofollow`.
5. Mark it as an unofficial concept demonstration until commissioned.
6. Use mock operational data only.
7. Never fake integrations, customers, revenue, bookings, or business results.
8. Record repository and demo URL in the ADF prospect record.
9. Email or message the prospect with the business outcome first; the demo link is proof, not the pitch.

ADF HQ may link to the demo internally. It does not absorb the prospect source code.

## Conversion path

Positive commercial movement proceeds through:

`Demo Sent → Presentation → Proposal → Conversion`

On win:

- create / update the client record,
- establish production scope,
- replace mock data with client-owned production infrastructure only after production gates are satisfied,
- establish maintenance terms,
- retain provenance from opportunity → prospect → prototype → client.

No prototype is called production until its live data loop is verified.

## Harvest review

Every resolved opportunity receives a Harvest Review, including losses.

Ask:

- What repeated?
- What reduced build labor?
- What objection appeared?
- What improved the demonstration?
- What component belongs in the Pattern Library?
- Should a sanitized generic simulator be created?
- Which archetype became stronger?
- Which assumption was disproved?

Possible outcomes:

- **PATTERN** — promote reusable component or workflow.
- **SIMULATOR** — create or improve a generic sanitized ADF simulator.
- **ARCHETYPE** — strengthen an industry manufacturing archetype.
- **INTELLIGENCE** — preserve market / objection / buyer insight.
- **NONE** — no durable asset; archive cleanly.

After harvest, prospect repos that are not production ancestors should be archived or retired.

No orphan repositories.

## Data Spine extension

The canonical PROSPECTS record retains its existing fields and adds:

- `opportunity_id`
- `opportunity_score`
- `value_leak`
- `demo_repo`
- `demo_url`

These fields connect discovery evidence to the sales and manufacturing loop without creating a new ledger.

The live Sheet migration is additive only. Existing rows remain valid.

## Minimum operating metrics

Track:

- opportunities promoted to ADF,
- qualified rate,
- outreach response rate,
- interested-to-demo rate,
- demo-to-proposal rate,
- proposal-to-conversion rate,
- average prospect-demo build effort,
- prospect repo count,
- orphan repo count,
- harvest rate,
- pattern / simulator extraction rate,
- maintenance conversion.

## Stop conditions

Stop or park when:

- no concrete value leak can be demonstrated,
- contact path is absent after reasonable recon,
- the prospect explicitly declines,
- evidence falls below qualification,
- required build effort exceeds expected strategic value,
- sensitive or regulated data would be required for a demo,
- another active build has materially higher leverage.

## End state

Every serious prospect should end as at least one of:

1. revenue,
2. reusable infrastructure,
3. durable market intelligence.

The Foundry does not merely pursue clients.

It turns pursuit itself into manufacturing input.
