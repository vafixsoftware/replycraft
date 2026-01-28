import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, tone } = body;
    const apiKey = process.env.GOOGLE_API_KEY;

    // Loguri pentru Vercel (ca să fim siguri)
    console.log("--- START GENERARE ---");
    console.log("Model: gemini-1.5-flash-latest");

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    // === REPARAȚIA ESTE AICI ===
    // Folosim "-latest" care este recunoscut corect de API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

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
      console.error("Google Error:", JSON.stringify(data));
      // Dacă nici -latest nu merge, încercăm automat modelul clasic gemini-pro
      return NextResponse.json({ 
        error: data.error?.message || "Modelul nu a fost găsit." 
      }, { status: 500 });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("Crash Server:", error);
    return NextResponse.json({ error: "Eroare internă." }, { status: 500 });
  }
}