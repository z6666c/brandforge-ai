"use client";
import type { BrandIdentity, ContactInfo, InvoiceData } from "@/lib/types";
import { bestTextOn } from "@/lib/color";
import { fontStack } from "@/lib/fonts";
import { qrSvg, zatcaTlv } from "@/lib/qr";
import { LockupBox, money, PRINT_SPECS, Sheet } from "./kit";
import { SvgBox } from "../ui/primitives";

interface P { identity: BrandIdentity; contact: ContactInfo; invoice: InvoiceData; guides?: boolean; printId?: string }

export function invoiceTotals(inv: InvoiceData) {
  const subtotal = inv.items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0);
  const vat = subtotal * inv.vatRate;
  return { subtotal, vat, total: subtotal + vat };
}

export function Invoice({ identity, contact, invoice, guides, printId }: P) {
  const p = identity.palette;
  const t = identity.typography;
  const { subtotal, vat, total } = invoiceTotals(invoice);
  const onPrimary = bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex);
  const body = { fontFamily: fontStack(t.arabicBody), color: p.neutralDark.hex };
  const num = { fontFamily: fontStack(t.englishBody), direction: "ltr" as const, unicodeBidi: "isolate" as const };
  const qr = qrSvg(
    zatcaTlv(identity.metadata.brandName, contact.vatNumber, `${invoice.date}T09:00:00Z`, total.toFixed(2), vat.toFixed(2)),
    { fg: p.neutralDark.hex, border: 0, ecc: "M" },
  );
  const M = 16;
  const box = (title: string, lines: [string, string][]) => (
    <div style={{ flex: 1, border: `0.3mm solid ${p.neutralDark.hex}1f`, borderRadius: "2mm", padding: "4mm 5mm" }}>
      <div style={{ fontSize: "8pt", fontWeight: 700, color: p.secondary.hex, marginBottom: "2mm" }}>{title}</div>
      {lines.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: "2mm", fontSize: "8.5pt", lineHeight: 1.75 }}>
          <span style={{ opacity: 0.6, minWidth: "22mm" }}>{k}</span>
          <span style={/^[\d\s+-]+$/.test(v) ? num : undefined}>{v}</span>
        </div>
      ))}
    </div>
  );
  return (
    <Sheet spec={PRINT_SPECS.invoice} bg="#FFFFFF" guides={guides} printId={printId}>
      <div style={{ position: "absolute", inset: 0, ...body }}>
        <div style={{ height: "4mm", background: p.primary.hex }} />
        <div style={{ padding: `10mm ${M}mm 0`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <LockupBox identity={identity} layout="horizontal" heightMm={16} showTagline={false} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: fontStack(t.arabicHeading), fontWeight: 700, fontSize: "18pt", color: p.primary.hex, lineHeight: 1.2 }}>فاتورة ضريبية</div>
            <div style={{ fontFamily: fontStack(t.englishHeading), fontSize: "9pt", letterSpacing: "0.2em", opacity: 0.55 }}>TAX INVOICE</div>
            <div style={{ marginTop: "3mm", fontSize: "8.5pt", lineHeight: 1.8 }}>
              <div>رقم الفاتورة: <span style={num}>{invoice.number}</span></div>
              <div>تاريخ الإصدار: <span style={num}>{invoice.date}</span></div>
            </div>
          </div>
        </div>

        <div style={{ padding: `8mm ${M}mm 0`, display: "flex", gap: "5mm" }}>
          {box("بيانات المورّد", [["الاسم", identity.metadata.brandName], ["الرقم الضريبي", contact.vatNumber], ["السجل التجاري", contact.crNumber], ["العنوان", contact.address]])}
          {box("بيانات العميل", [["الاسم", invoice.clientName], ["الرقم الضريبي", invoice.clientVat], ["العنوان", invoice.clientAddress]])}
        </div>

        <div style={{ padding: `8mm ${M}mm 0` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: p.primary.hex, color: onPrimary }}>
                {["#", "الوصف", "الكمية", "سعر الوحدة", "الإجمالي"].map((h, i) => (
                  <th key={h} style={{ padding: "2.6mm 3mm", textAlign: i === 1 ? "right" : "center", fontWeight: 600, width: i === 1 ? "auto" : i === 0 ? "9mm" : "26mm" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, i) => (
                <tr key={it.id} style={{ background: i % 2 ? p.neutralLight.hex : "#FFFFFF", borderBottom: `0.2mm solid ${p.neutralDark.hex}14` }}>
                  <td style={{ padding: "2.4mm 3mm", textAlign: "center", ...num }}>{i + 1}</td>
                  <td style={{ padding: "2.4mm 3mm" }}>{it.description}</td>
                  <td style={{ padding: "2.4mm 3mm", textAlign: "center", ...num }}>{it.qty}</td>
                  <td style={{ padding: "2.4mm 3mm", textAlign: "center", ...num }}>{money(Number(it.unitPrice) || 0)}</td>
                  <td style={{ padding: "2.4mm 3mm", textAlign: "center", ...num, fontWeight: 600 }}>{money((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6mm", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "8mm", alignItems: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "28mm", height: "28mm", borderRadius: "50%", border: `0.4mm dashed ${p.secondary.hex}88`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8pt", color: p.secondary.hex }}>
                  الختم الرسمي
                </div>
              </div>
              <div style={{ width: "42mm", fontSize: "8pt" }}>
                <div style={{ borderBottom: `0.3mm solid ${p.neutralDark.hex}55`, height: "12mm" }} />
                <div style={{ marginTop: "1.5mm", opacity: 0.6 }}>التوقيع المعتمد</div>
              </div>
            </div>
            <div style={{ width: "72mm", fontSize: "9pt" }}>
              {[["المجموع قبل الضريبة", subtotal], [`ضريبة القيمة المضافة (${Math.round(invoice.vatRate * 100)}%)`, vat]].map(([k, v]) => (
                <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "2mm 3mm", borderBottom: `0.2mm solid ${p.neutralDark.hex}14` }}>
                  <span style={{ opacity: 0.75 }}>{k}</span>
                  <span style={num}>{money(v as number)} {invoice.currency}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3mm", marginTop: "2mm", background: p.neutralDark.hex, color: p.neutralLight.hex, borderRadius: "1.5mm", fontWeight: 700 }}>
                <span>الإجمالي المستحق</span>
                <span style={{ ...num, color: p.accent.hex }}>{money(total)} {invoice.currency}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "22mm", left: `${M}mm`, display: "flex", alignItems: "center", gap: "3mm" }}>
          <SvgBox svg={qr} style={{ width: "24mm", height: "24mm" }} />
          <div style={{ fontSize: "7pt", opacity: 0.6, maxWidth: "38mm", lineHeight: 1.6 }}>رمز الاستجابة السريعة للفاتورة الإلكترونية (هيئة الزكاة والضريبة والجمارك)</div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "12mm", background: p.primary.hex, color: onPrimary, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${M}mm`, fontSize: "7.5pt" }}>
          <span style={num}>{contact.phone}</span>
          <span style={num}>{contact.email}</span>
          <span style={num}>{contact.website}</span>
        </div>
      </div>
    </Sheet>
  );
}
