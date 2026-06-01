export interface UniversStep {
  title: string;
  description: string;
  tip?: string;
}

export interface UniversProduct {
  name: string;
  brand: string;
  slug: string;
  role: string;
  price?: string;
}

export interface Univers {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  intro: string;
  whoFor: string[];
  steps: UniversStep[];
  products: UniversProduct[];
  avoid: string[];
  faq: Array<{ q: string; a: string }>;
  relatedUniverses: string[];
}

export const UNIVERS: Univers[] = [
  {
    slug: "peau-seche",
    title: "Guide peau sèche",
    subtitle: "Retrouver le confort et l'éclat",
    icon: "💧",
    color: "blue",
    intro: "La peau sèche manque de lipides et perd son eau trop rapidement. Elle tire, squame et réagit au moindre stimulus. Avec les bons actifs et les bons gestes, on peut restaurer sa barrière cutanée durablement.",
    whoFor: ["Tiraillements après la douche", "Peau qui squame ou pèle", "Sensations d'inconfort au vent ou au froid", "Peau terne et sans éclat"],
    steps: [
      {
        title: "1. Nettoyage doux",
        description: "Privilégiez un syndet (pain surgras) ou un gel crème sans sulfate. L'eau trop chaude aggrave la sécheresse — douche tiède recommandée.",
        tip: "Avène Xeracalm A.D Gel Nettoyant, CeraVe Crème Lavante",
      },
      {
        title: "2. Application immédiate après la douche",
        description: "Sur peau encore légèrement humide, appliquez votre crème pour piéger l'eau. Attendez 2 minutes maximum après séchage.",
        tip: "C'est le secret le moins connu : l'application sur peau humide double l'efficacité de l'hydratation.",
      },
      {
        title: "3. Crème riche en céramides",
        description: "Les céramides reconstituent la barrière lipidique. Associés à l'urée (5-10%) et à l'acide hyaluronique, ils offrent une hydratation profonde et longue durée.",
        tip: "CeraVe Crème Hydratante, Avène XeraCalm, Uriage Xémose",
      },
      {
        title: "4. Baume corps pour les zones très sèches",
        description: "Coudes, talons, genoux : ces zones nécessitent un baume plus occlusif appliqué le soir sous chaussettes.",
        tip: "Eucerin UreaRepair Plus 10% Urea, Avène Cicalfate+",
      },
    ],
    products: [
      { name: "CeraVe Crème Hydratante", brand: "CeraVe", slug: "cerave-creme-hydratante", role: "Hydratation quotidienne visage + corps", price: "2 500 DZD" },
      { name: "Avène XeraCalm A.D Émollient", brand: "Avène", slug: "avene-xeracalm-emollient", role: "Peau atopique et très sèche", price: "3 800 DZD" },
      { name: "Uriage Xémose Crème", brand: "Uriage", slug: "uriage-xemose-creme", role: "Sécheresse intense et chronique", price: "3 200 DZD" },
      { name: "Eucerin UreaRepair 10%", brand: "Eucerin", slug: "eucerin-urearepair-10", role: "Zones très sèches, talons, coudes", price: "2 800 DZD" },
    ],
    avoid: ["Savons solides classiques (pH trop alcalin)", "Produits avec alcool en début de liste", "Eau chaude prolongée", "Exfoliants agressifs sur peau desséchée"],
    faq: [
      { q: "Combien de fois par jour appliquer sa crème ?", a: "Au minimum matin et soir. Après chaque lavage des mains si la peau est très sèche. Plus l'application est fréquente, meilleur est le résultat." },
      { q: "La peau sèche et la peau déshydratée, c'est la même chose ?", a: "Non. La peau sèche est un type de peau (manque de lipides, permanent). La peau déshydratée est un état passager (manque d'eau, qui peut toucher tous les types de peau)." },
      { q: "Peut-on avoir la peau sèche et des boutons ?", a: "Oui. Il faut dans ce cas utiliser des produits non comédogènes et éviter les textures trop grasses sur les zones à boutons." },
    ],
    relatedUniverses: ["peau-sensible", "eczema-atopie", "anti-age"],
  },
  {
    slug: "peau-acneique",
    title: "Guide peau acnéique",
    subtitle: "Assainir sans agresser",
    icon: "🌿",
    color: "green",
    intro: "L'acné résulte d'un excès de sébum, d'une hyperkératinisation et d'une prolifération bactérienne. La bonne nouvelle : des soins ciblés permettent de réduire visiblement les imperfections en 4 à 8 semaines.",
    whoFor: ["Boutons inflammatoires (rouges, douloureux)", "Points noirs et comédons", "Pores dilatés", "Excès de brillance en milieu de journée", "Cicatrices post-acné"],
    steps: [
      {
        title: "1. Nettoyage 2x/jour sans agresser",
        description: "Un nettoyant doux matin et soir suffit. Nettoyer trop fréquemment ou trop agressivement stimule la production de sébum.",
        tip: "SVR Sebiaclear Gel Moussant, La Roche-Posay Effaclar Gel",
      },
      {
        title: "2. Exfoliation douce 2-3x/semaine",
        description: "L'acide salicylique (BHA, 0,5-2%) dissout les bouchons sébacés de l'intérieur du pore. À utiliser le soir uniquement.",
        tip: "La Roche-Posay Effaclar Sérum, SVR Sebiaclear Sérum",
      },
      {
        title: "3. Hydratation légère non comédogène",
        description: "Peau acnéique = peau qui a quand même besoin d'hydratation. Une texture gel-crème non comédogène évite l'effet rebond sébacé.",
        tip: "Bioderma Sébium Hydra, La Roche-Posay Effaclar Mat",
      },
      {
        title: "4. SPF non comédogène obligatoire",
        description: "Le soleil aggrave les cicatrices et les taches post-acné. Un SPF 50 fluide et non comédogène est indispensable le matin.",
        tip: "La Roche-Posay Anthelios UVMUNE 400 Fluide, SVR Sun Secure",
      },
      {
        title: "5. Traitement ciblé sur les boutons",
        description: "Sur les boutons isolés, appliquez une nuit un produit à la niacinamide 10% ou un gel anti-imperfection à l'acide azélaïque.",
        tip: "Évitez de percer les boutons — cela aggrave l'inflammation et les cicatrices.",
      },
    ],
    products: [
      { name: "Effaclar Duo+M", brand: "La Roche-Posay", slug: "effaclar-duo-plus", role: "Traitement anti-imperfections quotidien", price: "3 500 DZD" },
      { name: "Sébium Global", brand: "Bioderma", slug: "sebium-global", role: "Acné légère à modérée", price: "3 200 DZD" },
      { name: "Sebiaclear Sérum", brand: "SVR", slug: "sebiaclear-serum", role: "Sérum anti-récidive et anti-marques", price: "2 800 DZD" },
      { name: "Niacinamide 10% + Zinc 1%", brand: "Laboratoire", slug: "niacinamide-10-zinc", role: "Sébum control et anti-inflammatoire", price: "1 800 DZD" },
    ],
    avoid: ["Alcool pur en toner (dessèche et provoque un rebond)", "Huiles comédogènes (coco, lin)", "Gommages physiques abrasifs", "Toucher le visage fréquemment"],
    faq: [
      { q: "Faut-il éviter l'hydratation avec la peau grasse ?", a: "Absolument pas. Une peau déshydratée produit encore plus de sébum pour se protéger. L'hydratation légère est indispensable même pour les peaux grasses." },
      { q: "Combien de temps avant de voir des résultats ?", a: "Les premiers résultats (réduction de brillance, moins de nouveaux boutons) apparaissent en 2 à 4 semaines. Pour les cicatrices et taches, comptez 2 à 3 mois de régularité." },
      { q: "Peut-on utiliser le rétinol sur l'acné ?", a: "Oui, le rétinol est très efficace sur l'acné (normalise le renouvellement cellulaire). Introduisez-le progressivement, 2 fois/semaine, le soir uniquement avec SPF obligatoire le matin." },
    ],
    relatedUniverses: ["peau-grasse", "cicatrices-taches", "anti-age"],
  },
  {
    slug: "anti-age",
    title: "Guide anti-âge",
    subtitle: "Prévenir et corriger en douceur",
    icon: "✨",
    color: "purple",
    intro: "Le vieillissement cutané est influencé à 80% par les UV et le mode de vie. Une bonne routine anti-âge n'est pas complexe — elle repose sur 3 piliers : protection solaire, vitamine C et rétinol.",
    whoFor: ["Premières rides d'expression", "Perte de fermeté et d'élasticité", "Teint terne et irrégulier", "Taches brunes (hyperpigmentation)", "Cou et décolleté relâchés"],
    steps: [
      {
        title: "Matin 1 : Nettoyage doux",
        description: "Un nettoyant gel ou lait pour éliminer les impuretés sans agresser. Pas besoin d'être agressif le matin.",
      },
      {
        title: "Matin 2 : Vitamine C",
        description: "La vitamine C (L-ascorbique 10-20%) est l'anti-âge le plus documenté scientifiquement. Elle stimule le collagène, unifie le teint et renforce l'effet du SPF.",
        tip: "Appliquez 5 gouttes sur visage sec avant la crème. La formule doit être dans un flacon opaque pour éviter l'oxydation.",
      },
      {
        title: "Matin 3 : SPF 50+ (non négociable)",
        description: "C'est le soin anti-âge le plus efficace qui existe. Aucune crème anti-ride ne peut compenser l'absence de protection solaire.",
        tip: "Avène SPF 50+ Minéral, La Roche-Posay Anthelios Invisible Fluid",
      },
      {
        title: "Soir 1 : Démaquillage complet",
        description: "Les résidus de pollution et maquillage accélèrent le vieillissement. Double nettoyage (huile puis gel) pour les utilisatrices de maquillage.",
      },
      {
        title: "Soir 2 : Rétinol (2-3x/semaine)",
        description: "Le rétinol est l'ingrédient anti-âge le plus prouvé. Il stimule le collagène, accélère le renouvellement cellulaire et estompe les taches. Commencez par 0,1%, passez à 0,3% puis 0,5% progressivement.",
        tip: "Toujours sur peau parfaitement sèche, 20 minutes après le nettoyage. Jamais en même temps que les AHA/BHA.",
      },
      {
        title: "Soir 3 : Crème hydratante riche",
        description: "Une nuit hydratante booste la régénération cellulaire naturelle (qui se produit pendant le sommeil). Cherchez des peptides, acide hyaluronique et niacinamide.",
      },
    ],
    products: [
      { name: "Rétinol 0.3% + Vitamine E", brand: "SVR", slug: "svr-retinol-0-3", role: "Rétinol tolérance progressive", price: "3 500 DZD" },
      { name: "Anthelios Age Correct SPF50", brand: "La Roche-Posay", slug: "anthelios-age-correct", role: "SPF + anti-âge en une application", price: "4 200 DZD" },
      { name: "Liftactiv B3 Sérum", brand: "Vichy", slug: "vichy-liftactiv-b3", role: "Taches + rides + fermeté", price: "3 800 DZD" },
      { name: "Hyalu B5 Sérum", brand: "La Roche-Posay", slug: "hyalu-b5-serum", role: "Acide hyaluronique + repulpant", price: "3 200 DZD" },
    ],
    avoid: ["Stress chronique (accélère le vieillissement)", "Tabac (principal facteur de vieillissement prématuré)", "Exposition solaire sans protection", "Changer de routine trop souvent (empêche de voir les résultats)"],
    faq: [
      { q: "À partir de quel âge commencer l'anti-âge ?", a: "La prévention commence à 25 ans : SPF quotidien et vitamine C suffisent. Le rétinol peut être introduit dès 30 ans. Plus tôt on commence, meilleurs sont les résultats à long terme." },
      { q: "Les crèmes anti-rides fonctionnent-elles vraiment ?", a: "Certains actifs ont des preuves solides : rétinol, vitamine C, acide hyaluronique, peptides, niacinamide. Les résultats sont progressifs (6 à 12 semaines) et nécessitent une utilisation régulière." },
      { q: "Peut-on utiliser la vitamine C et le rétinol ensemble ?", a: "Pas en même temps. Vitamine C le matin (avec SPF), rétinol le soir. Ils s'annulent mutuellement si appliqués simultanément." },
    ],
    relatedUniverses: ["peau-seche", "taches-uniformite", "yeux-cernes"],
  },
  {
    slug: "bebe-naissance",
    title: "Guide bébé 0-6 mois",
    subtitle: "Les essentiels pour la peau du nourrisson",
    icon: "👶",
    color: "pink",
    intro: "La peau du nouveau-né est 5 fois plus fine que la peau adulte, son pH est encore immature et sa barrière cutanée se consolide durant les 3 premiers mois. Moins on utilise de produits, mieux c'est.",
    whoFor: ["Nouveau-nés et nourrissons 0-6 mois", "Peau réactive ou atopique", "Érythème fessier récurrent", "Parents qui souhaitent simplifier la routine"],
    steps: [
      {
        title: "1. Toilette du change : l'essentiel",
        description: "Eau tiède + coton pour les nouveau-nés. À partir de 3 semaines, les lingettes sans alcool ni parfum sont pratiques. Séchez en tamponnant (jamais en frottant).",
        tip: "Mustela Lingettes Dermo-Calmantes, Pampers Sensitive",
      },
      {
        title: "2. Crème change préventive systématique",
        description: "Appliquez à chaque change une couche fine de crème barrière pour protéger de l'humidité. Le zinc oxyde est l'actif de référence.",
        tip: "Mustela Crème Change 1 2 3, Bepanthen Pommade",
      },
      {
        title: "3. Bain : max 15 minutes",
        description: "Bain quotidien non obligatoire avant 1 mois. Utilisez un syndet surgras (sans savon) à pH neutre. Température 37°C.",
        tip: "Avène Cold Cream Pain Surgras, Mustela Gel Lavant",
      },
      {
        title: "4. Hydratation corps si peau sèche",
        description: "Uniquement si la peau est sèche ou atopique. Évitez les huiles végétales pures sur le visage avant 3 mois (risque d'occlusion).",
        tip: "CeraVe Crème Lavante, Avène Cold Cream Corps",
      },
    ],
    products: [
      { name: "Mustela Crème Change 1 2 3", brand: "Mustela", slug: "mustela-creme-change", role: "Protection change systématique", price: "1 800 DZD" },
      { name: "Avène Cold Cream Corps Bébé", brand: "Avène", slug: "avene-cold-cream-bebe", role: "Hydratation peau sèche nourrisson", price: "2 200 DZD" },
      { name: "Mustela Gel Lavant Doux", brand: "Mustela", slug: "mustela-gel-lavant", role: "Nettoyage corps et cheveux", price: "1 600 DZD" },
      { name: "Bepanthen Pommade Protectrice", brand: "Bepanthen", slug: "bepanthen-pommade", role: "Érythème fessier léger", price: "1 400 DZD" },
    ],
    avoid: ["Huiles essentielles (contre-indiquées avant 6 ans)", "Parfums et colorants artificiels", "Talc (risque inhalation)", "Produits adultes même naturels", "Alcool sous toutes ses formes"],
    faq: [
      { q: "Faut-il hydrater la peau du bébé tous les jours ?", a: "Seulement si la peau est sèche ou atopique. Un bébé à peau normale ne nécessite pas de crème corps quotidienne. Sur-hydrater peut perturber la flore cutanée naturelle." },
      { q: "Quand consulter un dermatologue pour le bébé ?", a: "Si l'érythème persiste plus de 48h malgré le traitement, si des plaques rouges apparaissent sur le corps (eczéma), ou si la peau saigne ou suinte." },
      { q: "Peut-on utiliser de l'huile d'amande douce ?", a: "À éviter avant 3 mois. Après, elle peut être utilisée ponctuellement pour le massage. Préférez les produits formulés pour bébé qui ont été testés sous contrôle dermatologique." },
    ],
    relatedUniverses: ["eczema-atopie", "peau-seche", "hygiene-bebe"],
  },
  {
    slug: "cheveux-chute",
    title: "Guide chute de cheveux",
    subtitle: "Comprendre et agir efficacement",
    icon: "💆",
    color: "amber",
    intro: "Perdre 50 à 100 cheveux par jour est normal. Au-delà, ou si la densité diminue visiblement, il faut agir. La chute peut être saisonnière, post-partum, liée au stress ou à une carence — le traitement dépend de la cause.",
    whoFor: ["Cheveux qui tombent en grande quantité", "Perte de densité ou zones clairsemées", "Chute post-accouchement ou post-stress", "Cheveux fins qui manquent de volume"],
    steps: [
      {
        title: "1. Identifier le type de chute",
        description: "Chute saisonnière (automne/printemps) : temporaire, dure 6-8 semaines. Effluvium télogène (stress, carence, post-partum) : nécessite de traiter la cause. Alopécie androgénétique : traitement long terme.",
        tip: "En cas de doute, un bilan sanguin chez le médecin est recommandé (ferritine, thyroïde, vitamine D).",
      },
      {
        title: "2. Shampoing anti-chute doux",
        description: "Utiliser un shampoing stimulant du cuir chevelu (caféine, quinine, complexe vitaminé) 3 fois par semaine. Massage du cuir chevelu 3 minutes à chaque lavage.",
        tip: "Vichy Dercos Anti-Chute, Ducray Anaphase+, Kérastase Spécifique",
      },
      {
        title: "3. Compléments alimentaires ciblés",
        description: "Biotine, fer chélaté, zinc, vitamine D3 et acides aminés soufrés pendant 3 mois minimum. L'effet est visible seulement après 3 mois de traitement régulier.",
        tip: "Resultats visibles après 90 jours — la patience est obligatoire.",
      },
      {
        title: "4. Lotion ou sérum actif",
        description: "Les lotions capillaires à appliquer directement sur le cuir chevelu (pas rincer) concentrent les actifs là où ils sont nécessaires. À appliquer matin ou soir.",
        tip: "Vichy Dercos Aminexil, Ducray Anacaps Lotion",
      },
    ],
    products: [
      { name: "Dercos Anti-Chute Shampooing", brand: "Vichy", slug: "vichy-dercos-anti-chute", role: "Shampoing fortifiant quotidien", price: "2 800 DZD" },
      { name: "Ducray Anaphase+ Shampooing", brand: "Ducray", slug: "ducray-anaphase-plus", role: "Complément chute diffuse", price: "2 600 DZD" },
      { name: "Aminexil Clinical 5 Lotion", brand: "Vichy", slug: "vichy-aminexil-clinical-5", role: "Lotion anti-chute intensive", price: "4 200 DZD" },
      { name: "Hair Booster Compléments", brand: "Laboratoire", slug: "hair-booster-complements", role: "Biotine + zinc + kératine 3 mois", price: "3 000 DZD" },
    ],
    avoid: ["Coiffage trop serré (queue de cheval serrée)", "Chaleur excessive (lisseur, sèche-cheveux puissance max)", "Carences nutritionnelles prolongées", "Stress chronique non géré"],
    faq: [
      { q: "La chute post-partum est-elle normale ?", a: "Absolument. L'effluvium télogène post-partum touche 40-50% des femmes entre 2 et 5 mois après l'accouchement. Les cheveux repoussent seuls en 6-12 mois, mais les compléments accélèrent le processus." },
      { q: "Le shampoing anti-chute fonctionne-t-il seul ?", a: "Non, il représente 20% du traitement. Les compléments alimentaires et la lotion topique sont les piliers principaux. L'alimentation (protéines, fer, oméga-3) joue aussi un rôle clé." },
      { q: "Faut-il arrêter le traitement une fois les cheveux revenus ?", a: "Pour la chute saisonnière : oui. Pour l'alopécie androgénétique : le traitement est continu, car la chute reprend à l'arrêt." },
    ],
    relatedUniverses: ["stress-bien-etre", "alimentation-complements", "cheveux-secs"],
  },
];

export function getUniverBySlug(slug: string): Univers | undefined {
  return UNIVERS.find((u) => u.slug === slug);
}

export const UNIVERS_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700" },
  green:  { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",badge: "bg-emerald-100 text-emerald-700" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
  pink:   { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200",   badge: "bg-pink-100 text-pink-700" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  badge: "bg-amber-100 text-amber-700" },
};
