// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { profile, conversation } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

    // Calculate how many turns have happened. 
    // A turn is one assistant question + one user answer.
    const userMessageCount = conversation.filter((msg: any) => msg.role === 'user').length;
    const MAX_QUESTIONS = 3;

    // Prompt instructions
    const systemInstruction = `
      You are the ServeIQ Antigravity Vetting Agent. Your job is to interview a technician who wants to join the platform.
      Profile Claim: Skills - ${profile.skills.join(', ')} | Complexity Claim - ${profile.claimed_complexity}.
      
      RULES:
      1. You must ask highly technical and practical questions one by one based on their claimed skills to verify their competence.
      2. If they claim "Expert", ask very hard diagnostic questions (e.g. PCB error codes, gas pressures, circuit diagrams).
      3. If they claim "Basic", ask simple foundational questions.
      4. Evaluate their previous answer before asking the next question.
      5. You will ask a total of ${MAX_QUESTIONS} questions. They have answered ${userMessageCount} questions so far.
      
      If ${userMessageCount} < ${MAX_QUESTIONS}:
      Generate the NEXT question. Output JSON: { "status": "ongoing", "ai_reply": "your next question here" }
      
      If ${userMessageCount} >= ${MAX_QUESTIONS}:
      Conclude the interview. Do NOT reject them. Even if they failed completely, downgrade them to "Basic/Trainee" level with a low minimum wage. If they answered well, match their claimed level or upgrade them.
      Output JSON: 
      {
        "status": "completed",
        "ai_reply": "Thank you, your profile has been evaluated.",
        "competence_score": <0-100 float based on answers>,
        "assigned_level": "Basic" | "Intermediate" | "Expert",
        "minimum_wage": <PKR integer, e.g. 500 for Basic, 1500 for Expert>
      }
      
      ONLY output raw JSON. Do not use markdown blocks.
    `;

    // Construct history for Gemini
    const contents = [
      { role: "user", parts: [{ text: systemInstruction }] },
      { role: "model", parts: [{ text: "Understood. I will output only JSON." }] }
    ];

    for (const msg of conversation) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    if (userMessageCount === 0) {
      // First trigger, the user hasn't spoken yet. We just need the first question.
      contents.push({ role: "user", parts: [{ text: "Begin the interview by asking the first question." }] });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${await response.text()}`);
    }

    const data = await response.json();
    let resultJSON = null;

    try {
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        resultJSON = JSON.parse(data.candidates[0].content.parts[0].text);
      }
    } catch (e) {
      console.error("Parse error", e);
      // Fallback
      resultJSON = {
        status: "completed",
        ai_reply: "System error during evaluation. Assigning trainee level safely.",
        competence_score: 30,
        assigned_level: "Basic",
        minimum_wage: 500
      };
    }

    return new Response(JSON.stringify(resultJSON), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
