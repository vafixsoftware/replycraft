import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Citim datele din cerere
    const body = await req.json();
    const { review, tone } = body;

    // 2. Verificăm Cheia API
    const apiKey = process.env.GOOGLE_API_KEY;
    
    // Mesaj de control în logurile Vercel (nu afișează cheia, doar dacă există)
    console.log("--- ÎNCEPERE GENERARE ---");
    console.log("Review primit:", review?.substring(0, 20) + "...");
    console.log("API Key există?", apiKey ? "DA" : "NU");

    if (!apiKey) {
      console.error("EROARE CRITICĂ: Lipsă API Key!");
      return NextResponse.json({ error: "Configurare server greșită (Lipsă API Key)" }, { status: 500 });
    }

    // 3. Pregătim cererea către Google (Model: gemini-1.5-flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a customer support agent. Write a ${tone} reply to: "${review}". Detect language and reply in same language. Keep it short.`
        }]
      }]
    };

    // 4. Trimitem la Google
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // 5. Verificăm dacă Google a dat eroare
    if (!response.ok) {
      console.error("Eroare de la Google:", JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        error: data.error?.message || "Google a refuzat cererea." 
      }, { status: 500 });
    }

    // 6. Extragem răspunsul
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!replyText) {
      console.error("Google a răspuns, dar fără text:", JSON.stringify(data));
      return NextResponse.json({ error: "AI-ul nu a generat text." }, { status: 500 });
    }

    console.log("Succes! Răspuns generat.");
    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error("EROARE DE SERVER (Crash):", error);
    return NextResponse.json({ error: "Eroare internă gravă." }, { status: 500 });
  }
}