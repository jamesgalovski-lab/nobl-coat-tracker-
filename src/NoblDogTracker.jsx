import { useState, useRef, useCallback } from "react";

const C = {
  forest:     "#3C5C53",
  sky:        "#72AAB9",
  ember:      "#CC6633",
  fog:        "#F1F1F0",
  white:      "#FFFFFF",
  forestDark: "#2a423c",
  skyLight:   "#a8cdd8",
  skyDark:    "#4d8ea0",
  emberLight: "#d98460",
  text:       "#1e2e2a",
  textMid:    "#4a6660",
  textLight:  "#7a9990",
};

// Each zone has an SVG guide diagram showing exactly what the photo should look like
const PHOTO_ZONES = [
  {
    id: "back",
    label: "Back & Top Coat",
    shortLabel: "Back",
    tip: "Stand your dog naturally. Hold phone directly above their back, about 2 feet up. Capture neck to tail.",
    svgGuide: (
      <svg viewBox="0 0 160 100" width="100%" style={{ borderRadius: "8px", display: "block" }}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        {/* Dog body top-down */}
        <ellipse cx="80" cy="52" rx="38" ry="22" fill="#b5907a" />
        {/* Head */}
        <ellipse cx="80" cy="26" rx="16" ry="14" fill="#c9a48e" />
        {/* Ears */}
        <ellipse cx="66" cy="24" rx="7" ry="10" fill="#a07860" />
        <ellipse cx="94" cy="24" rx="7" ry="10" fill="#a07860" />
        {/* Tail */}
        <path d="M80 74 Q88 86 96 82" stroke="#b5907a" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {/* Camera crosshair */}
        <circle cx="80" cy="52" r="30" fill="none" stroke={C.sky} strokeWidth="1.5" strokeDasharray="4 3"/>
        <line x1="80" y1="18" x2="80" y2="86" stroke={C.sky} strokeWidth="1" strokeDasharray="3 3"/>
        <line x1="46" y1="52" x2="114" y2="52" stroke={C.sky} strokeWidth="1" strokeDasharray="3 3"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill={C.textMid} fontFamily="sans-serif">top-down view</text>
      </svg>
    ),
  },
  {
    id: "belly",
    label: "Belly & Undercoat",
    shortLabel: "Belly",
    tip: "Gently roll your dog onto their back. Hold phone about 18 inches above. Capture chest to groin.",
    svgGuide: (
      <svg viewBox="0 0 160 100" width="100%" style={{ borderRadius: "8px", display: "block" }}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        {/* Dog on back - lighter belly */}
        <ellipse cx="80" cy="54" rx="40" ry="24" fill="#e8c9b0" />
        {/* Legs up */}
        <ellipse cx="52" cy="36" rx="8" ry="14" fill="#c9a48e" transform="rotate(-20 52 36)"/>
        <ellipse cx="108" cy="36" rx="8" ry="14" fill="#c9a48e" transform="rotate(20 108 36)"/>
        <ellipse cx="48" cy="72" rx="8" ry="14" fill="#c9a48e" transform="rotate(15 48 72)"/>
        <ellipse cx="112" cy="72" rx="8" ry="14" fill="#c9a48e" transform="rotate(-15 112 72)"/>
        {/* Camera crosshair */}
        <circle cx="80" cy="54" r="28" fill="none" stroke={C.sky} strokeWidth="1.5" strokeDasharray="4 3"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill={C.textMid} fontFamily="sans-serif">dog on back · belly up</text>
      </svg>
    ),
  },
  {
    id: "ears",
    label: "Ears (Both Sides)",
    shortLabel: "Ears",
    tip: "Fold one ear back to show the inner flap. Hold phone 8–10 inches away. Repeat for the other ear.",
    svgGuide: (
      <svg viewBox="0 0 160 100" width="100%" style={{ borderRadius: "8px", display: "block" }}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        {/* Ear close-up */}
        <ellipse cx="80" cy="55" rx="44" ry="36" fill="#c9a48e" />
        {/* Inner ear */}
        <ellipse cx="80" cy="58" rx="30" ry="24" fill="#e8b090" />
        <ellipse cx="80" cy="60" rx="18" ry="14" fill="#d49070" />
        {/* Fold indicator */}
        <path d="M36 30 Q80 10 124 30" stroke={C.sky} strokeWidth="2" fill="none" strokeDasharray="4 3"/>
        <text x="80" y="18" textAnchor="middle" fontSize="8" fill={C.skyDark} fontFamily="sans-serif">fold ear back</text>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill={C.textMid} fontFamily="sans-serif">inner flap visible · 8–10 in away</text>
      </svg>
    ),
  },
  {
    id: "paws",
    label: "Paws & Between Toes",
    shortLabel: "Paws",
    tip: "Hold a paw and gently spread the toes apart. Hold phone 6–8 inches away. Capture the skin between toes.",
    svgGuide: (
      <svg viewBox="0 0 160 100" width="100%" style={{ borderRadius: "8px", display: "block" }}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        {/* Paw pad */}
        <ellipse cx="80" cy="62" rx="30" ry="24" fill="#c9a48e" />
        {/* Toe beans */}
        <ellipse cx="56" cy="42" rx="11" ry="12" fill="#b8907a" />
        <ellipse cx="74" cy="36" rx="11" ry="12" fill="#b8907a" />
        <ellipse cx="93" cy="36" rx="11" ry="12" fill="#b8907a" />
        <ellipse cx="110" cy="42" rx="11" ry="12" fill="#b8907a" />
        {/* Between-toe indicators */}
        <line x1="66" y1="50" x2="72" y2="56" stroke={C.sky} strokeWidth="1.5"/>
        <line x1="80" y1="48" x2="80" y2="56" stroke={C.sky} strokeWidth="1.5"/>
        <line x1="94" y1="50" x2="88" y2="56" stroke={C.sky} strokeWidth="1.5"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill={C.textMid} fontFamily="sans-serif">toes spread · 6–8 in away</text>
      </svg>
    ),
  },
  {
    id: "face",
    label: "Face & Muzzle",
    shortLabel: "Face",
    tip: "Get your dog to face you at eye level. Hold phone about 12 inches away. Capture muzzle, eyes, and forehead.",
    svgGuide: (
      <svg viewBox="0 0 160 100" width="100%" style={{ borderRadius: "8px", display: "block" }}>
        <rect width="160" height="100" fill="#e8f0ee" rx="8"/>
        {/* Head */}
        <ellipse cx="80" cy="52" rx="38" ry="40" fill="#c9a48e" />
        {/* Ears */}
        <ellipse cx="44" cy="36" rx="12" ry="18" fill="#a07860" />
        <ellipse cx="116" cy="36" rx="12" ry="18" fill="#a07860" />
        {/* Eyes */}
        <circle cx="63" cy="44" r="7" fill="#3a2810" />
        <circle cx="97" cy="44" r="7" fill="#3a2810" />
        <circle cx="65" cy="42" r="2" fill="white" />
        <circle cx="99" cy="42" r="2" fill="white" />
        {/* Muzzle */}
        <ellipse cx="80" cy="64" rx="22" ry="16" fill="#b8907a" />
        <ellipse cx="80" cy="60" rx="10" ry="6" fill="#8a6050" />
        {/* Framing box */}
        <rect x="34" y="18" width="92" height="72" rx="4" fill="none" stroke={C.sky} strokeWidth="1.5" strokeDasharray="4 3"/>
        <text x="80" y="96" textAnchor="middle" fontSize="8" fill={C.textMid} fontFamily="sans-serif">facing you · eye level · 12 in</text>
      </svg>
    ),
  },
];

