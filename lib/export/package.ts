"use client";
// تجميع الحزمة الكاملة (Full Brand Package ZIP)
import JSZip from "jszip";
import type { BrandIdentity, ContactInfo, InvoiceData } from "../types";
import { faviconSvg, iconSvg, lockupSvg } from "../logo/render";
import { patternSvg } from "../pattern";
import { browserMeasure } from "../measure";
import { bestTextOn, rgbString } from "../color";
import { buildPdf, type PdfPageInput } from "./pdf";
import { PRINT_PIXEL_RATIO, canvasBytes, rasterize, resizeCanvas } from "./raster";

export type GetNode = (id: string) => HTMLElement;

interface SpecLike { w: number; h: number; bleed: number }
export type PdfJobId = "businessCard" | "letterhead" | "letterheadOffice" | "envelope" | "invoice" | "manual";

export const PDF_JOBS: Record<PdfJobId, { file: string; pages: string[]; mode: "print" | "office"; jpeg?: boolean; title: string }> = {
  businessCard: { file: "business-card_90x50mm_print.pdf", pages: ["cardFront", "cardBack"], mode: "print", title: "بطاقة الأعمال" },
  letterhead: { file: "letterhead_A4_print.pdf", pages: ["letterhead"], mode: "print", jpeg: true, title: "الورق الرسمي" },
  letterheadOffice: { file: "letterhead_A4_office.pdf", pages: ["letterhead"], mode: "office", jpeg: true, title: "الورق الرسمي (مكتبي)" },
  envelope: { file: "envelope_DL_print.pdf", pages: ["envelopeFront", "envelopeBack"], mode: "print", title: "المظروف DL" },
  invoice: { file: "invoice_A4.pdf", pages: ["invoice"], mode: "office", jpeg: true, title: "الفاتورة الضريبية" },
  manual: { file: "brand-guidelines.pdf", pages: ["manual1", "manual2", "manual3"], mode: "office", jpeg: true, title: "دليل الهوية" },
};

export async function renderPdfJob(job: PdfJobId, getNode: GetNode, specs: Record<string, SpecLike>, fontKey: string, brand: string) {
  const def = PDF_JOBS[job];
  const pages: PdfPageInput[] = [];
  for (const id of def.pages) {
    const node = getNode(id);
    const canvas = await rasterize(node, PRINT_PIXEL_RATIO, fontKey);
    const s = specs[id];
    pages.push({ canvas, trimW: s.w, trimH: s.h, bleed: s.bleed, mode: def.mode, jpeg: def.jpeg, label: `${brand} - ${id}` });
  }
  return { file: def.file, bytes: await buildPdf(pages, { title: `${def.title} — ${brand}` }) };
}

export function slugName(identity: BrandIdentity) {
  const en = identity.metadata.brandNameEn?.trim();
  return (en ? en.replace(/[^a-zA-Z0-9]+/g, "-") : identity.id).replace(/^-|-$/g, "") || "brand";
}

export function logoFiles(identity: BrandIdentity) {
  const c = identity.concepts[identity.selectedConcept];
  const base = {
    concept: c, palette: identity.palette, typography: identity.typography, name: identity.metadata.brandName,
    nameEn: identity.metadata.brandNameEn, tagline: identity.metadata.tagline, measure: browserMeasure, fontMode: "file" as const,
  };
  const ft = { typography: identity.typography, fontMode: "file" as const };
  const onPrimary = bestTextOn(identity.palette.primary.hex, identity.palette.neutralLight.hex, identity.palette.neutralDark.hex);
  return {
    "logo-horizontal.svg": lockupSvg({ ...base, layout: "horizontal" }).svg,
    "logo-vertical.svg": lockupSvg({ ...base, layout: "vertical" }).svg,
    "logo-horizontal-mono-black.svg": lockupSvg({ ...base, layout: "horizontal", variant: "mono-dark" }).svg,
    "logo-horizontal-mono-white.svg": lockupSvg({ ...base, layout: "horizontal", variant: "mono-light" }).svg,
    "logo-vertical-mono-black.svg": lockupSvg({ ...base, layout: "vertical", variant: "mono-dark" }).svg,
    "logo-horizontal-reverse.svg": lockupSvg({ ...base, layout: "horizontal", variant: "reverse" }).svg,
    "icon.svg": iconSvg(c, identity.palette, ft),
    "icon-mono-black.svg": iconSvg(c, identity.palette, { ...ft, mono: "#111111" }),
    "icon-mono-white.svg": iconSvg(c, identity.palette, { ...ft, mono: "#FFFFFF" }),
    "favicon.svg": faviconSvg(c, identity.palette, 64, identity.typography, "file"),
    "pattern.svg": patternSvg(c, onPrimary, identity.palette.primary.hex, 1200, 1200, 1, 0.25, identity.typography),
    "pattern-light.svg": patternSvg(c, identity.palette.primary.hex, identity.palette.neutralLight.hex, 1200, 1200, 1, 0.18, identity.typography),
  };
}

