// ═══════════════════════════════════════════════════════════════
// AURORA DIGITAL FOUNDRY — OPERATOR SUITE v2
// Build: LOCKED 2026-06-03 (Phase 1 Reconnect — Spine v2.0)
// Brand: Sierra Teal Light
// Spine: ADF DATA SPINE v2.0 — Asset-Centric Model
//   Primary : ARCHETYPES · PROTOTYPES · INFRASTRUCTURE_GALLERY
//             SEO_CLUSTERS · PATTERN_LIBRARY · OPERATOR_SUITE_MODULES
//   Secondary: PROSPECTS · CLIENTS · REVENUE · ACTIVITY_LOG
// Hydration: Reusable adapter → mapper → module pattern
// Deploy: Vite + viteSingleFile → single index.html
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";

// ── BRAND TOKENS ─────────────────────────────────────────────
// Source: Adf_index_brand_identity_.html — Sierra Teal Light system
const B = {
  bg:      "#F4F8F7",
  surface: "#FFFFFF",
  raised:  "#EBF3F1",
  border:  "#D0E4E0",
  bhi:     "#A8CEC8",
  teal:    "#0D9E8A",
  tlo:     "#0A7A6A",
  tbg:     "rgba(13,158,138,0.09)",
  green:   "#0A8A40",
  gbg:     "rgba(10,138,64,0.08)",
  red:     "#CC2222",
  rbg:     "rgba(204,34,34,0.08)",
  blue:    "#1A60A8",
  bbg:     "rgba(26,96,168,0.08)",
  gold:    "#D97706",
  goldbg:  "rgba(217,119,6,0.09)",
  ink:     "#0E1C1A",
  dim:     "#4A6A68",
  muted:   "#8AACAA",
};

const F = {
  disp: "'Bebas Neue', Impact, sans-serif",
  mono: "'DM Mono', 'Courier New', monospace",
  body: "'Barlow', system-ui, sans-serif",
};

// ── SPINE ADAPTER ─────────────────────────────────────────────
// Patch v1.1 — 2026-06-03
// READ:  GET ?sheet=TAB_NAME               → returns { ok, data[] }
// WRITE: GET ?sheet=TAB_NAME&payload={...} → returns { ok, action }
//
// Why GET for writes: Apps Script POST from browser triggers a Google auth
// redirect that drops the POST body silently. GET requests have no redirect.
// Payload is JSON-encoded in the query string — Apps Script doGet reads it
// from e.parameter.payload. Safe for this data scale and operator-only access.

const SPINE_URL = "https://script.google.com/macros/s/AKfycbwtD_9fIe483qD-8_czsigAdBhf3UGbJRUoyDcIFMLqeqdYIPmV-GfdjQyCyTMdvNwC/exec";

const adapter = {
  async read(sheet) {
    try {
      const r = await fetch(`${SPINE_URL}?sheet=${encodeURIComponent(sheet)}`);
      const d = await r.json();
      return d.data || null;
    } catch { return null; }
  },
  async append(sheet, row) {
    try {
      const payload = encodeURIComponent(JSON.stringify({ action: "append", row }));
      const r = await fetch(`${SPINE_URL}?sheet=${encodeURIComponent(sheet)}&payload=${payload}`);
      return await r.json();
    } catch (e) { return { ok: false, error: e.message }; }
  },
  async update(sheet, id, data) {
    try {
      const payload = encodeURIComponent(JSON.stringify({ action: "update", id, data }));
      const r = await fetch(`${SPINE_URL}?sheet=${encodeURIComponent(sheet)}&payload=${payload}`);
      return await r.json();
    } catch (e) { return { ok: false, error: e.message }; }
  },
};

// ── UTILITIES ─────────────────────────────────────────────────
const uid     = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const today   = () => new Date().toISOString().split("T")[0];
const addDays = (s, n) => { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };
const fmt     = n => "₱" + Number(n).toLocaleString();

// ── SEED DATA ─────────────────────────────────────────────────
// ── FALLBACK SEED DATA ────────────────────────────────────────
// Emergency fallback. Shown when PROSPECTS tab cannot be read.
// Spine v2.0 schema — no real names, no real data.
// Patch v1.3 — 2026-06-03: Reconnected to Spine v2.0 PROSPECTS.
const SEED_LEADS = [
  { id:"pros-XXX", name:"Demo Tourism Prospect",    vertical:"Tourism",       location:"Aurora Province", territory:"Baler/Aurora",    status:"Prototype", priority:"HIGH",   contact:"—", source:"—", fee:0, setupFee:0, monthlyRetainer:0, probability:0, action:"Spine offline — connect PROSPECTS tab", due:"—", cadence:"NONE", notes:"Fallback record.", recordState:"DEMO" },
  { id:"pros-XXX", name:"Demo Food Prospect",       vertical:"Food",          location:"Quezon Province", territory:"Lucena/Quezon",   status:"New Lead",  priority:"MEDIUM", contact:"—", source:"—", fee:0, setupFee:0, monthlyRetainer:0, probability:0, action:"Spine offline — connect PROSPECTS tab", due:"—", cadence:"NONE", notes:"Fallback record.", recordState:"DEMO" },
];

const SEED_PIPELINE = [
  { id:"D-XXX", name:"Demo Prospect A", stage:"Proposal",  value:0, prob:0, due:"—", next:"Spine offline" },
];
const SEED_FOLLOWUPS = [
  { id:"FU-XXX", lead:"Demo Prospect A", type:"72HR", due:"—", action:"Spine offline — connect PROSPECTS tab", status:"PENDING" },
];
const SEED_BOOKINGS  = [{ id:"J-XXX", client:"Demo Client", type:"Standard Build", status:"Pending", value:0, notes:"Spine offline." }];
const SEED_MARKETING = [
  { id:"M-001", ch:"GBP",      task:"Create ADF Google Business Profile listing", status:"Open", due:"2026-06-07" },
  { id:"M-002", ch:"Facebook", task:"Foundry — first proof-of-work post",          status:"Open", due:"2026-06-10" },
];
const SEED_REVIEWS   = [{ id:"R-XXX", client:"Demo Client", platform:"Google", status:"Not Sent", notes:"Spine offline." }];

// ── ASSET LEDGER FALLBACK SEEDS ───────────────────────────────
// Used by Snapshot when primary ledger reads fail.
const SEED_ASSETS = {
  archetypes:  [],
  prototypes:  [],
  gallery:     [],
  seoClusters: [],
  patterns:    [],
  osModules:   [],
};

// ── SHARED COMPONENTS ─────────────────────────────────────────
const TAG_COLOR = {
  // Legacy status values kept for backward compat
  DEMO:"teal", PITCH:"green", QUEUED:"blue", PROSPECT:"dim", STRATEGIC:"dim",
  // Spine v2.0 canonical stage values
  "New Lead":"dim", "Qualified":"blue", "Prototype":"teal",
  "Presentation":"teal", "Proposal":"green", "Conversion":"green",
  "Production":"green", "Maintenance":"teal", "Lost":"red", "Parked":"dim", "Archived":"dim",
  // Shared
  "Not Sent":"dim", Sent:"teal", Received:"green",
  "Closed Won":"green", "Closed Lost":"red",
  OVERDUE:"red", PENDING:"dim", Open:"gold", Done:"green",
  HIGH:"red", MEDIUM:"gold", LOW:"dim",
  Pending:"dim", "In Build":"teal", Review:"gold", Live:"green", Paid:"green",
};
const TAG_MAP = {
  teal:  { bg:B.tbg,    border:"rgba(13,158,138,.3)",  color:B.teal  },
  green: { bg:B.gbg,    border:"rgba(10,138,64,.3)",   color:B.green },
  red:   { bg:B.rbg,    border:"rgba(204,34,34,.3)",   color:B.red   },
  blue:  { bg:B.bbg,    border:"rgba(26,96,168,.3)",   color:B.blue  },
  gold:  { bg:B.goldbg, border:"rgba(217,119,6,.3)",   color:B.gold  },
  dim:   { bg:"rgba(74,106,104,.1)", border:"rgba(74,106,104,.2)", color:B.dim },
};

const Tag = ({ l }) => {
  const m = TAG_MAP[TAG_COLOR[l] || "dim"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:99,
      fontFamily:F.mono, fontSize:10, fontWeight:600, whiteSpace:"nowrap",
      background:m.bg, border:`1px solid ${m.border}`, color:m.color }}>
      {l}
    </span>
  );
};

const SLabel = ({ children }) => (
  <p style={{ fontFamily:F.mono, fontSize:9, fontWeight:600, letterSpacing:".14em",
    textTransform:"uppercase", color:B.teal, marginBottom:6 }}>
    {children}
  </p>
);

const Card = ({ children, accent, red, style={} }) => (
  <div style={{
    background: accent ? B.tbg : red ? B.rbg : B.surface,
    border: `1px solid ${accent ? "rgba(13,158,138,.25)" : red ? "rgba(204,34,34,.3)" : B.border}`,
    borderRadius:10, padding:14, ...style,
  }}>{children}</div>
);

const Divider = () => <div style={{ height:1, background:B.border, margin:"8px 0" }} />;

const PBar = ({ pct }) => (
  <div style={{ height:4, background:B.border, borderRadius:99, overflow:"hidden" }}>
    <div style={{ height:4, width:`${Math.min(100, pct)}%`, background:B.teal, borderRadius:99 }} />
  </div>
);

const MGrid = ({ items }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
    {items.map(m => (
      <div key={m.l} style={{
        background: m.alert ? B.rbg : B.raised,
        border: `1px solid ${m.alert ? "rgba(204,34,34,.35)" : B.border}`,
        borderRadius:8, padding:"12px 14px",
      }}>
        <p style={{ fontFamily:F.mono, fontSize:9, letterSpacing:".1em", textTransform:"uppercase", color:B.dim, marginBottom:4 }}>{m.l}</p>
        <p style={{ fontFamily:F.disp, fontSize:m.sm ? 16 : 22, letterSpacing:".02em", color:m.alert ? B.red : B.teal, lineHeight:1 }}>{m.v}</p>
        {m.n && <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, marginTop:3 }}>{m.n}</p>}
      </div>
    ))}
  </div>
);

const GBtn = ({ label, onClick, on, style={} }) => (
  <button onClick={onClick} style={{
    padding:"5px 10px", borderRadius:6, cursor:"pointer",
    fontFamily:F.mono, fontSize:9, letterSpacing:".1em",
    background: on ? B.teal : "transparent",
    color: on ? "#fff" : B.dim,
    border: `1px solid ${on ? B.teal : B.border}`,
    whiteSpace:"nowrap", flexShrink:0, ...style,
  }}>{label}</button>
);

const AIBtn = ({ label, onClick }) => (
  <button onClick={onClick} style={{
    padding:"5px 10px", borderRadius:6, cursor:"pointer",
    fontFamily:F.mono, fontSize:9, letterSpacing:".1em",
    background:B.tbg, border:`1px solid rgba(13,158,138,.3)`, color:B.teal,
    whiteSpace:"nowrap", flexShrink:0,
  }}>{label}</button>
);

const InpStyle = {
  display:"block", width:"100%", background:B.raised,
  border:`1px solid ${B.border}`, borderRadius:7,
  padding:"9px 12px", fontSize:13, fontFamily:F.body, color:B.ink,
  outline:"none", marginBottom:8, boxSizing:"border-box",
};

const Inp = ({ ph, val, onChange, type="text" }) => (
  <input type={type} placeholder={ph} value={val} onChange={onChange} style={InpStyle} />
);

const SaveBtn = ({ label, onClick }) => (
  <button onClick={onClick} style={{
    width:"100%", padding:10, background:B.green, color:"#fff",
    border:"none", borderRadius:7, cursor:"pointer",
    fontFamily:F.body, fontSize:13, fontWeight:600,
  }}>{label}</button>
);

// ══════════════════════════════════════════════════════════════
// HYDRATION LAYER — Spine v2.0
// Pattern: Sheet → adapter.read(tabName) → mapper(row) → module state
//
// Each ledger has:
//   adapter.read(TAB_NAME)  — fetches raw rows from Google Sheets
//   map[TabName](row)       — transforms raw row to frontend shape
//
// Adding a new ledger = add one read call + one mapper function.
// No custom fetch logic. No repeated boilerplate.
//
// PRIMARY LEDGERS (asset-centric):
//   ARCHETYPES, PROTOTYPES, INFRASTRUCTURE_GALLERY,
//   SEO_CLUSTERS, PATTERN_LIBRARY, OPERATOR_SUITE_MODULES
//
// SECONDARY LEDGERS (sales):
//   PROSPECTS, CLIENTS, REVENUE, ACTIVITY_LOG
// ══════════════════════════════════════════════════════════════

// ── MAPPER: PROSPECTS (Spine v2.0 schema) ────────────────────
// Tab: PROSPECTS
// Columns: prospect_id, business_name, industry, location, territory,
//          source, linked_archetype_id, linked_gallery_item_id,
//          stage, record_state, priority, template_family,
//          setup_fee, monthly_retainer, probability_pct,
//          next_action, follow_up_date, follow_up_cadence,
//          notes, created_at, updated_at

function mapProspect(row) {
  const r = Array.isArray(row)
    ? {
        prospect_id: row[0], business_name: row[1], industry: row[2],
        location: row[3], territory: row[4], source: row[5],
        linked_archetype_id: row[6], linked_gallery_item_id: row[7],
        stage: row[8], record_state: row[9], priority: row[10],
        template_family: row[11], setup_fee: row[12], monthly_retainer: row[13],
        probability_pct: row[14], next_action: row[15], follow_up_date: row[16],
        follow_up_cadence: row[17], notes: row[18], created_at: row[19], updated_at: row[20],
      }
    : row;

  const setupFee      = Number(r.setup_fee)       || 0;
  const retainer      = Number(r.monthly_retainer) || 0;
  const probability   = Number(r.probability_pct)  || 0;
  const estValue      = setupFee + (retainer * 3);
  const weighted      = Math.round(estValue * probability / 100);

  return {
    id:             r.prospect_id        || "",
    name:           r.business_name      || "",
    vertical:       r.industry           || "",
    location:       r.location           || "",
    territory:      r.territory          || "",
    source:         r.source             || "",
    archetypeId:    r.linked_archetype_id|| "",
    galleryId:      r.linked_gallery_item_id || "",
    status:         r.stage              || "New Lead",    // stage is the single lifecycle field
    recordState:    r.record_state       || "ACTIVE",
    priority:       r.priority           || "MEDIUM",
    templateFamily: r.template_family    || "",
    setupFee,
    monthlyRetainer: retainer,
    fee:            setupFee,                              // backward compat for card display
    probability,
    estValue,
    weighted,
    action:         r.next_action        || "",
    due:            r.follow_up_date     || "",
    cadence:        r.follow_up_cadence  || "NONE",
    notes:          r.notes              || "",
    contact:        "",                                    // not in v2.0 PROSPECTS schema
    reconStatus:    "",
    prototypeUrl:   "",
  };
}

// ── MAPPER: ARCHETYPES ────────────────────────────────────────
function mapArchetype(row) {
  const r = Array.isArray(row)
    ? { archetype_id:row[0], name:row[1], template_family:row[2], target_industry:row[3],
        target_market:row[4], search_gravity_score:row[5], commercial_gravity_score:row[6],
        pattern_reuse_score:row[7], backend_richness_score:row[8], strategic_fit_score:row[9],
        total_score:row[10], classification:row[11], lifecycle_state:row[12], priority:row[13],
        prototype_id:row[14], gallery_item_id:row[15], seo_cluster_id:row[16],
        frontend_demo_url:row[18], notes:row[20] }
    : row;
  return {
    id:            r.archetype_id       || "",
    name:          r.name               || "",
    family:        r.template_family    || "",
    industry:      r.target_industry    || "",
    market:        r.target_market      || "",
    score:         Number(r.total_score) || 0,
    classification:r.classification     || "",
    lifecycle:     r.lifecycle_state    || "Candidate",
    priority:      r.priority           || "MEDIUM",
    demoUrl:       r.frontend_demo_url  || "",
    notes:         r.notes              || "",
  };
}

