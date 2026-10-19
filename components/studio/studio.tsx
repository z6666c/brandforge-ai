"use client";
import { daysLeft, ensureAccount, useAccount, useEntitled } from "../account/account-client";
import { Watermark, PreviewBadge } from "../account/watermark";
import { paidGate } from "./paid-gate";
import { PLANS } from "@/lib/plans";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileArchive, Info, TriangleAlert, X, Layers, PenTool, Printer, Box, Save, SlidersHorizontal } from "lucide-react";
import { useBrand, selectedConcept, type StudioTab } from "@/store/brand-store";
import { symbolInner, colorsOf, setSymbolTypography } from "@/lib/logo/render";
import { fontStack } from "@/lib/fonts";
import { Button, cn, SvgBox } from "../ui/primitives";
import { EditorPanel } from "./editor-panel";
import { StrategyTab } from "./strategy-tab";
import { LogosTab } from "./logos-tab";
import { PrintTab } from "./print-tab";
import { MockupsTab } from "./mockups-tab";
import { exportPackage } from "./exporter";

const TABS: { id: StudioTab; label: string; I: typeof Layers }[] = [
  { id: "strategy", label: "الاستراتيجية والنظام", I: Layers },
  { id: "logos", label: "الشعار", I: PenTool },
  { id: "print", label: "المطبوعات", I: Printer },
  { id: "mockups", label: "المحاكاة والتصدير", I: Box },
];

function NoticeBar() {
  const notice = useBrand((s) => s.notice);
  const setNotice = useBrand((s) => s.setNotice);
  if (!notice) return null;
  const tone = { info: "bg-sky-50 text-sky-900 border-sky-200", warn: "bg-amber-50 text-amber-900 border-amber-200", error: "bg-red-50 text-red-900 border-red-200" }[notice.kind];
  return (
    <div className={cn("mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", tone)}>
      {notice.kind === "info" ? <Info className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
      <span className="flex-1">{notice.text}</span>
      <button onClick={() => setNotice(null)} aria-label="إغلاق"><X className="h-4 w-4 opacity-60" /></button>
    </div>
  );
}

export function Studio() {
  const identity = useBrand((s) => s.identity)!;
  setSymbolTypography(identity.typography);
  const tab = useBrand((s) => s.tab);
  const setTab = useBrand((s) => s.setTab);
  const back = useBrand((s) => s.backToWizard);
  const setNotice = useBrand((s) => s.setNotice);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const c = selectedConcept(identity);
  const saved = useBrand((s) => s.saved);
  const saveState = useBrand((s) => s.saveState);
  const save = useBrand((s) => s.saveToAccount);
  const contact = useBrand((s) => s.contact);
  const invoice = useBrand((s) => s.invoice);
  const { me } = useAccount();
  const customer = me?.role === "customer";
  const paid = useEntitled(saved?.id);

  // حفظ تلقائي بعد كل تعديل (للعميل المسجّل الذي حفظ التصميم مرة)
  React.useEffect(() => {
    if (!customer || !saved) return;
    const t = setTimeout(() => { save(true); }, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, contact, invoice, customer]);

  const saveNow = async () => {
    if (!(await ensureAccount("لحفظ هويتك والرجوع لها لاحقاً."))) return;
    if (await save()) setNotice({ kind: "info", text: paid ? "تم الحفظ في حسابك." : `تم حفظ المسودة في حسابك — أكمل الشراء خلال ${daysLeft(useBrand.getState().saved?.expiresAt) ?? 7} أيام لتحميل الملفات.` });
  };

  const zip = async () => {
    setBusy(true);
    try {
      const w = await exportPackage();
      if (w.length) setNotice({ kind: "warn", text: w.join("، ") });
    } catch (e) {
      setNotice({ kind: "error", text: "تعذر تجهيز الحزمة: " + (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-64px)]">
      {/* المحرر المباشر */}
      <div className={cn("fixed inset-y-16 start-0 z-30 w-[320px] border-e border-line shadow-xl transition-transform lg:static lg:z-auto lg:translate-x-0 lg:shadow-none", editorOpen ? "translate-x-0" : "translate-x-full")}>
        <EditorPanel />
      </div>
      {editorOpen && <div className="fixed inset-0 top-16 z-20 bg-black/20 lg:hidden" onClick={() => setEditorOpen(false)} />}

      <div className="scrollbar-thin flex-1 overflow-y-auto [scrollbar-gutter:stable]">
        <div className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <SvgBox svg={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${symbolInner(c, colorsOf(identity.palette))}</svg>`} style={{ width: 36, height: 36 }} />
              <div className="min-w-0">
                <div className="truncate font-bold" style={{ fontFamily: fontStack(identity.typography.arabicHeading) }}>{identity.metadata.brandName}</div>
                <div className="truncate text-xs text-muted">{identity.metadata.tagline || "هوية بصرية متكاملة"}</div>
              </div>
            </div>
            <div className="ms-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditorOpen(true)} className="lg:hidden"><SlidersHorizontal className="h-4 w-4" /> تعديل</Button>
              <Button variant="ghost" size="sm" onClick={back}><ArrowRight className="h-4 w-4" /> المعالج</Button>
              <Button variant="outline" size="sm" onClick={saveNow} disabled={saveState === "saving"}>
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">{saveState === "saving" ? "يحفظ…" : saved && customer ? (paid ? "محفوظ ✓" : "مسودة محفوظة") : "احفظ تصميمي"}</span>
              </Button>
              <Button variant="ember" size="sm" onClick={zip} disabled={busy}><FileArchive className="h-4 w-4" /> <span className="hidden sm:inline">الحزمة الكاملة</span> ZIP</Button>
            </div>
          </div>
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
            {TABS.map(({ id, label, I }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn("relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm transition", tab === id ? "font-semibold text-ink" : "text-muted hover:text-ink")}
              >
                <I className="h-4 w-4" /> {label}
                {tab === id && <motion.span layoutId="tab-line" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ember" />}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-7">
          <Watermark show={!paid} text="معاينة · BrandForge" />
          <PreviewBadge show={!paid} label={`التحميل بعد الدفع: ${PLANS.once.price} ${PLANS.once.currency} مرة واحدة أو ${PLANS.monthly.price} شهرياً`} onUnlock={() => { paidGate("لتحميل ملفات هويتك."); }} />
          <NoticeBar />
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              {tab === "strategy" && <StrategyTab />}
              {tab === "logos" && <LogosTab />}
              {tab === "print" && <PrintTab />}
              {tab === "mockups" && <MockupsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
