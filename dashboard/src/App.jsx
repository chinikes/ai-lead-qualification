import { useState, useEffect, useCallback, useRef } from "react";


const TEMP_CONFIG = {
  hot: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", label: "HOT", icon: "▲" },
  warm: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "WRM", icon: "◆" },
  cool: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", label: "COL", icon: "●" },
  cold: { color: "#6B7280", bg: "rgba(107,114,128,0.12)", label: "CLD", icon: "▼" },
};

const DECISION_CONFIG = {
  qualified: { color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "QUALIFIED" },
  nurture: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "NURTURE" },
  needs_review: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", label: "REVIEW" },
  disqualified: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", label: "DISQUALIFIED" },
};

const STAGE_LABELS = ["Intake", "Enrichment", "AI Analysis", "Scoring", "Decision", "Routed"];

const REPS = [
  { id: "rep_001", name: "Jessica Torres", territory: "US West", avatar: "JT", color: "#3B82F6" },
  { id: "rep_002", name: "Marcus Johnson", territory: "US East", avatar: "MJ", color: "#10B981" },
  { id: "rep_003", name: "Aisha Patel", territory: "US Central", avatar: "AP", color: "#F59E0B" },
  { id: "rep_004", name: "David Kim", territory: "International", avatar: "DK", color: "#A855F7" },
];

