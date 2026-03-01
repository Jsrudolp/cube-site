"use client";

function printElement(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const w = window.open("", "_blank", "width=1400,height=1000");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body>${el.outerHTML}</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// ---------------------------------------------------------------------------
// Mock asset 1: Positioning slide (Google Slides aesthetic)
// ---------------------------------------------------------------------------
function PositioningSlide() {
  return (
    <div
      id="mock-slide"
      style={{
        width: 1280,
        height: 720,
        background: "white",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "64px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {/* Title */}
      <h1 style={{ fontSize: 42, fontWeight: 700, color: "#1a0dab", lineHeight: 1.2 }}>
        Theme 2: No &ldquo;wow factor&rdquo; for TutorLink
      </h1>

      {/* Subtitle */}
      <p style={{ fontSize: 18, color: "#1a1a1a", marginTop: -8 }}>
        Examples — what are the parts of value that we aren&rsquo;t highlighting?
      </p>

      {/* Table */}
      <table
        style={{
          borderCollapse: "collapse",
          width: "85%",
          marginLeft: 48,
          fontSize: 15,
          color: "#1a1a1a",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #bbb", padding: "10px 16px", textAlign: "left", width: "45%", fontWeight: 700 }}>
              Not just…
            </th>
            <th style={{ border: "1px solid #bbb", padding: "10px 16px", textAlign: "left", fontWeight: 700 }}>
              But also,
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Credentialed instructors", "15+ years domain experience, ex-industry practitioners, published authors"],
            ["Recorded video lessons", "Live corrections on student work, personalised feedback in real time"],
            ["Structured homework help", "Proactive progress updates, parent-visible notes, celebration of milestones"],
            ["Small group video calls", "High per-student speaking time, project-based learning, portfolio outcomes"],
          ].map(([left, right], i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #bbb", padding: "10px 16px", verticalAlign: "top" }}>{left}</td>
              <td style={{ border: "1px solid #bbb", padding: "10px 16px", verticalAlign: "top" }}>{right}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom question */}
      <p style={{ fontSize: 22, color: "#555", marginTop: "auto" }}>
        How can we help instructors highlight their{" "}
        <strong style={{ color: "#1a0dab" }}>unique value propositions?</strong>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock asset 2: Investment memo (Google Docs aesthetic)
// ---------------------------------------------------------------------------
function InvestmentMemo() {
  return (
    <div
      id="mock-memo"
      style={{
        width: 816,
        minHeight: 1056,
        background: "white",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 13,
        color: "#1a1a1a",
        lineHeight: 1.6,
        padding: "72px 80px",
      }}
    >
      <p style={{ marginBottom: 16 }}>One-liner: affordable mental health support for early-career professionals</p>

      <p style={{ marginBottom: 8 }}>
        PMF: is there a proven market (revenue, customer loyalty, etc.) in other regions?
      </p>
      <ul style={{ paddingLeft: 32, marginBottom: 16 }}>
        <li>
          <a href="#" style={{ color: "#1a0dab" }}>Calm</a> / <a href="#" style={{ color: "#1a0dab" }}>BetterHelp</a>: established players in US + CA
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            <li>Clear PMF: 2M+ paying users, $300M+ revenue, 10+ years in a maturing market</li>
            <li>First result in "therapy app reviews" includes negative articles about therapist matching quality</li>
          </ul>
        </li>
        <li style={{ marginTop: 8 }}>
          Young professional segment has 3x higher reported burnout than general population
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            <li>~40% of 22–35 year olds report work-related anxiety affecting productivity</li>
            <li>Cultural shift → employers increasingly expected to subsidize mental wellness</li>
          </ul>
        </li>
        <li style={{ marginTop: 8 }}>
          Canadian market: limited domestic incumbents, US players have poor CA localisation and pricing parity issues
        </li>
      </ul>

      <p style={{ fontWeight: 700, marginBottom: 4 }}>Analysis</p>
      <ul style={{ paddingLeft: 32, marginBottom: 24 }}>
        <li>Clear foreign player with strong PMF, but category takes 5–10 years to build trust</li>
        <li>
          Unclear if employer-subsidy channel works at early stage — benefits procurement is slow
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            <li>B2C likely faster to validate, B2B likely higher LTV but 12–18 month sales cycles</li>
          </ul>
        </li>
      </ul>

      <p style={{ marginBottom: 8 }}>
        Rapid MVP: Can 1 founder + support resources build an MVP within 3–6 months on a $25k budget?
      </p>
      <ul style={{ paddingLeft: 32, marginBottom: 16 }}>
        <li>
          Various levels of technical complexity across solutions in the space:
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            <li><a href="#" style={{ color: "#1a0dab" }}>BetterHelp:</a> Async messaging + scheduled video with licensed therapists</li>
            <li><a href="#" style={{ color: "#1a0dab" }}>Woebot:</a> CBT-based chatbot, no human therapists, fully automated</li>
            <li><a href="#" style={{ color: "#1a0dab" }}>Inkblot:</a> Video-only licensed therapy, CA-focused, employer channel</li>
            <li><a href="#" style={{ color: "#1a0dab" }}>Tranquility:</a> Peer coaching model, lower price point, non-licensed coaches</li>
          </ul>
        </li>
        <li style={{ marginTop: 8 }}>
          Lowest complexity MVP: Booking software + vetted peer coach matching + async check-in messaging
        </li>
      </ul>

      <p style={{ fontWeight: 700, marginBottom: 4 }}>Analysis:</p>
      <ul style={{ paddingLeft: 32, marginBottom: 24 }}>
        <li>Peer coaching model is buildable in budget, but regulatory risk if framed as "mental health"</li>
        <li>Licensed therapist model builds more trust but unit economics are challenging at low volume</li>
      </ul>

      <p style={{ marginBottom: 8 }}>
        Ignored Opportunity: Is the opportunity space undergoing a paradigm shift or otherwise ignored? Is there limited domestic competition and low likelihood of foreign entrants?
      </p>
      <ul style={{ paddingLeft: 32, marginBottom: 24 }}>
        <li>Employer-subsidized wellness is underserved in CA — most US players haven&rsquo;t localised pricing</li>
        <li>
          Gen Z workforce expects mental health support as table stakes, not a perk
          <ul style={{ paddingLeft: 24, marginTop: 4 }}>
            <li>Shift creates a large cohort of first-time buyers entering the category</li>
          </ul>
        </li>
      </ul>

      <p style={{ fontWeight: 700, marginBottom: 4 }}>Overall assessment:</p>
      <ul style={{ paddingLeft: 32 }}>
        <li>Market timing is favorable, but founder-market fit and go-to-market channel are the critical unknowns</li>
        <li>Recommend passing unless founder has prior experience in mental health or employer benefits sales</li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MockAssetsPage() {
  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh", padding: 40, fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Mock Assets</h1>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
          Use <strong>Cmd+Shift+4</strong> (Mac) to screenshot each document, or click Print to open in a new window for PDF export.
        </p>
      </div>

      {/* Slide */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>business-1.png — Positioning Slide</h2>
          <button
            onClick={() => printElement("mock-slide")}
            style={{ padding: "6px 14px", fontSize: 13, background: "#1a1a1a", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            Print / Export PDF
          </button>
        </div>
        <div style={{ display: "inline-block", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <PositioningSlide />
        </div>
      </div>

      {/* Memo */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>business-2.png — Investment Memo</h2>
          <button
            onClick={() => printElement("mock-memo")}
            style={{ padding: "6px 14px", fontSize: 13, background: "#1a1a1a", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            Print / Export PDF
          </button>
        </div>
        <div style={{ display: "inline-block", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
          <InvestmentMemo />
        </div>
      </div>
    </div>
  );
}
