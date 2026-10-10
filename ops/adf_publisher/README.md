# ADF Publisher

Version: 2026.09-v0.3  
Status: ACTIVE — REPO-NATIVE SCHEDULER  
Clock: GitHub Actions  
Timezone: Asia/Manila

ADF Publisher schedules **canonical Insight releases** without depending on a paid social scheduler or ChatGPT task slots.

Architecture:

```
approved draft
    ↓
QUEUE.json
    ↓
GitHub Actions hourly clock
    ↓
governed release PR
    ↓
ADF Insights + RSS
    ↓
QUEUE.json LinkedIn package becomes ready
    ↓
Sole authorized ADF organic LinkedIn distribution executor
    ↓
Windsor.ai → LinkedIn Organic → Aurora Digital Foundry page
```

The website remains the source of truth. Social platforms are distribution surfaces.

## Publication contract

An item is eligible only when:

- `approved` is `true`
- `status` is `scheduled`
- `publish_at` is due
- `source_path` is under `ops/adf_publisher/drafts/`
- `destination_path` is under `insights/`
- `canonical_url` is under the canonical ADF Insights URL

The workflow never pushes directly to protected `main`. It creates an automation branch, opens a PR, and attempts a normal squash merge. Main branch protection remains authoritative.

A release is atomic: the article, Insights hub, RSS feed, and queue state land together in the same merge.

## State machine

```
draft → scheduled → published
             ↘
              (workflow failure; main remains scheduled)
```

Because the transaction is a PR, failed publication does not prematurely mark the canonical queue as published.

## Scheduling a release

1. Put a complete, editorially locked HTML file at:
   `ops/adf_publisher/drafts/<slug>/index.html`
2. Add an item to `QUEUE.json`.
3. Set:
   - `approved: true`
   - `status: "scheduled"`
   - `publish_at` to an ISO-8601 time with offset, e.g. `2026-10-02T18:00:00+08:00`
4. Merge the queue/draft change before the scheduled time.

The hourly workflow will release it at the first run at or after `publish_at`.

## Draft tokens

The publisher replaces these tokens in scheduled article HTML:

- `{{PUBLISHED_DATE}}` → YYYY-MM-DD
- `{{PUBLISHED_ISO}}` → full ISO timestamp
- `{{CANONICAL_URL}}` → queue canonical URL
- `{{TITLE}}`
- `{{DESCRIPTION}}`

## LinkedIn

ADF uses a **link-first distribution doctrine**.

The canonical Insight is the complete publication unit: article, embedded Field Note video when present, transcript, metadata, and CTA. LinkedIn is used to distribute the canonical Insight URL rather than requiring a separate native-video upload.

Default LinkedIn package:

- short thesis-led post text
- canonical Insight URL
- Open Graph cover from the Insight
- no native video requirement

This keeps publication momentum high and avoids paid scheduler dependencies or a manual video-upload bottleneck.

Execution is governed by the same queue. A LinkedIn post is eligible only after the canonical Insight is actually published, the item has approved `linkedin_commentary`, `linkedin_distribution` is `canonical_link`, `linkedin_urn` is still null, and `linkedin_status` is `ready` or absent. Reverify that the canonical URL is live before posting. The sole active authorized ADF organic LinkedIn distribution executor may publish at most one eligible ADF item per run through the connected Windsor.ai `linkedin_organic` account named **Aurora Digital Foundry**.

Use the queue's approved `linkedin_commentary` and canonical link package unchanged; do not add new claims, hashtags, CTAs, or alternate identity copy during distribution. After a successful LinkedIn write, the queue must record the returned LinkedIn URN, set `linkedin_status` to `published`, and record `linkedin_published_at`. If LinkedIn publishes but queue reconciliation fails, preserve the exact publication evidence as reconciliation debt and do not repost. Failed or unavailable distribution must never be reported as published, and the module must never fall back to a personal LinkedIn identity or another channel.

Field Note video masters remain preserved in the repository for the canonical page and future reuse. Native LinkedIn video is an optional exception, never a release requirement.

## Manual run

GitHub → Actions → **ADF Publisher** → Run workflow.

A manual run uses the exact same due-time and approval rules.


## 2026-10-10 organic-media failover during commercial outreach freeze

