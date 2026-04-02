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
    const { imageBase64, zoneLabel, dogInfo, weekLabel, validateOnly } = JSON.parse(event.body);

    if (!imageBase64 || !zoneLabel) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    function detectMediaType(b64) {
      const head = b64.substring(0, 16);
      if (head.startsWith("/9j/")) return "image/jpeg";
      if (head.startsWith("iVBORw0KGgo")) return "image/png";
      if (head.startsWith("R0lGOD")) return "image/gif";
      if (head.startsWith("UklGR")) return "image/webp";
      return "image/jpeg";
    }

    const mediaType = detectMediaType(imageBase64);

    // ── Validation-only mode ──────────────────────────────────────────────
    if (validateOnly) {
      const validationPrompt = `You are a photo quality checker for a dog skin and coat health app.

Look at this photo and determine if it is usable for analyzing a dog's ${zoneLabel}.

Evaluate these things:
1. Is a dog (or part of a dog) clearly visible?
2. Does the photo show the correct body area: ${zoneLabel}?
3. Is there enough light to make out coat texture and skin color?
4. Is it in focus enough to see surface detail?

Important: Be LENIENT. A slightly dark, slightly blurry, or imperfectly framed photo is still usable. 
Only mark as not usable if the photo genuinely cannot be analyzed at all.

If not usable, explain the problem in plain, friendly language a pet owner would understand — no jargon.
Give one specific, actionable tip to fix it.

Respond ONLY with valid JSON, no markdown:
{"usable": true, "issue": "", "suggestion": ""}

If usable: issue and suggestion must be empty strings.
If not usable: issue = what is wrong (friendly, 1 sentence), suggestion = exactly how to fix it (friendly, 1-2 sentences).`;

      const valRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 250,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
              { type: "text", text: validationPrompt }
            ]
          }]
        })
      });

      if (!valRes.ok) {
        const errText = await valRes.text();
        if (errText.includes("Could not process image") || valRes.status === 400) {
          return {
            statusCode: 200, headers,
            body: JSON.stringify({
              usable: false,
              issue: "This image format isn't supported — it looks like an iPhone HEIC file.",
              suggestion: "On your iPhone, go to Settings → Camera → Formats and choose 'Most Compatible'. Then retake the photo and it will save as JPEG, which works perfectly."
            })
          };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ usable: true, issue: "", suggestion: "" }) };
      }

      const valData = await valRes.json();
      const valText = (valData.content || []).map(c => c.text || "").join("").replace(/```json|```/gi, "").trim();
      try {
        const parsed = JSON.parse(valText);
        return { statusCode: 200, headers, body: JSON.stringify(parsed) };
      } catch(e) {
        return { statusCode: 200, headers, body: JSON.stringify({ usable: true, issue: "", suggestion: "" }) };
      }
    }

    // ── Full analysis mode ────────────────────────────────────────────────
    const dogName = dogInfo.name || "this dog";
    const breed = dogInfo.breed || "unknown breed";
    const age = dogInfo.age || "unknown age";
    const diet = dogInfo.diet || "unknown diet";
    const dietBrand = dogInfo.dietBrand || "unspecified brand";
    const dietDuration = dogInfo.dietDuration || "unknown duration";

    const prompt = `You are a friendly veterinary nutrition expert analyzing a dog photo for a consumer health app called NOBL Coat & Skin Tracker.

Dog info: name=${dogName}, breed=${breed}, age=${age}, diet type=${diet}, brand=${dietBrand}, on this diet for ${dietDuration}.
Photo area: ${zoneLabel}
Assessment: ${weekLabel}

WHAT TO LOOK FOR in this photo:
- Coat shine, luster, texture, density
- Skin color (pink=healthy, red=irritated, grey/dark=concerning)
- Visible flaking, scaling, or dryness
- Hair distribution — any thinning, bald patches, or matting
- Signs of irritation, moisture, or inflammation

WRITING RULES — follow these exactly:
- Write like a knowledgeable friend, not a scientist. Warm, clear, and encouraging.
- observations: 3-5 specific things you actually see in THIS photo. Concrete and specific to this area.
- dietSignals: What nutritional picture does this suggest? Focus on specific nutrients (omega-3 fatty acids, omega-6/linoleic acid, zinc, vitamin E, biotin, protein quality). NO food format mentions (no "kibble", "wet food", "raw", "freeze-dried"). Be specific but conversational.
- recommendations: Bullet points separated by "|". Each bullet must be:
  * Specific and actionable — not "add omega-3s" but WHY and WHAT LEVEL
  * Conversational — explain what the nutrient does in plain English
  * Include practical guidance levels where relevant (e.g. "look for foods with at least 2-3% omega-6 on the label")
  * Include specific care actions (brushing, ear cleaning, nail checks, hydration)
  * Do NOT repeat any point already made in a previous bullet
  * The LAST bullet must always be exactly: "For personalized help picking a NOBL product that supports ${dogName}'s skin and coat, reach out to us at customerservice@NOBLFoods.com — we'd love to help!"

NUTRIENT CONTEXT (use this knowledge to inform recommendations but write conversationally):
- Omega-6 (linoleic acid): critical for skin barrier and water retention. Look for 2-4% DM on food label.
- Omega-3 (EPA+DHA from marine sources): reduces inflammation, improves coat shine. Therapeutic dose: ~50-220mg EPA per kg body weight daily (Watson, J Nutrition 1998; Marchegiani et al., PMC 2020).
- Zinc: most commonly deficient trace mineral for skin. Essential for hair follicle health and keratinization. Look for 150-250mg/kg DM in food, preferably as zinc methionine for better absorption (Pereira et al., PMC 2021).
- Vitamin E: protects skin cell membranes, works best paired with fatty acid supplementation.
- Protein/amino acids: skin and coat are high-turnover tissues. Methionine and cysteine are especially important for coat keratin.
- Biotin and B vitamins: support keratin production and skin cell metabolism.

- photoNote: ONLY include if the photo quality genuinely prevented you from seeing something important. Be specific about what you couldn't assess and why. If the photo was fine, leave this as an empty string.
- trend: "baseline" for first submission, otherwise "improving", "stable", or "declining"
- score: 1-10 where 10 = perfect healthy coat/skin, 1 = severe issues

Respond ONLY with valid JSON, no markdown, no extra text:
{"score":7,"observations":["specific finding 1","specific finding 2","specific finding 3"],"dietSignals":"conversational nutritional insight","recommendations":"bullet 1|bullet 2|bullet 3|closing bullet","trend":"baseline","photoNote":""}`;

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Anthropic error:", apiRes.status, errText);
      if (errText.includes("Could not process image") || apiRes.status === 400) {
        return {
          statusCode: 200, headers,
          body: JSON.stringify({
            score: 0,
            observations: [],
            dietSignals: "",
            recommendations: "",
            trend: "baseline",
            photoNote: "This photo could not be processed — it may be in HEIC format (common on iPhones). To fix this: go to iPhone Settings → Camera → Formats → Most Compatible, then retake the photo."
          })
        };
      }
      return { statusCode: 502, headers, body: JSON.stringify({ error: `API error ${apiRes.status}`, detail: errText }) };
    }

    const data = await apiRes.json();
    const rawText = (data.content || []).map(c => c.text || "").join("").replace(/```json|```/gi, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error("Parse error:", rawText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Invalid JSON from AI", raw: rawText }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};
