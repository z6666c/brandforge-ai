"use client";
import * as React from "react";
import { Download, Ruler, Printer } from "lucide-react";
import { useBrand } from "@/store/brand-store";
import { BusinessCardBack, BusinessCardFront } from "../print/business-card";
import { Letterhead } from "../print/letterhead";
import { EnvelopeBack, EnvelopeFront } from "../print/envelope";
import { Invoice } from "../print/invoice";
import { ManualPage1, ManualPage2, ManualPage3 } from "../print/manual";
import { FitScale } from "../print/kit";
import { Badge, Button, Segmented } from "../ui/primitives";
import { exportPdf } from "./exporter";
import type { PdfJobId } from "@/lib/export/package";

type Piece = "card" | "letterhead" | "envelope" | "invoice" | "manual";

const META: Record<Piece, { label: string; spec: string; jobs: { id: PdfJobId; label: string }[] }> = {
  card: { label: "بطاقة الأعمال", spec: "90×50 مم + قص 3 مم", jobs: [{ id: "businessCard", label: "PDF للمطبعة (وجهان)" }] },
  letterhead: { label: "الورق الرسمي", spec: "A4 — 210×297 مم + قص 3 مم", jobs: [{ id: "letterhead", label: "PDF للمطبعة" }, { id: "letterheadOffice", label: "PDF مكتبي A4" }] },
  envelope: { label: "المظروف", spec: "DL — 220×110 مم + قص 3 مم", jobs: [{ id: "envelope", label: "PDF للمطبعة (وجهان)" }] },
  invoice: { label: "الفاتورة", spec: "A4 — 210×297 مم", jobs: [{ id: "invoice", label: "PDF" }] },
  manual: { label: "دليل الهوية", spec: "3 صفحات A4", jobs: [{ id: "manual", label: "PDF الدليل" }] },
};

function Paper({ children }: { children: React.ReactNode }) {
  return <div className="shadow-[0_2px_4px_rgba(0,0,0,.06),0_18px_40px_-12px_rgba(0,0,0,.28)]">{children}</div>;
}

export function PrintTab() {
  const identity = useBrand((s) => s.identity)!;
  const contact = useBrand((s) => s.contact);
  const invoice = useBrand((s) => s.invoice);
  const guides = useBrand((s) => s.showGuides);
  const toggleGuides = useBrand((s) => s.toggleGuides);
  const [piece, setPiece] = React.useState<Piece>("card");
  const [busy, setBusy] = React.useState(false);
  const common = { identity, contact, guides };
  const m = META[piece];

  const run = async (id: PdfJobId) => {
    setBusy(true);
    try { await exportPdf(id); } catch (e) { console.error(e); alert("تعذر إنشاء الملف: " + (e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented value={piece} onChange={setPiece} options={(Object.keys(META) as Piece[]).map((id) => ({ id, label: META[id].label }))} />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm">
            <input type="checkbox" checked={guides} onChange={toggleGuides} className="accent-ember" />
            خطوط القص والأمان
          </label>
          {m.jobs.map((j, i) => (
            <Button key={j.id} variant={i === 0 ? "primary" : "outline"} size="md" disabled={busy} onClick={() => run(j.id)}>
              <Download className="h-4 w-4" /> {j.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge><Ruler className="me-1 h-3 w-3" />{m.spec}</Badge>
        <Badge><Printer className="me-1 h-3 w-3" />300 DPI</Badge>
        {guides && (
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><i className="inline-block h-0 w-5 border-t-2 border-dashed border-ember" /> خط القص</span>
            <span className="flex items-center gap-1"><i className="inline-block h-0 w-5 border-t-2 border-dotted border-sky-600" /> منطقة الأمان</span>
          </span>
        )}
      </div>

      <div className="studio-canvas rounded-2xl p-6 md:p-10">
        {piece === "card" && (
          <div className="grid gap-8 lg:grid-cols-2">
            {[<BusinessCardFront key="f" {...common} />, <BusinessCardBack key="b" {...common} />].map((el, i) => (
              <div key={i}>
                <div className="mb-2 text-xs text-muted">{i === 0 ? "الوجه الأمامي" : "الوجه الخلفي"}</div>
                <FitScale wMm={96} hMm={56}><Paper>{el}</Paper></FitScale>
              </div>
            ))}
          </div>
        )}
        {piece === "letterhead" && <FitScale wMm={216} hMm={303} maxH={980}><Paper><Letterhead {...common} /></Paper></FitScale>}
        {piece === "envelope" && (
          <div className="space-y-8">
            <FitScale wMm={226} hMm={116}><Paper><EnvelopeFront {...common} /></Paper></FitScale>
            <FitScale wMm={226} hMm={116}><Paper><EnvelopeBack {...common} /></Paper></FitScale>
          </div>
        )}
        {piece === "invoice" && <FitScale wMm={210} hMm={297} maxH={980}><Paper><Invoice {...common} invoice={invoice} /></Paper></FitScale>}
        {piece === "manual" && (
          <div className="grid gap-6 xl:grid-cols-3">
            {[ManualPage1, ManualPage2, ManualPage3].map((P, i) => (
              <FitScale key={i} wMm={210} hMm={297}><Paper><P identity={identity} /></Paper></FitScale>
            ))}
          </div>
        )}
      </div>
      {piece === "invoice" && <p className="text-xs text-muted">يمكنك تعديل بنود الفاتورة وبيانات العميل من المحرر المباشر. رمز QR مُولّد بصيغة TLV المعتمدة للمرحلة الأولى من الفوترة الإلكترونية.</p>}
    </div>
  );
}
