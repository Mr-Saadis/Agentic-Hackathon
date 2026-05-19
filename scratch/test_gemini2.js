const apiKey1 = "AIzaSyAZ6s2NvgglX3amOHs_e-ioAblkd7UHGk";

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
  await testModel('gemini-1.5-flash', apiKey1);
  await testModel('gemini-1.5-flash-8b', apiKey1);
  await testModel('gemini-2.5-flash', apiKey1);
}

run();
