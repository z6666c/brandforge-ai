"use client";
// الخطوة 1: معالج الإدخال الذكي
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { useBrand } from "@/store/brand-store";
import { COLOR_PREFS, INDUSTRIES, STYLES, VALUES } from "@/lib/labels";
import { NameCheckPanel } from "../name-check-panel";
import { normalizeHex } from "@/lib/color";
import type { VisualStyle } from "@/lib/types";
import { Button, Chip, cn, Input, Label, Textarea } from "../ui/primitives";

const STEPS = ["الاسم والقطاع", "الشخصية والأسلوب", "الألوان"];

function StyleGlyph({ id }: { id: VisualStyle }) {
  const s = "currentColor";
  const g: Record<VisualStyle, React.ReactNode> = {
    minimal: <circle cx="24" cy="24" r="10" fill="none" stroke={s} strokeWidth="3" />,
    geometric: (
      <g fill={s}>
        <path d="M8 8h14v14H8z" />
        <path d="M26 8a14 14 0 0 1 14 14H26z" opacity=".55" />
        <path d="M8 40a14 14 0 0 1 14-14v14z" opacity=".55" />
        <circle cx="33" cy="33" r="7" />
      </g>
    ),
    islamic: <path fill={s} d="M24.0 3.0L28.8 12.5L38.8 9.2L35.5 19.2L45.0 24.0L35.5 28.8L38.8 38.8L28.8 35.5L24.0 45.0L19.2 35.5L9.2 38.8L12.5 28.8L3.0 24.0L12.5 19.2L9.2 9.2L19.2 12.5Z" />,
    tech3d: (
      <g>
        <path d="M24 6l16 9v18l-16 9-16-9V15z" fill={s} opacity=".25" />
        <path d="M24 24l16-9v18l-16 9z" fill={s} opacity=".6" />
        <path d="M24 24L8 15l16-9 16 9z" fill={s} />
      </g>
    ),
  };
  return <svg viewBox="0 0 48 48" className="h-10 w-10">{g[id]}</svg>;
}

