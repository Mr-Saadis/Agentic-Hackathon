const apiKey = "AIzaSyAZ6s2NvgglX3amOHs_e-ioAblkd7UH8Gk";

async function testModel(modelName, key) {
  try {
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
  await testModel('gemini-2.5-flash-lite', apiKey);
  await testModel('gemini-3.1-flash-lite', apiKey);
}

run();
