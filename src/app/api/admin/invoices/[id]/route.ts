import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// GET /api/admin/invoices/[id] — Détail facture
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*), orders(id, status, payment, wilaya, commune)")
    .eq("id", id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  return NextResponse.json({ invoice });
}

// GET /api/admin/invoices/[id]/pdf — Générer HTML facture (rendu en PDF côté client)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*), orders(id, payment, wilaya, commune, guest_name, guest_phone)")
    .eq("id", id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  // Si action=generate_pdf, retourner le HTML de la facture DGI
  if (body?.action === "generate_html") {
    const html = generateInvoiceHTML(invoice);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="facture-${invoice.invoice_number}.html"`,
      },
    });
  }

  return NextResponse.json({ invoice });
}

// ─── Générateur HTML facture DGI ──────────────────────────────────────────────
function generateInvoiceHTML(invoice: Record<string, unknown>): string {
  const items = (invoice.invoice_items as Array<Record<string, unknown>>) ?? [];
  const order = invoice.orders as Record<string, unknown> | null;
  const formatDZD = (n: number) =>
    new Intl.NumberFormat("fr-DZ", { minimumFractionDigits: 2 }).format(n) + " DZD";

  const itemRows = items.map((item) => `
    <tr>
      <td style="border:1px solid #ddd;padding:8px;">${item.name_fr ?? ""}</td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;">${item.quantity}</td>
      <td style="border:1px solid #ddd;padding:8px;text-align:right;">${formatDZD(Number(item.unit_price_ht))}</td>
      <td style="border:1px solid #ddd;padding:8px;text-align:center;">${item.tva_rate}%</td>
      <td style="border:1px solid #ddd;padding:8px;text-align:right;">${formatDZD(Number(item.total_ttc))}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoice.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; font-size: 12px; color: #1a1a1a; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #4aab3d; padding-bottom: 15px; }
    .logo { color: #4aab3d; font-size: 24px; font-weight: bold; }
    .title { text-align: right; }
    h1 { font-size: 20px; color: #193a15; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .info-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 12px; }
    .info-box h3 { color: #4aab3d; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }
    .info-box p { margin-bottom: 3px; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead { background: #4aab3d; color: white; }
    thead th { padding: 10px 8px; text-align: left; font-size: 11px; }
    tfoot td { font-weight: bold; background: #f0f9f0; }
    .total-section { max-width: 300px; margin-left: auto; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
    .total-row.final { font-size: 16px; font-weight: bold; color: #4aab3d; border-top: 2px solid #4aab3d; padding-top: 10px; }
    .legal { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 10px; color: #888; }
    .stamp { text-align: center; color: #193a15; font-size: 10px; margin-top: 20px; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Shifaa 🌿</div>
      <p style="color:#666;font-size:11px;">Parapharmacie en ligne</p>
      <p style="font-size:10px;color:#999;margin-top:4px;">
        ${invoice.seller_address}<br>
        RC: ${invoice.seller_rc} | NIF: ${invoice.seller_nif}
      </p>
    </div>
    <div class="title">
      <h1>FACTURE</h1>
      <p><strong>${invoice.invoice_number}</strong></p>
      <p style="color:#666;">Date: ${new Date(invoice.issue_date as string).toLocaleDateString("fr-DZ")}</p>
      <p style="color:#666;">Commande: ${invoice.order_id}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Vendeur</h3>
      <p><strong>Shifaa Parapharmacie</strong></p>
      <p>${invoice.seller_address}</p>
      <p>RC: ${invoice.seller_rc}</p>
      <p>NIF: ${invoice.seller_nif}</p>
    </div>
    <div class="info-box">
      <h3>Client</h3>
      <p><strong>${invoice.guest_name ?? "Client Shifaa"}</strong></p>
      <p>${order?.wilaya ?? ""}${order?.commune ? ", " + order.commune : ""}</p>
      ${invoice.guest_phone ? `<p>Tél: ${invoice.guest_phone}</p>` : ""}
      <p>Mode paiement: ${(order?.payment as string)?.toUpperCase() ?? "COD"}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th style="text-align:center;">Qté</th>
        <th style="text-align:right;">Prix HT</th>
        <th style="text-align:center;">TVA</th>
        <th style="text-align:right;">Total TTC</th>
      </tr>
    </thead>
    <tbody>${itemRows || `<tr><td colspan="5" style="padding:8px;text-align:center;border:1px solid #ddd;">Voir commande ${invoice.order_id}</td></tr>`}</tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <span>Sous-total HT</span>
      <span>${formatDZD(Number(invoice.total_ht))}</span>
    </div>
    ${Number(invoice.total_tva_9) > 0 ? `
    <div class="total-row">
      <span>TVA 9%</span>
      <span>${formatDZD(Number(invoice.total_tva_9))}</span>
    </div>` : ""}
    ${Number(invoice.total_tva_19) > 0 ? `
    <div class="total-row">
      <span>TVA 19%</span>
      <span>${formatDZD(Number(invoice.total_tva_19))}</span>
    </div>` : ""}
    ${Number(invoice.delivery_cost) > 0 ? `
    <div class="total-row">
      <span>Livraison</span>
      <span>${formatDZD(Number(invoice.delivery_cost))}</span>
    </div>` : ""}
    ${Number(invoice.discount_amount) > 0 ? `
    <div class="total-row" style="color:#e53e3e;">
      <span>Remise</span>
      <span>-${formatDZD(Number(invoice.discount_amount))}</span>
    </div>` : ""}
    ${Number(invoice.timbre_fiscal_dzd) > 0 ? `
    <div class="total-row">
      <span>Timbre fiscal (1%)</span>
      <span>${formatDZD(Number(invoice.timbre_fiscal_dzd))}</span>
    </div>` : ""}
    <div class="total-row final">
      <span>TOTAL TTC</span>
      <span>${formatDZD(Number(invoice.total_ttc))}</span>
    </div>
  </div>

  <div class="legal">
    <p>Document conforme aux dispositions de la loi algérienne n°18-05 relative au commerce électronique.</p>
    <p>TVA régie par le code des impôts directs et taxes assimilées (CIDTA) — DGI Algérie.</p>
    <p>Facture archivée pour une durée de 10 ans conformément à la réglementation fiscale algérienne.</p>
    <p>À conserver précieusement — Document non remboursable.</p>
  </div>

  <div class="stamp">
    <p>Shifaa Parapharmacie — contact@shifaa.dz — +213 7 70 70 80 90</p>
    <p>www.shifaa.dz | NIF: ${invoice.seller_nif} | RC: ${invoice.seller_rc}</p>
  </div>

  <div class="no-print" style="margin-top:20px;text-align:center;">
    <button onclick="window.print()" style="background:#4aab3d;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;">
      🖨️ Imprimer / Sauvegarder PDF
    </button>
  </div>
</body>
</html>`;
}
