"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles, X, Send, ChevronRight,
  RotateCcw
} from "lucide-react";
import { SITE } from "@/lib/site";

// ── Types ────────────────────────────────────────────────
type Role = "user" | "assistant";
type Message = {
  role: Role;
  content: string;
  products?: RecoProduct[];
  actions?: QuickAction[];
};
type RecoProduct = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  reason: string;
};
type QuickAction = {
  label: string;
  prompt: string;
};

// ── Suggestions contextuelles ────────────────────────────
const QUICK_STARTS: QuickAction[] = [
  { label: "🌸 Soin visage peau sèche", prompt: "Je cherche un soin visage pour peau sèche, que recommandez-vous ?" },
  { label: "💊 Vitamines énergie", prompt: "Quelles vitamines pour booster mon énergie ?" },
  { label: "👶 Produits bébé 0-6 mois", prompt: "Quels produits pour un bébé de 0 à 6 mois ?" },
  { label: "💆 Routine anti-âge", prompt: "Pouvez-vous me conseiller une routine anti-âge complète ?" },
  { label: "☀️ Protection solaire", prompt: "J'ai besoin d'une crème solaire SPF 50 pour peau sensible" },
  { label: "🌿 Alternatives naturelles", prompt: "Cherche des produits naturels et bio pour les soins du quotidien" },
];

const WELCOME = `Bonjour 👋 Je suis **Sana**, votre conseillère beauté & santé Shifaa.

Je peux vous aider à :
• Trouver le produit idéal pour votre profil
• Construire une routine complète
• Comparer des références
• Répondre à toutes vos questions

**Comment puis-je vous aider aujourd'hui ?**`;

// ── Composant principal ───────────────────────────────────
export function AiSalesAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME, actions: QUICK_STARTS },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: q };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: q,
          history: messages.filter((m) => m.role !== "assistant" || m.content !== WELCOME),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "Je suis désolée, une erreur s'est produite.",
          products: data.products,
          actions: data.suggestions,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Désolée, je rencontre une difficulté. Réessayez ou contactez-nous sur WhatsApp." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, sessionId]);

  function reset() {
    setMessages([{ role: "assistant", content: WELCOME, actions: QUICK_STARTS }]);
    setInput("");
  }

  // Guard admin — après tous les hooks
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Bouton flottant — positionné à gauche pour ne pas gêner le chatbot FAQ */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 left-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-shifaa-green to-shifaa-dark text-white shadow-lift transition hover:scale-105 md:bottom-8"
        aria-label="Conseillère IA Sana"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
            IA
          </span>
        )}
      </button>

      {/* Fenêtre — ancrée entre le header et les boutons */}
      {open && (
        <div className="fixed z-[45] flex flex-col overflow-hidden rounded-2xl border border-shifaa-border bg-white shadow-2xl"
          style={{
            top: "140px",
            bottom: "88px",
            left: "1rem",
            width: "min(400px, calc(100vw - 2rem))",
          }}>

          {/* Header */}
          <div className="shrink-0 bg-gradient-to-r from-shifaa-dark to-shifaa-green px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">
                  💆‍♀️
                </div>
                <div>
                  <p className="font-semibold text-sm">Sana — Conseillère IA</p>
                  <p className="text-[11px] text-white/70 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                    En ligne · Shifaa Parapharmacie
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={reset} className="text-white/60 hover:text-white transition-colors" title="Nouvelle conversation">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "bg-shifaa-green text-white rounded-br-sm"
                      : "bg-gray-100 text-shifaa-ink rounded-bl-sm"}`}>
                    {msg.content.split("\n").map((line, j) => (
                      <p key={j} className={line.startsWith("**") ? "font-semibold" : ""}>
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Produits recommandés */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 space-y-1.5 ml-1">
                    {msg.products.map((p) => (
                      <Link key={p.slug} href={`/produit/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl border border-shifaa-border bg-white px-3 py-2 hover:border-shifaa-green transition-colors group">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-shifaa-lime/20 text-sm">
                          🛍️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-shifaa-ink truncate group-hover:text-shifaa-green">{p.name}</p>
                          <p className="text-[10px] text-shifaa-muted">{p.brand} · {p.price.toLocaleString()} DZD</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-shifaa-muted shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Actions rapides */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 ml-1">
                    {msg.actions.map((a) => (
                      <button key={a.label} type="button" onClick={() => send(a.prompt)}
                        className="rounded-full border border-shifaa-border bg-white px-2.5 py-1 text-xs text-shifaa-ink hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2.5">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-shifaa-muted animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Zone de saisie */}
          <div className="shrink-0 border-t border-shifaa-border p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Décrivez votre besoin…"
                className="flex-1 rounded-xl border border-shifaa-border bg-gray-50 px-3 py-2.5 text-sm focus:border-shifaa-green focus:outline-none focus:ring-2 focus:ring-shifaa-green/20 focus:bg-white transition-all"
                disabled={loading}
              />
              <button type="button" onClick={() => send()} disabled={loading || !input.trim()}
                className="flex items-center justify-center rounded-xl bg-shifaa-green px-3 py-2.5 text-white hover:bg-shifaa-dark transition-colors disabled:opacity-40">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-shifaa-muted">
              <span>Conseils personnalisés par IA · Shifaa</span>
              <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="text-shifaa-green hover:underline">💬 WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
