"use client";

import { FormEvent, useState } from "react";
import { useToast } from "@/context/ToastContext";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("contact-email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessage(json.message);
      showToast("Message envoyé");
      form.reset();
    } else {
      setMessage(json.error ?? "Erreur");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-4 p-8">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Nom complet</label>
        <input id="name" name="name" required className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-medium">E-mail</label>
        <input id="contact-email" name="contact-email" type="email" required className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="subject" className="text-sm font-medium">Objet</label>
        <select id="subject" name="subject" className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm">
          <option>Commande</option>
          <option>Livraison</option>
          <option>Produit / conseil</option>
          <option>Retour</option>
          <option>Autre</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium">Message</label>
        <textarea id="message" name="message" rows={5} required className="mt-1 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm" />
      </div>
      {message && <p className="text-sm text-shifaa-green">{message}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