Fresh Sovereign command resumes ADF Insights and LinkedIn organic publishing while all commercial opportunity outreach remains on HOLD.

- Media Command is the **sole active ADF LinkedIn organic distribution executor only while Opportunity Forge is disabled**. Do not restart Opportunity Forge, harvest leads, create hiring drafts, send or schedule cold emails, solicit individual prospects, or create a competing publisher.
- Preserve the existing QUEUE.json approval, status, exact approved commentary, independent live canonical URL verification, LinkedIn-URN reconciliation, and no-repost rules above. Use Windsor.ai `linkedin_organic` account `143923481` exclusively. Continue the current ADF LinkedIn cadence subject to existing editorial/QA and no-spend gates.
- A QUEUE item marked `awaiting_canonical_release` cannot distribute until the canonical page is independently verified live and the queue is safely reconciled to `ready`. PR merge alone is not public availability. The ADF Publisher GitHub Actions release/PR process remains unchanged.
- Do not use this publishing handoff to conduct outbound acquisition, LinkedIn DMs, new commercial offers/pricing, paid promotion, personal-profile fallback, or cross-brand distribution.
- If Opportunity Forge is ever explicitly resumed, establish a single publisher owner and stop Media Command outbound LinkedIn publication until deconflicted. The commercial hold remains in force unless explicitly lifted by Hirro.


## Inbound LinkedIn Monetization — 2026-10-10 Authority & Attribution

**Scope:** governed ADF organic LinkedIn and ADF Insights only. The existing 2026-10-10 commercial opportunity outreach freeze is controlling: no cold DM, prospect harvesting, cold email, automated lead follow-up or Opportunity Forge restart. Inbound customers and self-selected buyers may continue through the separately authorized Revenue Order Watch and its human/payment gates.

**Approved offers (no price change):** Revenue Leak Audit USD 39, `https://hirrok.github.io/adf-hq/store/`; Opportunity Intelligence Brief founding pilot USD 79, `https://hirrok.github.io/adf-hq/store/opportunity-intelligence.html`. Do not manufacture testimonials, guarantees, offer promises or revenue claims. Do not add subscription/paid tooling.

**Editorial/test cadence:** retain the existing governed ADF LinkedIn daily organic baseline (plus material signal agility only within approved ceiling). Test **up to two offer-led posts per rolling seven days** inside—not on top of—the baseline, only when an approved/current editorial master and accurately relevant offer exist. Prefer a concrete business-problem → useful proof → optional canonical offer; interleave noncommercial educational Insights. Missing fresh evidence is not a mandate to force a post. This is a bounded validation experiment, not perpetual sales-copy autopilot.

