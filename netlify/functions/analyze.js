// ── NOBL Product Catalog ──────────────────────────────────────────────────────
// To add a new product: copy one entry and update all fields.
// gapSignals: keywords the AI must return in skinCoatSignals to trigger this product.
// nutrientHighlights: shown in the product card — keep to 2-3 most relevant.
// matchBadge: "Strongest match" | "Good match" | "Targeted match"
const NOBL_PRODUCTS = [
  {
    id: "turkey_duck",
    name: "Turkey & Duck Recipe",
    subtitle: "NOBL3 · 16oz · All life stages",
    url: "https://noblfoods.com/products/nobl3-everyday-turkey-duck-recipe-all-life-stages-16oz?variant=44151539007737",
    imageUrl: "https://cdn.shopify.com/s/files/1/0397/5184/4001/files/NOBL3_16oz_T_D_Front.png?v=1773409006",
    // Triggered when omega-6 / skin barrier signals present
    gapTriggers: ["omega6", "skin_barrier", "coat_dullness", "linoleic"],
    matchBadge: "Strongest match for skin barrier",
    nutrientHighlights: [
      {
        name: "Omega-6 (linoleic acid)",
        stat: "6.50% DM — above the 2–4% therapeutic target",
        why: "Directly addresses skin barrier weakness. Turkey & Duck has the highest linoleic acid of any NOBL recipe — the primary driver of coat moisture and softness.",
      },
      {
        name: "Zinc — from whole food sources",
        stat: "356 mg/kg DM — exceeds the 150–250 mg/kg therapeutic target",
        why: "From turkey and duck organs — no synthetic mineral forms. Supports hair follicle health and keratinization.",
      },
      {
        name: "Protein digestibility",
        stat: "91.5% digestible · 46.6% crude protein DM",
        why: "Highly digestible protein ensures amino acids reach Lou's skin and coat tissue where they're needed.",
      },
    ],
  },
  {
    id: "beef_chicken",
    name: "Beef & Chicken Recipe",
    subtitle: "NOBL3 · 16oz · All life stages",
    url: "https://noblfoods.com/products/nobl3-everyday-beef-chicken-recipe-all-life-stages?variant=43434871718137",
    imageUrl: "https://cdn.shopify.com/s/files/1/0397/5184/4001/files/NOBL3_B_C_16oz_Front.png?v=1773413378",
    // Triggered when zinc, vitamin E, inflammation, or oxidative signals present
    gapTriggers: ["zinc", "vitamin_e", "inflammation", "redness", "irritation", "paw", "ear", "oxidative", "healing"],
    matchBadge: "Strongest match for skin healing",
    nutrientHighlights: [
      {
        name: "Vitamin E",
        stat: "171 IU/kg — more than double any other NOBL recipe",
        why: "Protects skin cell membranes from oxidative damage. Especially relevant for areas showing redness or irritation like ears and paws.",
      },
      {
        name: "Zinc — from whole food sources",
        stat: "391 mg/kg DM — highest of all NOBL recipes",
        why: "Beef and chicken liver are naturally rich in bioavailable zinc. Supports skin barrier integrity and wound healing at the cellular level.",
      },
      {
        name: "Protein digestibility",
        stat: "92.8% digestible · 45.2% crude protein DM — highest of all recipes",
        why: "The highest digestibility score in the NOBL lineup means more usable amino acids for coat keratin and skin cell repair.",
      },
    ],
  },
];

// ── Serving size reference (oz per lb body weight, from feeding guide) ────────
// Guide: 0.4oz/5lb = 0.08 oz/lb. Used for per-serving nutrient calculations.
const OZ_PER_LB = 0.08;

