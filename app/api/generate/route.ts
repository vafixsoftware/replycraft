import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { review, tone } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    // === SCHIMBAREA ESTE AICI ===
    // Folosim 'gemini-1.5-flash' care este mult mai generos (1500 cereri/zi gratis)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are an expert customer support agent. 
          Task: Write a ${tone} reply to the following review: "${review}".
          
          CRITICAL INSTRUCTION: Detect the language of the review and write the reply in the SAME LANGUAGE. 
          (Example: If review is Romanian, reply in Romanian. If English, reply in English).
          
          Do not add any explanations, just the reply text.`
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
      // Vedem exact ce eroare dă Google în consolă (pe Vercel)
      console.error("Google API Error:", data);
      return NextResponse.json({ error: data.error?.message || "Eroare API Google" }, { status: 500 });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}