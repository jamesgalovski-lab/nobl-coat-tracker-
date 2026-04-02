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
    const { imageBase64, zoneLabel, dogInfo, weekLabel } = JSON.parse(event.body);

    if (!imageBase64 || !zoneLabel) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    // Auto-detect image format from base64 signature
    function detectMediaType(b64) {
      const head = b64.substring(0, 16);
      if (head.startsWith("/9j/")) return "image/jpeg";
      if (head.startsWith("iVBORw0KGgo")) return "image/png";
      if (head.startsWith("R0lGOD")) return "image/gif";
      if (head.startsWith("UklGR")) return "image/webp";
      return "image/jpeg";
    }

    const mediaType = detectMediaType(imageBase64);

    const prompt = `You are a veterinary nutritionist AI specializing in canine skin and coat health.
Analyze this dog photo of the ${zoneLabel} area.
Dog: name=${dogInfo.name || "unknown"}, breed=${dogInfo.breed || "unknown"}, age=${dogInfo.age || "unknown"}, diet=${dogInfo.diet || "unknown"} (${dogInfo.dietBrand || "unspecified"}), on this diet for ${dogInfo.dietDuration || "unknown"}.
This is their ${weekLabel} photo.

Be helpful even if photo quality is imperfect. Analyze what you CAN see. Only note a photoNote if quality truly prevents any meaningful assessment.

Respond ONLY with this exact JSON structure, no markdown, no extra text:
{"score":7,"observations":["obs1","obs2","obs3"],"dietSignals":"diet insight","recommendations":"recommendation","trend":"baseline","photoNote":""}

Rules: score = integer 1-10. trend = one of: improving, stable, declining, baseline. photoNote = empty string if photo was usable.`;

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              }
            },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Anthropic error:", apiRes.status, errText);
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