const DIET_OPTIONS = [
  "Kibble (dry food)", "Wet / canned food", "Raw diet (BARF)",
  "Home-cooked meals", "Mixed / combination", "Prescription diet", "Other",
];

const WEEKS = ["Baseline", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

// ── API — analysis only, no validation gate ───────────────────────────────────
async function analyzePhoto(imageBase64, zone, dogInfo, weekLabel) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
          { type: "text", text: `You are a veterinary nutritionist AI specializing in canine skin and coat health.
Analyze this dog photo of the ${zone.label} area. Dog info: ${JSON.stringify(dogInfo)}. This is their ${weekLabel} photo.
Do your best even if the photo quality is imperfect — note any limitations but still provide useful analysis.
Assess: coat shine/luster, skin condition (redness, dryness, flaking, hotspots), coat density and texture.
Respond ONLY with valid JSON (no markdown, no extra text):
{"score": 1-10, "observations": ["obs1","obs2","obs3"], "dietSignals": "what this suggests about their diet", "recommendations": "specific dietary or care recommendation", "trend": "improving/stable/declining/baseline", "photoNote": "brief note if photo quality limited the analysis, otherwise empty string"}` }
        ]
      }]
    })
  });
  const data = await response.json();
  const text = data.content?.map(i => i.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: C.fog, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: C.text },
  header: { background: C.forest, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "22px", color: C.white, letterSpacing: "0.04em" },
  logoSub: { fontSize: "11px", color: C.skyLight, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: "500" },
  body: { maxWidth: "480px", margin: "0 auto", padding: "20px 16px 40px" },
  card: { background: C.white, borderRadius: "16px", padding: "20px", marginBottom: "12px", border: `1px solid rgba(60,92,83,0.1)` },
  cardForest: { background: C.forest, borderRadius: "16px", padding: "20px", marginBottom: "12px" },
  label: { fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: C.textLight, marginBottom: "6px" },
  input: { width: "100%", padding: "11px 14px", borderRadius: "10px", border: `1.5px solid rgba(60,92,83,0.2)`, fontSize: "15px", fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.white, outline: "none", boxSizing: "border-box", marginBottom: "10px" },
  btnPrimary: { width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: C.forest, color: C.white, fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" },
};

