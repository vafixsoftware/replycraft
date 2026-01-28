"use client";

import { useState, useEffect } from "react";
// Importăm componentele de la Clerk
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, user } = useUser(); // Aflăm datele userului real
  
  const [review, setReview] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("professional");
  const [credits, setCredits] = useState(5);
  const [isPro, setIsPro] = useState(false);

  // Link Stripe
  const STRIPE_LINK = "LINKUL_TAU_DE_STRIPE_AICI"; 

  const handleGenerate = async () => {
    // Dacă nu are credite și nu e PRO
    if (!isPro && credits <= 0) {
      alert("Ai epuizat creditele gratuite.");
      return;
    }

    if (!review) return;
    setLoading(true);
    setReply("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review, tone }),
      });

      const data = await response.json();
      
      if (data.reply) {
        setReply(data.reply);
        if (!isPro) setCredits(credits - 1);
      } else {
        alert("Eroare: " + (data.error || "Eroare necunoscută"));
      }
    } catch (e) {
      alert("Eroare conexiune.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 text-slate-900 font-sans">
      
      {/* HEADER DE LOGARE */}
      <nav className="w-full max-w-4xl flex justify-between items-center mb-10 py-4">
        <div className="text-2xl font-black">Reply<span className="text-blue-600">Craft</span></div>
        
        <div className="flex gap-4 items-center">
          {/* Ce vede cineva care NU e logat */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold hover:bg-slate-800 transition">
                Log In / Sign Up
              </button>
            </SignInButton>
          </SignedOut>

          {/* Ce vede cineva care E logat */}
          <SignedIn>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-500">
                Salut, {user?.firstName}!
              </span>
              <UserButton afterSignOutUrl="/"/>
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* --- CONȚINUTUL PAGINII --- */}

      {/* Daca NU e logat, îi arătăm doar un mesaj de marketing */}
      <SignedOut>
        <div className="text-center mt-20 max-w-2xl">
          <h1 className="text-6xl font-black mb-6">Log in to Start.</h1>
          <p className="text-xl text-slate-500 mb-8">
            Create an account to verify you are human and get 5 free AI generations immediately.
          </p>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white text-xl px-8 py-4 rounded-full font-bold shadow-xl hover:bg-blue-500 transition">
              Get Started for Free
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* Daca E logat, îi arătăm aplicația */}
      <SignedIn>
        <div className="max-w-4xl w-full flex flex-col items-center">
          
          <div className="mb-6 flex gap-3 items-center">
             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
               {isPro ? "UNLIMITED PRO" : `${credits} Free Credits`}
             </span>
             {!isPro && (
               <a href={STRIPE_LINK} target="_blank" className="text-sm font-bold underline cursor-pointer text-slate-500 hover:text-blue-600">
                 Upgrade to PRO
               </a>
             )}
          </div>

          {/* ZONA DE GENERARE (Codul vechi) */}
          <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <textarea 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full h-32 p-4 border rounded-xl outline-none focus:border-blue-500 mb-4 bg-slate-50"
              placeholder="Paste review here..."
            ></textarea>

            <button 
              onClick={handleGenerate}
              disabled={loading || (!isPro && credits <= 0)}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 disabled:bg-slate-300"
            >
              {loading ? "Generating..." : "Generate Reply"}
            </button>

            {reply && (
              <div className="mt-6 p-4 bg-slate-100 rounded-xl">
                <p className="text-slate-800">{reply}</p>
              </div>
            )}
          </div>

        </div>
      </SignedIn>

    </main>
  );
}