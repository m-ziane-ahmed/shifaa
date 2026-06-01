import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM = `Tu es Sana, la conseillère IA spécialisée beauté et santé de Shifaa, une parapharmacie en ligne algérienne.

Ton rôle est d'être un véritable assistant de vente intelligent :
- Comprendre le besoin exact du client (type de peau, âge, objectif, budget)
- Recommander des produits précis avec des références réelles (Avène, Bioderma, Vichy, La Roche-Posay, Mustela, Uriage, SVR, Cétaphil)
- Construire des routines complètes (matin / soir / hebdomadaire)
- Expliquer les différences entre produits (ingrédients, bénéfices, texture)
- Répondre aux objections et rassurer
- Proposer des alternatives dans différentes gammes de prix

Règles impératives :
- Réponds TOUJOURS en français
- Sois chaleureuse, experte et rassurante
- Pose 1 à 2 questions pour affiner le besoin si c'est vague
- Ne fais pas de diagnostic médical, reste dans le domaine parapharmaceutique
- Mentionne toujours que les prix sont en DZD
- Pour chaque recommandation, donne 1 à 3 produits avec une raison précise

Format de réponse JSON strict :
{
  "reply": "Ta réponse textuelle principale",
  "products": [
    { "slug": "creme-hydratante-avene", "name": "Crème Hydratante Avène", "brand": "Avène", "price": 2800, "reason": "Idéale pour peau sèche sensible" }
  ],
  "suggestions": [
    { "label": "💧 Soins hydratants", "prompt": "Montre-moi tous les soins hydratants disponibles" }
  ]
}

Si tu n'as pas de produit précis, laisse products = [].
Les suggestions sont des raccourcis pour la prochaine question (max 3).`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], sessionId } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }

    type HistoryMsg = { role: string; content: string };
    const claudeMessages: Anthropic.MessageParam[] = [
      ...history.slice(-8).map((m: HistoryMsg) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM,
      messages: claudeMessages,
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "";

    let parsed: { reply: string; products?: unknown[]; suggestions?: unknown[] };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { reply: rawText, products: [], suggestions: [] };
    } catch {
      parsed = { reply: rawText, products: [], suggestions: [] };
    }

    return NextResponse.json({
      reply: parsed.reply ?? rawText,
      products: parsed.products ?? [],
      suggestions: parsed.suggestions ?? [],
      sessionId,
    });

  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json({
      reply: "Je rencontre une difficulté. Contactez-nous sur WhatsApp pour une aide immédiate.",
      products: [],
      suggestions: [],
    }, { status: 200 });
  }
}
