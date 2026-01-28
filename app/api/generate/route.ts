import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, tone } = body;
    const apiKey = process.env.GOOGLE_API_KEY;

    // Log-uri pentru debug (să vedem în Vercel dacă totul e ok)
    console.log("--- GENERARE CU GEMINI 1.5 PRO ---");

    if (!apiKey) {
      console.error("LIPSA API KEY!");
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    // === Marea Schimbare ===
    // Folosim 'gemini-1.5-pro' - Modelul Premium
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a helpful customer support expert. 
          Task: Write a ${tone} reply to this review: "${review}". 
          
          Important: Detect the language of the review and reply in the SAME language.
          Keep it professional, empathetic, and concise.`
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
        error: data.error?.message || "Eroare la modelul Pro." 
      }, { status: 500 });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("Crash Server:", error);
    return NextResponse.json({ error: "Eroare internă." }, { status: 500 });
  }
}