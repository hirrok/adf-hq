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
Hourly Opportunity Forge distribution module
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

Execution is governed by the same queue. A LinkedIn post is eligible only after the canonical Insight is actually published, the item has approved `linkedin_commentary`, `linkedin_distribution` is `canonical_link`, and `linkedin_urn` is still null. The hourly Opportunity Forge distribution module may publish at most one eligible ADF item per run through the connected Windsor.ai `linkedin_organic` account named **Aurora Digital Foundry**.

After a successful LinkedIn write, the queue must record the returned LinkedIn URN, set `linkedin_status` to `published`, and record `linkedin_published_at`. Failed or unavailable distribution must never be reported as published.

Field Note video masters remain preserved in the repository for the canonical page and future reuse. Native LinkedIn video is an optional exception, never a release requirement.

## Manual run

GitHub → Actions → **ADF Publisher** → Run workflow.

A manual run uses the exact same due-time and approval rules.