**Attribution link contract:** On *newly approved* offer-led posts, attach a clearly relevant canonical ADF store link with `utm_source=linkedin&utm_medium=organic&utm_campaign=adf_inbound_validation_20261010` and `utm_content=<stable_approved_post_slug>` (URL-encode values). Preserve already-approved locked LinkedIn packages unchanged unless separately reapproved. Page forms carry `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `referrer`, and `landing_url` as order-source evidence. Blank values remain unknown, not proof of direct traffic. LinkedIn post clicks are not necessarily store clicks.

**Measurement/cash rules:** Log publication URN, post family, source link, impressions, clicks, reactions/comments and source-data freshness from Windsor where available. Monitor attributed genuine Formspree/Gmail inbound orders with existing Revenue Order Watch, Airtable Orders and canonical `hirrok/adf-data-spine/data/revenue.json`. Treat platform engagement → visit → order → independent provider-verified payment → PDF delivery → buyer feedback as distinct stages. Do not call orders or clicks revenue. Do not create a second CRM, order watcher or payment pipeline. Keep customer/order details inside approved private authorities, not the public ADF repo or Media Command logs.

**Evaluation gate:** After a minimum of four distinct eligible offer posts and seven settled days, compare clicks and attributed orders (not just impressions). Mark paid demand VALIDATED only if real provider-reconciled payment and delivery evidence exists. Continue/iterate/park offers using their local product validation criteria, not subjective impressions. Do not manufacture private attribution when referrer stripping/UTM gaps leave source UNKNOWN.

**Routing repair:** `hirrok/adf-hq` is the current public HQ; `hirrok/aurora-digital-foundry-site` is archived historical evidence. Active acquisition CTA and asset URLs must target current canonical pages. Do not overwrite historic publication proofs, only correct future execution links and append dated source corrections in execution projections.


## Standing automated ADF LinkedIn monetization calendar — 2026-10-10

**Authority:** The operator explicitly approved automated organic IP accrual / monetization on 2026-10-10 for existing, authorized ADF assets and the current USD 39 / USD 79 offers. This is a **narrow editorial automation authority**, NOT permission for outbound prospecting, new products, repricing, unsupported claims, or a second publishing agent. Existing locked Insight commentary must still remain unchanged.

**Single owner/clock:** Media Command (6-hourly, at 01:00 / 07:00 / 13:00 / 19:00 Asia/Manila). Reserve 13:00 daily as the normal LinkedIn posting decision slot; the 19:00 run may recover an objectively missed 13:00 publication, respecting the once-per-day baseline and dedupe. No separate LinkedIn automation. The ADF Publisher GitHub Actions hour-at-:11 continues governed *Insights* release staging; it is NOT the LinkedIn send clock. Opportunity Forge remains disabled.

**Offer calendar:** `ops/adf_publisher/LINKEDIN_OFFER_QUEUE.json` is the governed offer-post copy and due-date source, distinct from the Insights `QUEUE.json`. Starting Tuesday 2026-10-13, approved source-verified USD 39 posts are scheduled **Tuesdays at 13:00** and USD 79 pilot posts **Fridays at 13:00**, Asia/Manila. Exactly one offer post may replace that day's organic baseline post, never stack on top. Two offer posts maximum per rolling seven days (check actual publication times, not merely scheduled dates). First four explicitly commissioned dates: Oct 13, 16, 20, 23. Every Monday 07:00 run inspect the next 14-day supply; if it is low, commission fresh original, nonduplicate editorial packages for upcoming Tue/Fri slots via a normal protected-branch PR with the same product-source preflight; the standing automated approval applies only to accurately substantiated text for those existing two offers. Do not claim future packages already scheduled until merged and verified.

**Daily owned-IP commitment:** On a normal 13:00 run, choose (1) the due approved offer package for that day; else (2) one uniquely eligible, source-approved `QUEUE.json` Insight package with a live destination and exact locked commentary; else (3) one new original short ADF operational observation grounded in an already published ADF-owned Insight or verified source, after automated editorial review. New standalone shorts must be useful without a sales pitch, preserve an exact stable id/text/source/approval evidence and publication URN in the canonical organic archive in this repo via protected-branch PR. Self-review is limited to factual, non-sensitive evergreen organic observations on already approved topics; if claims are contentious, require new research or new product promises, **draft for human review, do not auto-send**. Avoid paraphrase spam or daily near-duplicates; skip rather than invent new insights.

**Send gates for both queues:** Check that the sole publisher is Media Command and account is Windsor.ai `linkedin_organic` organization `143923481`; confirm target URL is genuinely live (not merely merged/deployment-success); independently read recent LinkedIn publication state to prevent same-day or semantic duplicates; verify approved exact text, link, product identity/price, timestamp, UTM parameters and seven-day offer cap. Use one Windsor LinkedIn company-page `create_post` execution with the stored unchanged commentary, `link`, `link_title`. Capture returned URN. Reconcile `status=published`, `linkedin_urn`, `linkedin_published_at` (and platform-proven activity URL if known) with a protected-branch PR, then read back the canonical state. If send state is unknown or URN writeback fails, **do not retry blindly**: investigate platform/readback, park the attempt as reconciliation debt, and alert only on material unfixable exception. Never claim published from scheduled state.

**Learning loop:** Count impressions/clicks and recorded inbound inquiries as early attention indicators, keeping true order, provider-verified payment, canonical revenue and PDF fulfillment separate. Assess offer conversion after **four** distinct published offer posts and at least **seven** settled days. Protect buyers' details in the private Data Spine/Airtable/approved mail, never in the public organic archive. Recycle learnings into fresh first-party Insights only with the existing approvals and governed release PR; do not automatically unlock Season 2 drafts.

**Global freeze:** No cold email, recruiter drafting, cold LinkedIn connection/DM, scraping prospects, outbound follow-up, paid boosts/subscriptions, or cross-brand posting. Only organic page posts and genuine opt-in inbound commerce are permitted during this hold.