const MOCK_LEADS = [
  { id: "ld_001", email: "sarah.chen@techcorp.io", name: "Sarah Chen", title: "VP of Sales", company: "TechCorp Solutions", industry: "SaaS", employees: 340, revenue: "$45M", source: "web_form", message: "Looking to automate lead qualification. Spending 20+ hrs/week on manual review. What's pricing for 15 reps?", stage: 5, scores: { firmographic: 89, demographic: 92, behavioral: 86, ai_fit: 78 }, composite: 86.4, temperature: "hot", decision: "qualified", signals: ["Explicit pricing inquiry", "Quantified pain (20+ hrs/week)", "Team size mentioned"], painPoints: ["Manual lead review bottleneck", "Rep time waste on unqualified leads"], talkingPoints: ["ROI: 20hrs/week x 15 reps = 300hrs saved", "Case study: Similar SaaS cut review time 80%"], confidence: 0.92, flags: [], routing: { rep: "Jessica Torres", repId: "rep_001", territory: "US West", sla: "15 min" }, timestamp: Date.now() - 180000 },
  { id: "ld_002", email: "james.wilson@megahealth.com", name: "James Wilson", title: "Director of Sales Ops", company: "MegaHealth Systems", industry: "Healthcare Tech", employees: 1200, revenue: "$180M", source: "linkedin", message: "Saw your post about AI lead scoring. Evaluating options to improve pipeline visibility.", stage: 5, scores: { firmographic: 81, demographic: 88, behavioral: 52, ai_fit: 71 }, composite: 74.2, temperature: "warm", decision: "qualified", signals: ["Active evaluation", "Pipeline visibility need"], painPoints: ["Pipeline visibility gaps"], talkingPoints: ["Healthcare compliance features", "Salesforce integration"], confidence: 0.85, flags: [], routing: { rep: "Marcus Johnson", repId: "rep_002", territory: "US East", sla: "1 hour" }, timestamp: Date.now() - 420000 },
  { id: "ld_003", email: "alex.martinez@acmewidgets.com", name: "Alex Martinez", title: "Sales Manager", company: "Acme Widgets", industry: "Manufacturing", employees: 120, revenue: "$20M", source: "chat_widget", message: "Interested in learning more about your platform.", stage: 5, scores: { firmographic: 54, demographic: 62, behavioral: 41, ai_fit: 45 }, composite: 51.3, temperature: "cool", decision: "nurture", signals: ["Inbound inquiry"], painPoints: ["General sales efficiency"], talkingPoints: ["Manufacturing case studies"], confidence: 0.68, flags: ["low_confidence"], routing: null, timestamp: Date.now() - 900000 },
  { id: "ld_004", email: "john.doe@gmail.com", name: "John Doe", title: "Consultant", company: "Unknown", industry: "Unknown", employees: null, revenue: null, source: "chat_widget", message: "Just exploring options for a client.", stage: 4, scores: { firmographic: 12, demographic: 35, behavioral: 28, ai_fit: 18 }, composite: 22.8, temperature: "cold", decision: "needs_review", signals: [], painPoints: [], talkingPoints: [], confidence: 0.31, flags: ["free_email", "low_confidence"], routing: null, timestamp: Date.now() - 1800000 },
  { id: "ld_005", email: "priya.patel@finova.io", name: "Priya Patel", title: "CRO", company: "Finova Analytics", industry: "FinTech", employees: 85, revenue: "$12M", source: "referral", message: "Our board is pushing us to improve sales efficiency. Need a demo this week if possible.", stage: 5, scores: { firmographic: 78, demographic: 95, behavioral: 92, ai_fit: 88 }, composite: 88.1, temperature: "hot", decision: "qualified", signals: ["Board-level mandate", "Urgent timeline", "Demo request", "Referral source"], painPoints: ["Board pressure on sales efficiency"], talkingPoints: ["Executive onboarding", "Demo within 24hrs"], confidence: 0.94, flags: [], routing: { rep: "Jessica Torres", repId: "rep_001", territory: "US West", sla: "15 min" }, timestamp: Date.now() - 60000 },
  { id: "ld_006", email: "tom.baker@genericcorp.net", name: "Tom Baker", title: "Junior Analyst", company: "GenericCorp", industry: "Consulting", employees: 15, revenue: "$1M", source: "email", message: "Hi", stage: 5, scores: { firmographic: 18, demographic: 8, behavioral: 15, ai_fit: 10 }, composite: 13.0, temperature: "cold", decision: "disqualified", signals: [], painPoints: [], talkingPoints: [], confidence: 0.45, flags: ["company_too_small"], routing: null, timestamp: Date.now() - 3600000 },
  { id: "ld_007", email: "elena.voss@datastream.ai", name: "Elena Voss", title: "VP Business Dev", company: "DataStream AI", industry: "SaaS", employees: 280, revenue: "$35M", source: "web_form", message: "We need to streamline our SDR workflow. Losing deals due to slow response times.", stage: 5, scores: { firmographic: 85, demographic: 90, behavioral: 75, ai_fit: 80 }, composite: 82.8, temperature: "hot", decision: "qualified", signals: ["Speed-to-lead concern", "Deal loss acknowledgment"], painPoints: ["Slow response times causing lost deals"], talkingPoints: ["Real-time routing cuts response to <5min"], confidence: 0.89, flags: [], routing: { rep: "Aisha Patel", repId: "rep_003", territory: "US Central", sla: "15 min" }, timestamp: Date.now() - 300000 },
  { id: "ld_008", email: "liam.chen@globaledge.co.uk", name: "Liam Chen", title: "Head of Sales", company: "GlobalEdge", industry: "Financial Services", employees: 520, revenue: "$78M", source: "referral", message: "Our CRO mentioned your platform. Rebuilding our entire lead management process.", stage: 5, scores: { firmographic: 82, demographic: 86, behavioral: 80, ai_fit: 76 }, composite: 81.2, temperature: "hot", decision: "qualified", signals: ["CRO referral", "Process rebuild initiative"], painPoints: ["Legacy lead management"], talkingPoints: ["Migration support", "Enterprise onboarding"], confidence: 0.88, flags: [], routing: { rep: "David Kim", repId: "rep_004", territory: "International", sla: "1 hour" }, timestamp: Date.now() - 540000 },
];

