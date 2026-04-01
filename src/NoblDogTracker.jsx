import { useState, useRef, useCallback } from "react";

// ── NOBL Brand Tokens ────────────────────────────────────────────────────────
const C = {
  forest:   "#3C5C53",  // primary — headers, nav, CTAs
  sky:      "#72AAB9",  // secondary — accents, icons, progress
  ember:    "#CC6633",  // alert/warning — flash reminder, rejections
  fog:      "#F1F1F0",  // background — page, cards
  white:    "#FFFFFF",
  forestDark: "#2a423c",
  forestLight: "#4e7468",
  skyLight:  "#a8cdd8",
  skyDark:   "#4d8ea0",
  emberLight:"#d98460",
  emberDark: "#9e4e26",
  text:      "#1e2e2a",
  textMid:   "#4a6660",
  textLight: "#7a9990",
};

const PHOTO_ZONES = [
  {
    id: "back",
    label: "Back & Top Coat",
    icon: "↑",
    instruction: "Stand your dog naturally. Hold camera directly above their back, about 2 feet away. Flash ON. The full spine from neck to tail must be visible.",
    guide: "Top-down · Full spine · 2 ft away · Flash on",
  },
  {
    id: "belly",
    label: "Belly & Undercoat",
    icon: "↓",
    instruction: "Have your dog lay on their back. Hold camera 18 inches above. Flash ON. Groin, belly, and chest all need to be in frame.",
    guide: "Dog on back · Full belly · Flash on",
  },
  {
    id: "ears",
    label: "Ears (Both Sides)",
    icon: "◁",
    instruction: "Fold the ear back gently to expose the inner flap. Get 8–10 inches close. Flash ON. Inner ear skin must be clearly visible.",
    guide: "Ear folded back · Inner skin visible · 8–10 in",
  },
  {
    id: "paws",
    label: "Paws & Between Toes",
    icon: "✦",
    instruction: "Hold a paw and gently spread the toes. Camera 6–8 inches away. Flash ON. Skin between toes and paw pads must be visible.",
    guide: "Toes spread · Skin visible · Flash on",
  },
  {
    id: "face",
    label: "Face & Muzzle",
    icon: "◉",
    instruction: "Have your dog face you at eye level. Hold camera 12 inches away. Flash ON. Muzzle skin, eyes, and forehead all need to be in frame.",
    guide: "Facing camera · Eye level · 12 in · Flash on",
  },
];

const DIET_OPTIONS = [
  "Kibble (dry food)", "Wet / canned food", "Raw diet (BARF)",
  "Home-cooked meals", "Mixed / combination", "Prescription diet", "Other",
];

const WEEKS = ["Baseline", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

// ── API ──────────────────────────────────────────────────────────────────────
async function analyzePhoto(imageBase64, zone, isValidation, dogInfo, weekLabel) {
  const systemPrompt = isValidation
    ? `You are a veterinary photo quality assessor. Determine if a submitted dog photo is usable for skin and coat health analysis.
Evaluate for: lighting quality, focus/sharpness, correct body area, appropriate distance, flash usage.
Respond ONLY with valid JSON: {"valid": true/false, "reason": "specific reason if invalid", "tip": "one specific actionable fix if invalid", "confidence": 0-100}
If valid, set reason and tip to "". Be strict — blurry, dark, or incorrectly framed photos must be rejected with specific, helpful guidance.`
    : `You are a veterinary nutritionist AI specializing in canine skin and coat health. Analyze this dog photo of the ${zone.label} area.
Dog info: ${JSON.stringify(dogInfo)}. This is their ${weekLabel} photo.
Assess coat shine/luster, skin condition (redness, dryness, flaking, hotspots), coat density and texture, any visible irritation.
Respond ONLY with valid JSON: {"score": 1-10, "observations": ["obs1","obs2","obs3"], "dietSignals": "what this suggests about their diet", "recommendations": "specific dietary or care recommendation", "trend": "improving/stable/declining/baseline"}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
          { type: "text", text: isValidation
            ? `Check if this photo of the dog's ${zone.label} meets quality standards. Required: ${zone.guide}`
            : `Analyze this ${zone.label} photo for skin and coat health indicators.` }
        ]
      }]
    })
  });
  const data = await response.json();
  const text = data.content?.map(i => i.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Shared Styles ─────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: C.fog,
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    color: C.text,
  },
  header: {
    background: C.forest,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: "22px",
    color: C.white,
    letterSpacing: "0.04em",
  },
  logoSub: {
    fontSize: "11px",
    color: C.skyLight,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  body: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "20px 16px 40px",
  },
  card: {
    background: C.white,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "12px",
    border: `1px solid rgba(60,92,83,0.1)`,
  },
  cardForest: {
    background: C.forest,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "12px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.textLight,
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: `1.5px solid rgba(60,92,83,0.2)`,
    fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    color: C.text,
    background: C.white,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "10px",
    transition: "border-color 0.2s",
  },
  btnPrimary: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: C.forest,
    color: C.white,
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: "0.02em",
    transition: "background 0.2s",
  },
  btnSecondary: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: `1.5px solid ${C.forest}`,
    background: "transparent",
    color: C.forest,
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "8px",
  },
  btnEmber: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: C.ember,
    color: C.white,
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginTop: "8px",
  },
};

