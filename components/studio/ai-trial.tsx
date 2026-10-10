"use client";
// قسم «تجربة الذكاء الاصطناعي» — أفكار بصرية سريعة للاستلهام (ليست للتسليم النهائي)
import * as React from "react";
import { FlaskConical, RefreshCw } from "lucide-react";
import type { BrandIdentity } from "@/lib/types";
import { useBrand } from "@/store/brand-store";
import { aiTrialUrls, AI_TRIAL_NOTE, nameIdeas } from "@/lib/ai-trial";
import { Button, Card, SectionTitle } from "../ui/primitives";

function TrialImg({ url, prompt, turn, onDone }: { url: string; prompt: string; turn: boolean; onDone: () => void }) {
  const [state, setState] = React.useState<"waiting" | "loading" | "ok" | "error">("waiting");
  const [tries, setTries] = React.useState(0);
  React.useEffect(() => { if (turn && state === "waiting") setState("loading"); }, [turn, state]);
  const fail = () => {
    // الخدمة المجانية ترفض الطلبات المتزامنة أحياناً: إعادة محاولة واحدة بعد ثوانٍ
    if (tries < 1) { setTries(1); setState("waiting"); setTimeout(() => setState("loading"), 4000); return; }
    setState("error"); onDone();
  };
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-ink/[0.03]">
        {(state === "loading" || state === "waiting") && <div className="absolute inset-0 animate-pulse bg-ink/5" />}
        {state === "waiting" ? null : state === "error" ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted">تعذر الوصول لخدمة التجربة الآن</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tries ? `${url}&retry=1` : url} alt={prompt} loading="lazy" onLoad={() => { setState("ok"); onDone(); }} onError={fail} className="h-full w-full object-cover" />
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
  const [done, setDone] = React.useState(0);
  const p = identity.palette;
  const items = seed === null ? [] : aiTrialUrls({
    name: identity.metadata.brandName, nameEn: identity.metadata.brandNameEn, industry: input.industry, sub: input.industryOther,
    style: input.visualStyle, colors: [p.primary.hex, p.secondary.hex, p.accent.hex],
    ideas: nameIdeas(identity.metadata.brandName, identity.metadata.brandNameEn),
  }, seed);
  return (
    <section className="rounded-2xl border border-dashed border-amber-400/70 bg-amber-50/40 p-5">
      <SectionTitle
        eyebrow="AI Lab · Beta"
        title="تجربة الذكاء الاصطناعي (تجريبي)"
        action={
          <Button variant="outline" size="sm" onClick={() => { setDone(0); setSeed(Math.floor(Math.random() * 900000)); }}>
            {seed === null ? <FlaskConical className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />} {seed === null ? "ولّد أفكاراً" : "أفكار أخرى"}
          </Button>
        }
      />
      <p className="mb-4 text-[13px] leading-relaxed text-muted">{AI_TRIAL_NOTE} الشعار النهائي يبقى من المحرك المتجهي أعلاه.</p>
      {items.length > 0 && <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{items.map((it, i) => <TrialImg key={it.url} {...it} turn={i <= done} onDone={() => setDone((d) => Math.max(d, i + 1))} />)}</div>}
    </section>
  );
}
