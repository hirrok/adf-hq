# Operator Snapshot

This directory contains **public, sanitized projections** for the ADF Operator Suite.

Canonical ADF operational records belong in the private `hirrok/adf-data-spine` repository after the v3.0 cutover.

## Privacy boundary

Files here may include public Foundry asset records and non-sensitive aggregate metrics.

They must not include:

- named prospect CRM records,
- prospect or client contact details,
- private notes,
- client records,
- non-public revenue,
- private activity logs,
- credentials or secrets.

`operator-snapshot.json` is intentionally not a backup of the private spine.

It is a projection.
