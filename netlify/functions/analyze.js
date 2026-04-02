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

Evaluate:
1. Is a dog (or part of a dog) clearly visible?
2. Does the photo show the correct body area: ${zoneLabel}?
3. Is there enough light to make out coat texture and skin color?
4. Is it in focus enough to see surface detail?

Be LENIENT. Only mark unusable if it genuinely cannot be analyzed at all.

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
          max_tokens: 200,
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
        return { statusCode: 200, headers, body: JSON.stringify(JSON.parse(valText)) };
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

    const prompt = `You are a friendly veterinary nutrition expert analyzing a dog photo for NOBL Coat & Skin Tracker.

Dog: name=${dogName}, breed=${breed}, age=${age}, diet=${diet}, brand=${dietBrand}, on diet for ${dietDuration}.
Photo area: ${zoneLabel}
Assessment: ${weekLabel}

WHAT TO LOOK FOR:
- Coat shine, luster, texture, density
- Skin color (pink=healthy, red/grey=concerning)
- Flaking, scaling, dryness
- Hair distribution — thinning, bald patches, matting
- Signs of irritation or inflammation

WRITING RULES:
- Warm, friendly tone like a knowledgeable friend — not clinical
- observations: 3-5 specific things you actually see in THIS photo about THIS area only
- dietSignals: conversational paragraph about what the coat/skin reveals nutritionally. Focus on specific nutrients (omega-3 EPA/DHA, omega-6 linoleic acid, zinc, vitamin E, biotin, protein). NO food format mentions (no "kibble", "wet food", "raw", "freeze-dried").
- photoNote: ONLY if quality genuinely prevented meaningful analysis. Specific about what couldn't be assessed. Empty string if photo was fine.
- trend: "baseline" for first submission, otherwise "improving"/"stable"/"declining"

FOR RECOMMENDATIONS — use this EXACT categorical JSON structure.
Each category is a NUTRIENT ACTION with: a clear "do this" header, ONE consistent dosing target, and the areas/effects it addresses.
Use ONLY these categories (include only the ones relevant to what you actually observed):

IMPORTANT DOSING RULES — pick ONE range and use it consistently:
- Omega-3 (EPA+DHA): "aim for 50–100mg of EPA per kg of body weight daily (from a marine source like fish oil)" — do NOT give a second range
- Omega-6 (linoleic acid): "look for 2–4% on the typical nutrient analysis — ask the manufacturer if it's not listed on the label" — NOT "guaranteed analysis"
- Zinc: "look for 150–250mg/kg in the food, ideally as zinc methionine which absorbs better than zinc oxide"
- Vitamin E: "ensure the food provides vitamin E — it works best when paired with fatty acid supplementation"
- Protein: "look for highly digestible protein sources, ideally ≥25% on the typical nutrient analysis"

The recommendations field must be a JSON string of this structure:
[
  {
    "header": "Add Omega-3 Fatty Acids (EPA + DHA)",
    "dose": "Aim for 50–100mg of EPA per kg of body weight daily from a marine source like fish oil",
    "effects": ["Reduces coat dullness and improves shine", "Supports skin barrier to reduce dryness"]
  },
  {
    "header": "Increase Omega-6 (Linoleic Acid)",
    "dose": "Look for 2–4% on the typical nutrient analysis — ask the manufacturer if it's not listed on the label",
    "effects": ["Strengthens the skin's moisture barrier", "Keeps coat soft and reduces coarseness"]
  }
]

Include only categories supported by what you actually observed. Max 5 categories total (not counting the closing NOBL item).
Always add this as the FINAL item in the array:
{"header": "Get Personalized NOBL Nutrition Guidance", "dose": "", "effects": ["Reach out to us at customerservice@NOBLFoods.com — we'd love to help find the right NOBL product for ${dogName}!"]}

Respond ONLY with valid JSON, no markdown:
{"score":7,"observations":["finding 1","finding 2","finding 3"],"dietSignals":"conversational paragraph","recommendations":"[{...}]","trend":"baseline","photoNote":""}

The recommendations field value must be a valid JSON array encoded as a string.`;

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1400,
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
            score: 0, observations: [], dietSignals: "", recommendations: "[]",
            trend: "baseline",
            photoNote: "This photo could not be processed. If you're using an iPhone, go to Settings → Camera → Formats → Most Compatible, then retake the photo as JPEG."
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

    // Ensure recommendations is a parseable array string
    if (typeof parsed.recommendations === "object") {
      parsed.recommendations = JSON.stringify(parsed.recommendations);
    }
    if (!parsed.recommendations || parsed.recommendations === "") {
      parsed.recommendations = "[]";
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};
