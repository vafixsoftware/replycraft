import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { review, tone } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key în mediu" }, { status: 500 });
    }

    // Am adăugat "-latest" pentru a forța Google să găsească versiunea activă
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `Ești un asistent expert în customer support. Scrie un răspuns ${tone} la următoarea recenzie: "${review}". Răspunde direct în limba în care este scrisă recenzia.`
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
      console.error("Detalii eroare Google:", data);
      return NextResponse.json({ 
        error: data.error?.message || "Google API Error",
        details: data.error 
      }, { status: response.status });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    return NextResponse.json({ error: "Eroare internă server" }, { status: 500 });
  }
}