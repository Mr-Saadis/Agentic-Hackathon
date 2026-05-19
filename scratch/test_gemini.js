const apiKey1 = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyAZ6s2NvgglX3amOHs_e-ioAblkd7UH8Gk"; // Fallback to provided key for testing
const apiKey2 = "AIzaSyAZ6s2NvgglX3amOHs_e-ioAblkd7UH8Gk";

async function testModel(modelName, key) {
  try {
    console.log(`Testing ${modelName} with key ending in ${key.slice(-5)}...`);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Say hi" }] }]
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ ${modelName} Success: ${data.candidates[0].content.parts[0].text.trim()}`);
    } else {
      console.error(`❌ ${modelName} Error:`, data.error.message);
    }
  } catch (err) {
    console.error(`❌ ${modelName} Exception:`, err.message);
  }
}

async function run() {
  await testModel('gemini-2.0-flash', apiKey2);
  await testModel('gemini-2.0-flash-lite-preview-02-05', apiKey2);
}

run();
