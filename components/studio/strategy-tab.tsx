"use client";
import * as React from "react";
import { Check, Copy, Pencil, Sparkles, Cpu } from "lucide-react";
import { useBrand, selectedConcept } from "@/store/brand-store";
import type { PaletteKey } from "@/lib/types";
import { bestTextOn, rgbString } from "@/lib/color";
import { contrastReport } from "@/lib/validate";
import { fontStack } from "@/lib/fonts";
import { label } from "@/lib/labels";
import { patternSvg } from "@/lib/pattern";
import { Badge, Card, SectionTitle, SvgBox, Textarea } from "../ui/primitives";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 1200); }}
      className="rounded p-1 opacity-60 hover:bg-black/5 hover:opacity-100"
      aria-label="نسخ"
    >
      {ok ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

const SW: { key: PaletteKey; role: string }[] = [
  { key: "primary", role: "الرئيسي" },
  { key: "secondary", role: "الثانوي" },
  { key: "accent", role: "التمييزي" },
  { key: "neutralDark", role: "محايد داكن" },
  { key: "neutralLight", role: "محايد فاتح" },
];

export function StrategyTab() {
  const identity = useBrand((s) => s.identity)!;
  const notes = useBrand((s) => s.validationNotes);
  const updateStory = useBrand((s) => s.updateStory);
  const [editing, setEditing] = React.useState(false);
  const p = identity.palette;
  const t = identity.typography;
  const concept = selectedConcept(identity);
  const report = contrastReport(p);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[1fr_280px]">
          <div className="p-6 md:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone={identity.source === "ai" ? "ember" : "neutral"}>
                {identity.source === "ai" ? <><Sparkles className="me-1 h-3 w-3" /> صياغة الذكاء الاصطناعي</> : <><Cpu className="me-1 h-3 w-3" /> المحرك المحلي</>}
              </Badge>
              <Badge>النمط النفسي: {identity.strategy.archetype}</Badge>
              {identity.metadata.values.map((v) => <Badge key={v}>{label.value(v)}</Badge>)}
              <span className="font-latin text-[11px] text-muted" dir="ltr">seed {identity.seed.toString(36)}</span>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">قصة العلامة وفلسفتها</h2>
              <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:bg-ink/5">
                <Pencil className="h-3.5 w-3.5" /> {editing ? "تم" : "تعديل"}
              </button>
            </div>
            {editing ? (
              <Textarea rows={7} value={identity.strategy.brandStory} onChange={(e) => updateStory(e.target.value)} />
            ) : (
              <p className="text-[15.5px] leading-[2.1] text-ink/85">{identity.strategy.brandStory}</p>
            )}
          </div>
          <div className="relative min-h-[220px] overflow-hidden" style={{ background: p.primary.hex }}>
            <SvgBox svg={patternSvg(concept, bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex), p.primary.hex, 560, 900, 0.8, 0.28)} className="absolute inset-0" style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </Card>

      {notes.length > 0 && (
        <div className="rounded-xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-ink/80">
          <b className="text-warn">طبقة التحقق:</b> {notes.join(" ")}
        </div>
      )}

      <section>
        <SectionTitle eyebrow="Color System" title="لوحة الألوان القياسية" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SW.map(({ key, role }) => {
            const s = p[key] as { hex: string; cmyk: string; pantone?: string; name?: string };
            const fg = bestTextOn(s.hex);
            return (
              <Card key={key} className="overflow-hidden">
                <div className="flex h-28 flex-col justify-between p-3" style={{ background: s.hex, color: fg }}>
                  <span className="text-xs font-medium opacity-80">{role}</span>
                  <span className="font-display text-sm font-semibold">{s.name ?? (key === "neutralDark" ? "للنصوص" : "للخلفيات")}</span>
                </div>
                <div className="space-y-1 p-3 font-latin text-[12px]" dir="ltr">
                  <div className="flex items-center justify-between font-semibold">{s.hex}<CopyBtn text={s.hex} /></div>
                  <div className="text-muted">{rgbString(s.hex)}</div>
                  <div className="text-muted">{s.cmyk}</div>
                  {s.pantone && <div className="truncate text-muted" title={s.pantone}>{s.pantone.replace(" (تقريبي)", " ≈")}</div>}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="WCAG" title="فحص التباين وإمكانية الوصول" />
        <Card className="divide-y divide-line">
          {report.map((r) => (
            <div key={r.label} className="flex items-center gap-4 px-4 py-3">
              <div className="flex h-9 w-16 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold" style={{ background: r.bg, color: r.fg }}>نص</div>
              <div className="flex-1 text-sm">{r.label}</div>
              <div className="font-latin text-sm font-semibold" dir="ltr">{r.ratio.toFixed(2)}:1</div>
              <Badge tone={r.level === "AAA" ? "ok" : r.level === "AA" ? "ok" : r.level === "AA كبير" ? "warn" : "bad"}>{r.level}</Badge>
            </div>
          ))}
        </Card>
        <p className="mt-2 text-xs text-muted">AA للنصوص العادية يتطلب 4.5:1، و«AA كبير» مناسب للعناوين الكبيرة والعناصر الرسومية فقط.</p>
      </section>

      <section>
        <SectionTitle eyebrow="Typography" title="أزواج الخطوط" />
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { role: "العناوين العربية", f: t.arabicHeading, sample: "هوية تُرى فتُتذكَّر", size: "text-3xl", w: 700 },
            { role: "النصوص العربية", f: t.arabicBody, sample: "نص تجريبي يوضح شكل الفقرات الطويلة وقابليتها للقراءة في المطبوعات والشاشات.", size: "text-base", w: 400 },
            { role: "العناوين الإنجليزية", f: t.englishHeading, sample: "Built to be remembered", size: "text-3xl", w: 700, ltr: true },
            { role: "النصوص الإنجليزية", f: t.englishBody, sample: "The quick brown fox jumps over the lazy dog. 0123456789", size: "text-base", w: 400, ltr: true },
          ].map((x) => (
            <Card key={x.role} className="p-5">
              <div className="mb-3 flex items-center justify-between text-xs text-muted">
                <span>{x.role}</span>
                <span className="font-latin font-semibold text-ink">{x.f}</span>
              </div>
              <div dir={x.ltr ? "ltr" : "rtl"} className={x.size} style={{ fontFamily: fontStack(x.f), fontWeight: x.w, lineHeight: 1.5, color: p.neutralDark.hex }}>
                {x.sample}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Brand Pattern" title="عنصر الزخرفة المتكرر" />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { fg: p.primary.hex, bg: p.neutralLight.hex, op: 0.22 },
            { fg: bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex), bg: p.primary.hex, op: 0.25 },
            { fg: p.accent.hex, bg: p.neutralDark.hex, op: 0.35 },
          ].map((v, i) => (
            <Card key={i} className="h-44 overflow-hidden">
              <SvgBox svg={patternSvg(concept, v.fg, v.bg, 600, 300, 0.9, v.op)} style={{ width: "100%", height: "100%" }} />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
