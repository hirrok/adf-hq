# ADF Currency Standard v1.0

Version: 2026.09-v1.0  
Status: ACTIVE  
Effective: 2026-09-27  
Default currency: **USD**

## Law

Aurora Digital Foundry commercial and operating surfaces use USD by default.

This includes:

- proposals and invoices,
- payment requests,
- Operator Suite commercial fields,
- pipeline and revenue reporting,
- Foundry tools,
- public simulators and reusable simulator templates,
- pricing examples and illustrative financial models.

## New values

New ADF commercial amounts are authored directly in USD.

Do not convert a new invoice from another internal base currency unless the source transaction itself is denominated in that currency.

## Legacy demo normalization

Some pre-standard simulator and tool mock data was authored in Philippine pesos.

For one-time normalization of those historical demo/mock values, ADF uses the fixed 2026-09-27 reference:

**1 Philippine peso = 0.0160393 USD**

This rate is a migration reference only. It is not a live FX engine and must not be applied to real invoices, settlements, accounting entries, or future commercial records.

## Historical evidence

Source archives, migration snapshots, and historical evidence may retain original currencies when changing them would corrupt provenance.

Public-facing summaries may present a clearly labeled USD-equivalent while preserving the original evidence unchanged.

## Display

Use:

- currency code: `USD`
- symbol: `$`
- locale: `en-US`

Avoid mixing $ and Philippine-peso values on the same active operating surface unless the source currency is explicitly material to the record.

## End state

ADF sells, invoices, receives, models, and reports in one default commercial currency: USD.