const NEW_LEADS_POOL = [
  { email: "nina.zhao@cloudstack.dev", name: "Nina Zhao", title: "Head of Growth", company: "CloudStack", industry: "DevTools", employees: 210, revenue: "$28M", source: "web_form", message: "Can your system integrate with HubSpot? We need to replace our manual scoring.", scores: { firmographic: 72, demographic: 85, behavioral: 78, ai_fit: 74 }, composite: 77.1, temperature: "warm", decision: "qualified", signals: ["Integration question", "Manual process replacement"], painPoints: ["Manual scoring spreadsheet"], repId: "rep_002" },
  { email: "raj.kumar@salesengine.io", name: "Raj Kumar", title: "VP Revenue Ops", company: "SalesEngine", industry: "SaaS", employees: 450, revenue: "$62M", source: "referral", message: "Sam at TechCorp recommended you. Our SDR team is drowning in unqualified leads.", scores: { firmographic: 91, demographic: 94, behavioral: 88, ai_fit: 82 }, composite: 89.2, temperature: "hot", decision: "qualified", signals: ["Referral from customer", "Explicit pain statement"], painPoints: ["SDR overwhelm with unqualified leads"], repId: "rep_001" },
  { email: "maria.silva@retailhub.co", name: "Maria Silva", title: "Marketing Manager", company: "RetailHub", industry: "E-commerce", employees: 65, revenue: "$8M", source: "linkedin", message: "Saw your case study. Interesting approach.", scores: { firmographic: 55, demographic: 42, behavioral: 35, ai_fit: 38 }, composite: 43.0, temperature: "cool", decision: "nurture", signals: ["Content engagement"], painPoints: [], repId: null },
  { email: "omar.hassan@velocitycrm.com", name: "Omar Hassan", title: "CTO", company: "VelocityCRM", industry: "SaaS", employees: 180, revenue: "$22M", source: "web_form", message: "Looking for an API-first lead scoring solution we can embed in our own product.", scores: { firmographic: 78, demographic: 70, behavioral: 82, ai_fit: 68 }, composite: 74.8, temperature: "warm", decision: "qualified", signals: ["API-first requirement", "Product embedding use case"], painPoints: ["Need embeddable solution"], repId: "rep_003" },
  { email: "sophie.laurent@nexgen.fr", name: "Sophie Laurent", title: "Directrice Commerciale", company: "NexGen Solutions", industry: "Technology", employees: 310, revenue: "28M EUR", source: "event", message: "We met at SaaStr. Interested in your AI qualification for the EU market.", scores: { firmographic: 74, demographic: 82, behavioral: 65, ai_fit: 70 }, composite: 73.0, temperature: "warm", decision: "qualified", signals: ["Event follow-up", "EU market expansion"], painPoints: ["EU market qualification needs"], repId: "rep_004" },
];

function m(extra = {}) { return { fontFamily: "'JetBrains Mono', monospace", ...extra }; }

function Badge({ label, color, bg }) {
  return <span style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", ...m(), color, background: bg, border: `1px solid ${color}22` }}>{label}</span>;
}

function ScoreBar({ value, color = "#3B82F6", height = 5 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height, background: "rgba(255,255,255,0.06)", borderRadius: height / 2, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: height / 2, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ ...m({ fontSize: 10, color: "rgba(255,255,255,0.45)", minWidth: 22, textAlign: "right" }) }}>{Math.round(value)}</span>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, ...m(), color: accent || "#fff", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function PipelineFunnel({ leads }) {
  const stages = STAGE_LABELS.map((l, i) => ({ l, c: leads.filter(x => x.stage >= i).length }));
  const mx = Math.max(...stages.map(s => s.c), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 56 }}>
      {stages.map((s, i) => {
        const h = Math.max((s.c / mx) * 46, 4); const op = 0.25 + (i / 5) * 0.75;
        return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ ...m({ fontSize: 10, fontWeight: 600 }), color: `rgba(59,130,246,${op + 0.2})` }}>{s.c}</span>
          <div style={{ width: "100%", height: h, background: `rgba(59,130,246,${op * 0.45})`, borderRadius: 3, transition: "height 0.3s" }} />
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{s.l}</span>
        </div>;
      })}
    </div>
  );
}

