"use client";
// دليل الهوية المصغر — 3 صفحات A4
import type { BrandIdentity } from "@/lib/types";
import { selectedConcept } from "@/store/brand-store";
import { bestTextOn, rgbString } from "@/lib/color";
import { fontStack } from "@/lib/fonts";
import { label } from "@/lib/labels";
import { IconBox, LockupBox, PatternLayer, PRINT_SPECS, Sheet } from "./kit";
import { useLockup } from "../hooks";
import { SvgBox } from "../ui/primitives";

interface P { identity: BrandIdentity; guides?: boolean; printId?: string }
const M = 16;

function PageFrame({ identity, page, title, children, printId, guides }: P & { page: number; title: string; children: React.ReactNode }) {
  const p = identity.palette;
  const t = identity.typography;
  return (
    <Sheet spec={PRINT_SPECS.manual1} bg="#FFFFFF" printId={printId} guides={guides}>
      <div style={{ position: "absolute", inset: 0, fontFamily: fontStack(t.arabicBody), color: p.neutralDark.hex }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `10mm ${M}mm 0`, fontSize: "8pt" }}>
          <span style={{ fontWeight: 600 }}>{identity.metadata.brandName} — دليل الهوية البصرية</span>
          <span style={{ fontFamily: fontStack(t.englishBody), opacity: 0.5 }}>0{page} / 03</span>
        </div>
        <div style={{ padding: `6mm ${M}mm 0` }}>
          <div style={{ fontFamily: fontStack(t.arabicHeading), fontWeight: 700, fontSize: "20pt", color: p.primary.hex }}>{title}</div>
          <div style={{ width: "14mm", height: "1mm", background: p.accent.hex, marginTop: "2mm" }} />
        </div>
        <div style={{ padding: `7mm ${M}mm 0` }}>{children}</div>
      </div>
    </Sheet>
  );
}

const H = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <div style={{ fontSize: "10pt", fontWeight: 700, color, margin: "0 0 3mm" }}>{children}</div>
);

