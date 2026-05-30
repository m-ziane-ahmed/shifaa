export const dynamic = "force-dynamic";
export const metadata = { title: "Exports | Admin Shifaa" };

const EXPORTS = [
  {
    label: "Commandes",
    icon: "🛒",
    description: "Toutes les commandes avec statuts, clients et totaux",
    href: "/api/admin/export/orders",
    formats: ["CSV", "Excel"],
  },
  {
    label: "Produits",
    icon: "📦",
    description: "Catalogue complet avec stocks et prix",
    href: "/api/admin/export/products",
    formats: ["CSV", "Excel"],
  },
  {
    label: "Clients",
    icon: "👥",
    description: "Liste clients avec points de fidélité",
    href: "/api/admin/export/clients",
    formats: ["CSV"],
  },
  {
    label: "Stock critique",
    icon: "📋",
    description: "Produits en rupture ou stock ≤ 5",
    href: "/api/admin/export/low-stock",
    formats: ["CSV"],
  },
  {
    label: "CA par wilaya",
    icon: "🗺️",
    description: "Chiffre d'affaires ventilé par wilaya",
    href: "/api/admin/export/revenue-by-wilaya",
    formats: ["CSV"],
  },
  {
    label: "Avis approuvés",
    icon: "⭐",
    description: "Tous les avis clients approuvés",
    href: "/api/admin/export/reviews",
    formats: ["CSV"],
  },
];

export default function AdminExport() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Exports</h1>
        <p className="text-sm text-gray-500 mt-1">Téléchargez vos données au format CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORTS.map((e) => (
          <div key={e.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <span className="text-2xl">{e.icon}</span>
            <h2 className="font-medium text-gray-900 mt-2 mb-1">{e.label}</h2>
            <p className="text-xs text-gray-500 mb-4">{e.description}</p>
            <div className="flex gap-2">
              {e.formats.map((fmt) => (
                <a
                  key={fmt}
                  href={`${e.href}?format=${fmt.toLowerCase()}`}
                  className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm text-center hover:bg-gray-50 transition-colors"
                >
                  ⬇ {fmt}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-medium text-amber-800 mb-1">Export comptable mensuel</h2>
        <p className="text-sm text-amber-700 mb-3">
          Génère un rapport complet du mois sélectionné : commandes, CA, TVA fictive et détail par wilaya.
        </p>
        <form className="flex gap-3 items-center">
          <input type="month" name="month" defaultValue={new Date().toISOString().slice(0, 7)}
            className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" />
          <a href="/api/admin/export/monthly"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors">
            ⬇ Télécharger le rapport mensuel
          </a>
        </form>
      </div>
    </div>
  );
}