function ScoringTrendsChart({ history }) {
  if (history.length < 2) return <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, fontStyle: "italic", padding: 12 }}>Simulate leads to see trends</div>;
  const w = 320, h = 100, p = 8;
  const pts = history.slice(-24);
  const xS = (w - p * 2) / Math.max(pts.length - 1, 1);
  const tY = v => h - p - (v / 100) * (h - p * 2);
  const mkLine = (key) => pts.map((pt, i) => `${p + i * xS},${tY(pt[key])}`).join(" ");
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
        {[25, 50, 75].map(v => <line key={v} x1={p} x2={w - p} y1={tY(v)} y2={tY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />)}
        <polyline points={mkLine("qualRate")} fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" />
        <polyline points={mkLine("avg")} fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={p + (pts.length - 1) * xS} cy={tY(pts[pts.length - 1].avg)} r="3" fill="#3B82F6" />
        <circle cx={p + (pts.length - 1) * xS} cy={tY(pts[pts.length - 1].qualRate)} r="3" fill="#10B981" opacity="0.5" />
      </svg>
      <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 2, background: "#3B82F6", borderRadius: 1 }} /><span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Avg score ({Math.round(pts[pts.length - 1].avg)})</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 2, background: "#10B981", borderRadius: 1, opacity: 0.5 }} /><span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Qual rate ({Math.round(pts[pts.length - 1].qualRate)}%)</span></div>
      </div>
    </div>
  );
}

function ActivityFeed({ events }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [events.length]);
  const icons = { intake: { i: "→", c: "#6B7280" }, enriched: { i: "◈", c: "#14B8A6" }, scored: { i: "▣", c: "#3B82F6" }, qualified: { i: "✓", c: "#10B981" }, nurture: { i: "~", c: "#F59E0B" }, review: { i: "?", c: "#8B5CF6" }, disqualified: { i: "✗", c: "#EF4444" }, routed: { i: "⇒", c: "#10B981" } };
  return (
    <div ref={ref} style={{ maxHeight: 220, overflowY: "auto" }}>
      {events.slice(0, 40).map((ev, i) => {
        const cfg = icons[ev.type] || icons.intake;
        const age = Math.round((Date.now() - ev.ts) / 1000);
        const ageS = age < 60 ? `${age}s` : age < 3600 ? `${Math.round(age / 60)}m` : `${Math.round(age / 3600)}h`;
        return <div key={ev.id} style={{ display: "flex", gap: 7, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.025)", opacity: Math.max(0.35, 1 - i * 0.035), animation: i === 0 ? "fadeIn 0.25s ease" : "none" }}>
          <span style={{ ...m({ fontSize: 10, fontWeight: 600 }), color: cfg.c, minWidth: 12, textAlign: "center" }}>{cfg.i}</span>
          <span style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.3 }}>{ev.msg}</span>
          <span style={{ ...m({ fontSize: 8 }), color: "rgba(255,255,255,0.18)" }}>{ageS}</span>
        </div>;
      })}
      {events.length === 0 && <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, fontStyle: "italic", padding: 10 }}>Simulate leads to see activity</div>}
    </div>
  );
}

function RepPerformance({ leads }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {REPS.map(rep => {
        const rl = leads.filter(l => l.routing?.repId === rep.id);
        const avg = rl.length > 0 ? rl.reduce((s, l) => s + l.composite, 0) / rl.length : 0;
        const hot = rl.filter(l => l.temperature === "hot").length;
        return <div key={rep.id} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: `${Math.min(rl.length * 14, 100)}%`, height: "100%", background: `${rep.color}06`, transition: "width 0.4s" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: rep.color, background: `${rep.color}18`, border: `1px solid ${rep.color}35` }}>{rep.avatar}</div>
              <div><div style={{ fontSize: 10, fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>{rep.name}</div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{rep.territory}</div></div>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {[["Leads", rl.length, "#fff"], ["Hot", hot, hot > 0 ? "#EF4444" : "rgba(255,255,255,0.15)"], ["Avg", rl.length > 0 ? Math.round(avg) : "—", avg >= 75 ? "#10B981" : avg >= 50 ? "#F59E0B" : "rgba(255,255,255,0.3)"]].map(([lbl, val, clr]) => (
                <div key={lbl}><div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{lbl}</div><div style={{ ...m({ fontSize: 13, fontWeight: 700 }), color: clr }}>{val}</div></div>
              ))}
            </div>
          </div>
        </div>;
      })}
    </div>
  );
}

