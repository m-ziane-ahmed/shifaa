export type FaqEntry = {
  q: string;
  a: string;
  link?: string;
  keywords: string[];
};

export const FAQ_BOT: FaqEntry[] = [
  // ── SOINS & PRODUITS ─────────────────────────────────────
  {
    q: "Conseil produit / routine soin",
    keywords: ["conseil", "conseiller", "routine", "soin", "peau", "choisir", "recommand", "quel produit", "quelle crème", "hydrat", "sécheresse", "acné", "sensible"],
    a: "Pour un conseil personnalisé, précisez votre type de peau, votre âge et votre besoin (hydratation, anti-âge, bébé…). Parcourez la boutique par catégorie ou filtrez par besoin et type de peau. Pour un avis approfondi, utilisez notre assistant IA Sana ou contactez-nous sur WhatsApp.",
    link: "/boutique",
  },
  {
    q: "Peau sèche : que choisir ?",
    keywords: ["peau sèche", "tiraillements", "desquamation", "peau qui pèle", "céramides", "urée"],
    a: "Pour la peau sèche, privilégiez des crèmes riches en céramides (Avène Cicalfate, CeraVe), en acide hyaluronique ou en urée. Appliquez sur peau légèrement humide pour maximiser l'absorption. Évitez les produits alcoolisés et les savons trop détersifs.",
    link: "/boutique?besoin=hydratation",
  },
  {
    q: "Peau grasse et acné",
    keywords: ["peau grasse", "acné", "boutons", "points noirs", "sébum", "niacinamide", "BHA"],
    a: "Pour la peau grasse et acnéique : nettoyant doux matin et soir, sérum niacinamide (SVR, Bioderma), acide salicylique (BHA) 2 à 3 fois par semaine. Évitez les crèmes trop occlusives. La nuit, une crème légère non comédogène suffit.",
    link: "/boutique?besoin=acne",
  },
  {
    q: "Protection solaire : quel SPF choisir ?",
    keywords: ["solaire", "spf", "spf50", "crème soleil", "uvb", "uva", "phototype", "bronzer"],
    a: "SPF 30 minimum pour la vie quotidienne, SPF 50+ pour exposition directe, plage ou sport. Réappliquez toutes les 2h si vous êtes dehors. Les formules minérales (oxyde de zinc, dioxyde de titane) conviennent aux peaux sensibles et aux bébés.",
    link: "/boutique?q=protection+solaire",
  },
  {
    q: "Soins anti-âge : par où commencer ?",
    keywords: ["anti-âge", "rides", "rétinol", "vitamine c", "rides", "fermeté", "collagène"],
    a: "À partir de 30 ans : SPF 50 le matin (pilier anti-âge n°1), sérum vitamine C le matin, rétinol le soir 2 à 3 fois/semaine. Introduisez le rétinol progressivement pour éviter l'irritation. Les marques Avène, Vichy et SVR proposent des gammes bien tolérées.",
    link: "/conseils/anti-age-premiers-gestes",
  },
  {
    q: "Différence entre Avène, Vichy et La Roche-Posay ?",
    keywords: ["avène", "vichy", "la roche-posay", "bioderma", "marque", "différence", "comparer"],
    a: "Avène : eau thermale apaisante, idéale peaux très sensibles et réactives. Vichy : eaux thermales volcaniques, efficace sur l'anti-âge et la chute de cheveux. La Roche-Posay : formules dermatologiques, parfaite pour peaux à problèmes (acné, eczéma, psoriasis). Bioderma : spécialiste du microbiome et de l'hygiène douce.",
    link: "/boutique",
  },

  // ── BÉBÉ & MATERNITÉ ─────────────────────────────────────
  {
    q: "Bébé et maternité",
    keywords: ["bébé", "bebe", "nourrisson", "maternité", "maternite", "couche", "lait", "allait"],
    a: "La rubrique Bébé & maternité regroupe hygiène douce, soins du change et accessoires adaptés aux tout-petits. Vérifiez toujours les précautions sur la fiche produit et demandez l'avis de votre pédiatre en cas de doute.",
    link: "/boutique?category=bebe-maternite",
  },
  {
    q: "Érythème fessier : que faire ?",
    keywords: ["érythème", "fesses bébé", "rougeurs change", "crème change", "zinc"],
    a: "À chaque change : nettoyez avec une lingette sans alcool ni parfum (Mustela, Pampers Sensitive), séchez délicatement et appliquez une crème barrière au zinc (Bépanthène, Cicalfate, Mustela Bébé). Si les rougeurs persistent plus de 48h, consultez un pédiatre.",
    link: "/boutique?q=crème+change",
  },
  {
    q: "Lingettes bébé : lesquelles choisir ?",
    keywords: ["lingette", "bébé", "nourrisson", "change", "peau sensible bébé"],
    a: "Privilégiez les lingettes sans alcool, sans parfum et sans MIT/CMIT (conservateurs irritants). Les marques Mustela, Pampers Sensitive et Weleda sont bien tolérées. Pour les nouveau-nés, les carrés de coton humidifiés restent l'option la plus douce.",
    link: "/boutique?q=lingettes+bébé",
  },

  // ── COMPLÉMENTS & BIEN-ÊTRE ──────────────────────────────
  {
    q: "Compléments et bien-être",
    keywords: ["complément", "complement", "vitamine", "minéraux", "bien-être", "immunit", "fatigue"],
    a: "Nos compléments sont des produits parapharmaceutiques autorisés, avec composition et posologie indiquées sur chaque fiche. Ils ne remplacent pas un avis médical. En cas de traitement en cours, parlez-en à un professionnel avant utilisation.",
    link: "/legal/perimetre",
  },
  {
    q: "Vitamine D : pourquoi et quelle dose ?",
    keywords: ["vitamine d", "vitamine d3", "calcium", "os", "immunité", "soleil", "carence"],
    a: "La vitamine D est souvent déficitaire en Algérie malgré l'ensoleillement (manque d'exposition directe, filtrage vestimentaire). En complément, 1 000 à 2 000 UI/jour est un apport courant. Consultez votre médecin pour un dosage sanguin avant toute supplémentation prolongée.",
    link: "/boutique?q=vitamine+D",
  },
  {
    q: "Magnésium contre le stress et la fatigue ?",
    keywords: ["magnésium", "stress", "anxiété", "fatigue", "crampes", "sommeil"],
    a: "Le magnésium marin est mieux absorbé que l'oxyde de magnésium. Dosage habituel : 300 à 400 mg/jour, à prendre avec les repas pour éviter les troubles digestifs. Associé à la vitamine B6, il améliore l'absorption. Résultats visibles après 3 à 4 semaines.",
    link: "/boutique?q=magnésium",
  },

  // ── LIVRAISON & COMMANDE ─────────────────────────────────
  {
    q: "Délais de livraison",
    keywords: ["livraison", "délai", "delai", "wilaya", "expédition", "expedition", "recevoir", "colis"],
    a: "Alger et banlieue : 24 à 48h. Grandes villes (Oran, Constantine, Annaba, Blida) : 2 à 3 jours. Autres wilayas : 3 à 5 jours ouvrés. La livraison est offerte à partir de 8 000 DZD. Paiement à la livraison disponible partout.",
    link: "/service-client/livraison",
  },
  {
    q: "Livraison à domicile ou point relais ?",
    keywords: ["domicile", "point relais", "livraison chez moi", "bureau", "yalidine", "zr express"],
    a: "Nous livrons à domicile ou en point relais selon la wilaya. Les délais et tarifs varient : consultez notre page Livraison pour le détail par zone. En cas d'absence, le livreur laisse un avis de passage et tente une seconde livraison.",
    link: "/service-client/livraison",
  },
  {
    q: "Modes de paiement",
    keywords: ["paiement", "payer", "cib", "edahabia", "carte", "espèce", "livraison", "satim", "en ligne"],
    a: "Vous pouvez régler à la livraison (espèces), ou en ligne par carte CIB / Edahabia via la passerelle Satim sécurisée. Le montant exact s'affiche avant validation. Aucune donnée bancaire n'est stockée sur notre site.",
    link: "/service-client",
  },
  {
    q: "Commande sans compte",
    keywords: ["invité", "invite", "sans compte", "inscription", "créer un compte", "compte obligatoire"],
    a: "Oui : cochez « Continuer en invité » au checkout. Indiquez nom, e-mail et téléphone pour la confirmation et le suivi. Un compte vous permet de gagner des points fidélité, accéder à votre historique et gérer vos adresses.",
    link: "/commande",
  },
  {
    q: "Suivi de commande",
    keywords: ["suivi", "suivre", "commande", "shf-", "numéro", "numero", "où en est", "statut"],
    a: "Rendez-vous sur Suivi de commande avec votre numéro SHF-… et l'e-mail utilisé lors de l'achat. Vous y verrez le statut en temps réel : confirmée, en préparation, expédiée, livrée.",
    link: "/service-client/suivi",
  },
  {
    q: "Modifier ou annuler une commande",
    keywords: ["annuler", "modifier", "changer", "commande en cours", "erreur commande"],
    a: "Une commande peut être modifiée ou annulée uniquement avant sa mise en préparation. Contactez-nous rapidement par WhatsApp avec votre numéro de commande. Après expédition, seul un retour est possible.",
    link: "/contact",
  },

  // ── RETOURS & RÉCLAMATIONS ───────────────────────────────
  {
    q: "Retours et échanges",
    keywords: ["retour", "rembours", "échange", "echange", "renvoyer", "défectueux"],
    a: "Les retours sont acceptés sous 14 jours pour tout produit non ouvert et dans son emballage d'origine. Déposez votre demande depuis Mon compte > Retours ou contactez notre service client. Le remboursement intervient sous 5 à 10 jours après réception.",
    link: "/service-client/retours",
  },
  {
    q: "Produit reçu abîmé ou incorrect",
    keywords: ["abîmé", "cassé", "mauvais produit", "erreur", "incorrect", "manquant"],
    a: "Photographiez le colis et le produit dès réception et contactez-nous par WhatsApp ou email sous 48h. Nous procédons à un échange ou remboursement immédiat selon votre préférence, sans frais supplémentaires.",
    link: "/contact",
  },

  // ── PROGRAMME FIDÉLITÉ ───────────────────────────────────
  {
    q: "Programme fidélité",
    keywords: ["fidélité", "fidelite", "points", "récompense", "recompense", "fidèle"],
    a: "Gagnez 1 point pour chaque 100 DZD dépensés. Cumulez des points aussi en laissant un avis, en parrainant un ami ou en complétant votre profil. Les niveaux Découverte → Silver → Gold → Platinum → Premium débloquent des avantages exclusifs.",
    link: "/compte/fidelite",
  },
  {
    q: "Comment utiliser mes points fidélité ?",
    keywords: ["utiliser points", "dépenser points", "récompense", "coupon", "remise points"],
    a: "Vos points s'accumulent automatiquement à chaque achat connecté. Ils sont convertibles en bons de réduction depuis Mon compte > Fidélité. 100 points = 100 DZD de réduction applicable sur votre prochaine commande.",
    link: "/compte/fidelite",
  },

  // ── DIVERS ───────────────────────────────────────────────
  {
    q: "WhatsApp et contact humain",
    keywords: ["whatsapp", "téléphone", "telephone", "appeler", "humain", "conseiller", "parler"],
    a: "Pour une réponse rapide de l'équipe : WhatsApp ou formulaire Contact (réponse sous 24–48h ouvrées). Horaires : sam.–jeu. 9h–18h. Pour un conseil beauté immédiat, notre assistante IA Sana (bouton ✨ en bas à gauche) est disponible 24h/24.",
    link: "/contact",
  },
  {
    q: "Médicaments sur ordonnance",
    keywords: ["ordonnance", "médicament", "medicament", "pharmacie", "prescription", "antibiotique"],
    a: "Non : Shifaa est une parapharmacie en ligne (hygiène, soins, compléments autorisés, accessoires). Nous ne vendons pas de médicaments sur ordonnance. Pour un traitement médical, consultez une officine habilitée.",
    link: "/legal/perimetre",
  },
  {
    q: "Codes promo",
    keywords: ["promo", "code", "réduction", "reduction", "coupon", "bienvenue", "livraison offerte"],
    a: "Saisissez votre code dans le panier avant validation. Les codes sont à usage unique sauf mention contraire. En cas de problème, vérifiez la date d'expiration et les conditions d'utilisation (montant minimum, catégorie concernée).",
    link: "/panier",
  },
  {
    q: "Produits naturels et bio",
    keywords: ["bio", "naturel", "vegan", "sans parabène", "sans sulfate", "certifié", "écologique"],
    a: "Filtrez la boutique avec les options Bio, Vegan ou Sans parabène pour afficher les produits correspondants. Les marques Acorelle, Melvita, Eau Thermale Jonzac et Weleda proposent des gammes certifiées disponibles chez Shifaa.",
    link: "/boutique?bio=1",
  },
  {
    q: "Diagnostic personnalisé gratuit",
    keywords: ["diagnostic", "test peau", "questionnaire", "routine personnalisée", "mon type de peau"],
    a: "Notre diagnostic IA est gratuit et prend moins de 2 minutes. Répondez à 4 questions sur votre peau, vos cheveux et vos objectifs — vous obtenez immédiatement une routine complète adaptée à votre profil avec les produits recommandés.",
    link: "/diagnostic",
  },
];

export const CHAT_WELCOME =
  "Bonjour 👋 Je suis l'assistant Shifaa. Je peux vous orienter sur nos soins parapharmacie, les marques, la livraison en Algérie, les paiements CIB/Edahabia ou le suivi de commande. Choisissez une suggestion ou décrivez votre besoin.";

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
  a: "Je n'ai pas identifié précisément votre demande. Reformulez en quelques mots (ex. « crème peau sèche », « paiement Edahabia ») ou utilisez notre assistante IA Sana (bouton ✨ en bas à gauche) pour un conseil personnalisé. Vous pouvez aussi contacter notre équipe directement.",
  link: "/contact",
};

function scoreEntry(input: string, entry: FaqEntry): number {
  const q = input.toLowerCase();
  let score = 0;
  if (entry.q.toLowerCase().includes(q) || q.includes(entry.q.toLowerCase().slice(0, 12))) score += 3;
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
    if (s > bestScore) { bestScore = s; best = entry; }
  }
  if (bestScore >= 2 && best) return best;
  return CHAT_FALLBACK;
}
