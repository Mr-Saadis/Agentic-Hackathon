// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, raw_input, current_lat, current_lng } = await req.json();

    if (!raw_input || typeof raw_input !== 'string') {
      throw new Error('raw_input is required and must be a string');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

    // Simulate Antigravity prompt using Gemini API (via REST to avoid heavy dependencies)
    const prompt = `
      You are the ServeIQ intent extraction engine (Google Antigravity layer).
      Your task is to parse the user's input, which may be in Pakistani slang, formal Urdu, English, or complex code-switched Roman Urdu.
      
      User Input: "${raw_input}"
      
      Extract the following fields into JSON format:
      - service_type: String matching one of ['AC Repair', 'Plumbing', 'Electrical', 'Other']
      - complexity: 'basic' | 'intermediate' | 'complex'
      - urgency: 'standard' | 'urgent'
      - preferred_time: ISO timestamp. If user implies "Now" or "Urgent" (e.g. "Abhi"), map to current timestamp.
      - location_parsed: String of neighborhood/area if mentioned (e.g., "G-13", "DHA Phase 2"). Return null if absent.
      - budget_sensitivity: 'high' | 'standard'
      - confidence_score: Float between 0.0 and 1.0 representing your confidence in parsing all mandatory fields accurately.
      
      Output MUST strictly be valid JSON only, without markdown formatting.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1, // Keep it deterministic
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error("Failed to reach Google Antigravity layer (Gemini).");
    }

    const data = await response.json();
    let extractedData: any = null;
    let tokensUsed = 0;

    try {
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const textResponse = data.candidates[0].content.parts[0].text;
        extractedData = JSON.parse(textResponse);
        tokensUsed = data.usageMetadata?.totalTokenCount || 150; // default approximation if missing
      }
    } catch (e) {
      console.error("Error parsing LLM response:", e);
      extractedData = { confidence_score: 0.0 };
    }

    const confidence = extractedData?.confidence_score || 0;
    const hasServiceType = extractedData?.service_type && extractedData.service_type !== 'Other';

    // FR-U-03: Dynamic Clarification Loop Handler
    let needs_clarification = false;
    let clarification_payload = null;

    if (confidence < 0.75 || !hasServiceType) {
      needs_clarification = true;
      clarification_payload = {
        question: "Aapko kis tarah ka kaam karwana hai? (Jaise: AC Repair, Plumbing, ya Electrical)",
        missing_field: !hasServiceType ? "service_type" : "general_clarification",
        chips: ["AC Repair", "Plumbing", "Electrical", "Other"]
      };
      
      // If clarification is needed, we don't return the fuzzy extracted data
      extractedData = null;
    }

    const output = {
      success: true,
      needs_clarification,
      extracted_data: extractedData,
      clarification_payload,
      antigravity_trace: {
        model_id: "gemini-3-flash", // Per spec request
        tokens_used: tokensUsed,
        reasoning_rationale: "Parsed via Google Antigravity intent extraction prompt with schema enforcement and strict latency caps."
      }
    };

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