export function identityJson(identity: BrandIdentity, contact: ContactInfo) {
  const files = logoFiles(identity);
  const { concepts, selectedConcept, ...rest } = identity;
  const concept = concepts[selectedConcept];
  return {
    ...rest,
    assets: {
      logoSvg: files["logo-horizontal.svg"],
      iconSvg: files["icon.svg"],
      monochromeSvg: files["logo-horizontal-mono-black.svg"],
      patternSvg: files["pattern-light.svg"],
    },
    logoConcept: { family: concept.family, title: concept.title, rationale: concept.rationale, seed: concept.seed },
    contact,
  };
}

export function tokensCss(identity: BrandIdentity) {
  const p = identity.palette, t = identity.typography;
  return `/* BrandForge AI — Design Tokens: ${identity.metadata.brandName} */
:root {
  --brand-primary: ${p.primary.hex};
  --brand-secondary: ${p.secondary.hex};
  --brand-accent: ${p.accent.hex};
  --brand-neutral-dark: ${p.neutralDark.hex};
  --brand-neutral-light: ${p.neutralLight.hex};
  --font-heading-ar: "${t.arabicHeading}", sans-serif;
  --font-body-ar: "${t.arabicBody}", sans-serif;
  --font-heading-en: "${t.englishHeading}", sans-serif;
  --font-body-en: "${t.englishBody}", sans-serif;
}
`;
}

function readme(identity: BrandIdentity) {
  const p = identity.palette;
  const row = (k: string, s: { hex: string; cmyk: string; pantone?: string }) => `- ${k}: ${s.hex} | ${rgbString(s.hex)} | ${s.cmyk}${s.pantone ? ` | ${s.pantone}` : ""}`;
  return `حزمة الهوية البصرية — ${identity.metadata.brandName}
أُنشئت بواسطة BrandForge AI بتاريخ ${new Date().toLocaleDateString("ar-SA-u-nu-latn")}

المحتويات:
01-logos/svg   ملفات الشعار المتجهية (أفقي، عمودي، أحادي، معكوس، الأيقونة، Favicon، النمط الزخرفي)
01-logos/png   نسخ PNG شفافة بعرض 2048 بكسل وأيقونات المفضلة 32/180/512
02-print       ملفات PDF جاهزة للمطبعة بدقة 300 DPI مع هامش قص 3 مم وعلامات القص (TrimBox/BleedBox)
               ونسخة مكتبية من الورق الرسمي بمقاس A4 الصافي، والفاتورة الضريبية
03-brand-guidelines.pdf   دليل الهوية المصغر (3 صفحات)
04-data        brand.json (بيانات الهوية الكاملة) + tokens.css (متغيرات الألوان والخطوط)
05-mockups     صور المحاكاة

الألوان:
${row("الرئيسي", p.primary)}
${row("الثانوي", p.secondary)}
${row("التمييزي", p.accent)}
${row("محايد داكن", p.neutralDark)}
${row("محايد فاتح", p.neutralLight)}

الخطوط (مجانية من Google Fonts):
العناوين العربية: ${identity.typography.arabicHeading} | النصوص العربية: ${identity.typography.arabicBody}
العناوين الإنجليزية: ${identity.typography.englishHeading} | النصوص الإنجليزية: ${identity.typography.englishBody}

ملاحظات مهمة للطباعة:
- ملفات PDF مصدّرة بنظام RGB عالي الدقة. اطلب من المطبعة التحويل إلى CMYK بملف التعريف المعتمد لديها
  (مثل ISO Coated v2 / FOGRA39) واعتمد بروفة لونية قبل الطباعة النهائية.
- قيم CMYK في هذا الملف تحويل مرجعي أولي، وقيم Pantone أقرب درجة تقريبية.
- النصوص داخل ملفات SVG تعتمد على الخطوط المذكورة؛ ثبّتها أو حوّل النص إلى مسارات (Create Outlines) قبل الإرسال للمطبعة.
`;
}