// ── Gap flag definitions — map AI signal keywords to gap flags ────────────────
// The consolidate call returns gapFlags[] — each flag is one of these keys.
const GAP_FLAG_KEYWORDS = {
  omega6:       ["omega-6","linoleic","skin barrier","moisture barrier","coat softness","dry coat","coarse coat","dull coat","coat dullness"],
  skin_barrier: ["skin barrier","moisture","dry","scaling","flaky","rough skin"],
  coat_dullness:["dull","lackluster","no shine","coarse","brittle","texture"],
  linoleic:     ["linoleic","omega-6","fatty acid"],
  zinc:         ["zinc","keratinization","hair follicle","coat pigment","nail","scaling"],
  vitamin_e:    ["vitamin e","antioxidant","oxidative","membrane"],
  inflammation: ["inflammation","inflammatory","inflamed"],
  redness:      ["redness","red","erythema","pink","irritat"],
  irritation:   ["irritat","itch","scratch","sensitive"],
  paw:          ["paw","pad","toe","between toes","pododermatitis"],
  ear:          ["ear","canal","otitis","ear flap"],
  oxidative:    ["oxidative","oxidation","free radical","antioxidant"],
  healing:      ["healing","heal","repair","wound","recovery"],
};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const body = JSON.parse(event.body);
    const { mode } = body;

    // ── MODE 1: Photo validation ──────────────────────────────────────────
    if (mode === "validate") {
      const { imageBase64, zoneLabel } = body;
      if (!imageBase64 || !zoneLabel) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing fields" }) };

      function detectMediaType(b64) {
        const h = b64.substring(0, 16);
        if (h.startsWith("/9j/")) return "image/jpeg";
        if (h.startsWith("iVBORw0KGgo")) return "image/png";
        if (h.startsWith("R0lGOD")) return "image/gif";
        if (h.startsWith("UklGR")) return "image/webp";
        return "image/jpeg";
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 200,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: detectMediaType(imageBase64), data: imageBase64 } },
            { type: "text", text: `Is this photo usable for analyzing a dog's ${zoneLabel}? Be lenient — only reject if truly unusable. Respond ONLY with JSON: {"usable":true,"issue":"","suggestion":""}` }
          ]}]
        })
      });

      if (!res.ok) {
        const t = await res.text();
        if (t.includes("Could not process image") || res.status === 400) {
          return { statusCode: 200, headers, body: JSON.stringify({ usable: false, issue: "This image format isn't supported — it looks like an iPhone HEIC file.", suggestion: "On your iPhone go to Settings → Camera → Formats → Most Compatible, then retake the photo." }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ usable: true, issue: "", suggestion: "" }) };
      }

      const d = await res.json();
      const txt = (d.content || []).map(c => c.text || "").join("").replace(/```json|```/gi, "").trim();
      return { statusCode: 200, headers, body: txt };
    }

    // ── MODE 2: Single zone analysis ──────────────────────────────────────
    if (mode === "analyze") {
      const { imageBase64, zoneLabel, dogInfo, weekLabel } = body;
      if (!imageBase64 || !zoneLabel) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing fields" }) };

      function detectMediaType(b64) {
        const h = b64.substring(0, 16);
        if (h.startsWith("/9j/")) return "image/jpeg";
        if (h.startsWith("iVBORw0KGgo")) return "image/png";
        if (h.startsWith("R0lGOD")) return "image/gif";
        if (h.startsWith("UklGR")) return "image/webp";
        return "image/jpeg";
      }

      const mediaType = detectMediaType(imageBase64);
      const prompt = `You are a friendly veterinary nutrition expert analyzing a dog photo for NOBL Coat & Skin Tracker.
Dog: name=${dogInfo.name||"unknown"}, breed=${dogInfo.breed||"unknown"}, age=${dogInfo.age||"unknown"}, weight=${dogInfo.weight||"unknown"} lbs, diet=${dogInfo.diet||"unknown"} (${dogInfo.dietBrand||"unspecified"}), on this diet for ${dogInfo.dietDuration||"unknown"}.
Photo area: ${zoneLabel} · Assessment: ${weekLabel}

Analyze ONLY what you can see in this specific photo. Write like a warm, knowledgeable friend.

Return ONLY valid JSON, no markdown:
{
  "score": 7,
  "observations": ["specific finding 1", "specific finding 2", "specific finding 3"],
  "skinCoatSignals": ["brief nutritional signal 1", "brief nutritional signal 2"],
  "trend": "baseline",
  "photoNote": ""
}

Rules:
- score: 1-10 integer
- observations: 3-5 specific things visible in THIS photo about THIS body area
- skinCoatSignals: 1-3 brief signals using these exact terms where relevant: "omega-6 gap", "skin barrier weakness", "coat dullness", "linoleic acid need", "zinc deficiency signal", "vitamin E need", "inflammation", "redness", "irritation", "paw dryness", "ear inflammation", "oxidative stress signal", "protein gap", "omega-3 gap"
- trend: "baseline" for first submission, else "improving"/"stable"/"declining"
- photoNote: only if quality prevented meaningful analysis; empty string otherwise`;

      const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 600,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: prompt }
          ]}]
        })
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        if (errText.includes("Could not process image") || apiRes.status === 400) {
          return { statusCode: 200, headers, body: JSON.stringify({ score: 0, observations: [], skinCoatSignals: [], trend: "baseline", photoNote: "This photo could not be processed. On iPhone: Settings → Camera → Formats → Most Compatible, then retake as JPEG." }) };
        }
        return { statusCode: 502, headers, body: JSON.stringify({ error: `API error ${apiRes.status}` }) };
      }

      const data = await apiRes.json();
      const raw = (data.content || []).map(c => c.text || "").join("").replace(/```json|```/gi, "").trim();
      return { statusCode: 200, headers, body: raw };
    }

    // ── MODE 3: Consolidate recommendations + derive gap flags ────────────
    if (mode === "consolidate") {
      const { zoneResults, dogInfo, weekLabel } = body;
      if (!zoneResults) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing zoneResults" }) };

      const signalSummary = zoneResults
        .filter(z => z.score > 0 && z.skinCoatSignals?.length)
        .map(z => `${z.zoneLabel}: ${z.skinCoatSignals.join("; ")}`)
        .join("\n");

      const areasSummary = zoneResults
        .filter(z => z.score > 0)
        .map(z => `${z.zoneLabel} (score ${z.score}/10)`)
        .join(", ");

      // Derive gap flags from all signals (server-side, no extra AI call needed)
      const allSignalText = zoneResults
        .flatMap(z => z.skinCoatSignals || [])
        .join(" ")
        .toLowerCase();

      const gapFlags = Object.entries(GAP_FLAG_KEYWORDS)
        .filter(([, keywords]) => keywords.some(kw => allSignalText.includes(kw.toLowerCase())))
        .map(([flag]) => flag);

      const prompt = `You are a friendly veterinary nutrition expert writing the recommendations section for a dog coat and skin health report.

Dog: name=${dogInfo.name||"unknown"}, breed=${dogInfo.breed||"unknown"}, age=${dogInfo.age||"unknown"}, weight=${dogInfo.weight||"unknown"} lbs, diet=${dogInfo.diet||"unknown"} (${dogInfo.dietBrand||"unspecified"}), on this diet for ${dogInfo.dietDuration||"unknown"}.
Assessment: ${weekLabel}

Areas analyzed: ${areasSummary || "multiple areas"}

Nutritional signals observed across all photos:
${signalSummary || "General coat quality concerns noted across multiple areas."}

YOUR JOB: Write ONE consolidated nutritional picture paragraph AND a clean set of categorical recommendations.
Each nutrient category appears EXACTLY ONCE — never repeat zinc, omega-3, omega-6, or vitamin E in multiple categories.

IMPORTANT LANGUAGE RULES:
- NEVER mention synthetic supplement forms like "zinc methionine", "zinc oxide", or "zinc proteinate"
- Instead say "bioavailable zinc sources" or "zinc from whole food sources"
- For omega-3s, say "marine sources like fish oil or whole fish" — not brand names or chemical forms
- NO food format mentions (no "kibble", "wet food", "raw", "freeze-dried")
- Write conversationally — warm, friendly, knowledgeable friend tone
- Reference dog's weight (${dogInfo.weight||"unknown"} lbs) when giving dosing guidance

For the nutritionalPicture: Write 2-3 sentences summarizing what the coat and skin photos reveal about nutritional status. Conversational, specific to what was observed.

For recommendations: Return an array of 3-5 categories maximum. Each has:
- header: the action (e.g. "Add Omega-3 Fatty Acids")
- dose: one specific, consistent target referencing the dog's weight where relevant
- effects: 2-4 bullet points covering ALL the areas this addresses

Always add as the FINAL item:
{"header":"Get Personalized NOBL Nutrition Guidance","dose":"","effects":["Reach out to us at customerservice@NOBLFoods.com — we'd love to help find the right NOBL product for ${dogInfo.name||"your dog"}!"]}

Also include care actions as ONE "Regular Coat & Skin Care" category with no dose field.

Return ONLY valid JSON, no markdown:
{
  "nutritionalPicture": "paragraph here",
  "recommendations": [...]
}`;

      const conRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1200,
          messages: [{ role: "user", content: [{ type: "text", text: prompt }] }]
        })
      });

      if (!conRes.ok) return { statusCode: 502, headers, body: JSON.stringify({ error: `Consolidation API error ${conRes.status}` }) };

      const conData = await conRes.json();
      const conRaw = (conData.content || []).map(c => c.text || "").join("").replace(/```json|```/gi, "").trim();

      try {
        const parsed = JSON.parse(conRaw);
        // Attach gap flags so the frontend can do product matching without another API call
        parsed.gapFlags = gapFlags;
        return { statusCode: 200, headers, body: JSON.stringify(parsed) };
      } catch(e) {
        return { statusCode: 502, headers, body: JSON.stringify({ error: "Consolidation parse error", raw: conRaw }) };
      }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown mode. Use: validate, analyze, consolidate" }) };

  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};