// ── MAPPER: PROTOTYPES ────────────────────────────────────────
function mapPrototype(row) {
  const r = Array.isArray(row)
    ? { prototype_id:row[0], archetype_id:row[1], name:row[3], template_family:row[4],
        ownership:row[5], live_url:row[7], build_stage:row[9], page_count:row[10] }
    : row;
  return {
    id:         r.prototype_id  || "",
    archetypeId:r.archetype_id  || "",
    name:       r.name          || "",
    family:     r.template_family || "",
    ownership:  r.ownership     || "FOUNDRY",
    liveUrl:    r.live_url      || "",
    stage:      r.build_stage   || "",
    pages:      Number(r.page_count) || 0,
  };
}

// ── MAPPER: INFRASTRUCTURE_GALLERY ───────────────────────────
function mapGalleryItem(row) {
  const r = Array.isArray(row)
    ? { gallery_item_id:row[0], archetype_id:row[1], public_title:row[2],
        template_family:row[3], target_industry:row[4], business_problem_demonstrated:row[5],
        frontend_demo_url:row[6], published_status:row[10] }
    : row;
  return {
    id:          r.gallery_item_id    || "",
    archetypeId: r.archetype_id       || "",
    title:       r.public_title       || "",
    family:      r.template_family    || "",
    industry:    r.target_industry    || "",
    problem:     r.business_problem_demonstrated || "",
    demoUrl:     r.frontend_demo_url  || "",
    published:   ["Published","published","TRUE","true",true].includes(r.published_status),
  };
}

// ── MAPPER: SEO_CLUSTERS ──────────────────────────────────────
function mapSEOCluster(row) {
  const r = Array.isArray(row)
    ? { seo_cluster_id:row[0], vertical:row[2], territory:row[3],
        primary_keyword:row[4], status:row[11] }
    : row;
  return {
    id:       r.seo_cluster_id  || "",
    vertical: r.vertical        || "",
    territory:r.territory       || "",
    keyword:  r.primary_keyword || "",
    status:   r.status          || "",
  };
}

// ── MAPPER: PATTERN_LIBRARY ───────────────────────────────────
function mapPattern(row) {
  const r = Array.isArray(row)
    ? { pattern_id:row[0], name:row[1], pattern_family:row[2],
        reuse_count:row[7], promotion_status:row[8], status:row[10] }
    : row;
  return {
    id:        r.pattern_id       || "",
    name:      r.name             || "",
    family:    r.pattern_family   || "",
    reuse:     Number(r.reuse_count) || 0,
    status:    r.promotion_status || "",
  };
}

// ── HYDRATION HELPER ──────────────────────────────────────────
// Generic: reads a tab, maps rows, filters empties.
// Usage: hydrateTab("ARCHETYPES", mapArchetype, setArchetypes)
async function hydrateTab(tabName, mapFn, setter) {
  try {
    const raw = await adapter.read(tabName);
    if (raw && Array.isArray(raw) && raw.length > 0) {
      const mapped = raw.map(mapFn).filter(r => r.id);
      if (mapped.length > 0) { setter(mapped); return true; }
    }
  } catch(_) {}
  return false;
}

// ── AI CONTEXT ────────────────────────────────────────────────
const buildContext = (leads, pipeline, followups, assets) => {
  const overdue = leads.filter(l => l.due && l.due !== "—" && new Date(l.due) < new Date() && !["Conversion","Production","Maintenance","Lost","Archived"].includes(l.status));
  const weighted = leads.filter(l => l.recordState === "ACTIVE").reduce((a,l) => a + (l.weighted || 0), 0);
  const archetypesDeployed = (assets?.archetypes || []).filter(a => ["Deployed","Enhanced"].includes(a.lifecycle)).length;
  const prototypesLive     = (assets?.prototypes || []).filter(p => p.stage === "Live").length;
  const galleryPublished   = (assets?.gallery || []).filter(g => g.published).length;

  return `You are the AI console for Aurora Digital Foundry — an asset-centric business infrastructure manufacturer in Aurora Province, Philippines, operated by Hirro Kuizon.

Business model: Keyword Research → Archetype → Prototype → Infrastructure Gallery → SEO → Traffic → Lead → Client
Prospects are downstream of archetypes. Assets generate revenue. Revenue funds more assets.

Current manufacturing snapshot:
- Archetypes deployed: ${archetypesDeployed}
- Prototypes live: ${prototypesLive}
- Gallery items published: ${galleryPublished}
- Active prospects: ${leads.filter(l => l.recordState === "ACTIVE").length}
- Overdue follow-ups: ${overdue.length}
- Weighted pipeline: PHP ${weighted.toLocaleString()}
- 8-week targets: PHP 100,000 setup · PHP 25,000 MRR
- Week 1 of 8. Zero closes.

Be direct, operator-grade, zero filler. Use PHP for currency.`;
};

// ══════════════════════════════════════════════════════════════
// MODULES
// ══════════════════════════════════════════════════════════════

