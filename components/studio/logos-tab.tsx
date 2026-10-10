"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Check, Download, Plus, RefreshCw } from "lucide-react";
import { useBrand } from "@/store/brand-store";
import { iconSvg, faviconSvg, symbolInner, colorsOf } from "@/lib/logo/render";
import { FAMILY_LABEL, compositionSpace } from "@/lib/logo";
import { readName } from "@/lib/logo/name-families";
import { AiTrial } from "./ai-trial";
import { logoFiles, slugName } from "@/lib/export/package";
import { downloadBlob } from "@/lib/export/raster";
import { useLockup } from "../hooks";
import { Button, Card, cn, SectionTitle, SvgBox } from "../ui/primitives";
import { exportNodePng } from "./exporter";

function downloadSvg(name: string, svg: string) {
  downloadBlob(new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svg}`], { type: "image/svg+xml" }), name);
}

function Tile({
  title, bg, children, svgFile, pngId, checker,
}: { title: string; bg: string; children: React.ReactNode; svgFile?: string; pngId?: string; checker?: boolean }) {
  const identity = useBrand((s) => s.identity)!;
  const slug = slugName(identity);
  return (
    <Card className="group overflow-hidden">
      <div className={cn("flex h-48 items-center justify-center p-6", checker && "checker")} style={{ background: checker ? undefined : bg }}>
        {children}
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex gap-1">
          {svgFile && (
            <button
              onClick={() => downloadSvg(`${slug}_${svgFile}`, (logoFiles(identity) as Record<string, string>)[svgFile])}
              className="rounded-md px-2 py-1 font-latin text-xs font-semibold text-muted hover:bg-ink/5 hover:text-ink"
            >
              SVG
            </button>
          )}
          {pngId && (
            <button
              onClick={() => exportNodePng(pngId, `${slug}_${svgFile?.replace(".svg", "") ?? pngId}.png`).catch(() => {})}
              className="rounded-md px-2 py-1 font-latin text-xs font-semibold text-muted hover:bg-ink/5 hover:text-ink"
            >
              PNG
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ConceptCard({ i }: { i: number }) {
  const identity = useBrand((s) => s.identity)!;
  const select = useBrand((s) => s.selectConcept);
  const c = identity.concepts[i];
  const active = identity.selectedConcept === i;
  const lk = useLockup(identity, "horizontal", "color", { conceptIndex: i, showTagline: false });
  return (
    <motion.button
      layout
      onClick={() => select(i)}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-white text-right transition-all",
        active ? "border-ink shadow-[0_0_0_3px_var(--color-ink)]" : "border-line hover:border-ink/40",
      )}
    >
      {active && (
        <span className="absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      <div className="flex h-44 items-center justify-center p-6" style={{ background: identity.palette.neutralLight.hex }}>
        <SvgBox svg={lk.svg} style={{ height: 76, width: (76 * lk.width) / lk.height, maxWidth: "100%" }} />
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-latin text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
          <span className="font-display font-semibold">{c.title}</span>
          <span className="mr-auto rounded-full bg-ink/5 px-2 py-0.5 text-[11px] text-muted">{FAMILY_LABEL[c.family]}</span>
        </div>
        <p className="line-clamp-3 text-[13px] leading-relaxed text-muted">{c.rationale}</p>
      </div>
    </motion.button>
  );
}

export function LogosTab() {
  const identity = useBrand((s) => s.identity)!;
  const regenerate = useBrand((s) => s.regenerateConcepts);
  const more = useBrand((s) => s.moreConcepts);
  const input = useBrand((s) => s.input);
  const space = React.useMemo(
    () => compositionSpace(readName(identity.metadata.brandName, identity.metadata.brandNameEn, input.industry, input.industryOther)),
    [identity.metadata.brandName, identity.metadata.brandNameEn, input.industry, input.industryOther],
  );
  const p = identity.palette;
  const c = identity.concepts[identity.selectedConcept];
  const h = useLockup(identity, "horizontal");
  const v = useLockup(identity, "vertical");
  const mono = useLockup(identity, "horizontal", "mono-dark");
  const white = useLockup(identity, "horizontal", "mono-light");
  const downloadAllSvg = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    Object.entries(logoFiles(identity)).forEach(([f, svg]) => zip.file(f, `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`));
    downloadBlob(await zip.generateAsync({ type: "blob" }), `${slugName(identity)}_logos-svg.zip`);
  };
  const fit = (l: { svg: string; width: number; height: number }, hpx: number) => (
    <SvgBox svg={l.svg} style={{ height: hpx, width: (hpx * l.width) / l.height, maxWidth: "100%" }} />
  );
  return (
    <div className="space-y-8">
      <section>
        <SectionTitle
          eyebrow="Logomark Engine"
          title="مفاهيم تقرأ اسمك ونشاطك — اختر الأنسب"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={regenerate}>
                <RefreshCw className="h-4 w-4" /> مفاهيم جديدة
              </Button>
              <Button variant="outline" size="sm" onClick={more} disabled={identity.concepts.length >= 36}>
                <Plus className="h-4 w-4" /> المزيد
              </Button>
            </div>
          }
        />
        <p className="-mt-2 mb-4 text-[13px] text-muted">
          يقرأ المحرك اسمك ونوع نشاطك ويركّب كل شعار لحظة الطلب — <b className="text-ink">{space.toLocaleString("ar-SA")}</b> تركيبة مختلفة ممكنة لعلامتك، ولا يُعاد عرض تصميم سبق ظهوره.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {identity.concepts.map((_, i) => <ConceptCard key={identity.concepts[i].id + i} i={i} />)}
        </div>
        {identity.concepts.length < 36 && (
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" size="sm" onClick={more}><Plus className="h-4 w-4" /> اعرض ٦ مفاهيم أخرى غير مكررة</Button>
          </div>
        )}
      </section>

      <AiTrial identity={identity} />

      <section>
        <SectionTitle eyebrow="Assets" title="أصول الشعار المختار" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile title="الشعار الكامل — أفقي" bg="#FFFFFF" svgFile="logo-horizontal.svg" pngId="logo-h">{fit(h, 84)}</Tile>
          <Tile title="الشعار الكامل — عمودي" bg="#FFFFFF" svgFile="logo-vertical.svg" pngId="logo-v">{fit(v, 140)}</Tile>
          <Tile title="الأيقونة المستقلة" bg={p.neutralLight.hex} svgFile="icon.svg" pngId="icon">
            <SvgBox svg={iconSvg(c, p)} style={{ width: 120, height: 120 }} />
          </Tile>
          <Tile title="أحادي اللون — أسود" bg="#FFFFFF" svgFile="logo-horizontal-mono-black.svg" pngId="logo-h-mono">{fit(mono, 84)}</Tile>
          <Tile title="أحادي اللون — أبيض" bg={p.neutralDark.hex} svgFile="logo-horizontal-mono-white.svg" pngId="logo-h-white">{fit(white, 84)}</Tile>
          <Tile title="أيقونة المفضلة (Favicon)" bg="#FFFFFF" svgFile="favicon.svg" pngId="favicon" checker>
            <div className="flex items-end gap-5">
              {[96, 48, 32, 16].map((s) => <SvgBox key={s} svg={faviconSvg(c, p)} style={{ width: s, height: s }} />)}
            </div>
          </Tile>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Scale test" title="اختبار الوضوح بالمقاسات المختلفة" />
        <Card className="flex flex-wrap items-end gap-8 p-6">
          {[160, 96, 64, 40, 24, 16].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <SvgBox svg={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${symbolInner(c, colorsOf(p))}</svg>`} style={{ width: s, height: s }} />
              <span className="font-latin text-[11px] text-muted">{s}px</span>
            </div>
          ))}
        </Card>
      </section>
      <Button variant="outline" size="sm" onClick={downloadAllSvg}>
        <Download className="h-4 w-4" /> تنزيل كل ملفات SVG (ZIP)
      </Button>
    </div>
  );
}
