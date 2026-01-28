import { NextResponse } from "next/server";

// Memoria serverului
const ipCache = new Map<string, number>();

export async function POST(req: Request) {
  try {
    // === REPARAȚIA AICI ===
    // Citim header-ul specific Vercel
    const forwarded = req.headers.get("x-forwarded-for");
    // Luăm primul IP din listă (acela e clientul real), sau un ID random dacă nu există
    const ip = forwarded ? forwarded.split(',')[0] : "unknown_user";

    // Dacă serverul nu reușește să citească IP-ul, nu blocăm userul (ca să nu blocăm pe toată lumea)
    if (ip === "unknown_user") {
      console.log("Nu s-a putut detecta IP-ul.");
    }

    console.log(`Cerere de la IP: ${ip}`); // Vedem în loguri cine cere

    const currentUsage = ipCache.get(ip) || 0;
    const LIMITA_MAXIMA = 5;

    // Verificăm limita DOAR dacă avem un IP valid (nu e unknown)
    if (ip !== "unknown_user" && currentUsage >= LIMITA_MAXIMA) {
      return NextResponse.json(
        { error: "Ai atins limita de 5 generări gratuite pe acest dispozitiv." },
        { status: 429 }
      );
    }

    // Creștem contorul
    if (ip !== "unknown_user") {
      ipCache.set(ip, currentUsage + 1);
    }

    // --- LOGICA GEMINI ---
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