"use client";

import { useState } from "react";

export default function Home() {
  const [review, setReview] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("professional");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!review) return;
    setLoading(true);
    setReply("");
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review, tone }),
      });

      const data = await response.json();
      if (data.reply) setReply(data.reply);
    } catch (error) {
      alert("A apărut o eroare la generare. Te rugăm să reîncerci.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white flex flex-col items-center p-6 text-slate-900 font-sans">
      <div className="max-w-4xl w-full flex flex-col items-center">
        
        {/* === HERO SECTION === */}
        <div className="text-center mb-10 mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-indigo-700 uppercase bg-indigo-100 rounded-full border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            V3.0 Stable Release
          </div>
          
          {/* NUME NOU: REPLYCRAFT (Poți schimba înapoi în ReplyBot dacă vrei) */}
          <h1 className="text-7xl font-black text-slate-900 mb-2 tracking-tighter">
            Reply<span className="text-blue-600">Craft</span>
          </h1>
          
          {/* BADGE SIMPLU */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm font-semibold text-slate-500">Powered by</span>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm flex items-center gap-1">
              ✨ Gemini AI
            </div>
          </div>

          <p className="text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
            Transform angry reviews into loyal customers using the world's most advanced AI models.
          </p>
        </div>

        {/* === MAIN TOOL === */}
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-white/50 mb-20 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

          <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wide">Customer Review</label>
          <textarea 
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 transition-all placeholder-slate-400 font-medium"
            placeholder="Paste the review here (e.g., 'The pizza arrived cold...')"
          ></textarea>

          <div className="mt-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">AI Persona Tone</label>
            <div className="grid grid-cols-3 gap-3">
              {['professional', 'friendly', 'apologetic'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                    tone === t 
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                    : "bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={loading || !review}
            className={`w-full mt-8 py-5 rounded-2xl font-black text-lg transition-all duration-300 transform active:scale-[0.99] ${
              loading || !review 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/30"
            }`}
          >
            {loading ? "Connecting to Neural Network..." : "Generate Flash Reply"}
          </button>

          {reply && (
            <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white animate-in fade-in slide-in-from-bottom-4 duration-500 relative group border border-slate-700/50">
              <div className="flex justify-between items-center mb-4">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">Generated Output</div>
                <div className="text-green-400 text-[10px] font-bold">● AI Optimized</div>
              </div>
              <p className="text-lg leading-relaxed font-medium text-slate-100 italic">"{reply}"</p>
              <button 
                onClick={copyToClipboard}
                className={`mt-6 w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  copied ? "bg-green-500 text-white" : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
              >
                {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
              </button>
            </div>
          )}
        </div>

        {/* === PRICING SECTION === */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Pricing Plans</h2>
          <p className="text-slate-500">Join 10,000+ businesses using ReplyCraft in 2026.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl mb-24">
          
          {/* Plan FREE */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm flex flex-col">
            <div className="text-xl font-bold text-slate-900 mb-2">Starter</div>
            <div className="text-4xl font-black text-slate-900 mb-6">$0</div>
            <ul className="space-y-4 text-slate-600 mb-8 flex-1">
              <li className="flex items-center gap-3"><span className="text-green-500">✓</span> 10 Replies / month</li>
              <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Professional Tone</li>
              <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Gemini AI Engine</li>
            </ul>
            <button 
              onClick={() => alert("You are already on the Starter Plan.")}
              className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              Current Plan
            </button>
          </div>

          {/* Plan PRO */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl transform md:scale-105 relative flex flex-col">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Most Popular
            </div>
            <div className="text-xl font-bold text-white mb-2">Pro Business</div>
            <div className="text-4xl font-black text-white mb-6">$19<span className="text-lg text-slate-400 font-normal">/mo</span></div>
            <ul className="space-y-4 text-slate-300 mb-8 flex-1">
              <li className="flex items-center gap-3"><span className="text-blue-400">✓</span> Unlimited Replies</li>
              <li className="flex items-center gap-3"><span className="text-blue-400">✓</span> Access to Gemini 3 Flash</li>
              <li className="flex items-center gap-3"><span className="text-blue-400">✓</span> 50+ Languages</li>
              <li className="flex items-center gap-3"><span className="text-blue-400">✓</span> Priority Support</li>
            </ul>
            <button 
              onClick={() => alert("Demo Mode: Payment gateway is connected but disabled for testing.")}
              className="w-full py-3 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50"
            >
              Upgrade Now
            </button>
          </div>

        </div>
        
        {/* FOOTER 2026 */}
        <div className="w-full border-t border-slate-200 pt-8 pb-8 text-center">
          <p className="text-slate-400 text-sm font-medium">
            © 2026 ReplyCraft Inc. Built with Next.js 16.
          </p>
        </div>

      </div>
    </main>
  );
}