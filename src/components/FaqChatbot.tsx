"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle, Send, Sparkles, X, Phone, MessageSquare,
  HelpCircle, Package, ChevronRight, Ticket
} from "lucide-react";
import { CHAT_SUGGESTIONS, CHAT_WELCOME, matchFaqAnswer } from "@/data/faq-bot";
import { SITE } from "@/lib/site";

type ChatMessage = {
  role: "bot" | "user";
  text: string;
  link?: string;
};

type Panel = "main" | "chat" | "ticket" | "contact";

// FAQ contextuelle selon la page
const PAGE_FAQ: Record<string, string[]> = {
  "/panier": ["Livraison offerte ?", "Modifier ma commande", "Code promo"],
  "/commande": ["Modes de paiement", "Sécurité du paiement", "Livraison estimée"],
  "/produit": ["Ce produit est-il authentique ?", "Disponibilité stock", "Conseils d'utilisation"],
  "/boutique": ["Filtrer par peau sèche", "Produits bio", "Best-sellers"],
};

export function FaqChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("main");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: CHAT_WELCOME },
  ]);
  const [ticketForm, setTicketForm] = useState({
    category: "commande", subject: "", message: "", email: "",
  });
  const [ticketSent, setTicketSent] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing, open]);

  // Suggestions contextuelles selon la page
  const contextSuggestions = Object.entries(PAGE_FAQ).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] ?? CHAT_SUGGESTIONS;

  function replyWithAnswer(question: string) {
    const answer = matchFaqAnswer(question);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: answer.a, link: answer.link }]);
    }, 550);
  }

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    replyWithAnswer(q);
  }

  async function submitTicket() {
    if (!ticketForm.subject || !ticketForm.message) return;
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: ticketForm.category,
        subject: ticketForm.subject,
        message: ticketForm.message,
        guestEmail: ticketForm.email || undefined,
      }),
    });
    if (res.ok) setTicketSent(true);
  }

  // Masquer sur admin
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) setPanel("main"); }}
        className="fixed bottom-20 right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-shifaa-green text-white shadow-lift transition hover:bg-shifaa-ink md:bottom-6"
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant Shifaa"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className="fixed bottom-36 right-4 z-[45] flex h-[min(560px,calc(100vh-10rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-shifaa-border bg-white shadow-lift md:bottom-24"
          role="dialog"
          aria-label="Centre d'assistance Shifaa"
        >
          {/* Header */}
          <div className="shrink-0 bg-shifaa-dark px-4 py-3 text-white">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-shifaa-lime" aria-hidden />
                <div>
                  <p className="font-semibold text-sm">Assistance Shifaa</p>
                  <p className="text-[11px] text-white/70">
                    {panel === "main" ? "Comment pouvons-nous vous aider ?"
                      : panel === "chat" ? "Chat en direct"
                      : panel === "ticket" ? "Créer un ticket"
                      : "Nous contacter"}
                  </p>
                </div>
              </div>
              {panel !== "main" && (
                <button onClick={() => setPanel("main")} className="text-white/60 hover:text-white text-xs">
                  ← Retour
                </button>
              )}
            </div>
          </div>

          {/* ── Panel principal ──────────────────────────────── */}
          {panel === "main" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Actions rapides */}
              <div className="space-y-2">
                <button onClick={() => setPanel("chat")}
                  className="flex w-full items-center gap-3 rounded-xl border border-shifaa-border p-3 hover:border-shifaa-green hover:bg-shifaa-lime/10 transition-all group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shifaa-lime/20">
                    <MessageSquare className="h-5 w-5 text-shifaa-green" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-shifaa-ink">Chat instantané</p>
                    <p className="text-xs text-shifaa-muted">FAQ & conseils produit</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-shifaa-muted group-hover:text-shifaa-green" />
                </button>

                <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3 hover:bg-green-100 transition-colors group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                    <span className="text-lg">💬</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">WhatsApp Business</p>
                    <p className="text-xs text-green-600">Réponse rapide · {SITE.phone}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-green-400 group-hover:text-green-600" />
                </a>

                <a href={`tel:${SITE.phoneTel}`}
                  className="flex items-center gap-3 rounded-xl border border-shifaa-border p-3 hover:border-shifaa-green hover:bg-shifaa-lime/10 transition-colors group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shifaa-lime/20">
                    <Phone className="h-5 w-5 text-shifaa-green" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-shifaa-ink">Téléphone</p>
                    <p className="text-xs text-shifaa-muted">{SITE.phone} · {SITE.hoursShort}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-shifaa-muted group-hover:text-shifaa-green" />
                </a>

                <button onClick={() => setPanel("ticket")}
                  className="flex w-full items-center gap-3 rounded-xl border border-shifaa-border p-3 hover:border-shifaa-green hover:bg-shifaa-lime/10 transition-colors group">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shifaa-lime/20">
                    <Ticket className="h-5 w-5 text-shifaa-green" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-shifaa-ink">Créer un ticket SAV</p>
                    <p className="text-xs text-shifaa-muted">Retour, réclamation, problème</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-shifaa-muted group-hover:text-shifaa-green" />
                </button>

                <Link href="/compte/commandes"
                  className="flex items-center gap-3 rounded-xl border border-shifaa-border p-3 hover:border-shifaa-green hover:bg-shifaa-lime/10 transition-colors group"
                  onClick={() => setOpen(false)}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-shifaa-lime/20">
                    <Package className="h-5 w-5 text-shifaa-green" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-shifaa-ink">Suivi de commande</p>
                    <p className="text-xs text-shifaa-muted">Voir mes commandes</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-shifaa-muted group-hover:text-shifaa-green" />
                </Link>
              </div>

              {/* Horaires */}
              <div className="rounded-xl bg-shifaa-cream border border-shifaa-border/50 p-3 text-center">
                <p className="text-xs text-shifaa-muted">
                  <span className="font-medium text-green-600">🟢 En ligne</span> · {SITE.hoursLong}
                </p>
              </div>

              {/* Questions contextuelles */}
              <div>
                <p className="text-xs font-medium text-shifaa-muted mb-2 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Questions fréquentes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {contextSuggestions.slice(0, 3).map((s) => (
                    <button key={s} type="button"
                      onClick={() => { setPanel("chat"); setTimeout(() => send(s), 100); }}
                      className="rounded-full border border-shifaa-border bg-white px-2.5 py-1 text-xs text-shifaa-ink hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Panel chat FAQ ───────────────────────────────── */}
          {panel === "chat" && (
            <>
              <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((msg, i) => (
                  <div key={i}
                    className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user" ? "ml-auto bg-shifaa-green text-white" : "bg-shifaa-cream text-shifaa-ink"
                    }`}
                  >
                    {msg.text}
                    {msg.link && (
                      <Link href={msg.link} onClick={() => setOpen(false)}
                        className="mt-1 block text-xs font-semibold underline text-shifaa-green">
                        Voir →
                      </Link>
                    )}
                  </div>
                ))}
                {typing && (
                  <div className="max-w-[80%] rounded-2xl bg-shifaa-cream px-3 py-2 text-sm text-shifaa-muted">
                    <span className="animate-pulse">L&apos;assistant réfléchit…</span>
                  </div>
                )}
              </div>

              {messages.length <= 1 && !typing && (
                <div className="shrink-0 flex flex-wrap gap-1.5 border-t border-shifaa-border/60 px-3 py-2">
                  {contextSuggestions.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)}
                      className="rounded-full border border-shifaa-border bg-white px-2.5 py-1 text-xs text-shifaa-ink hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="shrink-0 border-t border-shifaa-border p-3">
                <div className="flex gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                    placeholder="Votre question…"
                    className="flex-1 rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30"
                    disabled={typing} />
                  <button type="button" onClick={() => send()} disabled={typing || !input.trim()}
                    className="btn-primary px-3 disabled:opacity-50" aria-label="Envoyer">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-shifaa-muted text-center">
                  Conseils informatifs · Sans diagnostic médical ·{" "}
                  <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="text-shifaa-green hover:underline">WhatsApp</a> pour l&apos;équipe
                </p>
              </div>
            </>
          )}

          {/* ── Panel ticket SAV ─────────────────────────────── */}
          {panel === "ticket" && (
            <div className="flex-1 overflow-y-auto p-4">
              {ticketSent ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-3xl">✅</p>
                  <p className="font-semibold text-shifaa-ink">Ticket créé avec succès !</p>
                  <p className="text-sm text-shifaa-muted">Notre équipe vous répond sous 24h ouvrées.</p>
                  <button onClick={() => { setTicketSent(false); setPanel("main"); setTicketForm({ category: "commande", subject: "", message: "", email: "" }); }}
                    className="btn-primary text-sm">
                    Retour
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-shifaa-ink">Catégorie</label>
                    <select value={ticketForm.category}
                      onChange={(e) => setTicketForm((f) => ({ ...f, category: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30">
                      {[
                        { value: "commande", label: "Ma commande" },
                        { value: "livraison", label: "Livraison" },
                        { value: "retour", label: "Retour / remboursement" },
                        { value: "produit", label: "Produit" },
                        { value: "paiement", label: "Paiement" },
                        { value: "compte", label: "Mon compte" },
                        { value: "autre", label: "Autre" },
                      ].map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-shifaa-ink">Sujet *</label>
                    <input value={ticketForm.subject}
                      onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="Ex: Commande SHF-12345 non reçue"
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-shifaa-ink">Description *</label>
                    <textarea rows={3} value={ticketForm.message}
                      onChange={(e) => setTicketForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Décrivez votre problème…"
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-shifaa-ink">E-mail (si non connecté)</label>
                    <input type="email" value={ticketForm.email}
                      onChange={(e) => setTicketForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="votre@email.com"
                      className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-shifaa-green/30" />
                  </div>
                  <button type="button" onClick={submitTicket}
                    disabled={!ticketForm.subject || !ticketForm.message}
                    className="w-full btn-primary disabled:opacity-50 text-sm">
                    Envoyer le ticket
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
