"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { CHAT_SUGGESTIONS, CHAT_WELCOME, matchFaqAnswer } from "@/data/faq-bot";
import { SITE } from "@/lib/site";

type ChatMessage = {
  role: "bot" | "user";
  text: string;
  link?: string;
};

export function FaqChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: CHAT_WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  function replyWithAnswer(question: string) {
    const answer = matchFaqAnswer(question);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: answer.a,
          link: answer.link,
        },
      ]);
    }, 550);
  }

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    replyWithAnswer(q);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-shifaa-green text-white shadow-lift transition hover:bg-shifaa-ink md:bottom-6"
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant Shifaa"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className="fixed bottom-36 right-4 z-[45] flex h-[min(480px,72vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-shifaa-border bg-white shadow-lift md:bottom-24"
          role="dialog"
          aria-label="Assistant conseil Shifaa"
        >
          <div className="shrink-0 bg-shifaa-dark px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-shifaa-lime" aria-hidden />
              <div>
                <p className="font-semibold">Conseil Shifaa</p>
                <p className="text-xs text-white/75">Parapharmacie · orientation & commande</p>
              </div>
            </div>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden p-4 overscroll-contain [scrollbar-gutter:stable]"
          >
            {messages.map((msg, i) => (
              <div
                key={`${i}-${msg.role}`}
                className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-shifaa-green text-white"
                    : "bg-shifaa-cream text-shifaa-ink"
                }`}
              >
                {msg.text}
                {msg.link && (
                  <Link
                    href={msg.link}
                    className={`mt-2 block text-xs font-semibold underline ${
                      msg.role === "user" ? "text-white/90" : "text-shifaa-green"
                    }`}
                  >
                    Voir la page utile →
                  </Link>
                )}
              </div>
            ))}
            {typing && (
              <div className="max-w-[80%] rounded-2xl bg-shifaa-cream px-3 py-2 text-sm text-shifaa-muted">
                L&apos;assistant réfléchit…
              </div>
            )}
          </div>

          {messages.length <= 1 && !typing && (
            <div className="shrink-0 flex flex-wrap gap-2 border-t border-shifaa-border/60 px-3 py-2">
              {CHAT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-shifaa-border bg-white px-3 py-1 text-xs font-medium text-shifaa-ink transition hover:border-shifaa-green hover:text-shifaa-green"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="shrink-0 border-t border-shifaa-border p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Ex. crème peau sèche, suivi SHF-…"
                className="flex-1 rounded-xl border border-shifaa-border px-3 py-2 text-sm"
                disabled={typing}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={typing || !input.trim()}
                className="btn-primary px-3 disabled:opacity-50"
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-snug text-shifaa-muted">
              Conseils à titre informatif, sans diagnostic médical.{" "}
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-shifaa-green hover:underline"
              >
                WhatsApp
              </a>{" "}
              pour un échange avec l&apos;équipe.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