// ── Components ────────────────────────────────────────────────────────────────

function Header({ dogName, week }) {
  return (
    <div style={S.header}>
      <div>
        <div style={S.logo}>NOBL</div>
        <div style={S.logoSub}>Coat & Skin Tracker</div>
      </div>
      {dogName && (
        <div style={{ textAlign: "right" }}>
          <div style={{ color: C.skyLight, fontSize: "12px", letterSpacing: "0.08em" }}>TRACKING</div>
          <div style={{ color: C.white, fontSize: "15px", fontWeight: "600" }}>{dogName}</div>
          {week !== undefined && <div style={{ color: C.skyLight, fontSize: "12px" }}>{WEEKS[week]}</div>}
        </div>
      )}
    </div>
  );
}

function FlashBanner() {
  return (
    <div style={{
      background: C.ember,
      borderRadius: "12px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "14px",
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: "rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px", flexShrink: 0,
      }}>⚡</div>
      <div>
        <div style={{ fontWeight: "700", color: C.white, fontSize: "13px", letterSpacing: "0.04em" }}>ENABLE FLASH BEFORE EVERY PHOTO</div>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", marginTop: "2px" }}>Flash is required for accurate skin and coat analysis</div>
      </div>
    </div>
  );
}

function ProgressDots({ zones, photoStates }) {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {zones.map(z => {
        const s = photoStates[z.id];
        const bg = s === "valid" ? C.sky : s === "invalid" ? C.ember : "rgba(60,92,83,0.15)";
        return (
          <div key={z.id} style={{ flex: 1, height: "5px", borderRadius: "3px", background: bg, transition: "background 0.3s" }} />
        );
      })}
    </div>
  );
}

