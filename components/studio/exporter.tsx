"use client";
// منصة التصدير الخفية: تُركّب كل المطبوعات بمقاسها الحقيقي خارج الشاشة ثم تحوّلها إلى ملفات
import { paidGate } from "./paid-gate";
import * as React from "react";
import { create } from "zustand";
import { useBrand } from "@/store/brand-store";
import { BusinessCardBack, BusinessCardFront } from "../print/business-card";
import { Letterhead } from "../print/letterhead";
import { EnvelopeBack, EnvelopeFront } from "../print/envelope";
import { Invoice } from "../print/invoice";
import { ManualPage1, ManualPage2, ManualPage3 } from "../print/manual";
import { PRINT_SPECS } from "../print/kit";
import { SCENES } from "../mockups/scenes";
import { useLockup } from "../hooks";
import { SvgBox } from "../ui/primitives";
import { faviconSvg, iconSvg } from "@/lib/logo/render";
import { buildPackage, renderPdfJob, slugName, type GetNode, type PdfJobId } from "@/lib/export/package";
import { downloadBlob } from "@/lib/export/raster";
import type { BrandIdentity } from "@/lib/types";

interface ExportUI {
  mounted: boolean;
  busy: string | null;
  progress: number;
  set: (p: Partial<Omit<ExportUI, "set">>) => void;
}
export const useExportUI = create<ExportUI>((set) => ({ mounted: false, busy: null, progress: 0, set: (p) => set(p) }));

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

async function withStage<T>(label: string, job: (getNode: GetNode) => Promise<T>): Promise<T> {
  const ui = useExportUI.getState();
  if (ui.busy) throw new Error("هناك عملية تصدير جارية");
  ui.set({ mounted: true, busy: label, progress: 0 });
  try {
    for (let i = 0; i < 60 && !document.querySelector("[data-export-stage]"); i++) await frame();
    await document.fonts?.ready;
    await frame(); await frame();
    await new Promise((r) => setTimeout(r, 120));
    const getNode: GetNode = (id) => {
      const el = document.querySelector<HTMLElement>(`[data-export-stage] [data-print-id="${id}"]`);
      if (!el) throw new Error(`عنصر غير موجود: ${id}`);
      return el;
    };
    return await job(getNode);
  } finally {
    useExportUI.getState().set({ mounted: false, busy: null, progress: 0 });
  }
}

const SPECS = PRINT_SPECS as unknown as Record<string, { w: number; h: number; bleed: number }>;

export async function exportPdf(job: PdfJobId) {
  if (!(await paidGate("لتحميل المطبوعات PDF."))) return;
  const { identity } = useBrand.getState();
  if (!identity) return;
  const { file, bytes } = await withStage("تجهيز ملف PDF", (getNode) =>
    renderPdfJob(job, getNode, SPECS, JSON.stringify(identity.typography), slugName(identity)),
  );
  downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${slugName(identity)}_${file}`);
}

/** يعيد null إذا ما تم التحميل (لم يدفع بعد) */
export async function exportPackage(): Promise<string[] | null> {
  if (!(await paidGate("لتحميل حزمة الهوية الكاملة."))) return null;
  const { identity, contact, invoice } = useBrand.getState();
  if (!identity) return [];
  const res = await withStage("تجهيز الحزمة الكاملة", (getNode) =>
    buildPackage({
      identity, contact, invoice, getNode, specs: SPECS, sceneIds: SCENES.map((s) => `scene-${s.id}`),
      onProgress: (busy, progress) => useExportUI.getState().set({ busy, progress }),
    }),
  );
  downloadBlob(res.blob, res.filename);
  return res.warnings;
}

export async function exportNodePng(id: string, filename: string, width = 2048) {
  if (!(await paidGate("لتحميل الصور بدقة عالية."))) return;
  const { identity } = useBrand.getState();
  if (!identity) return;
  const { rasterize, canvasToBlob } = await import("@/lib/export/raster");
  const blob = await withStage("تجهيز الصورة", async (getNode) => {
    const node = getNode(id);
    const canvas = await rasterize(node, width / Math.max(1, node.offsetWidth), JSON.stringify(identity.typography));
    return canvasToBlob(canvas);
  });
  downloadBlob(blob, filename);
}

function LogoNodes({ identity }: { identity: BrandIdentity }) {
  const h = useLockup(identity, "horizontal");
  const v = useLockup(identity, "vertical");
  const hm = useLockup(identity, "horizontal", "mono-dark");
  const hw = useLockup(identity, "horizontal", "mono-light");
  const c = identity.concepts[identity.selectedConcept];
  const box = (id: string, svg: string, w: number, hh: number) => <SvgBox key={id} svg={svg} style={{ width: w, height: hh }} {...{ "data-print-id": id }} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {box("logo-h", h.svg, h.width * 2, h.height * 2)}
      {box("logo-v", v.svg, v.width * 2, v.height * 2)}
      {box("logo-h-mono", hm.svg, hm.width * 2, hm.height * 2)}
      {box("logo-h-white", hw.svg, hw.width * 2, hw.height * 2)}
      {box("icon", iconSvg(c, identity.palette), 256, 256)}
      {box("favicon", faviconSvg(c, identity.palette), 64, 64)}
    </div>
  );
}

export function ExportStage() {
  const mounted = useExportUI((s) => s.mounted);
  const identity = useBrand((s) => s.identity);
  const contact = useBrand((s) => s.contact);
  const invoice = useBrand((s) => s.invoice);
  if (!mounted || !identity) return null;
  const common = { identity, contact };
  return (
    <div aria-hidden style={{ position: "fixed", left: 0, top: 0, width: 0, height: 0, overflow: "hidden", pointerEvents: "none", zIndex: -1 }}>
    <div data-export-stage style={{ position: "absolute", left: 0, top: 0, width: 2400, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 40 }}>
      <BusinessCardFront {...common} printId="cardFront" />
      <BusinessCardBack {...common} printId="cardBack" />
      <Letterhead {...common} printId="letterhead" />
      <EnvelopeFront {...common} printId="envelopeFront" />
      <EnvelopeBack {...common} printId="envelopeBack" />
      <Invoice {...common} invoice={invoice} printId="invoice" />
      <ManualPage1 identity={identity} printId="manual1" />
      <ManualPage2 identity={identity} printId="manual2" />
      <ManualPage3 identity={identity} printId="manual3" />
      <LogoNodes identity={identity} />
      {SCENES.map(({ id, C }) => (
        <div key={id} data-print-id={`scene-${id}`} style={{ width: 960, height: 600 }}>
          <C {...common} />
        </div>
      ))}
    </div>
    </div>
  );
}

export function ExportOverlay() {
  const busy = useExportUI((s) => s.busy);
  const progress = useExportUI((s) => s.progress);
  if (!busy) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-md items-center gap-4 rounded-2xl bg-ink px-5 py-4 text-paper shadow-2xl">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-paper/30 border-t-ember" />
        <div className="flex-1">
          <div className="text-sm font-medium">{busy}…</div>
          {progress > 0 && (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper/15">
              <div className="h-full bg-ember transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
