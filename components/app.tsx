"use client";
import { AccountModals } from "./account/account-modals";
import { AccountBar, DemoNotice } from "./account-bar";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBrand } from "@/store/brand-store";
import { IntakeWizard } from "./wizard/intake-wizard";
import { Studio } from "./studio/studio";
import { ExportOverlay, ExportStage } from "./studio/exporter";
import { useMounted } from "./hooks";

function AppMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#16181d" />
      <path d="M8 22h16v3H8z" fill="#e4572e" />
      <path d="M10 7h12l-3 6h4l-9 8 2-6h-4z" fill="#f6f4ef" />
    </svg>
  );
}

const FORGE_STEPS = ["تحليل مدخلات العلامة", "صياغة الاستراتيجية والقصة", "بناء نظام الألوان وفحص التباين", "توليد مفاهيم الشعار", "تجهيز المطبوعات"];

function ForgeLoader() {
  const name = useBrand((s) => s.input.brandName);
  const stage = useBrand((s) => s.loadingStage);
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(FORGE_STEPS.length - 1, x + 1)), 520);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-paper/95 backdrop-blur">
      <div className="w-full max-w-sm px-6 text-center">
        <div className="relative mx-auto mb-8 h-24 w-24">
          {[0, 1, 2].map((k) => (
            <motion.div
              key={k}
              className="absolute inset-0 rounded-[28%] border-2 border-ink"
              animate={{ rotate: [0, 90, 180], scale: [1 - k * 0.18, 0.9 - k * 0.18, 1 - k * 0.18], borderColor: ["#16181d", "#e4572e", "#16181d"] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: k * 0.18, ease: "easeInOut" }}
            />
          ))}
        </div>
        <div className="mb-1 font-display text-2xl font-bold">نصوغ هوية «{name}»</div>
        <div className="mb-6 text-sm text-muted">بذرة تفرد جديدة لكل طلب — لا تتكرر النتائج</div>
        {stage === "ai-logos" && (
          <div className="mb-4 rounded-xl bg-ember/10 px-3 py-2 text-sm font-medium text-ember-deep">الذكاء الاصطناعي يرسم شعاراتك الآن من اسمك ونشاطك واختياراتك…</div>
        )}
        <div className="space-y-2 text-right">
          {FORGE_STEPS.map((s, k) => (
            <div key={s} className={`flex items-center gap-3 text-sm transition ${k <= i ? "text-ink" : "text-muted/50"}`}>
              <span className={`h-2 w-2 rounded-full ${k < i ? "bg-ok" : k === i ? "animate-pulse bg-ember" : "bg-line"}`} />
              {s}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function BrandForgeApp() {
  const mounted = useMounted();
  const stage = useBrand((s) => s.stage);
  const identity = useBrand((s) => s.identity);
  const loading = useBrand((s) => s.loading);
  const showStudio = stage === "studio" && !!identity;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 h-16 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-5">
          <AppMark />
          <div className="font-latin text-lg font-bold tracking-tight" dir="ltr">
            BrandForge <span className="text-ember">AI</span>
          </div>
          <span className="hidden text-sm text-muted sm:inline">· مولّد الهويات البصرية والمطبوعات الذكية</span>
          <div className="mr-auto"><AccountBar /></div>
        </div>
      </header>
      <DemoNotice text="أنت في الديمو: جرّب كل شيء مجاناً، وسجّل ببريدك أو جوالك ليبقى تصميمك محفوظاً 30 يوماً." />
      {mounted && (
        <AnimatePresence mode="wait">
          {showStudio ? (
            <motion.div key="studio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Studio />
            </motion.div>
          ) : (
            <motion.div key="wizard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <IntakeWizard />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <AnimatePresence>{loading && <ForgeLoader key="loader" />}</AnimatePresence>
      <AccountModals onOpenDesign={async (d) => {
        try { await useBrand.getState().loadSaved(d.id); }
        catch (e) { useBrand.getState().setNotice({ kind: "error", text: (e as Error).message }); }
      }} />
      <ExportStage />
      <ExportOverlay />
    </div>
  );
}
