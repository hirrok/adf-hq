// ═══════════════════════════════════════════════════════════════
// AURORA DIGITAL FOUNDRY — OPERATOR SUITE v2
// Build: LOCKED 2026-06-01
// Brand: Sierra Teal Light
// Modules: 10 (Snapshot, Leads, Pipeline, FollowUps, CRM,
//           Bookings, Marketing, Reviews, AI Console, Settings)
// Spine: Google Apps Script adapter — read/append/update
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
const SEED_LEADS = [
  { id:"P-001", name:"Aliya Surf Camp",       v:"Tourism·Surf",      loc:"Baler",          status:"DEMO",      priority:"HIGH",   contact:"TODO",          fee:17500, action:"Collect rates + phone + email",                   due:"2026-06-03", notes:"5 pages live." },
  { id:"P-002", name:"Ecopetrol Aurora",       v:"Energy Retail",     loc:"Maria Aurora",   status:"DEMO",      priority:"HIGH",   contact:"Jherico Lara",  fee:40000, action:"Book presentation — verify decision authority",    due:"2026-06-05", notes:"8 pages. Pro pkg." },
  { id:"P-003", name:"Nalu Surf Camp",         v:"Tourism·Surf",      loc:"Baler",          status:"QUEUED",    priority:"HIGH",   contact:"TODO",          fee:17500, action:"Finish demo — walk-in ready",                     due:"2026-06-04", notes:"Build queued." },
  { id:"P-004", name:"Hotel Rosita",           v:"Hospitality",       loc:"Lucena City",    status:"PITCH",     priority:"HIGH",   contact:"Manager",       fee:24000, action:"72hr follow-up — get decision",                   due:"2026-06-01", notes:"Pitch done." },
  { id:"P-005", name:"Queen Margarette",       v:"Food·Hospitality",  loc:"Lucena City",    status:"PITCH",     priority:"HIGH",   contact:"Manager",       fee:17500, action:"Close — v5 approved. Get sig.",                   due:"2026-06-01", notes:"v5 approved." },
  { id:"P-006", name:"Iron Tribe Fitness",     v:"Fitness",           loc:"Malvar, Batangas",status:"STRATEGIC", priority:"LOW",   contact:"Third/Louie",   fee:0,     action:"Debrief feedback",                                due:"2026-06-03", notes:"Family." },
  { id:"P-007", name:"Catalino's Restaurant",  v:"Food",              loc:"Lucena City",    status:"PROSPECT",  priority:"MEDIUM", contact:"TODO",          fee:20000, action:"Build Ember demo",                                due:"2026-06-07", notes:"Landmark." },
];

const SEED_PIPELINE = [
  { id:"D-001", name:"Hotel Rosita",      stage:"Proposal",  value:24000, prob:70, due:"2026-06-01", next:"Close — 72hr overdue" },
  { id:"D-002", name:"Queen Margarette",  stage:"Proposal",  value:17500, prob:80, due:"2026-06-01", next:"Sign-off on v5" },
  { id:"D-003", name:"Aliya Surf Camp",   stage:"Prototype", value:17500, prob:60, due:"2026-06-03", next:"Collect content, present" },
  { id:"D-004", name:"Ecopetrol Aurora",  stage:"Prototype", value:40000, prob:50, due:"2026-06-05", next:"Book presentation" },
  { id:"D-005", name:"Nalu Surf Camp",    stage:"Prototype", value:17500, prob:55, due:"2026-06-04", next:"Finish build, walk-in" },
];

const SEED_FOLLOWUPS = [
  { id:"FU-001", lead:"Hotel Rosita",     type:"72HR",  due:"2026-06-01", action:"Confirm decision on demo",               status:"OVERDUE" },
  { id:"FU-002", lead:"Queen Margarette", type:"72HR",  due:"2026-06-01", action:"Close — v5 approved. Get the sig.",       status:"OVERDUE" },
  { id:"FU-003", lead:"Aliya Surf Camp",  type:"7DAY",  due:"2026-06-03", action:"Collect rates, phone, email",             status:"PENDING" },
  { id:"FU-004", lead:"Ecopetrol Aurora", type:"24HR",  due:"2026-06-05", action:"Book presentation slot with Jherico",     status:"PENDING" },
  { id:"FU-005", lead:"Nalu Surf Camp",   type:"BUILD", due:"2026-06-04", action:"Ship demo — walk-in ready",               status:"PENDING" },
];

const SEED_BOOKINGS = [
  { id:"J-001", client:"Aliya Surf Camp",  type:"Standard Build", status:"Pending", value:17500, notes:"Awaiting content from client" },
  { id:"J-002", client:"Ecopetrol Aurora", type:"Pro Build",      status:"Pending", value:40000, notes:"Demo live, awaiting conversion" },
];

