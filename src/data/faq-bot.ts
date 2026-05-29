export type FaqEntry = {
  q: string;
  a: string;
  link?: string;
  keywords: string[];
};

export const FAQ_BOT: FaqEntry[] = [
  {
    q: "Conseil produit / routine soin",
    keywords: [
      "conseil",
      "conseiller",
      "routine",
      "soin",
      "peau",
      "choisir",
      "recommand",
      "quel produit",
      "quelle crème",
      "hydrat",
      "sécheresse",
      "acné",
      "sensible",
    ],
    a: "Pour un conseil personnalisé, précisez votre type de peau, votre âge et votre besoin (hydratation, anti-âge, bébé, etc.). Parcourez la boutique par catégorie ou filtrez par « besoin » et « type de peau ». Nos fiches produit indiquent mode d’emploi et précautions — sans promesse médicale. Pour un avis approfondi, contactez-nous ou écrivez sur WhatsApp.",
    link: "/boutique",
  },
  {
    q: "Bébé et maternité",
    keywords: ["bébé", "bebe", "nourrisson", "maternité", "maternite", "couche", "lait", "allait"],
    a: "La rubrique Bébé & maternité regroupe hygiène douce, soins du change et accessoires adaptés aux tout-petits. Vérifiez toujours les précautions sur la fiche produit et demandez l’avis de votre pédiatre en cas de doute.",
    link: "/boutique?category=bebe-maternite",
  },
  {
    q: "Compléments et bien-être",
    keywords: ["complément", "complement", "vitamine", "minéraux", "bien-être", "immunit", "fatigue"],
    a: "Nos compléments sont des produits parapharmaceutiques autorisés, avec composition et posologie indiquées sur chaque fiche. Ils ne remplacent pas un avis médical. En cas de traitement en cours, parlez-en à un professionnel de santé avant utilisation.",
    link: "/legal/perimetre",
  },
  {
    q: "Délais de livraison",
    keywords: ["livraison", "délai", "delai", "wilaya", "expédition", "expedition", "recevoir", "colis"],
    a: "Comptez en général 2 à 5 jours ouvrés selon la wilaya, en domicile ou point relais. La livraison est offerte à partir de 8 000 DZD. Consultez le détail par zone sur notre page Livraison.",
    link: "/service-client/livraison",
  },
  {
    q: "Modes de paiement",
    keywords: ["paiement", "payer", "cib", "edahabia", "carte", "espèce", "livraison", "satim", "en ligne"],
    a: "Vous pouvez régler à la livraison (espèces), ou en ligne par carte CIB / Edahabia via la passerelle Satim sécurisée. Le montant exact s’affiche avant validation de la commande.",
    link: "/service-client",
  },
  {
    q: "Commande sans compte",
    keywords: ["invité", "invite", "sans compte", "inscription", "créer un compte", "compte obligatoire"],
    a: "Oui : cochez « Continuer en invité » au checkout. Indiquez nom, e-mail et téléphone — ils servent à la confirmation et au suivi de commande.",
    link: "/commande",
  },
  {
    q: "Suivi de commande",
    keywords: ["suivi", "suivre", "commande", "shf-", "numéro", "numero", "où en est", "statut"],
    a: "Rendez-vous sur Suivi de commande avec votre numéro SHF-… et l’e-mail utilisé lors de l’achat (compte ou invité). Vous y verrez le statut et le détail.",
    link: "/service-client/suivi",
  },
  {
    q: "Programme fidélité",
    keywords: ["fidélité", "fidelite", "points", "récompense", "recompense", "fidèle"],
    a: "En étant connecté, vous gagnez 1 point pour chaque 100 DZD dépensés. Vos points s’affichent dans Mon compte — ils pourront servir à des avantages prochainement.",
    link: "/compte",
  },
  {
    q: "Retours et échanges",
    keywords: ["retour", "rembours", "échange", "echange", "renvoyer", "défectueux"],
    a: "Les retours sont possibles sous conditions (produit non ouvert, emballage intact). Déposez une demande depuis Mon compte > Retours ou contactez le service client sous 14 jours.",
    link: "/service-client/retours",
  },
  {
    q: "WhatsApp et contact humain",
    keywords: ["whatsapp", "téléphone", "telephone", "appeler", "humain", "conseiller", "parler"],
    a: "Pour une réponse rapide d’équipe : WhatsApp ou formulaire Contact (réponse sous 24–48 h ouvrées). Horaires : sam.–jeu. 9h–18h.",
    link: "/contact",
  },
  {
    q: "Médicaments sur ordonnance",
    keywords: ["ordonnance", "médicament", "medicament", "pharmacie", "prescription", "antibiotique"],
    a: "Non : Shifaa est une parapharmacie en ligne (hygiène, soins, compléments autorisés, accessoires). Pour un traitement sur ordonnance, consultez une officine habilitée.",
    link: "/legal/perimetre",
  },
  {
    q: "Codes promo",
    keywords: ["promo", "code", "réduction", "reduction", "coupon", "bienvenue", "livraison offerte"],
    a: "Saisissez votre code dans le panier avant le checkout. Exemples indicatifs : BIENVENUE10 (−10 %), LIVRAISON0 (frais offerts selon conditions). Le montant mis à jour s’affiche immédiatement.",
    link: "/panier",
  },
];

export const CHAT_WELCOME =
  "Bonjour, je suis l’assistant Shifaa. Je peux vous orienter sur nos soins parapharmacie, la livraison en Algérie, les paiements CIB/Edahabia ou le suivi de commande. Choisissez une suggestion ci-dessous ou décrivez votre besoin en une phrase.";

export const CHAT_SUGGESTIONS = [
  "Conseil pour ma peau",
  "Délais de livraison",
  "Paiement CIB / Edahabia",
  "Suivre ma commande",
  "Parler à l'équipe",
] as const;

export const CHAT_FALLBACK: FaqEntry = {
  q: "Autre question",
  keywords: [],
  a: "Je n’ai pas identifié précisément votre demande. Reformulez en quelques mots (ex. « crème peau sèche », « paiement Edahabia ») ou contactez notre équipe : nous vous répondrons avec un vrai conseil adapté à votre situation.",
  link: "/contact",
};

function scoreEntry(input: string, entry: FaqEntry): number {
  const q = input.toLowerCase();
  let score = 0;
  if (entry.q.toLowerCase().includes(q) || q.includes(entry.q.toLowerCase().slice(0, 12))) {
    score += 3;
  }
  for (const kw of entry.keywords) {
    if (q.includes(kw)) score += 2;
    const words = q.split(/\s+/).filter((w) => w.length > 2);
    if (words.some((w) => kw.includes(w) || w.includes(kw))) score += 1;
  }
  return score;
}

export function matchFaqAnswer(input: string): FaqEntry {
  const q = input.toLowerCase().trim();
  if (!q) return CHAT_FALLBACK;

  let best: FaqEntry | null = null;
  let bestScore = 0;

  for (const entry of FAQ_BOT) {
    const s = scoreEntry(q, entry);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  if (bestScore >= 2 && best) return best;
  return CHAT_FALLBACK;
}
