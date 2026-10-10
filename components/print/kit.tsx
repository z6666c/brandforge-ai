"use client";
// أدوات المطبوعات: صفحة بمقاسات ملّيمترية حقيقية + هوامش القص + أدوات الشعار والنمط
import * as React from "react";
import type { BrandIdentity, LogoConcept, Palette } from "@/lib/types";
import { symbolInner, colorsOf, type LockupLayout, type LockupVariant } from "@/lib/logo/render";
import { patternDef } from "@/lib/pattern";
import { useLockup } from "../hooks";
import { SvgBox } from "../ui/primitives";

export const PX_PER_MM = 96 / 25.4;
export const BLEED = 3;

export const PRINT_SPECS = {
  cardFront: { w: 90, h: 50, bleed: BLEED, label: "بطاقة الأعمال — الوجه الأمامي" },
  cardBack: { w: 90, h: 50, bleed: BLEED, label: "بطاقة الأعمال — الوجه الخلفي" },
  letterhead: { w: 210, h: 297, bleed: BLEED, label: "الورق الرسمي A4" },
  envelopeFront: { w: 220, h: 110, bleed: BLEED, label: "المظروف DL — الأمام" },
  envelopeBack: { w: 220, h: 110, bleed: BLEED, label: "المظروف DL — الخلف" },
  invoice: { w: 210, h: 297, bleed: 0, label: "الفاتورة الضريبية" },
  manual1: { w: 210, h: 297, bleed: 0, label: "دليل الهوية — 1" },
  manual2: { w: 210, h: 297, bleed: 0, label: "دليل الهوية — 2" },
  manual3: { w: 210, h: 297, bleed: 0, label: "دليل الهوية — 3" },
} as const;
export type PrintId = keyof typeof PRINT_SPECS;

const safeId = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "");

export function Sheet({
  spec, bg, guides, children, printId, style,
}: { spec: { w: number; h: number; bleed: number }; bg: string; guides?: boolean; children: React.ReactNode; printId?: string; style?: React.CSSProperties }) {
  const W = spec.w + spec.bleed * 2, H = spec.h + spec.bleed * 2;
  return (
    <div
      data-print-id={printId}
      style={{ width: `${W}mm`, height: `${H}mm`, position: "relative", overflow: "hidden", background: bg, direction: "rtl", ...style }}
    >
      {children}
      {guides && (
        <>
          {spec.bleed > 0 && (
            <div style={{ position: "absolute", inset: `${spec.bleed}mm`, outline: "0.25mm dashed rgba(228,87,46,0.9)", pointerEvents: "none", zIndex: 50 }} />
          )}
          <div style={{ position: "absolute", inset: `${spec.bleed + 4}mm`, outline: "0.2mm dotted rgba(30,120,200,0.7)", pointerEvents: "none", zIndex: 50 }} />
        </>
      )}
    </div>
  );
}

/** الشعار الكامل بارتفاع محدد بالملّيمتر */
export function LockupBox({
  identity, layout, variant = "color", heightMm, showTagline, style,
}: { identity: BrandIdentity; layout: LockupLayout; variant?: LockupVariant; heightMm: number; showTagline?: boolean; style?: React.CSSProperties }) {
  const l = useLockup(identity, layout, variant, { showTagline });
  return <SvgBox svg={l.svg} style={{ height: `${heightMm}mm`, width: `${(heightMm * l.width) / l.height}mm`, ...style }} />;
}

export function IconBox({
  concept, palette, mono, sizeMm, style,
}: { concept: LogoConcept; palette: Palette; mono?: string; sizeMm: number; style?: React.CSSProperties }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${symbolInner(concept, colorsOf(palette), mono)}</svg>`;
  return <SvgBox svg={svg} style={{ width: `${sizeMm}mm`, height: `${sizeMm}mm`, ...style }} />;
}

/** طبقة نمط زخرفي تملأ الحاوية */
export function PatternLayer({
  concept, color, opacity = 0.12, scale = 0.5, style,
}: { concept: LogoConcept; color: string; opacity?: number; scale?: number; style?: React.CSSProperties }) {
  const rid = safeId(React.useId());
  const id = `pt${rid}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs>${patternDef(concept, { color, id, opacity, scale })}</defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`;
  return <SvgBox svg={svg} style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }} />;
}

/** تصغير المعاينة لتلائم العرض المتاح مع إبقاء المقاس الحقيقي داخلياً */
export function FitScale({ wMm, hMm, maxH, children, className }: { wMm: number; hMm: number; maxH?: number; children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [avail, setAvail] = React.useState(600);
  React.useEffect(() => {
    if (!ref.current) return;
    // عتبة لتجنب حلقة إعادة القياس عند ظهور/اختفاء شريط التمرير
    const ro = new ResizeObserver(([e]) => {
      const w = Math.floor(e.contentRect.width);
      setAvail((prev) => (Math.abs(prev - w) > 24 || w < prev - 2 ? w : prev));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const wPx = wMm * PX_PER_MM, hPx = hMm * PX_PER_MM;
  let s = avail / wPx;
  if (maxH) s = Math.min(s, maxH / hPx);
  s = Math.min(s, 2.2);
  return (
    <div ref={ref} className={className} style={{ width: "100%" }}>
      <div style={{ width: wPx * s, height: hPx * s, margin: "0 auto", position: "relative" }}>
        <div style={{ transform: `scale(${s})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>{children}</div>
      </div>
    </div>
  );
}

export const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