function PhotoZoneCard({ zone, photo, onUpload, status, feedback, isAnalyzing }) {
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(zone.id, file, reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const borderColor = status === "valid" ? C.sky : status === "invalid" ? C.ember : "rgba(60,92,83,0.15)";
  const bgColor = status === "valid" ? "#f0f8fb" : status === "invalid" ? "#fdf4f0" : C.white;

  return (
    <div style={{
      border: `1.5px solid ${borderColor}`,
      borderRadius: "14px",
      padding: "16px",
      background: bgColor,
      marginBottom: "10px",
      transition: "all 0.25s ease",
    }}>
      {/* Zone header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "8px",
          background: C.forest,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.white, fontSize: "14px", fontWeight: "700", flexShrink: 0,
        }}>{zone.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: C.text }}>{zone.label}</div>
          <div style={{ fontSize: "11px", color: C.textLight, letterSpacing: "0.04em" }}>{zone.guide}</div>
        </div>
        {status === "valid" && (
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: C.sky, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: "13px" }}>✓</div>
        )}
      </div>

      {/* How-to instruction */}
      <div style={{
        background: `rgba(114,170,185,0.12)`,
        border: `1px solid rgba(114,170,185,0.3)`,
        borderRadius: "10px",
        padding: "10px 12px",
        marginBottom: "10px",
        fontSize: "13px",
        color: C.forestDark,
        lineHeight: "1.55",
      }}>
        <span style={{ fontWeight: "600", color: C.sky }}>How to take this photo — </span>
        {zone.instruction}
      </div>

      {/* Rejection feedback */}
      {status === "invalid" && feedback && (
        <div style={{
          background: `rgba(204,102,51,0.08)`,
          border: `1px solid rgba(204,102,51,0.3)`,
          borderRadius: "10px",
          padding: "10px 12px",
          marginBottom: "10px",
          fontSize: "13px",
          lineHeight: "1.55",
        }}>
          <div style={{ fontWeight: "700", color: C.emberDark, marginBottom: "4px" }}>✕  What's wrong</div>
          <div style={{ color: C.ember, marginBottom: "6px" }}>{feedback.reason}</div>
          <div style={{ fontWeight: "700", color: C.forestDark, marginBottom: "2px" }}>→  How to fix it</div>
          <div style={{ color: C.text }}>{feedback.tip}</div>
        </div>
      )}

      {/* Analyzing spinner */}
      {isAnalyzing && (
        <div style={{ textAlign: "center", padding: "10px", color: C.sky, fontSize: "13px", fontWeight: "600", letterSpacing: "0.04em" }}>
          Checking photo quality...
        </div>
      )}

      {/* Preview thumbnail */}
      {status === "valid" && photo && (
        <div style={{ borderRadius: "8px", overflow: "hidden", marginBottom: "10px", maxHeight: "110px" }}>
          <img src={URL.createObjectURL(photo)} alt={zone.label} style={{ width: "100%", objectFit: "cover", maxHeight: "110px" }} />
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      <button
        onClick={() => fileRef.current.click()}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "none",
          background: status === "valid" ? `rgba(114,170,185,0.2)` : C.forest,
          color: status === "valid" ? C.skyDark : C.white,
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {status === "valid" ? "Retake photo" : status === "invalid" ? "Retake photo" : "Upload photo"}
      </button>
    </div>
  );
}

function ScoreRing({ score, size = 80, stroke = 7 }) {
  const r = (size / 2) - stroke;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 10) * circ;
  const color = score >= 8 ? C.sky : score >= 6 ? C.forest : C.ember;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`rgba(60,92,83,0.1)`} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

function WeekNav({ history, currentWeek, onSelect }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
      {history.sort((a, b) => a.week - b.week).map(entry => (
        <button
          key={entry.week}
          onClick={() => onSelect(entry.week)}
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            border: `1.5px solid ${entry.week === currentWeek ? C.forest : "rgba(60,92,83,0.2)"}`,
            background: entry.week === currentWeek ? C.forest : "transparent",
            color: entry.week === currentWeek ? C.white : C.textMid,
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.02em",
          }}
        >{entry.weekLabel}</button>
      ))}
    </div>
  );
}

