# ADF Simulator Fleet Status — 2026-09-27

Status: **COMMISSIONED — SHARED STANDARD v1.0**

## Canonical role

The simulator fleet is a public proof surface for Aurora Digital Foundry. It demonstrates possible business interfaces and operator systems. It is **not** a directory of live client businesses and does not represent live customer data.

Canonical ADF authority: `hirrok/adf-hq`

## Active fleet

| # | Simulator | Slug |
|---:|---|---|
| 01 | Alon Surf & Stay | `surf-camp` |
| 02 | IronCrest Works | `trades-contractor` |
| 03 | ForgeHaus Fitness | `community-gym` |
| 04 | Kuwenta & Co. | `accounting-bookkeeping` |
| 05 | Solaris Fuel & LPG | `fuel-distributor` |
| 06 | Sandiwa Alliance | `industry-association` |
| 07 | Kape't Keso | `kapet-keso` |
| 08 | Teh Ronsha Law | `teh-ronsha-law` |
| 09 | Sagisag Aurora MPC | `agri-fishing-cooperative` |
| 10 | Brightline Electrical Services | `electrician-trades` |
| 11 | ClearFlow Plumbing Services | `plumbing-trades` |
| 12 | FrostLine Aircon Services | `hvac-aircon` |
| 13 | Perlas Dental Clinic | `dental-clinic` |
| 14 | Sinag Studio | `hair-salon` |

Legacy: `crumbly-crust-cafe` is retained only as historical evidence and is not part of the active homepage fleet.

## Shared commissioning standard

Shared assets:
- `/assets/adf-simulator-standard.css`
- `/assets/adf-simulator-standard.js`

Every active simulator now follows these rules:

1. **Visible provenance** — an ADF demo disclosure identifies the surface as an illustrative prototype.
2. **No fake privacy claim** — operator consoles open as simulations. Client-side password gates are not treated as security or required for access.
3. **No live-data implication** — operator surfaces identify their data as simulated/sample data.
4. **Demo-safe forms** — simulator forms do not transmit or store visitor data; submission returns a local demo-state message.
5. **Search boundary** — public simulator pages use `noindex, follow`; operator surfaces use `noindex, nofollow`.
6. **Canonical URLs** — each surface self-canonicals to its current `hirrok.github.io/adf-hq/simulators/...` route. Legacy `pages.dev` canonicals are retired.
7. **Truthful structured data** — fake/local-business schemas are removed from simulator pages; public prototypes use `CreativeWork` provenance for ADF instead.
8. **Social metadata** — titles and descriptions identify the destination as an ADF demo rather than a live business.
9. **Accessibility baseline** — visible focus treatment, keyboard activation for non-native clickable controls, and safe `target="_blank"` link relations are applied by the shared runtime.
10. **Brand independence** — each simulated business keeps its own visual identity; ADF appears as a restrained provenance layer rather than overwriting the client-facing concept.

## Operating rule

Simulator-specific redesigns are only warranted when a local defect exists. Shared concerns belong in the common simulator standard so the fleet does not drift into fourteen incompatible systems.