export async function buildPackage(opts: {
  identity: BrandIdentity; contact: ContactInfo; invoice: InvoiceData; getNode: GetNode; specs: Record<string, SpecLike>;
  sceneIds: string[]; onProgress: (label: string, pct: number) => void;
}): Promise<{ blob: Blob; filename: string; warnings: string[] }> {
  const { identity, contact, getNode, specs, onProgress } = opts;
  const zip = new JSZip();
  const name = slugName(identity);
  const root = zip.folder(`${name}-brand-package`)!;
  const fontKey = JSON.stringify(identity.typography);
  const warnings: string[] = [];

  onProgress("ملفات الشعار المتجهية", 5);
  const svgDir = root.folder("01-logos/svg")!;
  Object.entries(logoFiles(identity)).forEach(([f, s]) => svgDir.file(f, `<?xml version="1.0" encoding="UTF-8"?>\n${s}`));

  onProgress("نسخ PNG عالية الدقة", 12);
  const pngDir = root.folder("01-logos/png")!;
  for (const [id, file] of [["logo-h", "logo-horizontal.png"], ["logo-v", "logo-vertical.png"], ["logo-h-mono", "logo-horizontal-mono-black.png"], ["logo-h-white", "logo-horizontal-mono-white.png"], ["icon", "icon.png"]] as const) {
    const node = getNode(id);
    const canvas = await rasterize(node, 2048 / Math.max(1, node.offsetWidth), fontKey);
    pngDir.file(file, await canvasBytes(canvas));
  }
  const fav = await rasterize(getNode("favicon"), 512 / 64, fontKey);
  for (const s of [512, 180, 32]) pngDir.file(`favicon-${s}.png`, await canvasBytes(s === 512 ? fav : resizeCanvas(fav, s)));

  const jobs: [PdfJobId, string, number][] = [
    ["businessCard", "بطاقة الأعمال", 30], ["letterhead", "الورق الرسمي", 42], ["letterheadOffice", "الورق الرسمي المكتبي", 52],
    ["envelope", "المظروف", 60], ["invoice", "الفاتورة", 68], ["manual", "دليل الهوية", 76],
  ];
  const printDir = root.folder("02-print")!;
  for (const [job, label, pct] of jobs) {
    onProgress(label, pct);
    const { file, bytes } = await renderPdfJob(job, getNode, specs, fontKey, name);
    if (job === "manual") root.file("03-brand-guidelines.pdf", bytes);
    else printDir.file(file, bytes);
  }

  onProgress("بيانات الهوية", 86);
  const dataDir = root.folder("04-data")!;
  dataDir.file("brand.json", JSON.stringify(identityJson(identity, contact), null, 2));
  dataDir.file("tokens.css", tokensCss(identity));
  root.file("README.txt", readme(identity));

  onProgress("صور المحاكاة", 90);
  const mockDir = root.folder("05-mockups")!;
  for (const id of opts.sceneIds) {
    try {
      const canvas = await rasterize(getNode(id), 2, fontKey);
      mockDir.file(`${id.replace("scene-", "")}.jpg`, await canvasBytes(canvas, "image/jpeg", 0.92));
    } catch {
      warnings.push(`تعذر تصدير مشهد ${id}`);
    }
  }

  onProgress("ضغط الحزمة", 96);
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return { blob, filename: `${name}-brand-package.zip`, warnings };
}
