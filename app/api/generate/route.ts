import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, tone } = body;
    const apiKey = process.env.GOOGLE_API_KEY;

    // Confirmare în loguri că folosim modelul tău specific
    console.log("--- FOLOSIM MODELUL TĂU: gemini-robotics-er-1.5-preview ---");

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    // === AICI ESTE SECRETUL ===
    // Am scris exact numele modelului tău din dashboard
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-robotics-er-1.5-preview:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a customer support agent. Write a ${tone} reply to: "${review}". Detect language and reply in same language.`
        }]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Eroare Google:", JSON.stringify(data));
      return NextResponse.json({ 
        error: data.error?.message || "Eroare API" 
      }, { status: 500 });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("Crash:", error);
    return NextResponse.json({ error: "Eroare internă." }, { status: 500 });
  }
}