function LeadRow({ lead, isSelected, onClick }) {
  const t = TEMP_CONFIG[lead.temperature], d = DECISION_CONFIG[lead.decision];
  const age = Math.round((Date.now() - lead.timestamp) / 60000);
  return (
    <div onClick={onClick} style={{ display: "grid", gridTemplateColumns: "1fr 80px 55px 85px 60px 38px", alignItems: "center", padding: "9px 14px", cursor: "pointer", background: isSelected ? "rgba(59,130,246,0.07)" : "transparent", borderLeft: isSelected ? "2px solid #3B82F6" : "2px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.025)", transition: "all 0.1s" }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
      <div><div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 1 }}>{lead.name}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{lead.title} · {lead.company}</div></div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{lead.source.replace("_", " ")}</div>
      <span style={{ ...m({ fontSize: 12, fontWeight: 600 }), color: t.color }}>{lead.composite.toFixed(1)}</span>
      <Badge label={d.label} color={d.color} bg={d.bg} />
      <Badge label={`${t.icon} ${t.label}`} color={t.color} bg={t.bg} />
      <span style={{ ...m({ fontSize: 8 }), color: "rgba(255,255,255,0.2)" }}>{age < 60 ? `${age}m` : `${Math.round(age / 60)}h`}</span>
    </div>
  );
}

function StageTimeline({ lead }) {
  return <div style={{ display: "flex", alignItems: "center", padding: "5px 14px 1px" }}>
    {STAGE_LABELS.map((_, i) => {
      const a = i <= lead.stage, c = i === lead.stage && lead.stage < 5;
      return <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: a ? (c ? "#3B82F6" : "rgba(59,130,246,0.45)") : "rgba(255,255,255,0.06)", boxShadow: c ? "0 0 5px rgba(59,130,246,0.4)" : "none", transition: "all 0.25s" }} />
        {i < 5 && <div style={{ flex: 1, height: 1, background: a ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.03)", transition: "all 0.25s" }} />}
      </div>;
    })}
  </div>;
}

