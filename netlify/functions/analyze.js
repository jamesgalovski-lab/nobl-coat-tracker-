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
      try { return { statusCode: 200, headers, body: txt }; }
      catch { return { statusCode: 200, headers, body: JSON.stringify({ usable: true, issue: "", suggestion: "" }) }; }
    }

    // ── MODE 2: Single zone analysis (observations + score + dietSignals only) ──
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
Dog: name=${dogInfo.name||"unknown"}, breed=${dogInfo.breed||"unknown"}, age=${dogInfo.age||"unknown"}, diet=${dogInfo.diet||"unknown"} (${dogInfo.dietBrand||"unspecified"}), on this diet for ${dogInfo.dietDuration||"unknown"}.
Photo area: ${zoneLabel} · Assessment: ${weekLabel}

Analyze ONLY what you can see in this specific photo. Write like a warm, knowledgeable friend — not clinical.

Return ONLY valid JSON, no markdown:
{
  "score": 7,
  "observations": ["specific finding 1 about this area", "specific finding 2", "specific finding 3"],
  "skinCoatSignals": ["brief signal 1 relevant to nutrition", "brief signal 2"],
  "trend": "baseline",
  "photoNote": ""
}

Rules:
- score: 1-10 integer
- observations: 3-5 specific things visible in THIS photo about THIS body area
- skinCoatSignals: 1-3 brief nutritional signals observed (e.g. "coat dullness suggesting omega-3 gap", "dry scaling suggesting zinc or fatty acid need") — these feed a consolidated recommendation engine, so be specific but brief
- trend: "baseline" for first submission, else "improving"/"stable"/"declining"
- photoNote: ONLY if quality genuinely prevented meaningful analysis; empty string otherwise`;

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
      try { return { statusCode: 200, headers, body: raw }; }
      catch { return { statusCode: 502, headers, body: JSON.stringify({ error: "Parse error", raw }) }; }
    }

    // ── MODE 3: Consolidate all zone signals into ONE recommendation set ──
    if (mode === "consolidate") {
      const { zoneResults, dogInfo, weekLabel } = body;
      if (!zoneResults) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing zoneResults" }) };

      // Build a summary of all signals observed across zones
      const signalSummary = zoneResults
        .filter(z => z.score > 0 && z.skinCoatSignals?.length)
        .map(z => `${z.zoneLabel}: ${z.skinCoatSignals.join("; ")}`)
        .join("\n");

      const areasSummary = zoneResults
        .filter(z => z.score > 0)
        .map(z => `${z.zoneLabel} (score ${z.score}/10)`)
        .join(", ");

      const prompt = `You are a friendly veterinary nutrition expert writing the recommendations section for a dog coat and skin health report.

Dog: name=${dogInfo.name||"unknown"}, breed=${dogInfo.breed||"unknown"}, age=${dogInfo.age||"unknown"}, diet=${dogInfo.diet||"unknown"} (${dogInfo.dietBrand||"unspecified"}), on this diet for ${dogInfo.dietDuration||"unknown"}.
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

For the nutritionalPicture: Write 2-3 sentences summarizing what the coat and skin photos reveal about nutritional status. Conversational, specific to what was observed, no food formats.

For recommendations: Return an array of 3-5 categories maximum. Each has:
- header: the action (e.g. "Add Omega-3 Fatty Acids")
- dose: one specific, consistent target (e.g. "Aim for 50–100mg of EPA per kg of body weight daily from marine sources like fish oil or whole fish")
- effects: 2-4 bullet points covering ALL the areas this addresses — consolidate everything about this nutrient into these effects

Always include as the FINAL item:
{"header":"Get Personalized NOBL Nutrition Guidance","dose":"","effects":["Reach out to us at customerservice@NOBLFoods.com — we'd love to help find the right NOBL product for ${dogInfo.name||"your dog"}!"]}

Also include care actions (brushing, ear cleaning, paw care) as ONE separate category called "Regular Coat & Skin Care" with no dose field.

Return ONLY valid JSON, no markdown:
{
  "nutritionalPicture": "paragraph here",
  "recommendations": [
    {"header":"Add Omega-3 Fatty Acids","dose":"Aim for 50–100mg of EPA per kg of body weight daily from marine sources like fish oil or whole fish","effects":["Improves coat shine and reduces dullness","Supports skin barrier to reduce dryness","Reduces inflammation around sensitive areas like ears"]},
    {"header":"Regular Coat & Skin Care","dose":"","effects":["Brush coat 2-3 times weekly to distribute natural oils","Clean ears weekly with a vet-approved solution","Check paws weekly for dryness or debris"]},
    {"header":"Get Personalized NOBL Nutrition Guidance","dose":"","effects":["Reach out to us at customerservice@NOBLFoods.com — we'd love to help find the right NOBL product for ${dogInfo.name||"your dog"}!"]}
  ]
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