export function IntakeWizard() {
  const input = useBrand((s) => s.input);
  const setInput = useBrand((s) => s.setInput);
  const generate = useBrand((s) => s.generate);
  const identity = useBrand((s) => s.identity);
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);

  const canNext = [
    input.brandName.trim().length > 0 && (input.industry !== "other" || !!input.industryOther?.trim()),
    input.brandValues.length > 0,
    input.colorPreference !== "custom" || !!normalizeHex(input.customColor ?? ""),
  ];
  const go = (d: number) => { setDir(d); setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + d))); };
  const toggleValue = (v: (typeof VALUES)[number]["id"]) => {
    const has = input.brandValues.includes(v);
    if (has) setInput({ brandValues: input.brandValues.filter((x) => x !== v) });
    else if (input.brandValues.length < 3) setInput({ brandValues: [...input.brandValues, v] });
  };

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs text-muted">
          <Sparkles className="h-3.5 w-3.5 text-ember" /> هوية كاملة ومطبوعات جاهزة للطباعة
        </div>
        <h1 className="font-display text-4xl font-bold leading-[1.3] md:text-5xl">
          من اسمٍ واحد
          <br />
          إلى <span className="text-ember">هوية متكاملة</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          أجب عن ثلاثة أسئلة قصيرة، وسنصوغ قصة علامتك ونظام ألوانها وخطوطها وثلاثة مفاهيم لشعارها، مع بطاقة أعمال وورق رسمي ومظروف وفاتورة ودليل هوية.
        </p>
        <div className="mt-8 hidden gap-6 text-sm text-muted lg:flex">
          {["SVG متجهي", "PDF بدقة 300DPI", "عربي بالكامل"].map((t) => (
            <span key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" /> {t}</span>
          ))}
        </div>
        {identity && (
          <button onClick={() => useBrand.setState({ stage: "studio" })} className="mt-8 text-sm font-medium text-ember underline-offset-4 hover:underline">
            العودة إلى هوية «{identity.metadata.brandName}» ←
          </button>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,.35)] md:p-8">
        <div className="mb-7 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-2">
              <div className="h-1 overflow-hidden rounded-full bg-line">
                <motion.div className="h-full bg-ink" style={{ width: i <= step ? "100%" : "0%" }} initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.35 }} />
              </div>
              <span className={cn("text-xs", i === step ? "font-semibold text-ink" : "text-muted")}>{i + 1}. {s}</span>
            </div>
          ))}
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * 24 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label required>اسم العلامة التجارية</Label>
                      <Input autoFocus value={input.brandName} onChange={(e) => setInput({ brandName: e.target.value })} placeholder="مثال: نسيج" maxLength={40} />
                    </div>
                    <div>
                      <Label hint="اختياري">الاسم باللاتينية</Label>
                      <Input dir="ltr" value={input.brandNameEn} onChange={(e) => setInput({ brandNameEn: e.target.value })} placeholder="Naseej" maxLength={40} />
                    </div>
                  </div>
                  <div>
                    <Label hint="اختياري">الشعار اللفظي (Tagline)</Label>
                    <Input value={input.tagline} onChange={(e) => setInput({ tagline: e.target.value })} placeholder="مثال: نصنع التقنية بإتقان" maxLength={60} />
                  </div>
                  <div>
                    <Label>قطاع النشاط</Label>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map((i) => (
                        <Chip key={i.id} active={input.industry === i.id} onClick={() => setInput({ industry: i.id })}>{i.label}</Chip>
                      ))}
                    </div>
                    {input.industry === "other" && (
                      <Input className="mt-3" value={input.industryOther ?? ""} onChange={(e) => setInput({ industryOther: e.target.value })} placeholder="اكتب القطاع" />
                    )}
                  </div>
                  <NameCheckPanel
                    name={input.brandName}
                    nameEn={input.brandNameEn}
                    activity={input.industry === "other" ? input.industryOther || "نشاط تجاري" : INDUSTRIES.find((i) => i.id === input.industry)?.label ?? ""}
                    onPick={(n) => (/[a-z]/i.test(n) && !/[\u0600-\u06FF]/.test(n) ? setInput({ brandNameEn: n }) : setInput({ brandName: n }))}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <Label hint={`${input.brandValues.length}/3`}>قيم العلامة</Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {VALUES.map((v) => {
                        const active = input.brandValues.includes(v.id);
                        return (
                          <button
                            key={v.id}
                            onClick={() => toggleValue(v.id)}
                            disabled={!active && input.brandValues.length >= 3}
                            className={cn(
                              "rounded-xl border px-3 py-2.5 text-right transition disabled:opacity-40",
                              active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink/40",
                            )}
                          >
                            <div className="text-sm font-semibold">{v.label}</div>
                            <div className={cn("text-xs", active ? "text-paper/70" : "text-muted")}>{v.hint}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label>النمط البصري المفضل</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setInput({ visualStyle: s.id })}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 text-right transition",
                            input.visualStyle === s.id ? "border-ink bg-ink/[0.03] ring-2 ring-ink" : "border-line hover:border-ink/40",
                          )}
                        >
                          <span className={input.visualStyle === s.id ? "text-ember" : "text-ink/70"}><StyleGlyph id={s.id} /></span>
                          <span>
                            <span className="block text-sm font-semibold">{s.label}</span>
                            <span className="block text-xs text-muted">{s.hint}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label hint="اختياري">الفئة المستهدفة</Label>
                    <Textarea rows={2} value={input.targetAudience} onChange={(e) => setInput({ targetAudience: e.target.value })} placeholder="مثال: الشركات الناشئة ورواد الأعمال في الخليج" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <Label>تفضيل الألوان</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {COLOR_PREFS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setInput({ colorPreference: c.id })}
                          className={cn(
                            "rounded-2xl border p-4 text-right transition",
                            input.colorPreference === c.id ? "border-ink ring-2 ring-ink" : "border-line hover:border-ink/40",
                          )}
                        >
                          <div className="mb-3 flex h-10 overflow-hidden rounded-lg">
                            {(c.id === "custom" ? [input.customColor ?? "#888", "#d9d6cf", "#1a1a1a"] : c.swatches).map((h, i) => (
                              <span key={i} className="flex-1" style={{ background: h }} />
                            ))}
                          </div>
                          <div className="text-sm font-semibold">{c.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {input.colorPreference === "custom" && (
                    <div className="flex items-center gap-3 rounded-2xl bg-paper p-4">
                      <input type="color" value={normalizeHex(input.customColor ?? "") ?? "#1F6F78"} onChange={(e) => setInput({ customColor: e.target.value.toUpperCase() })} className="h-12 w-12 rounded-xl" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">اللون الأساسي المرغوب</div>
                        <div className="text-xs text-muted">سنبني حوله لوحة متناغمة ونصحح تباينه تلقائياً</div>
                      </div>
                      <Input dir="ltr" value={input.customColor} onChange={(e) => setInput({ customColor: e.target.value })} className="w-28 font-latin uppercase" />
                    </div>
                  )}
                  <div className="rounded-2xl border border-dashed border-line p-4 text-sm leading-7 text-muted">
                    <b className="text-ink">{input.brandName || "علامتك"}</b>
                    {input.brandNameEn && <span className="font-latin"> · {input.brandNameEn}</span>} —{" "}
                    {INDUSTRIES.find((i) => i.id === input.industry)?.label}، بقيم{" "}
                    {input.brandValues.map((v) => VALUES.find((x) => x.id === v)?.label).join("، ") || "—"} وأسلوب{" "}
                    {STYLES.find((s) => s.id === input.visualStyle)?.label}.
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <Button variant="ghost" onClick={() => go(-1)} disabled={step === 0}>
            <ArrowRight className="h-4 w-4" /> السابق
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => go(1)} disabled={!canNext[step]}>
              التالي <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ember" size="lg" onClick={generate} disabled={!canNext.every(Boolean)}>
              <Sparkles className="h-4 w-4" /> ولّد الهوية
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
