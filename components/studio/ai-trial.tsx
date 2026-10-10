"use client";
// قسم «تجربة الذكاء الاصطناعي» — أفكار بصرية سريعة للاستلهام (ليست للتسليم النهائي)
import * as React from "react";
import { FlaskConical, RefreshCw } from "lucide-react";
import type { BrandIdentity } from "@/lib/types";
import { useBrand } from "@/store/brand-store";
import { aiTrialUrls, AI_TRIAL_NOTE } from "@/lib/ai-trial";
import { Button, Card, SectionTitle } from "../ui/primitives";

function TrialImg({ url, prompt }: { url: string; prompt: string }) {
  const [state, setState] = React.useState<"loading" | "ok" | "error">("loading");
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-ink/[0.03]">
        {state === "loading" && <div className="absolute inset-0 animate-pulse bg-ink/5" />}
        {state === "error" ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted">تعذر الوصول لخدمة التجربة الآن</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={prompt} loading="lazy" onLoad={() => setState("ok")} onError={() => setState("error")} className="h-full w-full object-cover" />
        )}
        <span className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-black">تجريبي</span>
      </div>
      {state === "ok" && (
        <a href={url} target="_blank" rel="noreferrer" className="block border-t border-line px-3 py-2 text-center text-xs text-muted hover:text-ink">فتح الصورة</a>
      )}
    </Card>
  );
}

export function AiTrial({ identity }: { identity: BrandIdentity }) {
  const input = useBrand((s) => s.input);
  const [seed, setSeed] = React.useState<number | null>(null);
  const p = identity.palette;
  const items = seed === null ? [] : aiTrialUrls({
    name: identity.metadata.brandName, nameEn: identity.metadata.brandNameEn, industry: input.industry, sub: input.industryOther,
    style: input.visualStyle, colors: [p.primary.hex, p.secondary.hex, p.accent.hex],
  }, seed);
  return (
    <section className="rounded-2xl border border-dashed border-amber-400/70 bg-amber-50/40 p-5">
      <SectionTitle
        eyebrow="AI Lab · Beta"
        title="تجربة الذكاء الاصطناعي (تجريبي)"
        action={
          <Button variant="outline" size="sm" onClick={() => setSeed(Math.floor(Math.random() * 900000))}>
            {seed === null ? <FlaskConical className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />} {seed === null ? "ولّد أفكاراً" : "أفكار أخرى"}
          </Button>
        }
      />
      <p className="mb-4 text-[13px] leading-relaxed text-muted">{AI_TRIAL_NOTE} الشعار النهائي يبقى من المحرك المتجهي أعلاه.</p>
      {items.length > 0 && <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{items.map((it) => <TrialImg key={it.url} {...it} />)}</div>}
    </section>
  );
}