const SEED_MARKETING = [
  { id:"M-001", ch:"Facebook",  task:"Post Aliya Surf Camp demo announcement",   status:"Open", due:"2026-06-05" },
  { id:"M-002", ch:"GBP",       task:"Create ADF Google Business Profile listing", status:"Open", due:"2026-06-07" },
  { id:"M-003", ch:"Facebook",  task:"Ecopetrol Aurora case study post",           status:"Open", due:"2026-06-10" },
];

const SEED_REVIEWS = [
  { id:"R-001", client:"Aliya Surf Camp",  platform:"Google", status:"Not Sent", notes:"Send after launch" },
  { id:"R-002", client:"Ecopetrol Aurora", platform:"Google", status:"Not Sent", notes:"Send after launch" },
];

// ── SHARED COMPONENTS ─────────────────────────────────────────
const TAG_COLOR = {
  DEMO:"teal", PITCH:"green", QUEUED:"blue", PROSPECT:"dim", STRATEGIC:"dim",
  "Not Sent":"dim", Sent:"teal", Received:"green",
  Proposal:"green", Prototype:"teal", Qualified:"blue",
  "New Lead":"dim", "Closed Won":"green", "Closed Lost":"red",
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

// ── AI CONTEXT ────────────────────────────────────────────────
const buildContext = (leads, pipeline, followups) => {
  const overdue = followups.filter(f => f.status === "OVERDUE").map(f => f.lead).join(", ");
  const weighted = pipeline.reduce((a, d) => a + d.value * (d.prob / 100), 0);
  return `You are the AI action console for Aurora Digital Foundry — a business infrastructure agency in Aurora Province, Philippines, operated by Hirro Kuizon. Be direct, operator-grade, zero filler. Produce usable artifacts: draft messages, ranked lists, action plans, scripts. Use PHP for currency.

Current ops snapshot:
- Prospects: ${leads.length} | Demos live: ${leads.filter(l => l.status === "DEMO").length} | In pitch: ${leads.filter(l => l.status === "PITCH").length}
- Overdue follow-ups: ${followups.filter(f => f.status === "OVERDUE").length} (${overdue || "none"})
- Weighted pipeline value: PHP ${Math.round(weighted).toLocaleString()}
- 8-week targets: PHP 100,000 setup revenue · PHP 25,000 MRR
- Week 1 of 8. Zero closes so far. First conversion is the priority.`;
};

// ══════════════════════════════════════════════════════════════
// MODULES
// ══════════════════════════════════════════════════════════════

function Snapshot({ leads, pipeline, followups, nav }) {
  const ov = followups.filter(f => f.status === "OVERDUE").length;
  const wt = pipeline.reduce((a, d) => a + d.value * (d.prob / 100), 0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <SLabel>Today's Snapshot</SLabel>

      {ov > 0 && (
        <div style={{ background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, borderRadius:10, padding:12,
          display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:B.red, flexShrink:0 }} />
          <p style={{ fontFamily:F.mono, fontSize:11, color:B.red, flex:1 }}>
            {ov} OVERDUE FOLLOW-UP{ov > 1 ? "S" : ""} — ACT NOW
          </p>
          <GBtn label="ACTION →" onClick={() => nav("followups")} on />
        </div>
      )}

      <MGrid items={[
        { l:"Prospects",      v:leads.length },
        { l:"Demos Live",     v:leads.filter(l => l.status === "DEMO").length },
        { l:"Overdue",        v:ov, alert:ov > 0 },
        { l:"Wtd Pipeline",   v:fmt(Math.round(wt)), sm:true },
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
        {[
          { u:true,  t:"Close Hotel Rosita — 72hr follow-up overdue" },
          { u:true,  t:"Close Queen Margarette — v5 approved, get signature" },
          { u:false, t:"Ship Nalu demo — same-strip walk-in opportunity" },
          { u:false, t:"Book Ecopetrol presentation with Jherico Lara" },
          { u:false, t:"Register auroradigitalfoundry.com at Porkbun" },
        ].map((a, i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:a.u ? B.red : B.muted, marginTop:5, flexShrink:0 }} />
            <p style={{ fontSize:13, color:a.u ? B.ink : B.dim, lineHeight:1.4 }}>{a.t}</p>
          </div>
        ))}
      </Card>

      <Card>
        <SLabel>Governance</SLabel>
        {[
          ["Suite Status",    "STATE C — CANDIDATE", B.teal],
          ["Weekly Review 1", "June 8, 2026",         B.teal],
          ["Patches Overdue", "0",                    B.green],
          ["Red Band Clients","0",                    B.green],
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
  const [form, setForm] = useState({ name:"", v:"", loc:"", fee:"", action:"" });

  const f = p => k => e => setForm(prev => ({ ...prev, [k]:e.target.value }));
  const visible = filter === "ALL" ? leads : leads.filter(l => l.status === filter);

  const submit = async () => {
    if (!form.name.trim()) return;
    const row = {
      id: "P-" + uid(), name:form.name, v:form.v, loc:form.loc,
      status:"PROSPECT", priority:"MEDIUM", contact:"TODO",
      fee:Number(form.fee) || 0, action:form.action || "Follow up",
      due:addDays(today(), 2), notes:"", created:today(),
    };
    setLeads(p => [...p, row]);
    setAdding(false);
    setForm({ name:"", v:"", loc:"", fee:"", action:"" });
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
          <Inp ph="Vertical (Tourism·Surf)"   val={form.v}      onChange={e => setForm(p => ({ ...p, v:e.target.value }))} />
          <Inp ph="Location"                  val={form.loc}    onChange={e => setForm(p => ({ ...p, loc:e.target.value }))} />
          <Inp ph="Est. fee (PHP)"            val={form.fee}    onChange={e => setForm(p => ({ ...p, fee:e.target.value }))} />
          <Inp ph="Next action"               val={form.action} onChange={e => setForm(p => ({ ...p, action:e.target.value }))} />
          <SaveBtn label="Save to Spine" onClick={submit} />
        </Card>
      )}

      <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4 }}>
        {["ALL","PITCH","DEMO","QUEUED","PROSPECT","STRATEGIC"].map(x => (
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
                <p style={{ fontFamily:F.mono, fontSize:10, color:B.dim, marginTop:2 }}>{l.v} · {l.loc}</p>
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
                  {[["Contact",l.contact],["Follow-up",l.due],["Priority",l.priority],["Notes",l.notes||"—"]].map(([k,v]) => (
                    <div key={k}>
                      <p style={{ fontFamily:F.mono, fontSize:9, color:B.muted, marginBottom:2 }}>{k}</p>
                      <p style={{ fontSize:12, color:B.ink }}>{v}</p>
                    </div>
                  ))}
                </div>
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

  const markDone = async (id) => {
    setFollowups(p => p.map(f => f.id === id ? { ...f, status:"DONE" } : f));
    await adapter.update("FollowUps", id, { status:"DONE" });
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
        {pending.map(f => (
          <div key={f.id} style={{
            background: f.status === "OVERDUE" ? B.rbg : B.surface,
            border:`1px solid ${f.status === "OVERDUE" ? "rgba(204,34,34,.3)" : B.border}`,
            borderRadius:10, padding:12, display:"flex", gap:10, alignItems:"center",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:6, marginBottom:4, flexWrap:"wrap", alignItems:"center" }}>
                <Tag l={f.type} />
                <p style={{ fontSize:14, fontWeight:500, color:B.ink }}>{f.lead}</p>
              </div>
              <p style={{ fontSize:12, color:B.dim }}>{f.action}</p>
              <p style={{ fontFamily:F.mono, fontSize:9, color:f.status === "OVERDUE" ? B.red : B.muted, marginTop:3 }}>
                {f.status === "OVERDUE" ? "⚠ OVERDUE" : "DUE"} · {f.due}
              </p>
            </div>
            <button onClick={() => markDone(f.id)} style={{
              background:B.green, color:"#fff", fontFamily:F.mono, fontSize:8, letterSpacing:".1em",
              padding:"7px 10px", borderRadius:6, border:"none", cursor:"pointer", flexShrink:0,
            }}>DONE ✓</button>
          </div>
        ))}
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
function AIConsole({ leads, pipeline, followups, autoRun, onRan }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const PRESETS = [
    "Analyze leads — find highest-probability close this week",
    "Draft 72hr follow-up message for Hotel Rosita",
    "Draft close message for Queen Margarette — v5 approved",
    "Generate this week's Foundry operator brief",
    "Identify revenue gaps in the current pipeline",
    "Write Nalu Surf Camp demo walk-in script",
    "Suggest 3 next prospect targets in Aurora Province",
    "Draft Ecopetrol presentation opening",
  ];

  const run = async (prompt, idx = null) => {
    if (!prompt?.trim()) return;
    if (idx !== null) setActivePreset(idx);
    setLoading(true);
    setOutput(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildContext(leads, pipeline, followups),
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
function Settings({ spineConnected }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <SLabel>Foundry Settings</SLabel>
      <div style={{
        background: spineConnected ? B.gbg : B.rbg,
        border: `1px solid ${spineConnected ? "rgba(10,138,64,.3)" : "rgba(204,34,34,.3)"}`,
        borderRadius:10, padding:12,
      }}>
        <p style={{ fontFamily:F.mono, fontSize:10, letterSpacing:2, color:spineConnected ? B.green : B.red }}>
          {spineConnected ? "✓ DATA SPINE CONNECTED" : "⚠ DATA SPINE NOT CONNECTED"}
        </p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {[
          ["Operator",         "Hirro Kuizon",                       false],
          ["GitHub",           "hirrok/adf-hq",                      false],
          ["Domain",           "auroradigitalfoundry.com — PENDING",  true],
          ["Hosting",          "GitHub Pages — free tier",            false],
          ["Data Spine",       spineConnected ? "Google Sheets — CONNECTED" : "NOT CONNECTED", !spineConnected],
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
  const [mod,        setMod]       = useState("snapshot");
  const [live,       setLive]      = useState(false);
  const [leads,      setLeads]     = useState(SEED_LEADS);
  const [pipeline,   setPipeline]  = useState(SEED_PIPELINE);
  const [followups,  setFollowups] = useState(SEED_FOLLOWUPS);
  const [customers,  setCustomers] = useState([]);
  const [bookings,   setBookings]  = useState(SEED_BOOKINGS);
  const [marketing,  setMarketing] = useState(SEED_MARKETING);
  const [reviews,    setReviews]   = useState(SEED_REVIEWS);
  const [aiQueue,    setAiQueue]   = useState(null);
  const contentRef = useRef(null);

  const overdue = followups.filter(f => f.status === "OVERDUE").length;

  // Hydrate from spine on mount
  useEffect(() => {
    (async () => {
      const d = await adapter.read("Leads");
      if (d && d.length > 0) { setLeads(d); setLive(true); }
    })();
  }, []);

  const nav = (id) => {
    setMod(id);
    contentRef.current?.scrollTo({ top:0, behavior:"smooth" });
  };

  const ai = (prompt) => { setAiQueue(prompt); nav("ai"); };

  const MODULE_MAP = {
    snapshot:  <Snapshot  leads={leads} pipeline={pipeline} followups={followups} nav={nav} />,
    leads:     <Leads     leads={leads} setLeads={setLeads} ai={ai} />,
    pipeline:  <Pipeline  pipeline={pipeline} setPipeline={setPipeline} ai={ai} />,
    followups: <FollowUps followups={followups} setFollowups={setFollowups} />,
    customers: <Customers customers={customers} />,
    bookings:  <Bookings  bookings={bookings} setBookings={setBookings} ai={ai} />,
    marketing: <Marketing marketing={marketing} setMarketing={setMarketing} ai={ai} />,
    reviews:   <Reviews   reviews={reviews} setReviews={setReviews} ai={ai} />,
    ai:        <AIConsole leads={leads} pipeline={pipeline} followups={followups} autoRun={aiQueue} onRan={() => setAiQueue(null)} />,
    settings:  <Settings  spineConnected={live} />,
  };

  return (
    <div style={{
      display:"flex", flexDirection:"column", height:"100vh",
      background:B.bg, color:B.ink, fontFamily:F.body,
      WebkitFontSmoothing:"antialiased", maxWidth:480, margin:"0 auto",
    }}>
      {/* FONTS & ICONS */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:2px;height:2px;background:${B.bg}}
        ::-webkit-scrollbar-thumb{background:${B.border}}
        ::placeholder{color:${B.muted}}
        input:focus,select:focus,textarea:focus{border-color:${B.teal}!important;outline:none}
        button{-webkit-tap-highlight-color:transparent}
      `}</style>

      {/* TOP BAR */}
      <div style={{
        background:B.surface, borderBottom:`1px solid ${B.border}`,
        padding:"10px 14px", display:"flex", alignItems:"center",
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
            background: live ? B.gbg : B.tbg,
            border: `1px solid ${live ? B.green : B.teal}`,
            color: live ? B.green : B.teal,
          }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background: live ? B.green : B.teal }} />
            {live ? "LIVE" : "MOCK"}
          </div>
          {overdue > 0 && (
            <button onClick={() => nav("followups")} style={{
              display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px",
              borderRadius:99, fontFamily:F.mono, fontSize:9,
              background:B.rbg, border:`1px solid rgba(204,34,34,.3)`, color:B.red, cursor:"pointer",
            }}>⚠ {overdue} OVERDUE</button>
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div ref={contentRef} style={{ flex:1, overflowY:"auto", padding:14 }}>
        {MODULE_MAP[mod]}
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        background:B.surface, borderTop:`1px solid ${B.border}`,
        display:"flex", overflowX:"auto", flexShrink:0,
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
  );
}