// ── Header ────────────────────────────────────────────────────────────────────
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

// ── One-at-a-time guided photo capture ────────────────────────────────────────
function PhotoCapture({ zones, onComplete, weekLabel }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photos, setPhotos] = useState({});
  const [previews, setPreviews] = useState({});
  const fileRef = useRef();

  const zone = zones[currentIndex];
  const isLast = currentIndex === zones.length - 1;
  const hasPhoto = !!photos[zone.id];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      const previewUrl = URL.createObjectURL(file);
      setPhotos(p => ({ ...p, [zone.id]: base64 }));
      setPreviews(p => ({ ...p, [zone.id]: previewUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(photos);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleRetake = () => {
    setPhotos(p => { const n = { ...p }; delete n[zone.id]; return n; });
    setPreviews(p => { const n = { ...p }; delete n[zone.id]; return n; });
    setTimeout(() => fileRef.current?.click(), 100);
  };

  return (
    <div>
      {/* Progress bar */}
      <div style={{ ...S.card, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: "600", color: C.textMid }}>
            Photo {currentIndex + 1} of {zones.length}
          </div>
          <div style={{ fontSize: "13px", color: C.textLight }}>{zone.label}</div>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          {zones.map((z, i) => (
            <div key={z.id} style={{
              flex: 1, height: "5px", borderRadius: "3px",
              background: i < currentIndex ? C.forest : i === currentIndex ? C.sky : "rgba(60,92,83,0.12)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* Flash reminder — compact */}
      <div style={{
        background: C.ember, borderRadius: "10px", padding: "10px 14px",
        display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px",
      }}>
        <span style={{ fontSize: "16px" }}>⚡</span>
        <div style={{ fontSize: "13px", color: C.white, fontWeight: "600" }}>
          Enable flash on your camera before taking this photo
        </div>
      </div>

      {/* Zone card */}
      <div style={S.card}>
        {/* SVG guide */}
        <div style={{ marginBottom: "14px" }}>
          {zone.svgGuide}
        </div>

        {/* Tip */}
        <div style={{
          background: `rgba(114,170,185,0.1)`, border: `1px solid rgba(114,170,185,0.25)`,
          borderRadius: "10px", padding: "11px 14px", marginBottom: "14px",
          fontSize: "13px", color: C.forestDark || C.text, lineHeight: "1.55",
        }}>
          <span style={{ fontWeight: "700", color: C.sky }}>Position guide — </span>
          {zone.tip}
        </div>

        {/* Preview or upload area */}
        {hasPhoto ? (
          <div>
            <img
              src={previews[zone.id]}
              alt={zone.label}
              style={{ width: "100%", borderRadius: "10px", maxHeight: "200px", objectFit: "cover", display: "block", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleRetake}
                style={{ ...S.btnPrimary, background: "transparent", color: C.forest, border: `1.5px solid ${C.forest}`, flex: 1 }}
              >
                Retake
              </button>
              <button
                onClick={handleNext}
                style={{ ...S.btnPrimary, flex: 2, background: C.forest }}
              >
                {isLast ? "Run Analysis →" : `Next: ${zones[currentIndex + 1]?.shortLabel} →`}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed rgba(60,92,83,0.25)`,
                borderRadius: "12px",
                padding: "32px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: `rgba(60,92,83,0.03)`,
                marginBottom: "10px",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: C.forest, marginBottom: "4px" }}>
                Tap to upload photo
              </div>
              <div style={{ fontSize: "12px", color: C.textLight }}>
                Photo from camera roll or take new
              </div>
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      </div>

      {/* Already uploaded thumbnails */}
      {Object.keys(previews).length > 0 && (
        <div style={{ ...S.card, padding: "14px 16px" }}>
          <div style={S.label}>Uploaded so far</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {zones.slice(0, currentIndex + 1).map(z => previews[z.id] && (
              <div key={z.id} style={{ position: "relative" }}>
                <img src={previews[z.id]} alt={z.label} style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", border: `2px solid ${C.sky}` }} />
                <div style={{ position: "absolute", bottom: "2px", left: "2px", right: "2px", background: "rgba(0,0,0,0.5)", borderRadius: "4px", fontSize: "8px", color: "white", textAlign: "center", padding: "1px" }}>{z.shortLabel}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80, stroke = 7 }) {
  const r = (size / 2) - stroke;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 10) * circ;
  const color = score >= 8 ? C.sky : score >= 6 ? C.forest : C.ember;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(60,92,83,0.1)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────
function AnalysisResults({ results, weekLabel, dogInfo, history, currentWeek, onSelectWeek, onNextWeek }) {
  const validResults = results.filter(r => r.score);
  const avgScore = validResults.length
    ? parseFloat((validResults.reduce((a, b) => a + (b.score || 0), 0) / validResults.length).toFixed(1))
    : 0;
  const scoreLabel = avgScore >= 9 ? "Excellent" : avgScore >= 7.5 ? "Good" : avgScore >= 6 ? "Fair" : "Needs attention";

  return (
    <div>
      {/* Week pills */}
      {history.length > 1 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {history.sort((a, b) => a.week - b.week).map(entry => (
            <button key={entry.week} onClick={() => onSelectWeek(entry.week)} style={{
              padding: "6px 14px", borderRadius: "20px",
              border: `1.5px solid ${entry.week === currentWeek ? C.forest : "rgba(60,92,83,0.2)"}`,
              background: entry.week === currentWeek ? C.forest : "transparent",
              color: entry.week === currentWeek ? C.white : C.textMid,
              fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>{entry.weekLabel}</button>
          ))}
        </div>
      )}

      {/* Score hero */}
      <div style={{ ...S.cardForest, display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ScoreRing score={avgScore} size={84} stroke={7} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
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
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ fontSize: "12px", color: C.textMid, width: "68px", flexShrink: 0 }}>{zone?.shortLabel}</div>
                <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(60,92,83,0.1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.score || 0) * 10}%`, background: barColor, borderRadius: "3px", transition: "width 0.8s ease" }} />
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: barColor, width: "24px", textAlign: "right" }}>{r.score}</div>
              </div>
              {r.photoNote && (
                <div style={{ fontSize: "11px", color: C.textLight, marginTop: "3px", paddingLeft: "78px" }}>
                  ℹ {r.photoNote}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Findings */}
      <div style={S.card}>
        <div style={S.label}>Key findings</div>
        {results.flatMap(r => r.observations || []).map((obs, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sky, flexShrink: 0, marginTop: "6px" }} />
            <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.55" }}>{obs}</div>
          </div>
        ))}
      </div>

      {/* Diet signal */}
      <div style={{ ...S.card, background: `rgba(114,170,185,0.1)`, border: `1px solid rgba(114,170,185,0.25)` }}>
        <div style={{ ...S.label, color: C.skyDark }}>Diet signal</div>
        <div style={{ fontSize: "14px", color: C.text, lineHeight: "1.6" }}>
          {results.find(r => r.dietSignals)?.dietSignals || "—"}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ ...S.cardForest }}>
        <div style={{ ...S.label, color: C.skyLight }}>Recommendations</div>
        <div style={{ fontSize: "14px", color: C.fog, lineHeight: "1.6" }}>
          {results.map(r => r.recommendations).filter(Boolean).join(" ")}
        </div>
      </div>

      <div style={{ fontSize: "12px", color: C.textLight, lineHeight: "1.6", padding: "12px 4px" }}>
        ⚕ AI-assisted screening only. Does not replace professional veterinary diagnosis. Consult your vet for any health concerns.
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
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [weekResults, setWeekResults] = useState({});
  const [history, setHistory] = useState([]);
  const [viewingWeek, setViewingWeek] = useState(0);

  const handlePhotosComplete = useCallback(async (photos) => {
    setIsRunningAnalysis(true);
    setStep("analyzing");
    const results = [];

    for (let i = 0; i < PHOTO_ZONES.length; i++) {
      const zone = PHOTO_ZONES[i];
      setAnalysisPhase(`Analyzing ${zone.label}...`);
      setAnalysisProgress(Math.round((i / PHOTO_ZONES.length) * 100));
      try {
        const result = await analyzePhoto(photos[zone.id], zone, dogInfo, WEEKS[currentWeek]);
        results.push({ zoneId: zone.id, ...result });
      } catch {
        results.push({ zoneId: zone.id, score: 5, observations: ["Analysis unavailable for this area."], dietSignals: "", recommendations: "", photoNote: "Could not process this photo.", trend: "baseline" });
      }
    }

    setAnalysisProgress(100);
    const entry = { week: currentWeek, weekLabel: WEEKS[currentWeek], results, timestamp: new Date().toLocaleDateString() };
    setWeekResults(r => ({ ...r, [currentWeek]: results }));
    setHistory(h => [...h.filter(e => e.week !== currentWeek), entry]);
    setViewingWeek(currentWeek);
    setIsRunningAnalysis(false);
    setStep("results");
  }, [dogInfo, currentWeek]);

  const startNextWeek = () => {
    setCurrentWeek(w => Math.min(w + 1, 6));
    setStep("photos");
  };

  const updateDog = (k, v) => setDogInfo(d => ({ ...d, [k]: v }));
  const canStart = dogInfo.name && dogInfo.diet;

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <Header dogName={dogInfo.name || null} week={step !== "onboarding" ? currentWeek : undefined} />

      <div style={S.body}>

        {/* ONBOARDING */}
        {step === "onboarding" && (
          <div>
            <div style={{ ...S.card, marginTop: "4px" }}>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "22px", color: C.forest, marginBottom: "6px" }}>
                Track your dog's skin & coat health
              </div>
              <div style={{ fontSize: "14px", color: C.textMid, lineHeight: "1.6", marginBottom: "20px" }}>
                Upload baseline photos today, then check in weekly for 5–6 weeks. NOBL's AI tracks changes and shows how your dog's diet is working.
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

            <div style={S.card}>
              <div style={S.label}>5 areas we monitor</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {PHOTO_ZONES.map(z => (
                  <div key={z.id} style={{
                    background: `rgba(60,92,83,0.07)`, borderRadius: "8px",
                    padding: "6px 12px", fontSize: "13px", color: C.forest, fontWeight: "500",
                  }}>{z.shortLabel}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PHOTOS — one at a time */}
        {step === "photos" && (
          <PhotoCapture
            zones={PHOTO_ZONES}
            weekLabel={WEEKS[currentWeek]}
            onComplete={handlePhotosComplete}
          />
        )}

        {/* ANALYZING */}
        {step === "analyzing" && (
          <div style={{ ...S.card, textAlign: "center", padding: "48px 24px", marginTop: "4px" }}>
            {/* Progress ring */}
            <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 20px" }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(60,92,83,0.1)" strokeWidth="6"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke={C.sky} strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - analysisProgress / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 36 36)"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", color: C.forest }}>
                {analysisProgress}%
              </div>
            </div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "20px", color: C.forest, marginBottom: "8px" }}>
              Analyzing {dogInfo.name}'s health
            </div>
            <div style={{ fontSize: "14px", color: C.textMid, lineHeight: "1.6" }}>
              {analysisPhase || "Starting analysis..."}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === "results" && weekResults[viewingWeek] && (
          <AnalysisResults
            results={weekResults[viewingWeek]}
            weekLabel={WEEKS[viewingWeek]}
            dogInfo={dogInfo}
            history={history}
            currentWeek={viewingWeek}
            onSelectWeek={setViewingWeek}
            onNextWeek={startNextWeek}
          />
        )}

      </div>
    </div>
  );
}