function LeadDetail({ lead }) {
  if (!lead) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.12)", fontSize: 11, fontStyle: "italic" }}>Select a lead to inspect</div>;
  const t = TEMP_CONFIG[lead.temperature], d = DECISION_CONFIG[lead.decision];
  const dims = [{ k: "firmographic", l: "Firmographic", c: "#14B8A6" }, { k: "demographic", l: "Demographic", c: "#F97316" }, { k: "behavioral", l: "Behavioral", c: "#3B82F6" }, { k: "ai_fit", l: "AI Fit", c: "#A855F7" }];
  const Sec = ({ title, children }) => <div style={{ marginBottom: 14 }}><div style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>{title}</div>{children}</div>;

  return (
    <div style={{ padding: "14px 16px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>{lead.name}</h3>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{lead.title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{lead.company} · {lead.industry}{lead.employees ? ` · ${lead.employees} emp` : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
          <Badge label={`${t.icon} ${t.label}`} color={t.color} bg={t.bg} />
          <Badge label={d.label} color={d.color} bg={d.bg} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "rgba(255,255,255,0.025)", borderRadius: 8, marginBottom: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ ...m({ fontSize: 30, fontWeight: 700 }), color: t.color, lineHeight: 1 }}>{lead.composite.toFixed(1)}</div>
        <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Composite</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>Confidence: {Math.round(lead.confidence * 100)}%</div></div>
      </div>
      <Sec title="Score Breakdown">{dims.map(d => <div key={d.k} style={{ marginBottom: 5 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{d.l}</span><span style={{ ...m({ fontSize: 10 }), color: d.c }}>{lead.scores[d.k]}</span></div><ScoreBar value={lead.scores[d.k]} color={d.c} height={4} /></div>)}</Sec>
      {lead.message && <Sec title="Message"><div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, padding: 9, background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: "2px solid rgba(59,130,246,0.2)" }}>"{lead.message}"</div></Sec>}
      {lead.signals.length > 0 && <Sec title="Buying Signals">{lead.signals.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, fontSize: 10, color: "rgba(255,255,255,0.45)" }}><span style={{ color: "#10B981", fontSize: 6 }}>●</span>{s}</div>)}</Sec>}
      {lead.painPoints.length > 0 && <Sec title="Pain Points">{lead.painPoints.map((p, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, fontSize: 10, color: "rgba(255,255,255,0.45)" }}><span style={{ color: "#F59E0B", fontSize: 6 }}>●</span>{p}</div>)}</Sec>}
      {lead.talkingPoints.length > 0 && <Sec title="Talking Points">{lead.talkingPoints.map((t, i) => <div key={i} style={{ display: "flex", gap: 5, marginBottom: 3, fontSize: 10, color: "rgba(255,255,255,0.45)" }}><span style={{ color: "#3B82F6", fontSize: 9 }}>→</span>{t}</div>)}</Sec>}
      {lead.flags.length > 0 && <Sec title="Flags"><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{lead.flags.map((f, i) => <Badge key={i} label={f.replace(/_/g, " ").toUpperCase()} color="#F59E0B" bg="rgba(245,158,11,0.08)" />)}</div></Sec>}
      {lead.routing && <div style={{ padding: 9, background: "rgba(16,185,129,0.04)", borderRadius: 6, border: "1px solid rgba(16,185,129,0.1)" }}><div style={{ fontSize: 8, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 600 }}>Routing</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Rep: {lead.routing.rep} · Territory: {lead.routing.territory} · SLA: {lead.routing.sla}</div></div>}
    </div>
  );
}