function Snapshot({ leads, assets, nav }) {
  const active   = leads.filter(l => l.recordState === "ACTIVE" || !l.recordState);
  const overdue  = active.filter(l => l.due && l.due !== "—" && new Date(l.due) < new Date() && !["Conversion","Production","Maintenance","Lost","Archived"].includes(l.status));
  const weighted = active.reduce((a,l) => a + (l.weighted || 0), 0);

  const archs     = assets?.archetypes  || [];
  const protos    = assets?.prototypes  || [];
  const gallery   = assets?.gallery     || [];
  const clusters  = assets?.seoClusters || [];
  const patterns  = assets?.patterns    || [];

  const archsDeployed  = archs.filter(a => ["Deployed","Enhanced"].includes(a.lifecycle)).length;
  const protosLive     = protos.filter(p => p.stage === "Live").length;
  const galleryLive    = gallery.filter(g => g.published).length;
  const clustersActive = clusters.filter(c => c.status === "Active").length;
  const patternReuse   = patterns.reduce((a,p) => a + p.reuse, 0);
  const hasAssets      = archs.length > 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Foundry Manufacturing Cockpit</SLabel>

      {overdue.length > 0 && (
        <div style={{ background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, borderRadius:10, padding:12,
          display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} />
          <p style={{ fontFamily:F.mono, fontSize:11, color:B.red, flex:1 }}>
            {overdue.length} OVERDUE FOLLOW-UP{overdue.length > 1 ? "S" : ""} — ACT NOW
          </p>
          <GBtn label="ACTION →" onClick={() => nav("followups")} on />
        </div>
      )}

      <div style={{ background:B.raised, border:`1px solid ${B.border}`, borderRadius:10, padding:14 }}>
        <SLabel>Foundry Assets</SLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { l:"Archetypes Active",  v:hasAssets ? archsDeployed  : null },
            { l:"Prototypes Live", v:hasAssets ? protosLive     : null },
            { l:"Gallery Published",    v:hasAssets ? galleryLive    : null },
            { l:"SEO Clusters",    v:hasAssets ? clustersActive : null },
            { l:"Patterns",        v:hasAssets ? patterns.length: null },
            { l:"Pattern Reuse",   v:hasAssets ? patternReuse   : null },
          ].map(m => (
            <div key={m.l} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:8, padding:"10px 12px" }}>
              <p style={{ fontFamily:F.mono, fontSize:9, letterSpacing:".1em", textTransform:"uppercase", color:B.dim, marginBottom:4 }}>{m.l}</p>
              {m.v !== null
                ? <p style={{ fontFamily:F.disp, fontSize:22, color:B.teal, lineHeight:1 }}>{m.v}</p>
                : <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:1 }}>PENDING</p>
              }
            </div>
          ))}
        </div>
      </div>

      <MGrid items={[
        { l:"Active Prospects", v:active.length },
        { l:"Weighted Pipeline",     v:fmt(weighted), sm:true },
        { l:"Overdue",          v:overdue.length, alert:overdue.length > 0 },
        { l:"MRR",              v:"₱0", sm:true },
      ]} />

      <Card>
        <SLabel>Revenue Targets — Week 1 / 8</SLabel>
        {[["Setup Revenue", "₱0 / ₱100,000"], ["MRR", "₱0 / ₱25,000"]].map(([l, s]) => (
          <div key={l} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:B.dim }}>{l}</span>
              <span style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{s}</span>
            </div>
            <PBar pct={0} />
          </div>
        ))}
      </Card>

      <Card>
        <SLabel>Next Best Actions</SLabel>
        {overdue.map((p,i) => (
          <div key={"ov-"+i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, marginTop:5, flexShrink:0 }} />
            <p style={{ fontSize:13, color:B.ink, lineHeight:1.4 }}>Close {p.name} — {p.action}</p>
          </div>
        ))}
        {[
          "Manufacture next highest-scoring Archetype candidate",
          "Publish Surf archetype to Infrastructure Gallery",
          "Complete Nalu Surf Camp prototype — walk-in ready",
          "Register auroradigitalfoundry.com at Porkbun",
        ].map((t,i) => (
          <div key={"s-"+i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:B.muted, marginTop:5, flexShrink:0 }} />
            <p style={{ fontSize:13, color:B.dim, lineHeight:1.4 }}>{t}</p>
          </div>
        ))}
      </Card>

      <Card>
        <SLabel>Governance</SLabel>
        {[
          ["Spine Version",   "v2.0 — Asset-Centric", B.teal],
          ["Suite Status",    "STATE C — CANDIDATE",  B.teal],
          ["Weekly Review 1", "June 8, 2026",          B.teal],
          ["Patches Overdue", "0",                     B.green],
        ].map(([k, v, c]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
            <span style={{ fontSize:13, color:B.dim }}>{k}</span>
            <span style={{ fontFamily:F.mono, fontSize:11, color:c }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
function Leads({ leads, setLeads, ai }) {
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:"", vertical:"", location:"", fee:"", action:"" });

  const f = p => k => e => setForm(prev => ({ ...prev, [k]:e.target.value }));
  const visible = filter === "ALL" ? leads : leads.filter(l => l.status === filter);

  const submit = async () => {
    if (!form.name.trim()) return;
    const row = {
      id: "P-" + uid(), name:form.name, vertical:form.vertical, location:form.location,
      status:"PROSPECT", priority:"MEDIUM", contact:"TODO",
      fee:Number(form.fee) || 0, action:form.action || "Follow up",
      due:addDays(today(), 2), notes:"", created:today(),
    };
    setLeads(p => [...p, row]);
    setAdding(false);
    setForm({ name:"", vertical:"", location:"", fee:"", action:"" });
    await adapter.append("Leads", row);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <SLabel>Lead Inbox ({leads.length})</SLabel>
        <GBtn label={adding ? "✕ CANCEL" : "+ ADD"} onClick={() => setAdding(!adding)}
          style={{ background:adding ? "transparent" : B.green, borderColor:B.green, color:adding ? B.green : "#fff" }} />
      </div>

      {adding && (
        <Card style={{ borderColor:B.green }}>
          <SLabel>New Lead</SLabel>
          <Inp ph="Business name *"           val={form.name}   onChange={e => setForm(p => ({ ...p, name:e.target.value }))} />
          <Inp ph="Vertical (Tourism·Surf)"   val={form.vertical}  onChange={e => setForm(p => ({ ...p, vertical:e.target.value }))} />
          <Inp ph="Location"                  val={form.location}  onChange={e => setForm(p => ({ ...p, location:e.target.value }))} />
          <Inp ph="Est. fee (PHP)"            val={form.fee}    onChange={e => setForm(p => ({ ...p, fee:e.target.value }))} />
          <Inp ph="Next action"               val={form.action} onChange={e => setForm(p => ({ ...p, action:e.target.value }))} />
          <SaveBtn label="Save to Spine" onClick={submit} />
        </Card>
      )}

      <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4 }}>
        {["ALL","Proposal","Prototype","New Lead","Qualified","Parked"].map(x => (
          <GBtn key={x} label={x} onClick={() => setFilter(x)} on={filter === x} />
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {visible.map(l => (
          <div key={l.id}
            onClick={() => setExpanded(expanded === l.id ? null : l.id)}
            style={{
              background:B.surface,
              border:`1px solid ${B.border}`,
              borderLeft:`3px solid ${l.priority === "HIGH" ? B.red : l.priority === "MEDIUM" ? B.gold : B.muted}`,
              borderRadius:10, padding:14, cursor:"pointer",
            }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{l.name}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim, marginTop:2 }}>{l.vertical || l.v || "—"} · {l.location || l.loc || "—"}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                <Tag l={l.status} />
                {l.fee > 0 && <span style={{ fontFamily:F.mono, fontSize:10, color:B.teal }}>{fmt(l.fee)}</span>}
              </div>
            </div>
            <p style={{ fontSize:12, color:B.dim, marginTop:8, paddingTop:8, borderTop:`1px solid ${B.border}`, lineHeight:1.5 }}>
              {l.action}
            </p>
            {expanded === l.id && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${B.border}` }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
                  {[["Follow-up",l.due||"—"],["Priority",l.priority||"—"],["Source",l.source||"—"],["Recon",l.reconStatus||"—"],["Notes",l.notes||"—"]].map(([k,v]) => (
                    <div key={k}>
                      <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, marginBottom:2 }}>{k}</p>
                      <p style={{ fontSize:12, color:B.ink }}>{v}</p>
                    </div>
                  ))}
                </div>
                {l.prototypeUrl && l.prototypeUrl !== "PENDING" && l.prototypeUrl !== "" && (
                  <div style={{ marginBottom:8 }}>
                    <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, marginBottom:3 }}>PROTOTYPE</p>
                    <a href={l.prototypeUrl} target="_blank" rel="noopener"
                      style={{ fontSize:12, color:B.teal, wordBreak:"break-all" }}
                      onClick={e => e.stopPropagation()}>
                      {l.prototypeUrl} ↗
                    </a>
                  </div>
                )}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <AIBtn label="⚡ Follow-up"  onClick={() => ai(`Draft a professional follow-up message for ${l.name}. Brief, clear CTA. Context: ${l.action}`)} />
                  <AIBtn label="⚡ Close Script" onClick={() => ai(`Write a closing script for ${l.name}. They've seen the demo. Goal: deposit. Fee: ${fmt(l.fee)}`)} />
                  <AIBtn label="⚡ Re-engage"  onClick={() => ai(`Write a WhatsApp re-engagement message for ${l.name} who has gone quiet after the demo.`)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Pipeline({ pipeline, setPipeline, ai }) {
  const wt = pipeline.reduce((a, d) => a + d.value * (d.prob / 100), 0);
  const STAGES = ["New Lead","Qualified","Prototype","Presentation","Proposal","Closed Won","Closed Lost"];

  const updateStage = async (id, stage) => {
    setPipeline(p => p.map(d => d.id === id ? { ...d, stage } : d));
    await adapter.update("Pipeline", id, { stage });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Sales Pipeline</SLabel>
      <MGrid items={[
        { l:"Open Deals",    v:pipeline.length },
        { l:"Weighted Value",v:fmt(Math.round(wt)), sm:true },
      ]} />
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {pipeline.map(d => (
          <Card key={d.id}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:10 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{d.name}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim, marginTop:2 }}>{d.id} · Due {d.due}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                <Tag l={d.stage} />
                <span style={{ fontFamily:F.mono, fontSize:11, color:B.teal }}>{fmt(d.value)}</span>
              </div>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:B.dim }}>Probability</span>
                <span style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{d.prob}%</span>
              </div>
              <PBar pct={d.prob} />
            </div>
            <p style={{ fontSize:12, color:B.dim, marginBottom:10 }}>{d.next}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <AIBtn label="⚡ Follow-up"   onClick={() => ai(`Draft follow-up for ${d.name}. Stage: ${d.stage}.`)} />
              <AIBtn label="⚡ Close Script" onClick={() => ai(`Write closing script for ${d.name}. Stage: ${d.stage}. Value: ${fmt(d.value)}.`)} />
              <select value={d.stage} onChange={e => updateStage(d.id, e.target.value)}
                style={{ fontFamily:F.mono, fontSize:9, padding:"4px 6px", border:`1px solid ${B.border}`, borderRadius:6, background:B.surface, color:B.ink, cursor:"pointer" }}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function FollowUps({ followups, setFollowups }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ lead:"", type:"72HR", action:"", due:"" });

  const pending = followups.filter(f => f.status !== "DONE");
  const doneCount = followups.filter(f => f.status === "DONE").length;

  // ── OPTION B PERSISTENCE ─────────────────────────────────────
  // DONE ✓ writes to PROSPECTS (no FollowUps tab — Option B confirmed).
  // Pushes follow_up_date forward by cadence. Appends to ACTIVITY_LOG.
  const markDone = async (id) => {
    // Optimistic UI update
    setFollowups(p => p.map(f => f.id === id ? { ...f, status:"DONE" } : f));

    const prospect = followups.find(f => f.id === id);
    if (!prospect) return;

    const cadence = prospect.cadence || prospect.type || "72HR";
    const pad = n => String(n).padStart(2, "0");
    const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const base = new Date();

    let newDue = "";
    let clearAction = false;
    switch (cadence) {
      case "24HR":  { const d = new Date(base); d.setDate(d.getDate()+1); newDue = isoDate(d); break; }
      case "72HR":  { const d = new Date(base); d.setDate(d.getDate()+3); newDue = isoDate(d); break; }
      case "7DAY":  { const d = new Date(base); d.setDate(d.getDate()+7); newDue = isoDate(d); break; }
      case "BUILD": newDue = ""; clearAction = true; break;
      case "NONE":  newDue = ""; clearAction = true; break;
      case "MANUAL": newDue = prospect.due || ""; break;
      default:      { const d = new Date(base); d.setDate(d.getDate()+3); newDue = isoDate(d); }
    }

    const now = new Date().toISOString();
    const prospectUpdate = {
      follow_up_date: newDue,
      updated_at: now,
      ...(clearAction ? { next_action: "" } : {}),
    };

    // Write 1: push follow_up_date forward in PROSPECTS
    await adapter.update("PROSPECTS", id, prospectUpdate);

    // Write 2: append completion record to ACTIVITY_LOG
    const logRow = {
      log_id:      "LOG-" + Date.now().toString(36),
      timestamp:   now,
      entry_type:  "Follow-Up",
      entity_type: "Prospect",
      entity_id:   id,
      summary:     `Completed ${cadence} follow-up: ${prospect.action || "—"} (${prospect.name || id})`,
      operator:    "hirrok",
    };
    await adapter.append("ACTIVITY_LOG", logRow);
  };

  const submit = async () => {
    if (!form.lead.trim()) return;
    const row = { id:"FU-" + uid(), ...form, status:"PENDING" };
    setFollowups(p => [...p, row]);
    setAdding(false);
    setForm({ lead:"", type:"72HR", action:"", due:"" });
    await adapter.append("FollowUps", row);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <SLabel>Follow-Up Queue ({pending.length})</SLabel>
        <GBtn label={adding ? "✕ CANCEL" : "+ ADD"} onClick={() => setAdding(!adding)} />
      </div>
      <p style={{ fontFamily:F.mono, fontSize:9, color:B.dim, letterSpacing:1 }}>
        CADENCE: 24HR → 72HR → 7DAY · NO EXCEPTIONS
      </p>

      {adding && (
        <Card style={{ borderColor:B.green }}>
          <SLabel>New Follow-Up</SLabel>
          <Inp ph="Client name *" val={form.lead} onChange={e => setForm(p => ({ ...p, lead:e.target.value }))} />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type:e.target.value }))} style={InpStyle}>
            {["24HR","72HR","7DAY","BUILD","DEBRIEF"].map(t => <option key={t}>{t}</option>)}
          </select>
          <Inp ph="Action required" val={form.action} onChange={e => setForm(p => ({ ...p, action:e.target.value }))} />
          <Inp ph="" val={form.due} onChange={e => setForm(p => ({ ...p, due:e.target.value }))} type="date" />
          <SaveBtn label="Save to Spine" onClick={submit} />
        </Card>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {pending.map(f => {
          const isOv = f.due && f.due !== "—" && new Date(f.due) < new Date() &&
            !["Conversion","Production","Maintenance","Lost","Archived"].includes(f.status);
          const dueDisplay = typeof f.due === "string" && f.due.includes("T") ? f.due.split("T")[0] : f.due;
          return (
          <div key={f.id} style={{
            background: isOv ? B.rbg : B.surface,
            border:`1px solid ${isOv ? "rgba(204,34,34,.3)" : B.border}`,
            borderRadius:10, padding:12, display:"flex", gap:10, alignItems:"center",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap", alignItems:"center" }}>
                <Tag l={f.cadence || f.type || "72HR"} />
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{f.name || f.lead || "—"}</p>
              </div>
              <p style={{ fontSize:12, color:B.dim }}>{f.action}</p>
              <p style={{ fontFamily:F.mono, fontSize:9, color:isOv ? B.red : B.muted, marginTop:3 }}>
                {isOv ? "⚠ OVERDUE" : "DUE"} · {dueDisplay}
              </p>
            </div>
            <button onClick={() => markDone(f.id)} style={{
              background:B.green, color:"#fff", fontFamily:F.mono, fontSize:8, letterSpacing:".1em",
              padding:"7px 10px", borderRadius:6, border:"none", cursor:"pointer", flexShrink:0,
            }}>DONE ✓</button>
          </div>
          );
        })}
        {doneCount > 0 && (
          <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:2, padding:"4px 0" }}>
            {doneCount} COMPLETED
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Customers({ customers }) {
  const active = customers.filter(c => c.ltv > 0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>CRM — Customer Records</SLabel>
      {active.length === 0 ? (
        <Card accent>
          <p style={{ fontFamily:F.mono, fontSize:10, color:B.teal, marginBottom:6 }}>STATUS</p>
          <p style={{ fontSize:13, color:B.dim, lineHeight:1.6 }}>
            No converted clients yet. When a lead is marked <strong style={{ color:B.green }}>Won</strong>,
            their full record appears here — lifetime value, history, review tracking, and maintenance status.
          </p>
        </Card>
      ) : active.map(c => (
        <Card key={c.id}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:8 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{c.name}</p>
              <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{c.source}</p>
            </div>
            <Tag l={c.status || "Active"} />
          </div>
          <Divider />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div>
              <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted }}>LIFETIME VALUE</p>
              <p style={{ fontFamily:F.mono, fontSize:13, color:B.teal }}>{fmt(c.ltv)}</p>
            </div>
            <div>
              <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted }}>LAST CONTACT</p>
              <p style={{ fontSize:12, color:B.ink }}>{c.last || "—"}</p>
            </div>
          </div>
        </Card>
      ))}
      <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:1 }}>
        UPGRADE PATH: Lead → Won → Customer → Maintenance Client
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Bookings({ bookings, setBookings, ai }) {
  const STATUSES = ["Pending","In Build","Review","Live","Paid"];
  const update = (id, status) => setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Bookings / Jobs / Orders</SLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {bookings.map(j => (
          <Card key={j.id}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:8 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{j.client}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{j.id} · {j.type}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <Tag l={j.status} />
                <span style={{ fontFamily:F.mono, fontSize:11, color:B.teal }}>{fmt(j.value)}</span>
              </div>
            </div>
            <p style={{ fontSize:12, color:B.dim, marginBottom:8 }}>{j.notes}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <AIBtn label="⚡ Project Brief"   onClick={() => ai(`Generate a project brief for ${j.client} ${j.type}. Scope, deliverables, timeline.`)} />
              <AIBtn label="⚡ Launch Checklist" onClick={() => ai(`Write a handover and launch checklist for ${j.client} going live.`)} />
              <select value={j.status} onChange={e => update(j.id, e.target.value)}
                style={{ fontFamily:F.mono, fontSize:9, padding:"4px 6px", border:`1px solid ${B.border}`, borderRadius:6, background:B.surface, color:B.ink, cursor:"pointer" }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Marketing({ marketing, setMarketing, ai }) {
  const done = id => setMarketing(p => p.map(m => m.id === id ? { ...m, status:"Done" } : m));
  const pending = marketing.filter(m => m.status !== "Done");
  const doneCount = marketing.filter(m => m.status === "Done").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Marketing Command ({pending.length} open)</SLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {pending.map(m => (
          <Card key={m.id}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                  <Tag l={m.status === "Open" ? "Open" : m.status} />
                  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:99,
                    fontFamily:F.mono, fontSize:10, fontWeight:600,
                    background:B.bbg, border:`1px solid ${B.blue}44`, color:B.blue }}>{m.ch}</span>
                </div>
                <p style={{ fontSize:13, color:B.ink, marginBottom:4 }}>{m.task}</p>
                <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted }}>Due: {m.due}</p>
                <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                  <AIBtn label="⚡ Draft Post"
                    onClick={() => ai(`Write a ${m.ch} post for: "${m.task}". Professional, local appeal.`)} />
                  <AIBtn label="⚡ GBP Post"
                    onClick={() => ai("Write a Google Business Profile post for Aurora Digital Foundry. Max 300 chars.")} />
                </div>
              </div>
              <button onClick={() => done(m.id)} style={{
                background:B.green, color:"#fff", fontFamily:F.mono, fontSize:8,
                letterSpacing:".1em", padding:"7px 10px", borderRadius:6, border:"none",
                cursor:"pointer", flexShrink:0,
              }}>DONE</button>
            </div>
          </Card>
        ))}
        {doneCount > 0 && (
          <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:2, padding:"4px 0" }}>{doneCount} COMPLETED</p>
        )}
      </div>
      <Card accent>
        <SLabel>AI Content Tools</SLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <AIBtn label="⚡ Weekly Content Plan"
            onClick={() => ai("Generate a 7-day social content plan for Aurora Digital Foundry. Local businesses, prototype-first, proof-of-work tone.")} />
          <AIBtn label="⚡ Local Business Posts"
            onClick={() => ai("Write 3 Facebook post ideas showing how a local Aurora Province business benefits from digital infrastructure.")} />
          <AIBtn label="⚡ Campaign Checklist"
            onClick={() => ai("Write a campaign launch checklist: pre-launch, launch day, follow-up tasks.")} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Reviews({ reviews, setReviews, ai }) {
  const markSent = id => setReviews(p => p.map(r => r.id === id ? { ...r, status:"Sent" } : r));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Review & Reputation Hub</SLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {reviews.map(r => (
          <Card key={r.id}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:8 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{r.client}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{r.platform}</p>
              </div>
              <Tag l={r.status} />
            </div>
            <p style={{ fontSize:11, color:B.dim, marginBottom:8 }}>{r.notes}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <AIBtn label="⚡ Draft Request"
                onClick={() => ai(`Write a review request message for ${r.client}. Friendly, brief, direct ask.`)} />
              {r.status === "Received" && (
                <AIBtn label="⚡ Draft Response"
                  onClick={() => ai(`Write a professional response to a 5-star Google review for ${r.client}.`)} />
              )}
              <GBtn label="Mark Sent" onClick={() => markSent(r.id)} />
            </div>
          </Card>
        ))}
      </div>
      <Card accent>
        <SLabel>Reputation Tools</SLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <AIBtn label="⚡ Flag Reputation Risks"
            onClick={() => ai("Analyze current pipeline and flag any reputation risks or follow-up gaps.")} />
          <AIBtn label="⚡ Extract Testimonials"
            onClick={() => ai("Which current clients are the best testimonial candidates and why?")} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function AIConsole({ leads, pipeline, followups, assets, autoRun, onRan }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("adf_api_key") || "");
  const [showKey, setShowKey] = useState(false);

  const PRESETS = [
    "Generate this week's Foundry operator brief — asset-centric",
    "Which archetype should be manufactured next and why?",
    "Identify revenue gaps — which active prospects are closest to closing?",
    "Draft 72hr follow-up for the highest-probability Proposal stage prospect",
    "Write a demo walk-in script for a Prototype-stage prospect",
    "Suggest 3 next archetype candidates for Aurora Province territory",
    "Draft a closing message for a Proposal prospect — deposit goal",
    "What is the highest-leverage action the Foundry can take today?",
  ];

  const run = async (prompt, idx = null) => {
    if (!prompt?.trim()) return;
    if (!apiKey.trim()) { setOutput("⚠ Enter your Anthropic API key above to use AI features."); return; }
    if (idx !== null) setActivePreset(idx);
    setLoading(true);
    setOutput(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "x-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildContext(leads, pipeline, followups, assets),
          messages: [{ role:"user", content:prompt }],
        }),
      });
      const d = await r.json();
      setOutput(d.content?.map(c => c.text || "").join("\n") || "No response.");
    } catch (e) {
      setOutput("Error: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (autoRun) { run(autoRun); if (onRan) onRan(); }
  }, [autoRun]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>AI Action Console</SLabel>
      <p style={{ fontFamily:F.mono, fontSize:9, color:B.dim, letterSpacing:1 }}>CLAUDE · FOUNDRY CONTEXT ACTIVE</p>

      {/* API Key input */}
      {!apiKey.trim() && (
        <div style={{ background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, borderRadius:10, padding:14 }}>
          <p style={{ fontFamily:F.mono, fontSize:9, color:B.red, letterSpacing:2, marginBottom:8 }}>⚠ API KEY REQUIRED</p>
          <p style={{ fontSize:12, color:B.dim, marginBottom:10, lineHeight:1.5 }}>Enter your Anthropic API key to activate AI features. Stored locally in your browser only.</p>
          <div style={{ display:"flex", gap:6 }}>
            <input type={showKey?"text":"password"} placeholder="sk-ant-..." value={apiKey}
              onChange={e => { setApiKey(e.target.value); localStorage.setItem("adf_api_key", e.target.value); }}
              style={{ flex:1, background:B.surface, border:`1px solid ${B.border}`, borderRadius:7,
                padding:"9px 12px", fontSize:13, fontFamily:F.body, color:B.ink, outline:"none" }} />
            <button onClick={() => setShowKey(!showKey)} style={{ padding:"9px 12px", background:B.surface, border:`1px solid ${B.border}`, borderRadius:7, cursor:"pointer", fontFamily:F.mono, fontSize:9, color:B.dim }}>{showKey?"HIDE":"SHOW"}</button>
          </div>
        </div>
      )}
      {apiKey.trim() && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:99,
            fontFamily:F.mono, fontSize:9, background:B.gbg, border:`1px solid ${B.green}44`, color:B.green }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:B.green }} />
            API KEY SET
          </div>
          <button onClick={() => { setApiKey(""); localStorage.removeItem("adf_api_key"); }}
            style={{ background:"none", border:"none", cursor:"pointer", fontFamily:F.mono, fontSize:9, color:B.dim }}>CLEAR</button>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => run(p, i)} style={{
            background: activePreset === i ? B.tbg : B.surface,
            border: `1px solid ${activePreset === i ? B.teal : B.border}`,
            borderRadius:10, padding:"11px 14px", textAlign:"left", cursor:"pointer",
            fontSize:12, color:B.ink, fontFamily:F.body,
          }}>{p}</button>
        ))}
      </div>

      <div style={{ display:"flex", gap:6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && run(input)}
          placeholder="Type a command…"
          style={{ flex:1, background:B.raised, border:`1px solid ${B.border}`, borderRadius:7,
            padding:"9px 12px", fontSize:13, fontFamily:F.body, color:B.ink, outline:"none" }} />
        <button onClick={() => run(input)} style={{
          padding:"9px 16px", background:B.teal, color:"#fff",
          border:"none", borderRadius:7, cursor:"pointer", fontFamily:F.body, fontSize:13, fontWeight:600,
        }}>RUN</button>
      </div>

      {loading && (
        <Card accent>
          <p style={{ fontFamily:F.mono, fontSize:10, color:B.teal, letterSpacing:2 }}>PROCESSING…</p>
        </Card>
      )}
      {output && (
        <Card>
          <p style={{ fontFamily:F.mono, fontSize:8, letterSpacing:3, color:B.teal, marginBottom:8 }}>OUTPUT</p>
          <p style={{ fontSize:12, color:B.ink, lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:F.body }}>{output}</p>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Settings({ spineConnected, spineStatus, spineDetail }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <SLabel>Foundry Settings</SLabel>
      <div style={{
        background: spineStatus==="LIVE" ? B.gbg : spineStatus==="FALLBACK" ? B.rbg : B.tbg,
        border: `1px solid ${spineStatus==="LIVE" ? "rgba(10,138,64,.3)" : spineStatus==="FALLBACK" ? "rgba(204,34,34,.3)" : "rgba(13,158,138,.25)"}`,
        borderRadius:10, padding:12,
      }}>
        <p style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2,
          color: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }}>
          {spineStatus==="LIVE"
            ? `✓ SPINE v2.0 LIVE — ${spineDetail || "PROSPECTS"} CONNECTED`
            : spineStatus==="FALLBACK"
            ? `⚠ SPINE FALLBACK — ${spineDetail || "READ FAILED"}`
            : "◌ SPINE v2.0 CONNECTING…"}
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {[
          ["Operator",         "Hirro Kuizon",                       false],
          ["GitHub",           "hirrok/adf-hq",                      false],
          ["Domain",           "auroradigitalfoundry.com — PENDING",  true],
          ["Hosting",          "GitHub Pages — free tier",            false],
          ["Data Spine",       spineStatus==="LIVE" ? `PROSPECTS — LIVE` : spineStatus==="FALLBACK" ? "FALLBACK — READ FAILED" : "Connecting…", spineStatus!=="LIVE"],
          ["Form Backend",     "Formspree — mjgzdlja",                false],
          ["GBP",              "NOT CREATED",                         true],
          ["Search Console",   "NOT SET UP",                          true],
          ["Analytics",        "NOT INSTALLED",                       true],
          ["Campaign Week",    "1 / 8",                               false],
          ["Setup Rev Target", "PHP 100,000 / 8 weeks",              false],
          ["MRR Target",       "PHP 25,000 / 8 weeks",               false],
          ["Suite Status",     "STATE C — CANDIDATE",                 false],
          ["Weekly Review 1",  "June 8, 2026",                        false],
        ].map(([k, v, warn]) => (
          <div key={k} style={{
            background:B.surface, border:`1px solid ${B.border}`, borderRadius:8,
            padding:"9px 13px", display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap",
          }}>
            <p style={{ fontFamily:F.mono, fontSize:9, color:B.dim, letterSpacing:2 }}>{k}</p>
            <p style={{ fontFamily:F.mono, fontSize:10, color:warn ? B.red : B.ink, textAlign:"right" }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ══════════════════════════════════════════════════════════════
const NAV_MODULES = [
  { id:"snapshot",  label:"SNAP",  icon:"ti-layout-dashboard" },
  { id:"leads",     label:"LEADS", icon:"ti-inbox"            },
  { id:"pipeline",  label:"PIPE",  icon:"ti-arrow-right-circle"},
  { id:"followups", label:"QUEUE", icon:"ti-clock"            },
  { id:"customers", label:"CRM",   icon:"ti-users"            },
  { id:"bookings",  label:"JOBS",  icon:"ti-calendar-event"   },
  { id:"marketing", label:"MKT",   icon:"ti-speakerphone"     },
  { id:"reviews",   label:"REP",   icon:"ti-star"             },
  { id:"ai",        label:"AI",    icon:"ti-bolt"             },
  { id:"settings",  label:"SET",   icon:"ti-settings"         },
];

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
export default function FoundryOps() {
  const [mod,         setMod]        = useState("snapshot");
  const [live,        setLive]       = useState(false);
  const [spineStatus, setSpineStatus]= useState("CONNECTING");
  const [spineDetail, setSpineDetail]= useState("");         // which tab confirmed readable

  // Secondary ledger state
  const [leads,      setLeads]     = useState(SEED_LEADS);
  const [pipeline,   setPipeline]  = useState(SEED_PIPELINE);
  const [followups,  setFollowups] = useState(SEED_FOLLOWUPS);
  const [customers,  setCustomers] = useState([]);
  const [bookings,   setBookings]  = useState(SEED_BOOKINGS);
  const [marketing,  setMarketing] = useState(SEED_MARKETING);
  const [reviews,    setReviews]   = useState(SEED_REVIEWS);

  // Primary asset ledger state — Spine v2.0
  const [archetypes,  setArchetypes]  = useState(SEED_ASSETS.archetypes);
  const [prototypes,  setPrototypes]  = useState(SEED_ASSETS.prototypes);
  const [gallery,     setGallery]     = useState(SEED_ASSETS.gallery);
  const [seoClusters, setSeoClusters] = useState(SEED_ASSETS.seoClusters);
  const [patterns,    setPatterns]    = useState(SEED_ASSETS.patterns);

  const [aiQueue,    setAiQueue]   = useState(null);
  const contentRef = useRef(null);

  // Derived overdue count from PROSPECTS (Option B — no separate FollowUps tab)
  const overdue = leads.filter(l =>
    (l.recordState === "ACTIVE" || !l.recordState) &&
    l.due && l.due !== "—" &&
    new Date(l.due) < new Date() &&
    !["Conversion","Production","Maintenance","Lost","Archived"].includes(l.status)
  ).length;

  // ── SPINE HYDRATION v2.0 ─────────────────────────────────────
  // Pattern: Sheet → adapter.read(tab) → mapper(row) → state
  // PART 4 — Badge reflects: spine reachable AND expected tab readable
  useEffect(() => {
    (async () => {
      // Step 1: Reconnect PROSPECTS (secondary — required for daily ops)
      const prospectsOk = await hydrateTab("PROSPECTS", mapProspect, (rows) => {
        const active = rows.filter(r => r.recordState === "ACTIVE" || !r.recordState);
        setLeads(active.length > 0 ? active : rows); // show all if no ACTIVE filter match
      });

      if (prospectsOk) {
        setLive(true);
        setSpineStatus("LIVE");
        setSpineDetail("PROSPECTS");
      } else {
        setSpineStatus("FALLBACK");
        setSpineDetail("PROSPECTS READ FAILED");
      }

      // Step 2: Hydrate primary asset ledgers (non-blocking — fail gracefully)
      await hydrateTab("ARCHETYPES",           mapArchetype,   setArchetypes);
      await hydrateTab("PROTOTYPES",           mapPrototype,   setPrototypes);
      await hydrateTab("INFRASTRUCTURE_GALLERY", mapGalleryItem, setGallery);
      await hydrateTab("SEO_CLUSTERS",         mapSEOCluster,  setSeoClusters);
      await hydrateTab("PATTERN_LIBRARY",      mapPattern,     setPatterns);
    })();
  }, []);

  const assets = { archetypes, prototypes, gallery, seoClusters, patterns };

  const nav = (id) => {
    setMod(id);
    contentRef.current?.scrollTo({ top:0, behavior:"smooth" });
  };

  const ai = (prompt) => { setAiQueue(prompt); nav("ai"); };

  const MODULE_MAP = {
    snapshot:  <Snapshot  leads={leads} assets={assets} nav={nav} />,
    leads:     <Leads     leads={leads} setLeads={setLeads} ai={ai} />,
    pipeline:  <Pipeline  pipeline={pipeline} setPipeline={setPipeline} ai={ai} />,
    followups: <FollowUps followups={leads} setFollowups={setLeads} />,
    customers: <Customers customers={customers} />,
    bookings:  <Bookings  bookings={bookings} setBookings={setBookings} ai={ai} />,
    marketing: <Marketing marketing={marketing} setMarketing={setMarketing} ai={ai} />,
    reviews:   <Reviews   reviews={reviews} setReviews={setReviews} ai={ai} />,
    ai:        <AIConsole leads={leads} pipeline={pipeline} followups={followups} assets={assets} autoRun={aiQueue} onRan={() => setAiQueue(null)} />,
    settings:  <Settings  spineConnected={live} spineStatus={spineStatus} spineDetail={spineDetail} />,
  };

  return (
    // Outer shell — full viewport, page background
    <div style={{ minHeight:"100vh", background:B.bg, fontFamily:F.body, WebkitFontSmoothing:"antialiased" }}>
      {/* FONTS & ICONS */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{min-height:100vh;background:${B.bg};}
        ::-webkit-scrollbar{width:2px;height:2px;background:${B.bg}}
        ::-webkit-scrollbar-thumb{background:${B.border}}
        ::placeholder{color:${B.muted}}
        input:focus,select:focus,textarea:focus{border-color:${B.teal}!important;outline:none}
        button{-webkit-tap-highlight-color:transparent}
        /* ── RESPONSIVE SHELL ── */
        .ops-shell{
          display:flex; flex-direction:column; height:100vh;
          max-width:480px; margin:0 auto; color:${B.ink};
          position:relative;
        }
        @media(min-width:900px){
          .ops-shell{
            max-width:900px;
            flex-direction:row;
            height:100vh;
            border-left:1px solid ${B.border};
            border-right:1px solid ${B.border};
          }
          .ops-topbar{
            display:none !important;
          }
          .ops-sidebar{
            display:flex !important;
            flex-direction:column;
            width:200px;
            min-width:200px;
            flex-shrink:0;
            border-right:1px solid ${B.border};
            background:${B.surface};
            padding:16px 0;
            overflow-y:auto;
          }
          .ops-sidebar-logo{
            display:flex !important;
            align-items:center;
            gap:10px;
            padding:0 16px 20px;
            border-bottom:1px solid ${B.border};
            margin-bottom:12px;
          }
          .ops-sidenav-btn{
            display:flex !important;
            align-items:center;
            gap:10px;
            padding:10px 16px;
            border:none;
            background:none;
            cursor:pointer;
            font-family:${F.mono};
            font-size:10px;
            letter-spacing:.12em;
            color:${B.dim};
            width:100%;
            text-align:left;
            border-left:2px solid transparent;
            transition:all .1s;
          }
          .ops-sidenav-btn.active{
            color:${B.teal};
            background:${B.tbg};
            border-left-color:${B.teal};
          }
          .ops-sidenav-btn i{ font-size:16px; flex-shrink:0; }
          .ops-bottomnav{
            display:none !important;
          }
          .ops-content{
            flex:1;
            overflow-y:auto;
            padding:24px 28px;
          }
        }
        @media(max-width:899px){
          .ops-sidebar{ display:none !important; }
          .ops-sidenav-btn{ display:none !important; }
          .ops-sidebar-logo{ display:none !important; }
          .ops-topbar{ display:flex !important; }
          .ops-bottomnav{ display:flex !important; }
          .ops-content{ flex:1; overflow-y:auto; padding:14px; }
        }
      `}</style>
    <div className="ops-shell">

      {/* DESKTOP SIDEBAR — hidden on mobile via CSS */}
      <div className="ops-sidebar">
        <div className="ops-sidebar-logo">
          <div style={{ width:28, height:28, borderRadius:6, background:B.teal,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontFamily:F.disp, fontSize:17, color:"#fff", letterSpacing:1, lineHeight:1 }}>A</span>
          </div>
          <div>
            <p style={{ fontFamily:F.disp, fontSize:12, letterSpacing:3, color:B.ink, lineHeight:1 }}>FOUNDRY <span style={{ color:B.teal }}>OPS</span></p>
            <p style={{ fontFamily:F.mono, fontSize:7, color:B.tlo, letterSpacing:2, marginTop:2 }}>AURORA DIGITAL FOUNDRY</p>
          </div>
        </div>
        <div style={{ padding:"0 12px", marginBottom:12, display:"flex", gap:6, flexWrap:"wrap" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:99,
            fontFamily:F.mono, fontSize:9,
            background: spineStatus==="LIVE" ? B.gbg : spineStatus==="FALLBACK" ? B.rbg : B.tbg,
            border: `1px solid ${spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? "rgba(204,34,34,.4)" : B.teal}`,
            color: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }}>
            <div style={{ width:5, height:5, borderRadius:"50%",
              background: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }} />
            {spineStatus==="LIVE" ? "LIVE" : spineStatus==="FALLBACK" ? "FALLBACK" : "…"}
          </div>
          {overdue > 0 && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:99,
              fontFamily:F.mono, fontSize:9, background:B.rbg,
              border:`1px solid rgba(204,34,34,.3)`, color:B.red }}>⚠ {overdue}</div>
          )}
        </div>
        {NAV_MODULES.map(n => (
          <button key={n.id} onClick={() => nav(n.id)}
            className={`ops-sidenav-btn${mod===n.id?" active":""}`}>
            <i className={`ti ${n.icon}`} />
            {n.label}
            {n.id==="followups" && overdue>0 && (
              <span style={{ marginLeft:"auto", background:B.red, color:"#fff",
                fontFamily:F.mono, fontSize:7, padding:"1px 5px", borderRadius:99 }}>{overdue}</span>
            )}
          </button>
        ))}
      </div>

      {/* MOBILE TOP BAR — hidden on desktop via CSS */}
      <div className="ops-topbar" style={{
        background:B.surface, borderBottom:`1px solid ${B.border}`,
        padding:"10px 14px", alignItems:"center",
        justifyContent:"space-between", gap:8, flexShrink:0,
        boxShadow:`0 1px 4px rgba(13,44,40,.06)`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:B.teal,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontFamily:F.disp, fontSize:17, color:"#fff", letterSpacing:1, lineHeight:1 }}>A</span>
          </div>
          <div>
            <p style={{ fontFamily:F.disp, fontSize:13, letterSpacing:3, color:B.ink, lineHeight:1 }}>
              FOUNDRY <span style={{ color:B.teal }}>OPS</span>
            </p>
            <p style={{ fontFamily:F.mono, fontSize:7, color:B.tlo, letterSpacing:2, marginTop:1 }}>
              AURORA DIGITAL FOUNDRY
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px",
            borderRadius:99, fontFamily:F.mono, fontSize:9,
            background: spineStatus==="LIVE" ? B.gbg : spineStatus==="FALLBACK" ? B.rbg : B.tbg,
            border: `1px solid ${spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? "rgba(204,34,34,.4)" : B.teal}`,
            color: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal,
          }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }} />
            {spineStatus==="LIVE" ? "LIVE" : spineStatus==="FALLBACK" ? "FALLBACK" : "…"}
          </div>
          {overdue > 0 && (
            <button onClick={() => nav("followups")} style={{ display:"inline-flex", alignItems:"center", gap:4,
              padding:"3px 8px", borderRadius:99, fontFamily:F.mono, fontSize:9,
              background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, color:B.red, cursor:"pointer",
            }}>⚠ {overdue} OVERDUE</button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div ref={contentRef} className="ops-content">
        {MODULE_MAP[mod]}
      </div>

      {/* MOBILE BOTTOM NAV — hidden on desktop via CSS */}
      <div className="ops-bottomnav" style={{
        background:B.surface, borderTop:`1px solid ${B.border}`,
        overflowX:"auto", flexShrink:0,
        boxShadow:`0 -1px 4px rgba(13,44,40,.06)`,
      }}>
        {NAV_MODULES.map(n => (
          <button key={n.id} onClick={() => nav(n.id)} style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            padding:"8px 4px", border:"none", background:"none",
            borderBottom:`2px solid ${mod === n.id ? B.teal : "transparent"}`,
            cursor:"pointer", flex:1, minWidth:44, flexShrink:0,
            fontFamily:F.mono, fontSize:6, letterSpacing:1,
            color: mod === n.id ? B.teal : B.dim,
            transition:"all .1s",
          }}>
            <i className={`ti ${n.icon}`} style={{ fontSize:16 }} />
            {n.label}
            {n.id === "followups" && overdue > 0 && (
              <span style={{
                background:B.red, color:"#fff", fontFamily:F.mono, fontSize:7,
                padding:"1px 4px", borderRadius:99, marginTop:-2,
              }}>{overdue}</span>
            )}
          </button>
        ))}
      </div>
    </div>
    </div>
  );
}};

const F = {
  disp: "'Bebas Neue', Impact, sans-serif",
  mono: "'DM Mono', 'Courier New', monospace",
  body: "'Barlow', system-ui, sans-serif",
};

// ── SPINE ADAPTER ─────────────────────────────────────────────
const SPINE_URL = "https://script.google.com/macros/s/AKfycbwtD_9fIe483qD-8_czsigAdBhf3UGbJRUoyDcIFMLqeqdYIPmV-GfdjQyCyTMdvNwC/exec";

const adapter = {
  async read(sheet) {
    try {
      const r = await fetch(`${SPINE_URL}?sheet=${sheet}`);
      const d = await r.json();
      return d.data || null;
    } catch { return null; }
  },
  async append(sheet, row) {
    try {
      const r = await fetch(SPINE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "append", sheet, row }),
      });
      return await r.json();
    } catch { return { ok: false, offline: true }; }
  },
  async update(sheet, id, data) {
    try {
      const r = await fetch(SPINE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", sheet, id, data }),
      });
      return await r.json();
    } catch { return { ok: false, offline: true }; }
  },
};

// ── UTILITIES ─────────────────────────────────────────────────
const uid     = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const today   = () => new Date().toISOString().split("T")[0];
const addDays = (s, n) => { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().split("T")[0]; };
const fmt     = n => "₱" + Number(n).toLocaleString();

// ── SEED DATA ─────────────────────────────────────────────────
// ── FALLBACK SEED DATA ────────────────────────────────────────
// Emergency fallback. Shown when PROSPECTS tab cannot be read.
// Spine v2.0 schema — no real names, no real data.
// Patch v1.3 — 2026-06-03: Reconnected to Spine v2.0 PROSPECTS.
const SEED_LEADS = [
  { id:"pros-XXX", name:"Demo Tourism Prospect",    vertical:"Tourism",       location:"Aurora Province", territory:"Baler/Aurora",    status:"Prototype", priority:"HIGH",   contact:"—", source:"—", fee:0, setupFee:0, monthlyRetainer:0, probability:0, action:"Spine offline — connect PROSPECTS tab", due:"—", cadence:"NONE", notes:"Fallback record.", recordState:"DEMO" },
  { id:"pros-XXX", name:"Demo Food Prospect",       vertical:"Food",          location:"Quezon Province", territory:"Lucena/Quezon",   status:"New Lead",  priority:"MEDIUM", contact:"—", source:"—", fee:0, setupFee:0, monthlyRetainer:0, probability:0, action:"Spine offline — connect PROSPECTS tab", due:"—", cadence:"NONE", notes:"Fallback record.", recordState:"DEMO" },
];

const SEED_PIPELINE = [
  { id:"D-XXX", name:"Demo Prospect A", stage:"Proposal",  value:0, prob:0, due:"—", next:"Spine offline" },
];
const SEED_FOLLOWUPS = [
  { id:"FU-XXX", lead:"Demo Prospect A", type:"72HR", due:"—", action:"Spine offline — connect PROSPECTS tab", status:"PENDING" },
];
const SEED_BOOKINGS  = [{ id:"J-XXX", client:"Demo Client", type:"Standard Build", status:"Pending", value:0, notes:"Spine offline." }];
const SEED_MARKETING = [
  { id:"M-001", ch:"GBP",      task:"Create ADF Google Business Profile listing", status:"Open", due:"2026-06-07" },
  { id:"M-002", ch:"Facebook", task:"Foundry — first proof-of-work post",          status:"Open", due:"2026-06-10" },
];
const SEED_REVIEWS   = [{ id:"R-XXX", client:"Demo Client", platform:"Google", status:"Not Sent", notes:"Spine offline." }];

// ── ASSET LEDGER FALLBACK SEEDS ───────────────────────────────
// Used by Snapshot when primary ledger reads fail.
const SEED_ASSETS = {
  archetypes:  [],
  prototypes:  [],
  gallery:     [],
  seoClusters: [],
  patterns:    [],
  osModules:   [],
};

// ── SHARED COMPONENTS ─────────────────────────────────────────
const TAG_COLOR = {
  // Legacy status values kept for backward compat
  DEMO:"teal", PITCH:"green", QUEUED:"blue", PROSPECT:"dim", STRATEGIC:"dim",
  // Spine v2.0 canonical stage values
  "New Lead":"dim", "Qualified":"blue", "Prototype":"teal",
  "Presentation":"teal", "Proposal":"green", "Conversion":"green",
  "Production":"green", "Maintenance":"teal", "Lost":"red", "Parked":"dim", "Archived":"dim",
  // Shared
  "Not Sent":"dim", Sent:"teal", Received:"green",
  "Closed Won":"green", "Closed Lost":"red",
  OVERDUE:"red", PENDING:"dim", Open:"gold", Done:"green",
  HIGH:"red", MEDIUM:"gold", LOW:"dim",
  Pending:"dim", "In Build":"teal", Review:"gold", Live:"green", Paid:"green",
};
const TAG_MAP = {
  teal:  { bg:B.tbg,    border:"rgba(13,158,138,.3)",  color:B.teal  },
  green: { bg:B.gbg,    border:"rgba(10,138,64,.3)",   color:B.green },
  red:   { bg:B.rbg,    border:"rgba(204,34,34,.3)",   color:B.red   },
  blue:  { bg:B.bbg,    border:"rgba(26,96,168,.3)",   color:B.blue  },
  gold:  { bg:B.goldbg, border:"rgba(217,119,6,.3)",   color:B.gold  },
  dim:   { bg:"rgba(74,106,104,.1)", border:"rgba(74,106,104,.2)", color:B.dim },
};

const Tag = ({ l }) => {
  const m = TAG_MAP[TAG_COLOR[l] || "dim"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:99,
      fontFamily:F.mono, fontSize:10, fontWeight:600, whiteSpace:"nowrap",
      background:m.bg, border:`1px solid ${m.border}`, color:m.color }}>
      {l}
    </span>
  );
};

const SLabel = ({ children }) => (
  <p style={{ fontFamily:F.mono, fontSize:9, fontWeight:600, letterSpacing:".14em",
    textTransform:"uppercase", color:B.teal, marginBottom:6 }}>
    {children}
  </p>
);

const Card = ({ children, accent, red, style={} }) => (
  <div style={{
    background: accent ? B.tbg : red ? B.rbg : B.surface,
    border: `1px solid ${accent ? "rgba(13,158,138,.25)" : red ? "rgba(204,34,34,.3)" : B.border}`,
    borderRadius:10, padding:14, ...style,
  }}>{children}</div>
);

const Divider = () => <div style={{ height:1, background:B.border, margin:"8px 0" }} />;

const PBar = ({ pct }) => (
  <div style={{ height:4, background:B.border, borderRadius:99, overflow:"hidden" }}>
    <div style={{ height:4, width:`${Math.min(100, pct)}%`, background:B.teal, borderRadius:99 }} />
  </div>
);

const MGrid = ({ items }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
    {items.map(m => (
      <div key={m.l} style={{
        background: m.alert ? B.rbg : B.raised,
        border: `1px solid ${m.alert ? "rgba(204,34,34,.35)" : B.border}`,
        borderRadius:8, padding:"12px 14px",
      }}>
        <p style={{ fontFamily:F.mono, fontSize:9, letterSpacing:".1em", textTransform:"uppercase", color:B.dim, marginBottom:4 }}>{m.l}</p>
        <p style={{ fontFamily:F.disp, fontSize:m.sm ? 16 : 22, letterSpacing:".02em", color:m.alert ? B.red : B.teal, lineHeight:1 }}>{m.v}</p>
        {m.n && <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, marginTop:3 }}>{m.n}</p>}
      </div>
    ))}
  </div>
);

const GBtn = ({ label, onClick, on, style={} }) => (
  <button onClick={onClick} style={{
    padding:"5px 10px", borderRadius:6, cursor:"pointer",
    fontFamily:F.mono, fontSize:9, letterSpacing:".1em",
    background: on ? B.teal : "transparent",
    color: on ? "#fff" : B.dim,
    border: `1px solid ${on ? B.teal : B.border}`,
    whiteSpace:"nowrap", flexShrink:0, ...style,
  }}>{label}</button>
);

const AIBtn = ({ label, onClick }) => (
  <button onClick={onClick} style={{
    padding:"5px 10px", borderRadius:6, cursor:"pointer",
    fontFamily:F.mono, fontSize:9, letterSpacing:".1em",
    background:B.tbg, border:`1px solid rgba(13,158,138,.3)`, color:B.teal,
    whiteSpace:"nowrap", flexShrink:0,
  }}>{label}</button>
);

const InpStyle = {
  display:"block", width:"100%", background:B.raised,
  border:`1px solid ${B.border}`, borderRadius:7,
  padding:"9px 12px", fontSize:13, fontFamily:F.body, color:B.ink,
  outline:"none", marginBottom:8, boxSizing:"border-box",
};

const Inp = ({ ph, val, onChange, type="text" }) => (
  <input type={type} placeholder={ph} value={val} onChange={onChange} style={InpStyle} />
);

const SaveBtn = ({ label, onClick }) => (
  <button onClick={onClick} style={{
    width:"100%", padding:10, background:B.green, color:"#fff",
    border:"none", borderRadius:7, cursor:"pointer",
    fontFamily:F.body, fontSize:13, fontWeight:600,
  }}>{label}</button>
);

// ══════════════════════════════════════════════════════════════
// HYDRATION LAYER — Spine v2.0
// Pattern: Sheet → adapter.read(tabName) → mapper(row) → module state
//
// Each ledger has:
//   adapter.read(TAB_NAME)  — fetches raw rows from Google Sheets
//   map[TabName](row)       — transforms raw row to frontend shape
//
// Adding a new ledger = add one read call + one mapper function.
// No custom fetch logic. No repeated boilerplate.
//
// PRIMARY LEDGERS (asset-centric):
//   ARCHETYPES, PROTOTYPES, INFRASTRUCTURE_GALLERY,
//   SEO_CLUSTERS, PATTERN_LIBRARY, OPERATOR_SUITE_MODULES
//
// SECONDARY LEDGERS (sales):
//   PROSPECTS, CLIENTS, REVENUE, ACTIVITY_LOG
// ══════════════════════════════════════════════════════════════

// ── MAPPER: PROSPECTS (Spine v2.0 schema) ────────────────────
// Tab: PROSPECTS
// Columns: prospect_id, business_name, industry, location, territory,
//          source, linked_archetype_id, linked_gallery_item_id,
//          stage, record_state, priority, template_family,
//          setup_fee, monthly_retainer, probability_pct,
//          next_action, follow_up_date, follow_up_cadence,
//          notes, created_at, updated_at

function mapProspect(row) {
  const r = Array.isArray(row)
    ? {
        prospect_id: row[0], business_name: row[1], industry: row[2],
        location: row[3], territory: row[4], source: row[5],
        linked_archetype_id: row[6], linked_gallery_item_id: row[7],
        stage: row[8], record_state: row[9], priority: row[10],
        template_family: row[11], setup_fee: row[12], monthly_retainer: row[13],
        probability_pct: row[14], next_action: row[15], follow_up_date: row[16],
        follow_up_cadence: row[17], notes: row[18], created_at: row[19], updated_at: row[20],
      }
    : row;

  const setupFee      = Number(r.setup_fee)       || 0;
  const retainer      = Number(r.monthly_retainer) || 0;
  const probability   = Number(r.probability_pct)  || 0;
  const estValue      = setupFee + (retainer * 3);
  const weighted      = Math.round(estValue * probability / 100);

  return {
    id:             r.prospect_id        || "",
    name:           r.business_name      || "",
    vertical:       r.industry           || "",
    location:       r.location           || "",
    territory:      r.territory          || "",
    source:         r.source             || "",
    archetypeId:    r.linked_archetype_id|| "",
    galleryId:      r.linked_gallery_item_id || "",
    status:         r.stage              || "New Lead",    // stage is the single lifecycle field
    recordState:    r.record_state       || "ACTIVE",
    priority:       r.priority           || "MEDIUM",
    templateFamily: r.template_family    || "",
    setupFee,
    monthlyRetainer: retainer,
    fee:            setupFee,                              // backward compat for card display
    probability,
    estValue,
    weighted,
    action:         r.next_action        || "",
    due:            r.follow_up_date     || "",
    cadence:        r.follow_up_cadence  || "NONE",
    notes:          r.notes              || "",
    contact:        "",                                    // not in v2.0 PROSPECTS schema
    reconStatus:    "",
    prototypeUrl:   "",
  };
}

// ── MAPPER: ARCHETYPES ────────────────────────────────────────
function mapArchetype(row) {
  const r = Array.isArray(row)
    ? { archetype_id:row[0], name:row[1], template_family:row[2], target_industry:row[3],
        target_market:row[4], search_gravity_score:row[5], commercial_gravity_score:row[6],
        pattern_reuse_score:row[7], backend_richness_score:row[8], strategic_fit_score:row[9],
        total_score:row[10], classification:row[11], lifecycle_state:row[12], priority:row[13],
        prototype_id:row[14], gallery_item_id:row[15], seo_cluster_id:row[16],
        frontend_demo_url:row[18], notes:row[20] }
    : row;
  return {
    id:            r.archetype_id       || "",
    name:          r.name               || "",
    family:        r.template_family    || "",
    industry:      r.target_industry    || "",
    market:        r.target_market      || "",
    score:         Number(r.total_score) || 0,
    classification:r.classification     || "",
    lifecycle:     r.lifecycle_state    || "Candidate",
    priority:      r.priority           || "MEDIUM",
    demoUrl:       r.frontend_demo_url  || "",
    notes:         r.notes              || "",
  };
}

// ── MAPPER: PROTOTYPES ────────────────────────────────────────
function mapPrototype(row) {
  const r = Array.isArray(row)
    ? { prototype_id:row[0], archetype_id:row[1], name:row[3], template_family:row[4],
        ownership:row[5], live_url:row[7], build_stage:row[9], page_count:row[10] }
    : row;
  return {
    id:         r.prototype_id  || "",
    archetypeId:r.archetype_id  || "",
    name:       r.name          || "",
    family:     r.template_family || "",
    ownership:  r.ownership     || "FOUNDRY",
    liveUrl:    r.live_url      || "",
    stage:      r.build_stage   || "",
    pages:      Number(r.page_count) || 0,
  };
}

// ── MAPPER: INFRASTRUCTURE_GALLERY ───────────────────────────
function mapGalleryItem(row) {
  const r = Array.isArray(row)
    ? { gallery_item_id:row[0], archetype_id:row[1], public_title:row[2],
        template_family:row[3], target_industry:row[4], business_problem_demonstrated:row[5],
        frontend_demo_url:row[6], published_status:row[10] }
    : row;
  return {
    id:          r.gallery_item_id    || "",
    archetypeId: r.archetype_id       || "",
    title:       r.public_title       || "",
    family:      r.template_family    || "",
    industry:    r.target_industry    || "",
    problem:     r.business_problem_demonstrated || "",
    demoUrl:     r.frontend_demo_url  || "",
    published:   ["Published","published","TRUE","true",true].includes(r.published_status),
  };
}

// ── MAPPER: SEO_CLUSTERS ──────────────────────────────────────
function mapSEOCluster(row) {
  const r = Array.isArray(row)
    ? { seo_cluster_id:row[0], vertical:row[2], territory:row[3],
        primary_keyword:row[4], status:row[11] }
    : row;
  return {
    id:       r.seo_cluster_id  || "",
    vertical: r.vertical        || "",
    territory:r.territory       || "",
    keyword:  r.primary_keyword || "",
    status:   r.status          || "",
  };
}

// ── MAPPER: PATTERN_LIBRARY ───────────────────────────────────
function mapPattern(row) {
  const r = Array.isArray(row)
    ? { pattern_id:row[0], name:row[1], pattern_family:row[2],
        reuse_count:row[7], promotion_status:row[8], status:row[10] }
    : row;
  return {
    id:        r.pattern_id       || "",
    name:      r.name             || "",
    family:    r.pattern_family   || "",
    reuse:     Number(r.reuse_count) || 0,
    status:    r.promotion_status || "",
  };
}

// ── HYDRATION HELPER ──────────────────────────────────────────
// Generic: reads a tab, maps rows, filters empties.
// Usage: hydrateTab("ARCHETYPES", mapArchetype, setArchetypes)
async function hydrateTab(tabName, mapFn, setter) {
  try {
    const raw = await adapter.read(tabName);
    if (raw && Array.isArray(raw) && raw.length > 0) {
      const mapped = raw.map(mapFn).filter(r => r.id);
      if (mapped.length > 0) { setter(mapped); return true; }
    }
  } catch(_) {}
  return false;
}

// ── AI CONTEXT ────────────────────────────────────────────────
const buildContext = (leads, pipeline, followups, assets) => {
  const overdue = leads.filter(l => l.due && l.due !== "—" && new Date(l.due) < new Date() && !["Conversion","Production","Maintenance","Lost","Archived"].includes(l.status));
  const weighted = leads.filter(l => l.recordState === "ACTIVE").reduce((a,l) => a + (l.weighted || 0), 0);
  const archetypesDeployed = (assets?.archetypes || []).filter(a => ["Deployed","Enhanced"].includes(a.lifecycle)).length;
  const prototypesLive     = (assets?.prototypes || []).filter(p => p.stage === "Live").length;
  const galleryPublished   = (assets?.gallery || []).filter(g => g.published).length;

  return `You are the AI console for Aurora Digital Foundry — an asset-centric business infrastructure manufacturer in Aurora Province, Philippines, operated by Hirro Kuizon.

Business model: Keyword Research → Archetype → Prototype → Infrastructure Gallery → SEO → Traffic → Lead → Client
Prospects are downstream of archetypes. Assets generate revenue. Revenue funds more assets.

Current manufacturing snapshot:
- Archetypes deployed: ${archetypesDeployed}
- Prototypes live: ${prototypesLive}
- Gallery items published: ${galleryPublished}
- Active prospects: ${leads.filter(l => l.recordState === "ACTIVE").length}
- Overdue follow-ups: ${overdue.length}
- Weighted pipeline: PHP ${weighted.toLocaleString()}
- 8-week targets: PHP 100,000 setup · PHP 25,000 MRR
- Week 1 of 8. Zero closes.

Be direct, operator-grade, zero filler. Use PHP for currency.`;
};

// ══════════════════════════════════════════════════════════════
// MODULES
// ══════════════════════════════════════════════════════════════

function Snapshot({ leads, assets, nav }) {
  const active   = leads.filter(l => l.recordState === "ACTIVE" || !l.recordState);
  const overdue  = active.filter(l => l.due && l.due !== "—" && new Date(l.due) < new Date() && !["Conversion","Production","Maintenance","Lost","Archived"].includes(l.status));
  const weighted = active.reduce((a,l) => a + (l.weighted || 0), 0);

  const archs     = assets?.archetypes  || [];
  const protos    = assets?.prototypes  || [];
  const gallery   = assets?.gallery     || [];
  const clusters  = assets?.seoClusters || [];
  const patterns  = assets?.patterns    || [];

  const archsDeployed  = archs.filter(a => ["Deployed","Enhanced"].includes(a.lifecycle)).length;
  const protosLive     = protos.filter(p => p.stage === "Live").length;
  const galleryLive    = gallery.filter(g => g.published).length;
  const clustersActive = clusters.filter(c => c.status === "Active").length;
  const patternReuse   = patterns.reduce((a,p) => a + p.reuse, 0);
  const hasAssets      = archs.length > 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Foundry Manufacturing Cockpit</SLabel>

      {overdue.length > 0 && (
        <div style={{ background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, borderRadius:10, padding:12,
          display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} />
          <p style={{ fontFamily:F.mono, fontSize:11, color:B.red, flex:1 }}>
            {overdue.length} OVERDUE FOLLOW-UP{overdue.length > 1 ? "S" : ""} — ACT NOW
          </p>
          <GBtn label="ACTION →" onClick={() => nav("followups")} on />
        </div>
      )}

      <div style={{ background:B.raised, border:`1px solid ${B.border}`, borderRadius:10, padding:14 }}>
        <SLabel>Foundry Assets</SLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            { l:"Archetypes Active",  v:hasAssets ? archsDeployed  : null },
            { l:"Prototypes Live", v:hasAssets ? protosLive     : null },
            { l:"Gallery Published",    v:hasAssets ? galleryLive    : null },
            { l:"SEO Clusters",    v:hasAssets ? clustersActive : null },
            { l:"Patterns",        v:hasAssets ? patterns.length: null },
            { l:"Pattern Reuse",   v:hasAssets ? patternReuse   : null },
          ].map(m => (
            <div key={m.l} style={{ background:B.surface, border:`1px solid ${B.border}`, borderRadius:8, padding:"10px 12px" }}>
              <p style={{ fontFamily:F.mono, fontSize:9, letterSpacing:".1em", textTransform:"uppercase", color:B.dim, marginBottom:4 }}>{m.l}</p>
              {m.v !== null
                ? <p style={{ fontFamily:F.disp, fontSize:22, color:B.teal, lineHeight:1 }}>{m.v}</p>
                : <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:1 }}>PENDING</p>
              }
            </div>
          ))}
        </div>
      </div>

      <MGrid items={[
        { l:"Active Prospects", v:active.length },
        { l:"Weighted Pipeline",     v:fmt(weighted), sm:true },
        { l:"Overdue",          v:overdue.length, alert:overdue.length > 0 },
        { l:"MRR",              v:"₱0", sm:true },
      ]} />

      <Card>
        <SLabel>Revenue Targets — Week 1 / 8</SLabel>
        {[["Setup Revenue", "₱0 / ₱100,000"], ["MRR", "₱0 / ₱25,000"]].map(([l, s]) => (
          <div key={l} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:B.dim }}>{l}</span>
              <span style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{s}</span>
            </div>
            <PBar pct={0} />
          </div>
        ))}
      </Card>

      <Card>
        <SLabel>Next Best Actions</SLabel>
        {overdue.map((p,i) => (
          <div key={"ov-"+i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, marginTop:5, flexShrink:0 }} />
            <p style={{ fontSize:13, color:B.ink, lineHeight:1.4 }}>Close {p.name} — {p.action}</p>
          </div>
        ))}
        {[
          "Manufacture next highest-scoring Archetype candidate",
          "Publish Surf archetype to Infrastructure Gallery",
          "Complete Nalu Surf Camp prototype — walk-in ready",
          "Register auroradigitalfoundry.com at Porkbun",
        ].map((t,i) => (
          <div key={"s-"+i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:B.muted, marginTop:5, flexShrink:0 }} />
            <p style={{ fontSize:13, color:B.dim, lineHeight:1.4 }}>{t}</p>
          </div>
        ))}
      </Card>

      <Card>
        <SLabel>Governance</SLabel>
        {[
          ["Spine Version",   "v2.0 — Asset-Centric", B.teal],
          ["Suite Status",    "STATE C — CANDIDATE",  B.teal],
          ["Weekly Review 1", "June 8, 2026",          B.teal],
          ["Patches Overdue", "0",                     B.green],
        ].map(([k, v, c]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
            <span style={{ fontSize:13, color:B.dim }}>{k}</span>
            <span style={{ fontFamily:F.mono, fontSize:11, color:c }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
function Leads({ leads, setLeads, ai }) {
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:"", vertical:"", location:"", fee:"", action:"" });

  const f = p => k => e => setForm(prev => ({ ...prev, [k]:e.target.value }));
  const visible = filter === "ALL" ? leads : leads.filter(l => l.status === filter);

  const submit = async () => {
    if (!form.name.trim()) return;
    const row = {
      id: "P-" + uid(), name:form.name, vertical:form.vertical, location:form.location,
      status:"PROSPECT", priority:"MEDIUM", contact:"TODO",
      fee:Number(form.fee) || 0, action:form.action || "Follow up",
      due:addDays(today(), 2), notes:"", created:today(),
    };
    setLeads(p => [...p, row]);
    setAdding(false);
    setForm({ name:"", vertical:"", location:"", fee:"", action:"" });
    await adapter.append("Leads", row);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <SLabel>Lead Inbox ({leads.length})</SLabel>
        <GBtn label={adding ? "✕ CANCEL" : "+ ADD"} onClick={() => setAdding(!adding)}
          style={{ background:adding ? "transparent" : B.green, borderColor:B.green, color:adding ? B.green : "#fff" }} />
      </div>

      {adding && (
        <Card style={{ borderColor:B.green }}>
          <SLabel>New Lead</SLabel>
          <Inp ph="Business name *"           val={form.name}   onChange={e => setForm(p => ({ ...p, name:e.target.value }))} />
          <Inp ph="Vertical (Tourism·Surf)"   val={form.vertical}  onChange={e => setForm(p => ({ ...p, vertical:e.target.value }))} />
          <Inp ph="Location"                  val={form.location}  onChange={e => setForm(p => ({ ...p, location:e.target.value }))} />
          <Inp ph="Est. fee (PHP)"            val={form.fee}    onChange={e => setForm(p => ({ ...p, fee:e.target.value }))} />
          <Inp ph="Next action"               val={form.action} onChange={e => setForm(p => ({ ...p, action:e.target.value }))} />
          <SaveBtn label="Save to Spine" onClick={submit} />
        </Card>
      )}

      <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4 }}>
        {["ALL","Proposal","Prototype","New Lead","Qualified","Parked"].map(x => (
          <GBtn key={x} label={x} onClick={() => setFilter(x)} on={filter === x} />
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {visible.map(l => (
          <div key={l.id}
            onClick={() => setExpanded(expanded === l.id ? null : l.id)}
            style={{
              background:B.surface,
              border:`1px solid ${B.border}`,
              borderLeft:`3px solid ${l.priority === "HIGH" ? B.red : l.priority === "MEDIUM" ? B.gold : B.muted}`,
              borderRadius:10, padding:14, cursor:"pointer",
            }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{l.name}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim, marginTop:2 }}>{l.vertical || l.v || "—"} · {l.location || l.loc || "—"}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                <Tag l={l.status} />
                {l.fee > 0 && <span style={{ fontFamily:F.mono, fontSize:10, color:B.teal }}>{fmt(l.fee)}</span>}
              </div>
            </div>
            <p style={{ fontSize:12, color:B.dim, marginTop:8, paddingTop:8, borderTop:`1px solid ${B.border}`, lineHeight:1.5 }}>
              {l.action}
            </p>
            {expanded === l.id && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${B.border}` }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
                  {[["Follow-up",l.due||"—"],["Priority",l.priority||"—"],["Source",l.source||"—"],["Recon",l.reconStatus||"—"],["Notes",l.notes||"—"]].map(([k,v]) => (
                    <div key={k}>
                      <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, marginBottom:2 }}>{k}</p>
                      <p style={{ fontSize:12, color:B.ink }}>{v}</p>
                    </div>
                  ))}
                </div>
                {l.prototypeUrl && l.prototypeUrl !== "PENDING" && l.prototypeUrl !== "" && (
                  <div style={{ marginBottom:8 }}>
                    <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, marginBottom:3 }}>PROTOTYPE</p>
                    <a href={l.prototypeUrl} target="_blank" rel="noopener"
                      style={{ fontSize:12, color:B.teal, wordBreak:"break-all" }}
                      onClick={e => e.stopPropagation()}>
                      {l.prototypeUrl} ↗
                    </a>
                  </div>
                )}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <AIBtn label="⚡ Follow-up"  onClick={() => ai(`Draft a professional follow-up message for ${l.name}. Brief, clear CTA. Context: ${l.action}`)} />
                  <AIBtn label="⚡ Close Script" onClick={() => ai(`Write a closing script for ${l.name}. They've seen the demo. Goal: deposit. Fee: ${fmt(l.fee)}`)} />
                  <AIBtn label="⚡ Re-engage"  onClick={() => ai(`Write a WhatsApp re-engagement message for ${l.name} who has gone quiet after the demo.`)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Pipeline({ pipeline, setPipeline, ai }) {
  const wt = pipeline.reduce((a, d) => a + d.value * (d.prob / 100), 0);
  const STAGES = ["New Lead","Qualified","Prototype","Presentation","Proposal","Closed Won","Closed Lost"];

  const updateStage = async (id, stage) => {
    setPipeline(p => p.map(d => d.id === id ? { ...d, stage } : d));
    await adapter.update("Pipeline", id, { stage });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Sales Pipeline</SLabel>
      <MGrid items={[
        { l:"Open Deals",    v:pipeline.length },
        { l:"Weighted Value",v:fmt(Math.round(wt)), sm:true },
      ]} />
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {pipeline.map(d => (
          <Card key={d.id}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:10 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{d.name}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim, marginTop:2 }}>{d.id} · Due {d.due}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                <Tag l={d.stage} />
                <span style={{ fontFamily:F.mono, fontSize:11, color:B.teal }}>{fmt(d.value)}</span>
              </div>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:B.dim }}>Probability</span>
                <span style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{d.prob}%</span>
              </div>
              <PBar pct={d.prob} />
            </div>
            <p style={{ fontSize:12, color:B.dim, marginBottom:10 }}>{d.next}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <AIBtn label="⚡ Follow-up"   onClick={() => ai(`Draft follow-up for ${d.name}. Stage: ${d.stage}.`)} />
              <AIBtn label="⚡ Close Script" onClick={() => ai(`Write closing script for ${d.name}. Stage: ${d.stage}. Value: ${fmt(d.value)}.`)} />
              <select value={d.stage} onChange={e => updateStage(d.id, e.target.value)}
                style={{ fontFamily:F.mono, fontSize:9, padding:"4px 6px", border:`1px solid ${B.border}`, borderRadius:6, background:B.surface, color:B.ink, cursor:"pointer" }}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function FollowUps({ followups, setFollowups }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ lead:"", type:"72HR", action:"", due:"" });

  const pending = followups.filter(f => f.status !== "DONE");
  const doneCount = followups.filter(f => f.status === "DONE").length;

  // ── OPTION B PERSISTENCE ─────────────────────────────────────
  // DONE ✓ writes to PROSPECTS (no FollowUps tab — Option B confirmed).
  // Pushes follow_up_date forward by cadence. Appends to ACTIVITY_LOG.
  const markDone = async (id) => {
    // Optimistic UI update
    setFollowups(p => p.map(f => f.id === id ? { ...f, status:"DONE" } : f));

    const prospect = followups.find(f => f.id === id);
    if (!prospect) return;

    const cadence = prospect.cadence || prospect.type || "72HR";
    const pad = n => String(n).padStart(2, "0");
    const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const base = new Date();

    let newDue = "";
    let clearAction = false;
    switch (cadence) {
      case "24HR":  { const d = new Date(base); d.setDate(d.getDate()+1); newDue = isoDate(d); break; }
      case "72HR":  { const d = new Date(base); d.setDate(d.getDate()+3); newDue = isoDate(d); break; }
      case "7DAY":  { const d = new Date(base); d.setDate(d.getDate()+7); newDue = isoDate(d); break; }
      case "BUILD": newDue = ""; clearAction = true; break;
      case "NONE":  newDue = ""; clearAction = true; break;
      case "MANUAL": newDue = prospect.due || ""; break;
      default:      { const d = new Date(base); d.setDate(d.getDate()+3); newDue = isoDate(d); }
    }

    const now = new Date().toISOString();
    const prospectUpdate = {
      follow_up_date: newDue,
      updated_at: now,
      ...(clearAction ? { next_action: "" } : {}),
    };

    // Write 1: push follow_up_date forward in PROSPECTS
    await adapter.update("PROSPECTS", id, prospectUpdate);

    // Write 2: append completion record to ACTIVITY_LOG
    const logRow = {
      log_id:      "LOG-" + Date.now().toString(36),
      timestamp:   now,
      entry_type:  "Follow-Up",
      entity_type: "Prospect",
      entity_id:   id,
      summary:     `Completed ${cadence} follow-up: ${prospect.action || "—"} (${prospect.name || id})`,
      operator:    "hirrok",
    };
    await adapter.append("ACTIVITY_LOG", logRow);
  };

  const submit = async () => {
    if (!form.lead.trim()) return;
    const row = { id:"FU-" + uid(), ...form, status:"PENDING" };
    setFollowups(p => [...p, row]);
    setAdding(false);
    setForm({ lead:"", type:"72HR", action:"", due:"" });
    await adapter.append("FollowUps", row);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <SLabel>Follow-Up Queue ({pending.length})</SLabel>
        <GBtn label={adding ? "✕ CANCEL" : "+ ADD"} onClick={() => setAdding(!adding)} />
      </div>
      <p style={{ fontFamily:F.mono, fontSize:9, color:B.dim, letterSpacing:1 }}>
        CADENCE: 24HR → 72HR → 7DAY · NO EXCEPTIONS
      </p>

      {adding && (
        <Card style={{ borderColor:B.green }}>
          <SLabel>New Follow-Up</SLabel>
          <Inp ph="Client name *" val={form.lead} onChange={e => setForm(p => ({ ...p, lead:e.target.value }))} />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type:e.target.value }))} style={InpStyle}>
            {["24HR","72HR","7DAY","BUILD","DEBRIEF"].map(t => <option key={t}>{t}</option>)}
          </select>
          <Inp ph="Action required" val={form.action} onChange={e => setForm(p => ({ ...p, action:e.target.value }))} />
          <Inp ph="" val={form.due} onChange={e => setForm(p => ({ ...p, due:e.target.value }))} type="date" />
          <SaveBtn label="Save to Spine" onClick={submit} />
        </Card>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {pending.map(f => {
          const isOv = f.due && f.due !== "—" && new Date(f.due) < new Date() &&
            !["Conversion","Production","Maintenance","Lost","Archived"].includes(f.status);
          const dueDisplay = typeof f.due === "string" && f.due.includes("T") ? f.due.split("T")[0] : f.due;
          return (
          <div key={f.id} style={{
            background: isOv ? B.rbg : B.surface,
            border:`1px solid ${isOv ? "rgba(204,34,34,.3)" : B.border}`,
            borderRadius:10, padding:12, display:"flex", gap:10, alignItems:"center",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap", alignItems:"center" }}>
                <Tag l={f.cadence || f.type || "72HR"} />
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{f.name || f.lead || "—"}</p>
              </div>
              <p style={{ fontSize:12, color:B.dim }}>{f.action}</p>
              <p style={{ fontFamily:F.mono, fontSize:9, color:isOv ? B.red : B.muted, marginTop:3 }}>
                {isOv ? "⚠ OVERDUE" : "DUE"} · {dueDisplay}
              </p>
            </div>
            <button onClick={() => markDone(f.id)} style={{
              background:B.green, color:"#fff", fontFamily:F.mono, fontSize:8, letterSpacing:".1em",
              padding:"7px 10px", borderRadius:6, border:"none", cursor:"pointer", flexShrink:0,
            }}>DONE ✓</button>
          </div>
          );
        })}
        {doneCount > 0 && (
          <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:2, padding:"4px 0" }}>
            {doneCount} COMPLETED
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Customers({ customers }) {
  const active = customers.filter(c => c.ltv > 0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>CRM — Customer Records</SLabel>
      {active.length === 0 ? (
        <Card accent>
          <p style={{ fontFamily:F.mono, fontSize:10, color:B.teal, marginBottom:6 }}>STATUS</p>
          <p style={{ fontSize:13, color:B.dim, lineHeight:1.6 }}>
            No converted clients yet. When a lead is marked <strong style={{ color:B.green }}>Won</strong>,
            their full record appears here — lifetime value, history, review tracking, and maintenance status.
          </p>
        </Card>
      ) : active.map(c => (
        <Card key={c.id}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:8 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{c.name}</p>
              <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{c.source}</p>
            </div>
            <Tag l={c.status || "Active"} />
          </div>
          <Divider />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div>
              <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted }}>LIFETIME VALUE</p>
              <p style={{ fontFamily:F.mono, fontSize:13, color:B.teal }}>{fmt(c.ltv)}</p>
            </div>
            <div>
              <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted }}>LAST CONTACT</p>
              <p style={{ fontSize:12, color:B.ink }}>{c.last || "—"}</p>
            </div>
          </div>
        </Card>
      ))}
      <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:1 }}>
        UPGRADE PATH: Lead → Won → Customer → Maintenance Client
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Bookings({ bookings, setBookings, ai }) {
  const STATUSES = ["Pending","In Build","Review","Live","Paid"];
  const update = (id, status) => setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Bookings / Jobs / Orders</SLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {bookings.map(j => (
          <Card key={j.id}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:8 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{j.client}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{j.id} · {j.type}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <Tag l={j.status} />
                <span style={{ fontFamily:F.mono, fontSize:11, color:B.teal }}>{fmt(j.value)}</span>
              </div>
            </div>
            <p style={{ fontSize:12, color:B.dim, marginBottom:8 }}>{j.notes}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <AIBtn label="⚡ Project Brief"   onClick={() => ai(`Generate a project brief for ${j.client} ${j.type}. Scope, deliverables, timeline.`)} />
              <AIBtn label="⚡ Launch Checklist" onClick={() => ai(`Write a handover and launch checklist for ${j.client} going live.`)} />
              <select value={j.status} onChange={e => update(j.id, e.target.value)}
                style={{ fontFamily:F.mono, fontSize:9, padding:"4px 6px", border:`1px solid ${B.border}`, borderRadius:6, background:B.surface, color:B.ink, cursor:"pointer" }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Marketing({ marketing, setMarketing, ai }) {
  const done = id => setMarketing(p => p.map(m => m.id === id ? { ...m, status:"Done" } : m));
  const pending = marketing.filter(m => m.status !== "Done");
  const doneCount = marketing.filter(m => m.status === "Done").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Marketing Command ({pending.length} open)</SLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {pending.map(m => (
          <Card key={m.id}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                  <Tag l={m.status === "Open" ? "Open" : m.status} />
                  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:99,
                    fontFamily:F.mono, fontSize:10, fontWeight:600,
                    background:B.bbg, border:`1px solid ${B.blue}44`, color:B.blue }}>{m.ch}</span>
                </div>
                <p style={{ fontSize:13, color:B.ink, marginBottom:4 }}>{m.task}</p>
                <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted }}>Due: {m.due}</p>
                <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                  <AIBtn label="⚡ Draft Post"
                    onClick={() => ai(`Write a ${m.ch} post for: "${m.task}". Professional, local appeal.`)} />
                  <AIBtn label="⚡ GBP Post"
                    onClick={() => ai("Write a Google Business Profile post for Aurora Digital Foundry. Max 300 chars.")} />
                </div>
              </div>
              <button onClick={() => done(m.id)} style={{
                background:B.green, color:"#fff", fontFamily:F.mono, fontSize:8,
                letterSpacing:".1em", padding:"7px 10px", borderRadius:6, border:"none",
                cursor:"pointer", flexShrink:0,
              }}>DONE</button>
            </div>
          </Card>
        ))}
        {doneCount > 0 && (
          <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, letterSpacing:2, padding:"4px 0" }}>{doneCount} COMPLETED</p>
        )}
      </div>
      <Card accent>
        <SLabel>AI Content Tools</SLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <AIBtn label="⚡ Weekly Content Plan"
            onClick={() => ai("Generate a 7-day social content plan for Aurora Digital Foundry. Local businesses, prototype-first, proof-of-work tone.")} />
          <AIBtn label="⚡ Local Business Posts"
            onClick={() => ai("Write 3 Facebook post ideas showing how a local Aurora Province business benefits from digital infrastructure.")} />
          <AIBtn label="⚡ Campaign Checklist"
            onClick={() => ai("Write a campaign launch checklist: pre-launch, launch day, follow-up tasks.")} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Reviews({ reviews, setReviews, ai }) {
  const markSent = id => setReviews(p => p.map(r => r.id === id ? { ...r, status:"Sent" } : r));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Review & Reputation Hub</SLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {reviews.map(r => (
          <Card key={r.id}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:8 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{r.client}</p>
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim }}>{r.platform}</p>
              </div>
              <Tag l={r.status} />
            </div>
            <p style={{ fontSize:11, color:B.dim, marginBottom:8 }}>{r.notes}</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <AIBtn label="⚡ Draft Request"
                onClick={() => ai(`Write a review request message for ${r.client}. Friendly, brief, direct ask.`)} />
              {r.status === "Received" && (
                <AIBtn label="⚡ Draft Response"
                  onClick={() => ai(`Write a professional response to a 5-star Google review for ${r.client}.`)} />
              )}
              <GBtn label="Mark Sent" onClick={() => markSent(r.id)} />
            </div>
          </Card>
        ))}
      </div>
      <Card accent>
        <SLabel>Reputation Tools</SLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <AIBtn label="⚡ Flag Reputation Risks"
            onClick={() => ai("Analyze current pipeline and flag any reputation risks or follow-up gaps.")} />
          <AIBtn label="⚡ Extract Testimonials"
            onClick={() => ai("Which current clients are the best testimonial candidates and why?")} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function AIConsole({ leads, pipeline, followups, assets, autoRun, onRan }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("adf_api_key") || "");
  const [showKey, setShowKey] = useState(false);

  const PRESETS = [
    "Generate this week's Foundry operator brief — asset-centric",
    "Which archetype should be manufactured next and why?",
    "Identify revenue gaps — which active prospects are closest to closing?",
    "Draft 72hr follow-up for the highest-probability Proposal stage prospect",
    "Write a demo walk-in script for a Prototype-stage prospect",
    "Suggest 3 next archetype candidates for Aurora Province territory",
    "Draft a closing message for a Proposal prospect — deposit goal",
    "What is the highest-leverage action the Foundry can take today?",
  ];

  const run = async (prompt, idx = null) => {
    if (!prompt?.trim()) return;
    if (!apiKey.trim()) { setOutput("⚠ Enter your Anthropic API key above to use AI features."); return; }
    if (idx !== null) setActivePreset(idx);
    setLoading(true);
    setOutput(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
          "x-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildContext(leads, pipeline, followups, assets),
          messages: [{ role:"user", content:prompt }],
        }),
      });
      const d = await r.json();
      setOutput(d.content?.map(c => c.text || "").join("\n") || "No response.");
    } catch (e) {
      setOutput("Error: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (autoRun) { run(autoRun); if (onRan) onRan(); }
  }, [autoRun]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>AI Action Console</SLabel>
      <p style={{ fontFamily:F.mono, fontSize:9, color:B.dim, letterSpacing:1 }}>CLAUDE · FOUNDRY CONTEXT ACTIVE</p>

      {/* API Key input */}
      {!apiKey.trim() && (
        <div style={{ background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, borderRadius:10, padding:14 }}>
          <p style={{ fontFamily:F.mono, fontSize:9, color:B.red, letterSpacing:2, marginBottom:8 }}>⚠ API KEY REQUIRED</p>
          <p style={{ fontSize:12, color:B.dim, marginBottom:10, lineHeight:1.5 }}>Enter your Anthropic API key to activate AI features. Stored locally in your browser only.</p>
          <div style={{ display:"flex", gap:6 }}>
            <input type={showKey?"text":"password"} placeholder="sk-ant-..." value={apiKey}
              onChange={e => { setApiKey(e.target.value); localStorage.setItem("adf_api_key", e.target.value); }}
              style={{ flex:1, background:B.surface, border:`1px solid ${B.border}`, borderRadius:7,
                padding:"9px 12px", fontSize:13, fontFamily:F.body, color:B.ink, outline:"none" }} />
            <button onClick={() => setShowKey(!showKey)} style={{ padding:"9px 12px", background:B.surface, border:`1px solid ${B.border}`, borderRadius:7, cursor:"pointer", fontFamily:F.mono, fontSize:9, color:B.dim }}>{showKey?"HIDE":"SHOW"}</button>
          </div>
        </div>
      )}
      {apiKey.trim() && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:99,
            fontFamily:F.mono, fontSize:9, background:B.gbg, border:`1px solid ${B.green}44`, color:B.green }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:B.green }} />
            API KEY SET
          </div>
          <button onClick={() => { setApiKey(""); localStorage.removeItem("adf_api_key"); }}
            style={{ background:"none", border:"none", cursor:"pointer", fontFamily:F.mono, fontSize:9, color:B.dim }}>CLEAR</button>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => run(p, i)} style={{
            background: activePreset === i ? B.tbg : B.surface,
            border: `1px solid ${activePreset === i ? B.teal : B.border}`,
            borderRadius:10, padding:"11px 14px", textAlign:"left", cursor:"pointer",
            fontSize:12, color:B.ink, fontFamily:F.body,
          }}>{p}</button>
        ))}
      </div>

      <div style={{ display:"flex", gap:6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && run(input)}
          placeholder="Type a command…"
          style={{ flex:1, background:B.raised, border:`1px solid ${B.border}`, borderRadius:7,
            padding:"9px 12px", fontSize:13, fontFamily:F.body, color:B.ink, outline:"none" }} />
        <button onClick={() => run(input)} style={{
          padding:"9px 16px", background:B.teal, color:"#fff",
          border:"none", borderRadius:7, cursor:"pointer", fontFamily:F.body, fontSize:13, fontWeight:600,
        }}>RUN</button>
      </div>

      {loading && (
        <Card accent>
          <p style={{ fontFamily:F.mono, fontSize:10, color:B.teal, letterSpacing:2 }}>PROCESSING…</p>
        </Card>
      )}
      {output && (
        <Card>
          <p style={{ fontFamily:F.mono, fontSize:8, letterSpacing:3, color:B.teal, marginBottom:8 }}>OUTPUT</p>
          <p style={{ fontSize:12, color:B.ink, lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:F.body }}>{output}</p>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function Settings({ spineConnected, spineStatus, spineDetail }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <SLabel>Foundry Settings</SLabel>
      <div style={{
        background: spineStatus==="LIVE" ? B.gbg : spineStatus==="FALLBACK" ? B.rbg : B.tbg,
        border: `1px solid ${spineStatus==="LIVE" ? "rgba(10,138,64,.3)" : spineStatus==="FALLBACK" ? "rgba(204,34,34,.3)" : "rgba(13,158,138,.25)"}`,
        borderRadius:10, padding:12,
      }}>
        <p style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2,
          color: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }}>
          {spineStatus==="LIVE"
            ? `✓ SPINE v2.0 LIVE — ${spineDetail || "PROSPECTS"} CONNECTED`
            : spineStatus==="FALLBACK"
            ? `⚠ SPINE FALLBACK — ${spineDetail || "READ FAILED"}`
            : "◌ SPINE v2.0 CONNECTING…"}
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {[
          ["Operator",         "Hirro Kuizon",                       false],
          ["GitHub",           "hirrok/adf-hq",                      false],
          ["Domain",           "auroradigitalfoundry.com — PENDING",  true],
          ["Hosting",          "GitHub Pages — free tier",            false],
          ["Data Spine",       spineStatus==="LIVE" ? `PROSPECTS — LIVE` : spineStatus==="FALLBACK" ? "FALLBACK — READ FAILED" : "Connecting…", spineStatus!=="LIVE"],
          ["Form Backend",     "Formspree — mjgzdlja",                false],
          ["GBP",              "NOT CREATED",                         true],
          ["Search Console",   "NOT SET UP",                          true],
          ["Analytics",        "NOT INSTALLED",                       true],
          ["Campaign Week",    "1 / 8",                               false],
          ["Setup Rev Target", "PHP 100,000 / 8 weeks",              false],
          ["MRR Target",       "PHP 25,000 / 8 weeks",               false],
          ["Suite Status",     "STATE C — CANDIDATE",                 false],
          ["Weekly Review 1",  "June 8, 2026",                        false],
        ].map(([k, v, warn]) => (
          <div key={k} style={{
            background:B.surface, border:`1px solid ${B.border}`, borderRadius:8,
            padding:"9px 13px", display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap",
          }}>
            <p style={{ fontFamily:F.mono, fontSize:9, color:B.dim, letterSpacing:2 }}>{k}</p>
            <p style={{ fontFamily:F.mono, fontSize:10, color:warn ? B.red : B.ink, textAlign:"right" }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ══════════════════════════════════════════════════════════════
const NAV_MODULES = [
  { id:"snapshot",  label:"SNAP",  icon:"ti-layout-dashboard" },
  { id:"leads",     label:"LEADS", icon:"ti-inbox"            },
  { id:"pipeline",  label:"PIPE",  icon:"ti-arrow-right-circle"},
  { id:"followups", label:"QUEUE", icon:"ti-clock"            },
  { id:"customers", label:"CRM",   icon:"ti-users"            },
  { id:"bookings",  label:"JOBS",  icon:"ti-calendar-event"   },
  { id:"marketing", label:"MKT",   icon:"ti-speakerphone"     },
  { id:"reviews",   label:"REP",   icon:"ti-star"             },
  { id:"ai",        label:"AI",    icon:"ti-bolt"             },
  { id:"settings",  label:"SET",   icon:"ti-settings"         },
];

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
export default function FoundryOps() {
  const [mod,         setMod]        = useState("snapshot");
  const [live,        setLive]       = useState(false);
  const [spineStatus, setSpineStatus]= useState("CONNECTING");
  const [spineDetail, setSpineDetail]= useState("");         // which tab confirmed readable

  // Secondary ledger state
  const [leads,      setLeads]     = useState(SEED_LEADS);
  const [pipeline,   setPipeline]  = useState(SEED_PIPELINE);
  const [followups,  setFollowups] = useState(SEED_FOLLOWUPS);
  const [customers,  setCustomers] = useState([]);
  const [bookings,   setBookings]  = useState(SEED_BOOKINGS);
  const [marketing,  setMarketing] = useState(SEED_MARKETING);
  const [reviews,    setReviews]   = useState(SEED_REVIEWS);

  // Primary asset ledger state — Spine v2.0
  const [archetypes,  setArchetypes]  = useState(SEED_ASSETS.archetypes);
  const [prototypes,  setPrototypes]  = useState(SEED_ASSETS.prototypes);
  const [gallery,     setGallery]     = useState(SEED_ASSETS.gallery);
  const [seoClusters, setSeoClusters] = useState(SEED_ASSETS.seoClusters);
  const [patterns,    setPatterns]    = useState(SEED_ASSETS.patterns);

  const [aiQueue,    setAiQueue]   = useState(null);
  const contentRef = useRef(null);

  // Derived overdue count from PROSPECTS (Option B — no separate FollowUps tab)
  const overdue = leads.filter(l =>
    (l.recordState === "ACTIVE" || !l.recordState) &&
    l.due && l.due !== "—" &&
    new Date(l.due) < new Date() &&
    !["Conversion","Production","Maintenance","Lost","Archived"].includes(l.status)
  ).length;

  // ── SPINE HYDRATION v2.0 ─────────────────────────────────────
  // Pattern: Sheet → adapter.read(tab) → mapper(row) → state
  // PART 4 — Badge reflects: spine reachable AND expected tab readable
  useEffect(() => {
    (async () => {
      // Step 1: Reconnect PROSPECTS (secondary — required for daily ops)
      const prospectsOk = await hydrateTab("PROSPECTS", mapProspect, (rows) => {
        const active = rows.filter(r => r.recordState === "ACTIVE" || !r.recordState);
        setLeads(active.length > 0 ? active : rows); // show all if no ACTIVE filter match
      });

      if (prospectsOk) {
        setLive(true);
        setSpineStatus("LIVE");
        setSpineDetail("PROSPECTS");
      } else {
        setSpineStatus("FALLBACK");
        setSpineDetail("PROSPECTS READ FAILED");
      }

      // Step 2: Hydrate primary asset ledgers (non-blocking — fail gracefully)
      await hydrateTab("ARCHETYPES",           mapArchetype,   setArchetypes);
      await hydrateTab("PROTOTYPES",           mapPrototype,   setPrototypes);
      await hydrateTab("INFRASTRUCTURE_GALLERY", mapGalleryItem, setGallery);
      await hydrateTab("SEO_CLUSTERS",         mapSEOCluster,  setSeoClusters);
      await hydrateTab("PATTERN_LIBRARY",      mapPattern,     setPatterns);
    })();
  }, []);

  const assets = { archetypes, prototypes, gallery, seoClusters, patterns };

  const nav = (id) => {
    setMod(id);
    contentRef.current?.scrollTo({ top:0, behavior:"smooth" });
  };

  const ai = (prompt) => { setAiQueue(prompt); nav("ai"); };

  const MODULE_MAP = {
    snapshot:  <Snapshot  leads={leads} assets={assets} nav={nav} />,
    leads:     <Leads     leads={leads} setLeads={setLeads} ai={ai} />,
    pipeline:  <Pipeline  pipeline={pipeline} setPipeline={setPipeline} ai={ai} />,
    followups: <FollowUps followups={leads} setFollowups={setLeads} />,
    customers: <Customers customers={customers} />,
    bookings:  <Bookings  bookings={bookings} setBookings={setBookings} ai={ai} />,
    marketing: <Marketing marketing={marketing} setMarketing={setMarketing} ai={ai} />,
    reviews:   <Reviews   reviews={reviews} setReviews={setReviews} ai={ai} />,
    ai:        <AIConsole leads={leads} pipeline={pipeline} followups={followups} assets={assets} autoRun={aiQueue} onRan={() => setAiQueue(null)} />,
    settings:  <Settings  spineConnected={live} spineStatus={spineStatus} spineDetail={spineDetail} />,
  };

  return (
    // Outer shell — full viewport, page background
    <div style={{ minHeight:"100vh", background:B.bg, fontFamily:F.body, WebkitFontSmoothing:"antialiased" }}>
      {/* FONTS & ICONS */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{min-height:100vh;background:${B.bg};}
        ::-webkit-scrollbar{width:2px;height:2px;background:${B.bg}}
        ::-webkit-scrollbar-thumb{background:${B.border}}
        ::placeholder{color:${B.muted}}
        input:focus,select:focus,textarea:focus{border-color:${B.teal}!important;outline:none}
        button{-webkit-tap-highlight-color:transparent}
        /* ── RESPONSIVE SHELL ── */
        .ops-shell{
          display:flex; flex-direction:column; height:100vh;
          max-width:480px; margin:0 auto; color:${B.ink};
          position:relative;
        }
        @media(min-width:900px){
          .ops-shell{
            max-width:900px;
            flex-direction:row;
            height:100vh;
            border-left:1px solid ${B.border};
            border-right:1px solid ${B.border};
          }
          .ops-topbar{
            display:none !important;
          }
          .ops-sidebar{
            display:flex !important;
            flex-direction:column;
            width:200px;
            min-width:200px;
            flex-shrink:0;
            border-right:1px solid ${B.border};
            background:${B.surface};
            padding:16px 0;
            overflow-y:auto;
          }
          .ops-sidebar-logo{
            display:flex !important;
            align-items:center;
            gap:10px;
            padding:0 16px 20px;
            border-bottom:1px solid ${B.border};
            margin-bottom:12px;
          }
          .ops-sidenav-btn{
            display:flex !important;
            align-items:center;
            gap:10px;
            padding:10px 16px;
            border:none;
            background:none;
            cursor:pointer;
            font-family:${F.mono};
            font-size:10px;
            letter-spacing:.12em;
            color:${B.dim};
            width:100%;
            text-align:left;
            border-left:2px solid transparent;
            transition:all .1s;
          }
          .ops-sidenav-btn.active{
            color:${B.teal};
            background:${B.tbg};
            border-left-color:${B.teal};
          }
          .ops-sidenav-btn i{ font-size:16px; flex-shrink:0; }
          .ops-bottomnav{
            display:none !important;
          }
          .ops-content{
            flex:1;
            overflow-y:auto;
            padding:24px 28px;
          }
        }
        @media(max-width:899px){
          .ops-sidebar{ display:none !important; }
          .ops-sidenav-btn{ display:none !important; }
          .ops-sidebar-logo{ display:none !important; }
          .ops-topbar{ display:flex !important; }
          .ops-bottomnav{ display:flex !important; }
          .ops-content{ flex:1; overflow-y:auto; padding:14px; }
        }
      `}</style>
    <div className="ops-shell">

      {/* DESKTOP SIDEBAR — hidden on mobile via CSS */}
      <div className="ops-sidebar">
        <div className="ops-sidebar-logo">
          <div style={{ width:28, height:28, borderRadius:6, background:B.teal,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontFamily:F.disp, fontSize:17, color:"#fff", letterSpacing:1, lineHeight:1 }}>A</span>
          </div>
          <div>
            <p style={{ fontFamily:F.disp, fontSize:12, letterSpacing:3, color:B.ink, lineHeight:1 }}>FOUNDRY <span style={{ color:B.teal }}>OPS</span></p>
            <p style={{ fontFamily:F.mono, fontSize:7, color:B.tlo, letterSpacing:2, marginTop:2 }}>AURORA DIGITAL FOUNDRY</p>
          </div>
        </div>
        <div style={{ padding:"0 12px", marginBottom:12, display:"flex", gap:6, flexWrap:"wrap" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:99,
            fontFamily:F.mono, fontSize:9,
            background: spineStatus==="LIVE" ? B.gbg : spineStatus==="FALLBACK" ? B.rbg : B.tbg,
            border: `1px solid ${spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? "rgba(204,34,34,.4)" : B.teal}`,
            color: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }}>
            <div style={{ width:5, height:5, borderRadius:"50%",
              background: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }} />
            {spineStatus==="LIVE" ? "LIVE" : spineStatus==="FALLBACK" ? "FALLBACK" : "…"}
          </div>
          {overdue > 0 && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:99,
              fontFamily:F.mono, fontSize:9, background:B.rbg,
              border:`1px solid rgba(204,34,34,.3)`, color:B.red }}>⚠ {overdue}</div>
          )}
        </div>
        {NAV_MODULES.map(n => (
          <button key={n.id} onClick={() => nav(n.id)}
            className={`ops-sidenav-btn${mod===n.id?" active":""}`}>
            <i className={`ti ${n.icon}`} />
            {n.label}
            {n.id==="followups" && overdue>0 && (
              <span style={{ marginLeft:"auto", background:B.red, color:"#fff",
                fontFamily:F.mono, fontSize:7, padding:"1px 5px", borderRadius:99 }}>{overdue}</span>
            )}
          </button>
        ))}
      </div>

      {/* MOBILE TOP BAR — hidden on desktop via CSS */}
      <div className="ops-topbar" style={{
        background:B.surface, borderBottom:`1px solid ${B.border}`,
        padding:"10px 14px", alignItems:"center",
        justifyContent:"space-between", gap:8, flexShrink:0,
        boxShadow:`0 1px 4px rgba(13,44,40,.06)`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:B.teal,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontFamily:F.disp, fontSize:17, color:"#fff", letterSpacing:1, lineHeight:1 }}>A</span>
          </div>
          <div>
            <p style={{ fontFamily:F.disp, fontSize:13, letterSpacing:3, color:B.ink, lineHeight:1 }}>
              FOUNDRY <span style={{ color:B.teal }}>OPS</span>
            </p>
            <p style={{ fontFamily:F.mono, fontSize:7, color:B.tlo, letterSpacing:2, marginTop:1 }}>
              AURORA DIGITAL FOUNDRY
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px",
            borderRadius:99, fontFamily:F.mono, fontSize:9,
            background: spineStatus==="LIVE" ? B.gbg : spineStatus==="FALLBACK" ? B.rbg : B.tbg,
            border: `1px solid ${spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? "rgba(204,34,34,.4)" : B.teal}`,
            color: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal,
          }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background: spineStatus==="LIVE" ? B.green : spineStatus==="FALLBACK" ? B.red : B.teal }} />
            {spineStatus==="LIVE" ? "LIVE" : spineStatus==="FALLBACK" ? "FALLBACK" : "…"}
          </div>
          {overdue > 0 && (
            <button onClick={() => nav("followups")} style={{ display:"inline-flex", alignItems:"center", gap:4,
              padding:"3px 8px", borderRadius:99, fontFamily:F.mono, fontSize:9,
              background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, color:B.red, cursor:"pointer",
            }}>⚠ {overdue} OVERDUE</button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div ref={contentRef} className="ops-content">
        {MODULE_MAP[mod]}
      </div>

      {/* MOBILE BOTTOM NAV — hidden on desktop via CSS */}
      <div className="ops-bottomnav" style={{
        background:B.surface, borderTop:`1px solid ${B.border}`,
        overflowX:"auto", flexShrink:0,
        boxShadow:`0 -1px 4px rgba(13,44,40,.06)`,
      }}>
        {NAV_MODULES.map(n => (
          <button key={n.id} onClick={() => nav(n.id)} style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            padding:"8px 4px", border:"none", background:"none",
            borderBottom:`2px solid ${mod === n.id ? B.teal : "transparent"}`,
            cursor:"pointer", flex:1, minWidth:44, flexShrink:0,
            fontFamily:F.mono, fontSize:6, letterSpacing:1,
            color: mod === n.id ? B.teal : B.dim,
            transition:"all .1s",
          }}>
            <i className={`ti ${n.icon}`} style={{ fontSize:16 }} />
            {n.label}
            {n.id === "followups" && overdue > 0 && (
              <span style={{
                background:B.red, color:"#fff", fontFamily:F.mono, fontSize:7,
                padding:"1px 4px", borderRadius:99, marginTop:-2,
              }}>{overdue}</span>
            )}
          </button>
        ))}
      </div>
    </div>
    </div>
  );
}
