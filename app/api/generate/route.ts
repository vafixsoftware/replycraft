import { NextResponse } from "next/server";

// Aceasta este "memoria" serverului unde ținem minte cine a intrat
// Format: { "IP_ADRESA": NUMAR_CERERI }
const ipCache = new Map<string, number>();

export async function POST(req: Request) {
  try {
    // 1. Aflăm IP-ul utilizatorului
    // Pe Vercel, IP-ul real se află în header-ul 'x-forwarded-for'
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // 2. Verificăm de câte ori a generat deja
    const currentUsage = ipCache.get(ip) || 0;
    const LIMITA_MAXIMA = 5;

    // 3. Dacă a depășit limita, îi dăm STOP
    if (currentUsage >= LIMITA_MAXIMA) {
      return NextResponse.json(
        { error: "Limita gratuită atinsă (5/5). Te rugăm să faci upgrade." },
        { status: 429 } // Codul 429 înseamnă "Too Many Requests"
      );
    }

    // 4. Dacă e ok, creștem contorul pentru acest IP
    ipCache.set(ip, currentUsage + 1);

    // --- CONTINUĂM CU LOGICA VECHE PENTRU GEMINI ---
    const { review, tone } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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
      return NextResponse.json({ error: "Eroare API Google" }, { status: 500 });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ reply: replyText });

  } catch (error) {
    return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
  }
}