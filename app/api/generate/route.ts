import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { review, tone } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    // Folosim modelul experimental care a mers la tine (robotics-er-1.5-preview)
    // Sau poți lăsa 'gemini-pro' dacă acela a mers ultima dată.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-robotics-er-1.5-preview:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          // AICI ESTE SCHIMBAREA MAGICĂ:
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
      return NextResponse.json({ error: data.error?.message || "Eroare API" }, { status: 500 });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ reply: replyText });

  } catch (error) {
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}