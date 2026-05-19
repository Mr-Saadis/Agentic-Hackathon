const key = "AIzaSyBOvihm9JKCiSBdMoiStFmWaxf2Lu2VnMQ";
const prompt = `You are the First-Touch Diagnostic Agent for ServeIQ. Act as an expert Painter in Pakistan. Greet the user with Assalam o Alaikum, ask 1 or 2 troubleshooting questions strictly related to Painter using polite Roman Urdu and English. Do not solve the problem, just diagnose to find the best technician.

If the activeService is "More" or "General", ask the user what exact service they need. When the user replies (e.g., "Fridge theek karwana hai"), you MUST update "detected_specific_service" to a standardized category name (e.g., "Fridge Repair") and set "ai_reply" to your diagnostic question. If the activeService is already a specific category, leave "detected_specific_service" as null.

OUTPUT (strict JSON only):
{
  "ai_reply": "string",
  "detected_specific_service": "string or null"
}`;

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    system_instruction: { parts: [{ text: prompt }] },
    contents: [{ role: 'user', parts: [{ text: 'Paint kharab' }] }],
    generationConfig: { temperature: 0.1, topK: 40, topP: 0.95, maxOutputTokens: 512, responseMimeType: 'application/json' }
  })
})
.then(r => r.json())
.then(console.log);
