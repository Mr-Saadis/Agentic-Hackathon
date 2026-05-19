const apiKey = "AIzaSyAZ6s2NvgglX3amOHs_e-ioAblkd7UH8Gk";

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (res.ok) {
      console.log("Available models:");
      data.models.forEach(m => {
        // Only print models that have 'flash' or 'lite' in their name
        if (m.name.includes('flash') || m.name.includes('lite') || m.name.includes('8b')) {
          console.log(`- ${m.name}`);
        }
      });
    } else {
      console.error("Error fetching models:", data.error.message);
    }
  } catch (err) {
    console.error("Exception:", err.message);
  }
}

listModels();
