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

    // ── Detect image format from base64 signature ─────────────────────────
    function detectMediaType(b64) {
      const head = b64.substring(0, 20);
      if (head.startsWith("/9j/")) return "image/jpeg";
      if (head.startsWith("iVBORw0KGgo")) return "image/png";
      if (head.startsWith("R0lGOD")) return "image/gif";
      if (head.startsWith("UklGR")) return "image/webp";
      // HEIC/HEIF starts with ftyp box — base64 of 0x0000001C667479706865 or similar
      // These decode to "AAAB..." or "AAAC..." patterns
      if (head.startsWith("AAAB") || head.startsWith("AAAC") || head.startsWith("AAAM")) return "image/heic";
      return "image/jpeg";
    }

    let processedBase64 = imageBase64;
    let mediaType = detectMediaType(imageBase64);

    // ── HEIC handling: tell Anthropic it's HEIC or try as JPEG fallback ──
    // Anthropic does not support HEIC natively. We mark it and handle gracefully.
    const isHeic = mediaType === "image/heic";
    if (isHeic) {
      // Send as jpeg and let Anthropic handle it — modern Claude can sometimes
      // process HEIC bytes even when labeled jpeg. If it fails we return a
      // helpful validation error instead of a generic crash.
      mediaType = "image/jpeg";
    }

    // ── Validation-only mode (called before full analysis) ────────────────
    if (validateOnly) {
      const validationPrompt = `You are a photo quality checker for a veterinary skin and coat analysis app.
Look at this photo and determine if it is usable for analyzing a dog's ${zoneLabel}.

Check for:
1. Is a dog clearly visible?
2. Is the correct body area shown (${zoneLabel})?
3. Is there enough lighting to see skin/coat detail?
4. Is the image in focus (not severely blurry)?

Be LENIENT. A slightly imperfect photo is acceptable. Only reject if it truly cannot be analyzed.

Respond ONLY with valid JSON, no markdown:
{"usable": true or false, "issue": "one specific problem if not usable, empty string if usable", "suggestion": "one specific fix if not usable, empty string if usable"}`;

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
              { type: "image", source: { type: "base64", media_type: mediaType, data: processedBase64 } },
              { type: "text", text: validationPrompt }
            ]
          }]
        })
      });

      if (!valRes.ok) {
        const errText = await valRes.text();
        // HEIC format rejection from Anthropic
        if (isHeic || errText.includes("Could not process image") || errText.includes("400")) {
          return {
            statusCode: 200, headers,
            body: JSON.stringify({
              usable: false,
              issue: "HEIC photo format is not supported",
              suggestion: "Open your iPhone Camera app, go to Settings → Camera → Formats and select 'Most Compatible'. This saves photos as JPEG which works with the analyzer. Alternatively, take a screenshot of the photo and upload the screenshot instead."
            })
          };
        }
        return { statusCode: 502, headers, body: JSON.stringify({ error: `API error ${valRes.status}` }) };
      }

      const valData = await valRes.json();
      const valText = (valData.content || []).map(c => c.text || "").join("").replace(/```json|```/gi, "").trim();
      try {
        return { statusCode: 200, headers, body: valText };
      } catch(e) {
        return { statusCode: 200, headers, body: JSON.stringify({ usable: true, issue: "", suggestion: "" }) };
      }
    }

    // ── Full analysis mode ────────────────────────────────────────────────
    const prompt = `You are a veterinary nutritionist AI specializing in canine skin and coat health.
Analyze this dog photo of the ${zoneLabel} area.
Dog: name=${dogInfo.name || "unknown"}, breed=${dogInfo.breed || "unknown"}, age=${dogInfo.age || "unknown"}, diet type=${dogInfo.diet || "unknown"}, food brand=${dogInfo.dietBrand || "unspecified"}, on this diet for ${dogInfo.dietDuration || "unknown"}.
This is their ${weekLabel} photo.

INSTRUCTIONS:
- Analyze what you can see, even if photo quality is imperfect
- observations: 3-5 specific findings about THIS area only (coat texture, skin color, signs of irritation, moisture, hair density, etc.)
- dietSignals: focus ONLY on nutritional gaps (fatty acid deficiency, protein adequacy, zinc, vitamin E, omega-3/6 balance, antioxidants, hydration). Do NOT mention specific food formats like kibble, wet food, raw, freeze-dried, etc.
- recommendations: specific actionable bullet points (use "|" to separate each bullet). Include:
  * Nutritional gaps to address (fatty acids, specific vitamins/minerals) — no food format mentions
  * Specific care actions (brushing frequency, nail checks, ear cleaning, etc.)
  * Do NOT repeat points already made
  * End with exactly this closing bullet: "For personalized nutrition guidance, email us at customerservice@NOBLFoods.com — we'd love to help find the right NOBL product for ${dogInfo.name || "your dog"}."
- photoNote: brief note ONLY if quality meaningfully limited analysis, otherwise empty string
- trend: baseline for first submission, otherwise improving/stable/declining based on comparison

Respond ONLY with valid JSON, no markdown, no extra text:
{"score":7,"observations":["finding 1","finding 2","finding 3"],"dietSignals":"nutritional gap analysis only","recommendations":"bullet 1|bullet 2|bullet 3|closing bullet","trend":"baseline","photoNote":""}`;

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 900,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: processedBase64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Anthropic error:", apiRes.status, errText);
      // Detect HEIC-related failure
      if (isHeic || errText.includes("Could not process image")) {
        return {
          statusCode: 200, headers,
          body: JSON.stringify({
            score: 0,
            observations: ["Photo could not be analyzed — HEIC format is not supported."],
            dietSignals: "",
            recommendations: "Retake this photo as JPEG. On iPhone: go to Settings → Camera → Formats → Most Compatible.|Alternatively, take a screenshot of the photo and upload that instead.",
            trend: "baseline",
            photoNote: "HEIC format not supported. Please retake as JPEG."
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
      console.error("Parse error:", e, "Raw:", rawText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Invalid JSON from AI", raw: rawText }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch (err) {
    console.error("Handler error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};
