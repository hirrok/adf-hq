# ADF Repo-Native Data Spine Standard v3.0

Version: 2026.09-v3.0  
Status: CANONICAL — ACTIVE  
Effective: 2026-09-27  
Canonical authority: `hirrok/adf-data-spine` (PRIVATE)

## Mission

ADF's canonical operational state lives in portable, version-controlled structured files rather than in Google Sheets.

The private Data Spine answers:

- What is happening now?
- What requires follow-up?
- What revenue is at risk or available?
- What assets exist?
- What opportunity should be acted on next?
- What changed, when, and why?

Git history is the audit trail.

## Authority boundary

### Private authority

`hirrok/adf-data-spine` owns canonical operational truth:

- recon requests
- archetypes
- prototypes
- infrastructure gallery records
- SEO clusters
- pattern library
- operator modules
- prospects
- clients
- revenue
- activity log
- migration evidence

It must remain private.

### Public projection

`hirrok/adf-hq` owns:

- public website
- public doctrine
- public Insights / Field Notes
- reusable showroom simulators
- sanitized Operator Suite projections
- schemas and interface contracts that are safe to publish

The public repo must never contain:

- private prospect contacts
- client contacts
- non-public revenue
- private CRM notes
- customer data
- credentials
- account secrets
- private activity details

## Canonical layout

```text
adf-data-spine/
├── README.md
├── 00_SPINE_MANIFEST.json
├── schema/
│   ├── spine.schema.json
│   └── ledger-registry.json
├── data/
│   ├── recon-requests.json
│   ├── archetypes.json
│   ├── prototypes.json
│   ├── infrastructure-gallery.json
│   ├── seo-clusters.json
│   ├── pattern-library.json
│   ├── operator-suite-modules.json
│   ├── prospects.json
│   ├── clients.json
│   ├── revenue.json
│   └── activity-log.jsonl
└── migration/
    ├── 2026-09-27-google-spine/
    │   ├── source-manifest.json
    │   ├── OPS_HUD.json
    │   └── <one untouched source snapshot per Sheet tab>
    └── verification.json
```

## Ledger format

Canonical state ledgers use UTF-8 JSON.

Each JSON ledger is an object:

```json
{
  "schema_version": "3.0",
  "ledger": "prospects",
  "updated_at": "ISO-8601",
  "records": []
}
```

The activity log uses JSONL because it is append-oriented. Every line is one complete JSON object.

CSV may be generated for export but is never canonical.

## Transaction law

A business transaction that mutates several ledgers should resolve as one Git commit whenever practical.

Example conversion transaction:

`PROSPECTS update + CLIENTS append + REVENUE append + ACTIVITY_LOG append → one commit`

This keeps the repository state coherent and makes rollback meaningful.

Commit messages use:

`<domain>: <business event>`

Examples:

- `prospects: qualify pros-0042 after recon`
- `sales: convert pros-0042 to cli-0017`
- `factory: mark prototype proto-0012 live`
- `harvest: promote booking-flow pattern`

## Identity and record law

Existing stable IDs are preserved during migration.

New records use stable, human-inspectable prefixes already present in ADF where practical:

- `recon-`
- `arch-`
- `proto-`
- `gal-`
- `seo-`
- `pat-`
- `pros-`
- `cli-`
- `REV-`
- `LOG-`

Never recycle an ID after deletion or archival.

## Opportunity-to-Asset extension

Prospect records include:

- `opportunity_id`
- `opportunity_score`
- `value_leak`
- `demo_repo`
- `demo_url`

Migration preserves every original Google Sheet field first, then adds these extension fields without deleting source evidence.

## OPS_HUD treatment

The legacy Google `OPS_HUD` tab is a display artifact, not a canonical ledger.

It is preserved untouched under migration evidence.

A future operator HUD is derived from canonical repo ledgers or a sanitized public projection.

## Browser law

A public GitHub Pages application must never receive credentials capable of writing to the private spine.

Therefore:

- public Operator Suite = sanitized read-only projection / simulator
- authoritative mutations = authenticated GitHub operations performed by an authorized operator or agent
- future browser write gateway = optional, authenticated, server-side, and justified only by operational need

No private GitHub token may be embedded in HTML, JavaScript, public Actions artifacts, or public configuration.

## Sanitized projection

The public Operator Suite may consume:

`adf-hq/ops/data/operator-snapshot.json`

The projection may contain public Foundry assets and non-sensitive aggregate operating metrics.

It must exclude real prospect, client, revenue, contact, and private activity records.

## Google migration

Google Sheets was the source for the initial v3.0 migration only.

Cutover completed after count/ID verification passed for all canonical ledgers.

Completed sequence:

1. snapshot every source tab without mutation,
2. transform structured tabs to canonical repo ledgers,
3. preserve source headers and stable IDs,
4. add approved v3.0 extension fields,
5. verify source record counts against repo record counts,
6. verify content hashes,
7. switch ADF operational authority to the private repo,
8. remove live Google dependencies from ADF HQ,
9. mark the Google Sheet `RETIRED — HISTORICAL EVIDENCE` only after verification.

Do not delete the Sheet as part of cutover.

## Client deployment doctrine

This standard governs ADF's own operating spine.

It does not force repo-native storage onto clients.

For client production:

- client-owned Google Sheets + Apps Script remains valid for simple operational deployments,
- Supabase remains valid when complexity justifies it,
- repo-native data is appropriate when Git-based operation is actually the simplest durable system.

Choose the lowest-complexity client-owned backend that reliably runs the business.

## Recovery

Because canonical mutations are commits:

- inspect history,
- identify last known-good commit,
- revert the faulty transaction,
- verify ledger relationships,
- record recovery in activity log.

Do not rewrite history to hide operational errors.

## End state

ADF owns its operating truth as portable structured data with an auditable history.

Google becomes an optional client deployment tool, not an internal dependency.