export default function Dashboard() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("leads");
  const [pulse, setPulse] = useState(true);
  const nli = useRef(0), eid = useRef(0);

  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1200); return () => clearInterval(t); }, []);
  useEffect(() => {
    const q = leads.filter(l => l.decision === "qualified").length, tot = leads.length || 1;
    const avg = leads.reduce((s, l) => s + l.composite, 0) / tot;
    setHistory(p => [...p.slice(-30), { avg: Math.round(avg * 10) / 10, qualRate: Math.round((q / tot) * 100), ts: Date.now() }]);
  }, [leads.length]);

  const addEv = useCallback((type, msg) => { eid.current++; setEvents(p => [{ id: eid.current, type, msg, ts: Date.now() }, ...p.slice(0, 60)]); }, []);

  const simulate = useCallback(() => {
    const tpl = NEW_LEADS_POOL[nli.current % NEW_LEADS_POOL.length]; nli.current++;
    const id = `ld_${Date.now()}`;
    setLeads(p => [{ ...tpl, id, stage: 0, confidence: 0, flags: [], signals: [], painPoints: [], talkingPoints: [], routing: null, timestamp: Date.now() }, ...p]);
    addEv("intake", `New lead: ${tpl.name} (${tpl.company})`);
    [
      { s: 1, t: "enriched", m: `Enriching ${tpl.name} — ${tpl.company}` },
      { s: 2, t: "enriched", m: `AI analysis complete for ${tpl.company}` },
      { s: 3, t: "scored", m: `Scored ${tpl.name}: ${tpl.composite.toFixed(1)}/100` },
      { s: 4, t: tpl.decision === "qualified" ? "qualified" : tpl.decision === "nurture" ? "nurture" : tpl.decision === "needs_review" ? "review" : "disqualified", m: `${tpl.name} → ${tpl.decision.toUpperCase()}` },
      { s: 5, t: tpl.decision === "qualified" ? "routed" : tpl.decision, m: tpl.decision === "qualified" ? `Routed ${tpl.name} to ${REPS.find(r => r.id === tpl.repId)?.name || "queue"}` : `${tpl.name} — complete` },
    ].forEach((ev, i) => {
      setTimeout(() => {
        setLeads(p => p.map(l => l.id !== id ? l : {
          ...l, stage: ev.s, confidence: ev.s >= 4 ? tpl.confidence || 0.7 : ev.s * 0.15,
          scores: ev.s >= 3 ? tpl.scores : { firmographic: 0, demographic: 0, behavioral: 0, ai_fit: 0 },
          composite: ev.s >= 4 ? tpl.composite : 0, temperature: ev.s >= 4 ? tpl.temperature : "cold",
          decision: ev.s >= 5 ? tpl.decision : "needs_review",
          signals: ev.s >= 4 ? (tpl.signals || []) : [], painPoints: ev.s >= 4 ? (tpl.painPoints || []) : [],
          talkingPoints: ev.s >= 5 ? (tpl.talkingPoints || []) : [],
          routing: ev.s >= 5 && tpl.decision === "qualified" ? { rep: REPS.find(r => r.id === tpl.repId)?.name || "Auto", repId: tpl.repId, territory: REPS.find(r => r.id === tpl.repId)?.territory || "RR", sla: tpl.temperature === "hot" ? "15 min" : "1 hour" } : null,
        }));
        addEv(ev.t, ev.m);
      }, (i + 1) * 850);
    });
  }, [addEv]);

  const sel = leads.find(l => l.id === selectedId);
  const filt = filter === "all" ? leads : leads.filter(l => l.decision === filter);
  const st = { total: leads.length, qual: leads.filter(l => l.decision === "qualified").length, avg: leads.length > 0 ? (leads.reduce((s, l) => s + l.composite, 0) / leads.length).toFixed(1) : "0", hot: leads.filter(l => l.temperature === "hot").length };
  const qr = leads.length > 0 ? Math.round((st.qual / leads.length) * 100) : 0;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0A0B0E", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>


      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.012)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: pulse ? "#10B981" : "rgba(16,185,129,0.25)", boxShadow: pulse ? "0 0 6px rgba(16,185,129,0.35)" : "none", transition: "all 0.3s" }} />
          <span style={{ ...m({ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }), color: "rgba(255,255,255,0.6)" }}>LEAD QUALIFICATION OPS</span>
          <span style={{ ...m({ fontSize: 8 }), color: "rgba(255,255,255,0.15)" }}>v2.0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["leads", "analytics"].map(v => <button key={v} onClick={() => setView(v)} style={{ ...m({ fontSize: 9, fontWeight: 500 }), padding: "4px 10px", borderRadius: 4, cursor: "pointer", background: view === v ? "rgba(255,255,255,0.07)" : "transparent", color: view === v ? "#fff" : "rgba(255,255,255,0.3)", border: view === v ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", textTransform: "uppercase", letterSpacing: "0.05em" }}>{v}</button>)}
          <button onClick={simulate} style={{ ...m({ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em" }), padding: "5px 12px", borderRadius: 4, background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)", cursor: "pointer" }}>+ SIMULATE LEAD</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, padding: "12px 18px" }}>
        <MetricCard label="Total Leads" value={st.total} />
        <MetricCard label="Qualified" value={st.qual} accent="#10B981" sub={`${qr}% rate`} />
        <MetricCard label="Avg Score" value={st.avg} accent="#3B82F6" />
        <MetricCard label="Hot Leads" value={st.hot} accent="#EF4444" sub="15 min SLA" />
        <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>Pipeline</div>
          <PipelineFunnel leads={leads} />
        </div>
      </div>

      {view === "leads" ? (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 320px", borderTop: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {["all", "qualified", "nurture", "needs_review", "disqualified"].map(f => {
                const cnt = f === "all" ? leads.length : leads.filter(l => l.decision === f).length;
                const lbl = f === "all" ? "ALL" : f === "needs_review" ? "REV" : f.slice(0, 4).toUpperCase();
                return <button key={f} onClick={() => setFilter(f)} style={{ ...m({ fontSize: 8, fontWeight: 500 }), padding: "3px 7px", borderRadius: 3, cursor: "pointer", background: filter === f ? "rgba(255,255,255,0.07)" : "transparent", color: filter === f ? "#fff" : "rgba(255,255,255,0.25)", border: filter === f ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent", textTransform: "uppercase", letterSpacing: "0.04em" }}>{lbl} {cnt}</button>;
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 55px 85px 60px 38px", padding: "5px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 7, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              <span>Lead</span><span>Source</span><span>Score</span><span>Decision</span><span>Temp</span><span>Age</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filt.map(l => <div key={l.id}><StageTimeline lead={l} /><LeadRow lead={l} isSelected={selectedId === l.id} onClick={() => setSelectedId(l.id)} /></div>)}
              {filt.length === 0 && <div style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.12)", fontSize: 11, fontStyle: "italic" }}>No leads match filter</div>}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.008)", overflowY: "auto" }}><LeadDetail lead={sel} /></div>
        </div>
      ) : (
        <div style={{ flex: 1, padding: "14px 18px", overflowY: "auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Scoring Trends</div>
              <ScoringTrendsChart history={history} />
            </div>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Decision Distribution</div>
              {Object.entries(DECISION_CONFIG).map(([k, cfg]) => {
                const cnt = leads.filter(l => l.decision === k).length, pct = leads.length > 0 ? (cnt / leads.length) * 100 : 0;
                return <div key={k} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 10, color: cfg.color }}>{cfg.label}</span><span style={{ ...m({ fontSize: 10 }), color: "rgba(255,255,255,0.4)" }}>{cnt} ({Math.round(pct)}%)</span></div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: cfg.color, borderRadius: 3, opacity: 0.6, transition: "width 0.3s" }} /></div>
                </div>;
              })}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Rep Performance</div>
              <RepPerformance leads={leads} />
            </div>
            <div style={{ padding: 16, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Live Activity</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 4, height: 4, borderRadius: "50%", background: pulse ? "#10B981" : "rgba(16,185,129,0.2)", transition: "all 0.3s" }} /><span style={{ ...m({ fontSize: 8 }), color: "rgba(255,255,255,0.2)" }}>{events.length} events</span></div>
              </div>
              <ActivityFeed events={events} />
            </div>
          </div>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Average Score by Source</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {["web_form", "referral", "linkedin", "chat_widget", "email", "event"].map(src => {
                const sl = leads.filter(l => l.source === src), avg = sl.length > 0 ? sl.reduce((s, l) => s + l.composite, 0) / sl.length : 0;
                const h = Math.max((avg / 100) * 50, 3), clr = avg >= 75 ? "#10B981" : avg >= 50 ? "#F59E0B" : avg >= 25 ? "#3B82F6" : "#6B7280";
                return <div key={src} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <span style={{ ...m({ fontSize: 11, fontWeight: 600 }), color: avg > 0 ? clr : "rgba(255,255,255,0.1)" }}>{avg > 0 ? Math.round(avg) : "—"}</span>
                  <div style={{ width: "65%", height: h, background: clr, borderRadius: 2, opacity: 0.5, transition: "height 0.3s" }} />
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{src.replace("_", " ")}</span>
                  <span style={{ ...m({ fontSize: 8 }), color: "rgba(255,255,255,0.15)" }}>{sl.length}</span>
                </div>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