function AnalysisResults({ results, weekLabel, dogInfo, history, onSelectWeek, currentWeek, onNextWeek }) {
  const avgScore = results.length
    ? parseFloat((results.reduce((a, b) => a + (b.score || 0), 0) / results.length).toFixed(1))
    : 0;
  const scoreLabel = avgScore >= 8.5 ? "Excellent" : avgScore >= 7 ? "Good" : avgScore >= 5 ? "Fair" : "Needs attention";
  const trendColor = avgScore >= 8 ? C.sky : avgScore >= 6 ? C.forest : C.ember;

  return (
    <div>
      {history.length > 1 && <WeekNav history={history} currentWeek={currentWeek} onSelect={onSelectWeek} />}

      {/* Score hero */}
      <div style={{ ...S.cardForest, display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ScoreRing score={avgScore} size={84} stroke={7} />
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "22px", fontWeight: "700", color: C.white }}>{avgScore}</span>
            <span style={{ fontSize: "10px", color: C.skyLight }}>/ 10</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: C.skyLight, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{weekLabel} · {dogInfo.name}</div>
          <div style={{ fontSize: "20px", fontFamily: "'DM Serif Display', Georgia, serif", color: C.white, marginBottom: "6px" }}>{scoreLabel}</div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", color: C.skyLight }}>
            {results[0]?.trend === "improving" ? "↑ Improving" : results[0]?.trend === "declining" ? "↓ Declining" : "◆ Baseline"}
          </div>
        </div>
      </div>

      {/* Zone bars */}
      <div style={S.card}>
        <div style={S.label}>By area</div>
        {results.map((r, i) => {
          const zone = PHOTO_ZONES.find(z => z.id === r.zoneId);
          const barColor = r.score >= 8 ? C.sky : r.score >= 6 ? C.forest : C.ember;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ fontSize: "12px", color: C.textMid, width: "80px", flexShrink: 0 }}>{zone?.label?.split(" ")[0] || ""}</div>
              <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(60,92,83,0.1)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${r.score * 10}%`, background: barColor, borderRadius: "3px", transition: "width 0.8s ease" }} />
              </div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: barColor, width: "24px", textAlign: "right" }}>{r.score}</div>
            </div>
          );
        })}
      </div>

      {/* Observations */}
      <div style={S.card}>
        <div style={S.label}>Key findings</div>
        {results.map((r, i) =>
          r.observations?.map((obs, j) => (
            <div key={`${i}-${j}`} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sky, flexShrink: 0, marginTop: "6px" }} />
              <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.55" }}>{obs}</div>
            </div>
          ))
        )}
      </div>

      {/* Diet signal */}
      <div style={{ ...S.card, background: `rgba(114,170,185,0.1)`, border: `1px solid rgba(114,170,185,0.25)` }}>
        <div style={{ ...S.label, color: C.skyDark }}>Diet signal</div>
        <div style={{ fontSize: "14px", color: C.forestDark, lineHeight: "1.6" }}>
          {results[0]?.dietSignals || "—"}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ ...S.card, background: C.forest }}>
        <div style={{ ...S.label, color: C.skyLight }}>Recommendations</div>
        <div style={{ fontSize: "14px", color: C.fog, lineHeight: "1.6" }}>
          {results.map(r => r.recommendations).filter(Boolean).join(" ")}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: "12px", color: C.textLight, lineHeight: "1.6", padding: "12px 4px" }}>
        ⚕ This tool is AI-assisted and for informational purposes only. It does not replace professional veterinary diagnosis or treatment. Consult your vet for any health concerns.
      </div>

      {currentWeek < 6 && (
        <button style={S.btnPrimary} onClick={onNextWeek}>
          Schedule {WEEKS[Math.min(currentWeek + 1, 6)]} Check-in →
        </button>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function NoblDogTracker() {
  const [step, setStep] = useState("onboarding");
  const [dogInfo, setDogInfo] = useState({ name: "", breed: "", age: "", diet: "", dietBrand: "", dietDuration: "" });
  const [currentWeek, setCurrentWeek] = useState(0);
  const [photoStates, setPhotoStates] = useState({});
  const [photoFiles, setPhotoFiles]   = useState({});
  const [photoBase64, setPhotoBase64] = useState({});
  const [photoFeedback, setPhotoFeedback] = useState({});
  const [analyzingZone, setAnalyzingZone] = useState(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState("");
  const [weekResults, setWeekResults] = useState({});
  const [history, setHistory] = useState([]);
  const [viewingWeek, setViewingWeek] = useState(0);

  const handlePhotoUpload = useCallback(async (zoneId, file, base64) => {
    setPhotoFiles(p => ({ ...p, [zoneId]: file }));
    setPhotoBase64(p => ({ ...p, [zoneId]: base64 }));
    setPhotoStates(p => ({ ...p, [zoneId]: "analyzing" }));
    setAnalyzingZone(zoneId);

    const zone = PHOTO_ZONES.find(z => z.id === zoneId);
    try {
      const result = await analyzePhoto(base64, zone, true, dogInfo, WEEKS[currentWeek]);
      if (result.valid) {
        setPhotoStates(p => ({ ...p, [zoneId]: "valid" }));
        setPhotoFeedback(p => ({ ...p, [zoneId]: null }));
      } else {
        setPhotoStates(p => ({ ...p, [zoneId]: "invalid" }));
        setPhotoFeedback(p => ({ ...p, [zoneId]: result }));
      }
    } catch {
      setPhotoStates(p => ({ ...p, [zoneId]: "invalid" }));
      setPhotoFeedback(p => ({ ...p, [zoneId]: {
        reason: "We couldn't assess this photo.",
        tip: "Make sure it's well-lit with flash enabled, in sharp focus, and clearly shows the correct area. Try holding the camera steady and closer.",
      }}));
    }
    setAnalyzingZone(null);
  }, [dogInfo, currentWeek]);

  const allValid = PHOTO_ZONES.every(z => photoStates[z.id] === "valid");
  const validCount = PHOTO_ZONES.filter(z => photoStates[z.id] === "valid").length;

  const runFullAnalysis = async () => {
    setIsRunningAnalysis(true);
    setStep("analyzing");
    const results = [];
    for (const zone of PHOTO_ZONES) {
      setAnalysisPhase(`Analyzing ${zone.label}...`);
      try {
        const result = await analyzePhoto(photoBase64[zone.id], zone, false, dogInfo, WEEKS[currentWeek]);
        results.push({ zoneId: zone.id, ...result });
      } catch {
        results.push({ zoneId: zone.id, score: 5, observations: ["Analysis could not be completed for this area."], dietSignals: "", recommendations: "Please retake this photo and try again." });
      }
    }
    const entry = { week: currentWeek, weekLabel: WEEKS[currentWeek], results, timestamp: new Date().toLocaleDateString() };
    setWeekResults(r => ({ ...r, [currentWeek]: results }));
    setHistory(h => [...h.filter(e => e.week !== currentWeek), entry]);
    setViewingWeek(currentWeek);
    setIsRunningAnalysis(false);
    setStep("results");
  };

  const startNextWeek = () => {
    const next = Math.min(currentWeek + 1, 6);
    setCurrentWeek(next);
    setPhotoStates({});
    setPhotoFiles({});
    setPhotoBase64({});
    setPhotoFeedback({});
    setStep("photos");
  };

  const updateDog = (k, v) => setDogInfo(d => ({ ...d, [k]: v }));
  const canStart = dogInfo.name && dogInfo.diet;

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

      <Header
        dogName={dogInfo.name || null}
        week={step !== "onboarding" ? currentWeek : undefined}
      />

      <div style={S.body}>

        {/* ── ONBOARDING ── */}
        {step === "onboarding" && (
          <div>
            <div style={{ ...S.card, marginTop: "4px" }}>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "22px", color: C.forest, marginBottom: "6px" }}>
                Track your dog's skin & coat health
              </div>
              <div style={{ fontSize: "14px", color: C.textMid, lineHeight: "1.6", marginBottom: "20px" }}>
                Upload baseline photos today, then check in weekly for 5–6 weeks. NOBL's AI will track changes and tell you how your dog's diet is — or isn't — working.
              </div>

              <div style={S.label}>Dog's name</div>
              <input style={S.input} placeholder="e.g. Buddy" value={dogInfo.name} onChange={e => updateDog("name", e.target.value)} />

              <div style={S.label}>Breed</div>
              <input style={S.input} placeholder="e.g. Golden Retriever" value={dogInfo.breed} onChange={e => updateDog("breed", e.target.value)} />

              <div style={S.label}>Age</div>
              <input style={S.input} placeholder="e.g. 4 years" value={dogInfo.age} onChange={e => updateDog("age", e.target.value)} />

              <div style={S.label}>Current diet type</div>
              <select style={{ ...S.input, background: C.white }} value={dogInfo.diet} onChange={e => updateDog("diet", e.target.value)}>
                <option value="">Select diet type...</option>
                {DIET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>

              <div style={S.label}>Food brand</div>
              <input style={S.input} placeholder="e.g. Royal Canin, Orijen" value={dogInfo.dietBrand} onChange={e => updateDog("dietBrand", e.target.value)} />

              <div style={S.label}>How long on this diet?</div>
              <input style={S.input} placeholder="e.g. 6 weeks" value={dogInfo.dietDuration} onChange={e => updateDog("dietDuration", e.target.value)} />

              <button
                style={{ ...S.btnPrimary, opacity: canStart ? 1 : 0.45, marginTop: "8px" }}
                disabled={!canStart}
                onClick={() => setStep("photos")}
              >
                Begin Baseline Photos →
              </button>
            </div>

            {/* What we track */}
            <div style={S.card}>
              <div style={S.label}>5 key areas we monitor</div>
              {PHOTO_ZONES.map(z => (
                <div key={z.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: `rgba(60,92,83,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: C.forest, fontSize: "12px", fontWeight: "700", flexShrink: 0 }}>
                    {z.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{z.label}</div>
                    <div style={{ fontSize: "11px", color: C.textLight }}>{z.guide}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHOTOS ── */}
        {step === "photos" && (
          <div>
            <div style={{ ...S.card, marginTop: "4px" }}>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "18px", color: C.forest, marginBottom: "4px" }}>
                {WEEKS[currentWeek]} Photos
              </div>
              <div style={{ fontSize: "13px", color: C.textMid, marginBottom: "14px" }}>
                Each photo is checked instantly. If something's off, you'll see exactly what to fix — no guessing.
              </div>
              <ProgressDots zones={PHOTO_ZONES} photoStates={photoStates} />
              <div style={{ fontSize: "12px", color: C.textLight, marginTop: "6px" }}>
                {validCount} of {PHOTO_ZONES.length} approved
              </div>
            </div>

            <FlashBanner />

            {PHOTO_ZONES.map(zone => (
              <PhotoZoneCard
                key={zone.id}
                zone={zone}
                photo={photoFiles[zone.id]}
                onUpload={handlePhotoUpload}
                status={photoStates[zone.id] || "idle"}
                feedback={photoFeedback[zone.id]}
                isAnalyzing={analyzingZone === zone.id}
              />
            ))}

            <button
              style={{ ...S.btnPrimary, opacity: allValid ? 1 : 0.4, marginTop: "8px" }}
              disabled={!allValid}
              onClick={runFullAnalysis}
            >
              {allValid ? "Run Full Analysis →" : `${validCount} / ${PHOTO_ZONES.length} photos approved`}
            </button>
          </div>
        )}

        {/* ── ANALYZING ── */}
        {step === "analyzing" && (
          <div style={{ ...S.card, textAlign: "center", padding: "48px 24px", marginTop: "4px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              border: `3px solid rgba(60,92,83,0.15)`,
              borderTopColor: C.sky,
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "20px", color: C.forest, marginBottom: "8px" }}>
              Analyzing {dogInfo.name}'s health
            </div>
            <div style={{ fontSize: "14px", color: C.textMid, lineHeight: "1.6", marginBottom: "12px" }}>
              {analysisPhase || "Running analysis across all 5 areas..."}
            </div>
            <div style={{ fontSize: "12px", color: C.textLight }}>This takes about 30–60 seconds</div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === "results" && weekResults[viewingWeek] && (
          <AnalysisResults
            results={weekResults[viewingWeek]}
            weekLabel={WEEKS[viewingWeek]}
            dogInfo={dogInfo}
            history={history}
            currentWeek={viewingWeek}
            onSelectWeek={(w) => setViewingWeek(w)}
            onNextWeek={startNextWeek}
          />
        )}

      </div>
    </div>
  );
}
