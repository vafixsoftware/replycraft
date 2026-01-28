import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, tone } = body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Lipsă API Key" }, { status: 500 });
    }

    // LISTA DE MODELE PE CARE LE VOM TESTA AUTOMAT
    // Dacă primul dă eroare, trecem la următorul.
    const modelsToTry = [
      "gemini-1.5-flash",         // Cel mai nou și rapid
      "gemini-1.5-flash-latest",  // Varianta latest
      "gemini-1.0-pro",           // Varianta stabilă a modelului vechi
      "gemini-pro"                // Alias-ul vechi
    ];

    let lastError = null;

    // Încercăm modelele pe rând
    for (const modelName of modelsToTry) {
      console.log(`Trying model: ${modelName}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
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

      if (response.ok && data.candidates) {
        // AM REUȘIT!
        console.log(`SUCCESS with model: ${modelName}`);
        const replyText = data.candidates[0].content.parts[0].text;
        return NextResponse.json({ reply: replyText });
      } else {
        // Eșec pe acest model, ținem minte eroarea și continuăm
        console.error(`Failed ${modelName}:`, data.error?.message);
        lastError = data.error?.message;
      }
    }

    // Dacă am ajuns aici, înseamnă că TOATE au eșuat
    return NextResponse.json({ 
      error: `Toate modelele au eșuat. Ultima eroare: ${lastError}` 
    }, { status: 500 });

  } catch (error) {
    console.error("Critical Server Error:", error);
    return NextResponse.json({ error: "Eroare internă gravă." }, { status: 500 });
  }
}