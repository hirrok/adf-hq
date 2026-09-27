# ADF LinkedIn Scheduler

Status: ACTIVE — v0.1
Timezone: Asia/Manila

This branch is the mutable distribution queue for Aurora Digital Foundry.
The ADF website remains the canonical source of truth. LinkedIn is distribution only.

## State machine

draft -> scheduled -> publishing -> published
                              -> error

The executor MUST publish only when all of these are true:

- approved == true
- status == "scheduled"
- publish_at is due or past
- canonical_url is present
- link_title is present

Before calling LinkedIn, change the item to "publishing" and write that state back to this branch.
If the LinkedIn write succeeds, set status to "published", write linkedin_urn and published_at, and clear error.
If the LinkedIn write fails, set status to "error", preserve the item, record the error, and notify the operator.

Items in draft, error, publishing, or published MUST NOT be published automatically.

## Queue file

QUEUE.json

Each scheduled item uses:

- id: stable unique slug
- title
- canonical_url
- commentary
- link_title
- link_description
- publish_at: ISO 8601 with +08:00
- approved: boolean
- status
- linkedin_urn
- published_at
- error

## Operating doctrine

1. Canonical content is published to ADF Insights first.
2. Editorial lock happens before an item is marked approved.
3. Scheduling is a reversible queue mutation.
4. External publication is consequential and happens only from approved + scheduled.
5. Confirmed LinkedIn URN is evidence of publication.
6. Metricool is not part of this path.
