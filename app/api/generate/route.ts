import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { review, tone } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    // Folosim modelul STANDARD, stabil și generos (1500 cereri/zi)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are an expert customer support agent. 
          Task: Write a ${tone} reply to the following review: "${review}".
          
          CRITICAL INSTRUCTION: Detect the language of the review and write the reply in the SAME LANGUAGE.
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
      console.error("Eroare Google:", data); // Asta ne ajută să vedem eroarea în logurile Vercel
      return NextResponse.json({ error: data.error?.message || "Eroare la generare" }, { status: 500 });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    return NextResponse.json({ error: "Eroare internă server" }, { status: 500 });
  }
}