export function ManualPage1({ identity, guides, printId }: P) {
  const p = identity.palette;
  const c = selectedConcept(identity);
  const onPrimary = bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex);
  const revVariant = onPrimary === p.neutralLight.hex ? "mono-light" : "mono-dark";
  const lk = useLockup(identity, "horizontal", "color", { showTagline: false });
  const ratio = parseFloat(identity.guidelines.clearSpaceRatio) || 0.5;
  const logoH = 22, iconMm = logoH * (100 / lk.height), pad = iconMm * ratio;
  return (
    <PageFrame identity={identity} page={1} title="الشعار وقصة العلامة" printId={printId} guides={guides}>
      <div style={{ fontSize: "9pt", lineHeight: 1.95, textAlign: "justify", marginBottom: "6mm" }}>{identity.strategy.brandStory}</div>
      <div style={{ display: "flex", gap: "4mm", fontSize: "8pt", marginBottom: "7mm", flexWrap: "wrap" }}>
        {[["النمط النفسي", identity.strategy.archetype], ["الأسلوب", label.style(identity.metadata.style)], ["القيم", identity.metadata.values.map(label.value).join("، ")]].map(([k, v]) => (
          <div key={k} style={{ background: p.neutralLight.hex, borderRadius: "1.5mm", padding: "2mm 3.5mm" }}>
            <span style={{ opacity: 0.6 }}>{k}: </span>
            <b>{v}</b>
          </div>
        ))}
      </div>

      <H color={p.secondary.hex}>مساحة الأمان ({identity.guidelines.clearSpaceRatio.split(" ")[0]})</H>
      <div style={{ display: "flex", justifyContent: "center", background: p.neutralLight.hex, padding: "9mm 0", marginBottom: "7mm", borderRadius: "2mm" }}>
        <div style={{ position: "relative", padding: `${pad}mm`, outline: `0.3mm dashed ${p.accent.hex}`, background: "#fff" }}>
          <LockupBox identity={identity} layout="horizontal" heightMm={logoH} showTagline={false} />
          {[{ top: 0, right: `${pad + 2}mm`, w: "3mm", h: `${pad}mm` }, { bottom: 0, left: `${pad + 2}mm`, w: "3mm", h: `${pad}mm` }].map((s, i) => (
            <div key={i} style={{ position: "absolute", top: s.top, bottom: s.bottom, right: s.right, left: s.left, width: s.w, height: s.h, borderInline: `0.3mm solid ${p.accent.hex}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6.5pt", color: p.accent.hex, fontFamily: "serif", fontStyle: "italic" }}>x</div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: "8pt", opacity: 0.75, marginTop: "-4mm", marginBottom: "7mm" }}>
        x = {ratio} من ارتفاع الرمز. الحد الأدنى للمقاس: 25 مم في الطباعة، و120 بكسل على الشاشات.
      </div>

      <H color={p.secondary.hex}>نسخ الشعار المعتمدة</H>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4mm" }}>
        {[
          { bg: "#FFFFFF", v: "color" as const, cap: "الأساسية — على الخلفيات الفاتحة", border: true },
          { bg: p.primary.hex, v: revVariant as "mono-light" | "mono-dark", cap: "المعكوسة — على اللون الرئيسي" },
          { bg: "#FFFFFF", v: "mono-dark" as const, cap: "أحادية سوداء — للطباعة بلون واحد", border: true },
          { bg: p.neutralDark.hex, v: "mono-light" as const, cap: "أحادية بيضاء — على الخلفيات الداكنة" },
        ].map((x) => (
          <div key={x.cap}>
            <div style={{ height: "30mm", background: x.bg, border: x.border ? `0.3mm solid ${p.neutralDark.hex}1a` : undefined, borderRadius: "2mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LockupBox identity={identity} layout="horizontal" variant={x.v} heightMm={13} showTagline={false} />
            </div>
            <div style={{ fontSize: "7.5pt", opacity: 0.7, marginTop: "1.5mm" }}>{x.cap}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "6mm", alignItems: "center", marginTop: "6mm" }}>
        <IconBox concept={c} palette={p} sizeMm={14} />
        <div style={{ fontSize: "8pt", lineHeight: 1.7 }}>
          <b>{c.title}:</b> {c.rationale}
        </div>
      </div>
    </PageFrame>
  );
}

export function ManualPage2({ identity, guides, printId }: P) {
  const p = identity.palette;
  const t = identity.typography;
  const sw = [
    { k: "الرئيسي", hex: p.primary.hex, cmyk: p.primary.cmyk, pan: p.primary.pantone, name: p.primary.name, share: 45 },
    { k: "الثانوي", hex: p.secondary.hex, cmyk: p.secondary.cmyk, pan: p.secondary.pantone, name: p.secondary.name, share: 20 },
    { k: "التمييزي", hex: p.accent.hex, cmyk: p.accent.cmyk, pan: p.accent.pantone, name: p.accent.name, share: 8 },
    { k: "محايد داكن", hex: p.neutralDark.hex, cmyk: p.neutralDark.cmyk, pan: "—", name: "للنصوص", share: 12 },
    { k: "محايد فاتح", hex: p.neutralLight.hex, cmyk: p.neutralLight.cmyk, pan: "—", name: "للخلفيات", share: 15 },
  ];
  const fonts = [
    { role: "العناوين العربية", name: t.arabicHeading, sample: "هوية تُرى فتُتذكَّر", w: 700, size: "18pt" },
    { role: "النصوص العربية", name: t.arabicBody, sample: "أبجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ ٠١٢٣٤٥٦٧٨٩", w: 400, size: "10.5pt" },
    { role: "العناوين الإنجليزية", name: t.englishHeading, sample: "Design that endures", w: 700, size: "18pt", ltr: true },
    { role: "النصوص الإنجليزية", name: t.englishBody, sample: "The quick brown fox jumps over the lazy dog 0123456789", w: 400, size: "10pt", ltr: true },
  ];
  return (
    <PageFrame identity={identity} page={2} title="الألوان والخطوط" printId={printId} guides={guides}>
      <H color={p.secondary.hex}>لوحة الألوان</H>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "3mm" }}>
        {sw.map((s) => (
          <div key={s.k} style={{ border: `0.3mm solid ${p.neutralDark.hex}14`, borderRadius: "2mm", overflow: "hidden" }}>
            <div style={{ height: "26mm", background: s.hex, padding: "2.5mm", color: bestTextOn(s.hex), fontSize: "7.5pt", fontWeight: 600 }}>{s.k}</div>
            <div style={{ padding: "2.5mm", fontSize: "6.8pt", lineHeight: 1.75 }}>
              <div style={{ fontWeight: 700, fontSize: "7.5pt" }}>{s.name}</div>
              <div style={{ fontFamily: fontStack(t.englishBody), direction: "ltr", textAlign: "right" }}>
                <div>{s.hex}</div>
                <div>{rgbString(s.hex)}</div>
                <div>{s.cmyk}</div>
                <div style={{ opacity: 0.7 }}>{s.pan.replace(" (تقريبي)", "≈")}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: "7.5pt", opacity: 0.7, margin: "3mm 0 2mm" }}>نسب الاستخدام المقترحة</div>
      <div style={{ display: "flex", height: "7mm", borderRadius: "1.5mm", overflow: "hidden", border: `0.3mm solid ${p.neutralDark.hex}14` }}>
        {sw.map((s) => (
          <div key={s.k} style={{ width: `${s.share}%`, background: s.hex, color: bestTextOn(s.hex), fontSize: "6.5pt", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack(t.englishBody) }}>{s.share}%</div>
        ))}
      </div>
      <div style={{ fontSize: "7pt", opacity: 0.6, marginTop: "2mm", lineHeight: 1.6 }}>
        قيم CMYK تحويل مرجعي أولي وقيم Pantone أقرب درجة تقريبية؛ يُعتمد اللون النهائي ببروفة طباعية لدى المطبعة.
      </div>

      <div style={{ marginTop: "8mm" }}>
        <H color={p.secondary.hex}>أزواج الخطوط</H>
        {fonts.map((f) => (
          <div key={f.role} style={{ display: "flex", gap: "5mm", alignItems: "center", padding: "4mm 0", borderBottom: `0.2mm solid ${p.neutralDark.hex}14` }}>
            <div style={{ width: "38mm", flexShrink: 0 }}>
              <div style={{ fontSize: "7pt", opacity: 0.6 }}>{f.role}</div>
              <div style={{ fontSize: "9pt", fontWeight: 700, fontFamily: fontStack(f.name) }}>{f.name}</div>
            </div>
            <div style={{ fontFamily: fontStack(f.name), fontWeight: f.w, fontSize: f.size, direction: f.ltr ? "ltr" : "rtl", textAlign: f.ltr ? "left" : "right", flex: 1, lineHeight: 1.4 }}>{f.sample}</div>
          </div>
        ))}
        <div style={{ fontSize: "7.5pt", opacity: 0.7, marginTop: "3mm" }}>جميع الخطوط مجانية ومتاحة عبر Google Fonts برخصة OFL.</div>
      </div>
    </PageFrame>
  );
}

export function ManualPage3({ identity, guides, printId }: P) {
  const p = identity.palette;
  const c = selectedConcept(identity);
  const lk = useLockup(identity, "horizontal", "color", { showTagline: false });
  const cell = (style: React.CSSProperties, cap: string, bg = "#FFFFFF", extra?: React.ReactNode, wrapStyle?: React.CSSProperties) => (
    <div>
      <div style={{ height: "27mm", background: bg, borderRadius: "2mm", border: `0.3mm solid ${p.neutralDark.hex}14`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", ...wrapStyle }}>
        {extra}
        <SvgBox svg={lk.svg} style={{ height: "11mm", width: `${(11 * lk.width) / lk.height}mm`, position: "relative", ...style }} />
        <div style={{ position: "absolute", top: "1.5mm", left: "1.5mm", width: "5mm", height: "5mm", borderRadius: "50%", background: "#D93025", color: "#fff", fontSize: "7pt", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</div>
      </div>
      <div style={{ fontSize: "7.5pt", marginTop: "1.5mm", opacity: 0.8 }}>{cap}</div>
    </div>
  );
  return (
    <PageFrame identity={identity} page={3} title="الاستخدامات المسموحة والممنوعة" printId={printId} guides={guides}>
      <H color={p.secondary.hex}>استخدامات ممنوعة</H>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4mm" }}>
        {cell({ transform: "scaleX(1.45)" }, "لا تمطّ الشعار أو تغيّر نسبه")}
        {cell({ transform: "rotate(-14deg)" }, "لا تدوّر الشعار")}
        {cell({ filter: "hue-rotate(150deg) saturate(1.6)" }, "لا تغيّر الألوان")}
        {cell({ filter: "drop-shadow(1.2mm 1.2mm 0.8mm rgba(0,0,0,.55))" }, "لا تضف ظلالاً أو تأثيرات")}
        {cell({}, "لا تضعه على خلفية مزدحمة", p.secondary.hex, <PatternLayer concept={c} color={p.accent.hex} opacity={0.9} scale={0.25} />)}
        {cell({ opacity: 0.35 }, "لا تقلل وضوحه أو شفافيته")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7mm", marginTop: "8mm" }}>
        {[
          { title: "✓ افعل", items: identity.guidelines.dos, color: "#1F8A5B" },
          { title: "✕ لا تفعل", items: identity.guidelines.donts, color: "#D93025" },
        ].map((col) => (
          <div key={col.title}>
            <div style={{ fontWeight: 700, fontSize: "10pt", color: col.color, marginBottom: "2mm" }}>{col.title}</div>
            {col.items.map((d) => (
              <div key={d} style={{ fontSize: "8.3pt", lineHeight: 1.7, padding: "1.6mm 0", borderBottom: `0.2mm solid ${p.neutralDark.hex}12` }}>{d}</div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "8mm" }}>
        <H color={p.secondary.hex}>النمط الزخرفي</H>
        <div style={{ height: "30mm", borderRadius: "2mm", position: "relative", overflow: "hidden", background: p.primary.hex }}>
          <PatternLayer concept={c} color={bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex)} opacity={0.3} scale={0.5} />
        </div>
        <div style={{ fontSize: "7.5pt", opacity: 0.7, marginTop: "2mm" }}>يستخدم في خلفيات المطبوعات والتغليف بشفافية 10–30% ولا يوضع فوق الشعار مباشرة.</div>
      </div>
    </PageFrame>
  );
}
