# ADF Publisher

Version: 2026.09-v0.2  
Status: ACTIVE — REPO-NATIVE SCHEDULER  
Clock: GitHub Actions  
Timezone: Asia/Manila

ADF Publisher schedules **canonical Insight releases** without Metricool or ChatGPT task slots.

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
LinkedIn RSS distribution
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

ADF Publisher intentionally does **not** store LinkedIn credentials in the repo.

Connect this RSS feed to the Aurora Digital Foundry LinkedIn Page once:

`https://hirrok.github.io/adf-hq/insights/feed.xml`

When LinkedIn automatic RSS sharing is available for the Page, new canonical releases can propagate automatically. If the Page only offers review-before-share, ADF Publisher still handles the complete site schedule and LinkedIn presents the new feed item for review.

Field-note videos remain optional native LinkedIn assets; the canonical Insight page is published independently.

## Manual run

GitHub → Actions → **ADF Publisher** → Run workflow.

A manual run uses the exact same due-time and approval rules.
