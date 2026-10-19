"use client";
// إدارة الحالة (Zustand): بيانات الهوية الحالية متزامنة لحظياً مع كل شاشات المعاينة
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BrandIdentity, BrandSystemAI, ContactInfo, IntakeInput, InvoiceData, InvoiceItem, LogoConcept, Palette, PaletteKey, Typography,
} from "@/lib/types";
import { freshSeed, uid } from "@/lib/random";
import { generateConcepts } from "@/lib/logo";
import { assembleIdentity, generateLocalSystem } from "@/lib/strategy";
import { refreshSwatch } from "@/lib/validate";

export type Stage = "wizard" | "studio";
export type StudioTab = "strategy" | "logos" | "print" | "mockups";

export const DEFAULT_INPUT: IntakeInput = {
  brandName: "",
  brandNameEn: "",
  tagline: "",
  industry: "tech",
  brandValues: [],
  visualStyle: "geometric",
  targetAudience: "",
  colorPreference: "cool",
  customColor: "#1F6F78",
  logoTypes: [],
  likes: "",
  avoid: "",
  aiDirect: true,
};

const slugify = (s?: string) =>
  (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "brand";

function defaultContact(input: IntakeInput): ContactInfo {
  const slug = slugify(input.brandNameEn);
  return {
    personName: "عبدالله المحمد",
    jobTitle: "المدير التنفيذي",
    phone: "+966 50 123 4567",
    email: `info@${slug}.sa`,
    website: `www.${slug}.sa`,
    address: "طريق الملك فهد، الرياض، المملكة العربية السعودية",
    crNumber: "1010123456",
    vatNumber: "310123456700003",
  };
}

function defaultInvoice(): InvoiceData {
  return {
    number: "INV-2026-0001",
    date: new Date().toISOString().slice(0, 10),
    clientName: "شركة العميل المحدودة",
    clientVat: "300000000000003",
    clientAddress: "جدة، المملكة العربية السعودية",
    vatRate: 0.15,
    currency: "ر.س",
    items: [
      { id: "i1", description: "تصميم الهوية البصرية الكاملة", qty: 1, unitPrice: 8500 },
      { id: "i2", description: "طباعة بطاقات أعمال (500 بطاقة)", qty: 2, unitPrice: 350 },
      { id: "i3", description: "قوالب المطبوعات الرسمية", qty: 1, unitPrice: 1200 },
    ],
  };
}

export interface Notice { kind: "info" | "warn" | "error"; text: string }

interface BrandState {
  stage: Stage;
  tab: StudioTab;
  input: IntakeInput;
  identity: BrandIdentity | null;
  contact: ContactInfo;
  invoice: InvoiceData;
  loading: boolean;
  notice: Notice | null;
  validationNotes: string[];
  showGuides: boolean;

  setInput: (patch: Partial<IntakeInput>) => void;
  generate: () => Promise<void>;
  regenerateConcepts: () => void;
  moreConcepts: () => void;
  seenSigs: string[];
  loadingStage: "ai-logos" | null;
  aiBusy: boolean;
  moreAiLogos: () => Promise<void>;
  selectConcept: (i: number) => void;
  setTab: (t: StudioTab) => void;
  backToWizard: () => void;
  updateColor: (key: PaletteKey, hex: string) => void;
  updateTypography: (key: keyof Typography, value: string) => void;
  updateMeta: (patch: Partial<Pick<BrandIdentity["metadata"], "brandName" | "brandNameEn" | "tagline">>) => void;
  updateStory: (story: string) => void;
  updateContact: (patch: Partial<ContactInfo>) => void;
  updateInvoice: (patch: Partial<Omit<InvoiceData, "items">>) => void;
  updateItem: (id: string, patch: Partial<InvoiceItem>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  setNotice: (n: Notice | null) => void;
  toggleGuides: () => void;
}

/** شعارات يرسمها الذكاء الاصطناعي مباشرة (Recraft أو Gemini) */
export async function fetchAILogos(input: IntakeInput, palette: Palette, count = 4): Promise<{ concepts: LogoConcept[]; error?: string }> {
  if (process.env.NEXT_PUBLIC_BRANDFORGE_DEMO === "1") return { concepts: [], error: "PREVIEW" };
  try {
    const res = await fetch("/api/brand/ai-logos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, palette, count }), signal: AbortSignal.timeout(95_000),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return { concepts: [], error: res.status === 501 ? "NO_KEY" : d.error ?? String(res.status) };
    return { concepts: (d.concepts ?? []) as LogoConcept[] };
  } catch {
    return { concepts: [], error: "تعذر الاتصال بمولّد الشعارات" };
  }
}

async function fetchAISystem(input: IntakeInput, seed: number): Promise<{ system: BrandSystemAI | null; notice: Notice | null; notes: string[] }> {
  if (process.env.NEXT_PUBLIC_BRANDFORGE_DEMO === "1") {
    return { system: null, notes: [], notice: { kind: "info", text: "نسخة معاينة: تعمل بالمحرك المحلي، وتنزيل الملفات معطّل هنا. التصدير الكامل وصياغة Gemini متاحان عند تشغيل مشروع Next.js." } };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 60_000);
    const res = await fetch("/api/brand/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, seed }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (res.status === 403) {
      const d = await res.json().catch(() => ({}));
      return { system: null, notes: [], notice: { kind: "info", text: d.error === "DEMO_LIMIT" ? "وصلت لحد التجربة بالذكاء الاصطناعي لهذه الساعة، فاستُخدم المحرك المحلي." : "حساب الديمو يعمل بالمحرك المحلي الكامل. صياغة الهوية بالذكاء الاصطناعي متاحة لحساب الإدارة." } };
    }
    if (res.status === 501) {
      return { system: null, notes: [], notice: { kind: "info", text: "تعمل الآن بالمحرك المحلي. أضف GEMINI_API_KEY لتفعيل صياغة الهوية بالذكاء الاصطناعي." } };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.system) {
      return { system: null, notes: [], notice: { kind: "warn", text: `تعذر الاتصال بنموذج الذكاء الاصطناعي، فاستُخدم المحرك المحلي. (${data.error ?? res.status})` } };
    }
    return { system: data.system as BrandSystemAI, notes: data.notes ?? [], notice: null };
  } catch {
    return { system: null, notes: [], notice: { kind: "info", text: "تعمل الآن بالمحرك المحلي (لا يوجد خادم API متاح)." } };
  }
}

export const useBrand = create<BrandState>()(
  persist(
    (set, get) => ({
      stage: "wizard",
      tab: "strategy",
      input: DEFAULT_INPUT,
      identity: null,
      contact: defaultContact(DEFAULT_INPUT),
      invoice: defaultInvoice(),
      loading: false,
      notice: null,
      validationNotes: [],
      showGuides: true,
      seenSigs: [],
      loadingStage: null,
      aiBusy: false,
      moreAiLogos: async () => {
        const { identity, input } = get();
        if (!identity || get().aiBusy) return;
        set({ aiBusy: true });
        const ai = await fetchAILogos(input, identity.palette, 4);
        const cur = get().identity;
        if (ai.concepts.length && cur) set({ identity: { ...cur, concepts: [...ai.concepts, ...cur.concepts].slice(0, 48), selectedConcept: 0 }, aiBusy: false });
        else set({ aiBusy: false, notice: { kind: ai.error === "NO_KEY" ? "info" : "warn", text: ai.error === "NO_KEY" ? "الرسم بالذكاء الاصطناعي يحتاج RECRAFT_API_KEY أو GEMINI_API_KEY في إعدادات الخادم." : ai.error === "PREVIEW" ? "الرسم بالذكاء الاصطناعي يعمل في الموقع المنشور فقط، وليس في المعاينة." : `تعذر الرسم بالذكاء الاصطناعي: ${ai.error}` } });
      },

      setInput: (patch) => set({ input: { ...get().input, ...patch } }),

      generate: async () => {
        const input = get().input;
        if (!input.brandName.trim()) return;
        set({ loading: true, notice: null });
        const seed = freshSeed(input.brandName + input.industry);
        const started = Date.now();
        const concepts = generateConcepts(input, seed);
        const { system, notice, notes } = await fetchAISystem(input, seed);
        const finalSystem = system ?? generateLocalSystem(input, seed);
        let identity = assembleIdentity(input, finalSystem, concepts, seed, system ? "ai" : "local");
        // التوليد المباشر: الذكاء الاصطناعي يرسم الشعارات بألوان الهوية، وتظهر أولاً قبل بدائل المحرك
        let aiNotice: Notice | null = null;
        if (input.aiDirect !== false) {
          set({ loadingStage: "ai-logos" });
          const ai = await fetchAILogos(input, identity.palette, 4);
          if (ai.concepts.length) identity = { ...identity, concepts: [...ai.concepts, ...identity.concepts], selectedConcept: 0 };
          else if (ai.error && ai.error !== "PREVIEW" && ai.error !== "NO_KEY") aiNotice = { kind: "warn", text: `تعذر رسم الشعارات بالذكاء الاصطناعي الآن (${ai.error})؛ عرضنا شعارات المحرك.` };
        }
        const wait = Math.max(0, 2200 - (Date.now() - started)); // يمنح شاشة التحميل وقتاً لعرض المراحل
        await new Promise((r) => setTimeout(r, wait));
        const prev = get().contact;
        const contact = prev.email.startsWith("info@brand") || !get().identity ? defaultContact(input) : prev;
        set({ identity, contact, loading: false, loadingStage: null, notice: notice ?? aiNotice, validationNotes: notes, stage: "studio", tab: "strategy" });
      },

      regenerateConcepts: () => {
        const { identity, input } = get();
        if (!identity) return;
        const seed = freshSeed(identity.id);
        const seen = [...get().seenSigs, ...identity.concepts.map((c) => c.signature ?? "")].slice(-400);
        const concepts = generateConcepts(input, seed, identity.concepts.map((c) => c.family), 6, seen);
        set({ identity: { ...identity, concepts: [...identity.concepts.filter((c) => c.ai), ...concepts], selectedConcept: 0 }, seenSigs: seen });
      },
      moreConcepts: () => {
        const { identity, input } = get();
        if (!identity) return;
        const seed = freshSeed(identity.id + identity.concepts.length);
        const seen = [...get().seenSigs, ...identity.concepts.map((c) => c.signature ?? "")];
        const fams = identity.concepts.slice(-6).map((c) => c.family);
        const extra = generateConcepts(input, seed, fams, 6, seen);
        const ai = identity.concepts.filter((c) => c.ai), local = identity.concepts.filter((c) => !c.ai);
        set({ identity: { ...identity, concepts: [...ai, ...[...local, ...extra].slice(-36)] } });
      },

      selectConcept: (i) => {
        const id = get().identity;
        if (id) set({ identity: { ...id, selectedConcept: i } });
      },
      setTab: (tab) => set({ tab }),
      backToWizard: () => set({ stage: "wizard" }),

      updateColor: (key, hex) => {
        const id = get().identity;
        if (id) set({ identity: { ...id, palette: refreshSwatch(key, hex, id.palette) } });
      },
      updateTypography: (key, value) => {
        const id = get().identity;
        if (id) set({ identity: { ...id, typography: { ...id.typography, [key]: value } } });
      },
      updateMeta: (patch) => {
        const id = get().identity;
        if (id) set({ identity: { ...id, metadata: { ...id.metadata, ...patch } } });
      },
      updateStory: (story) => {
        const id = get().identity;
        if (id) set({ identity: { ...id, strategy: { ...id.strategy, brandStory: story } } });
      },
      updateContact: (patch) => set({ contact: { ...get().contact, ...patch } }),
      updateInvoice: (patch) => set({ invoice: { ...get().invoice, ...patch } }),
      updateItem: (iid, patch) =>
        set({ invoice: { ...get().invoice, items: get().invoice.items.map((it) => (it.id === iid ? { ...it, ...patch } : it)) } }),
      addItem: () =>
        set({ invoice: { ...get().invoice, items: [...get().invoice.items, { id: uid(), description: "بند جديد", qty: 1, unitPrice: 0 }] } }),
      removeItem: (iid) => set({ invoice: { ...get().invoice, items: get().invoice.items.filter((i) => i.id !== iid) } }),
      setNotice: (notice) => set({ notice }),
      toggleGuides: () => set({ showGuides: !get().showGuides }),
    }),
    {
      name: "brandforge-v1",
      partialize: (s) => ({ stage: s.stage, tab: s.tab, input: s.input, identity: s.identity, contact: s.contact, invoice: s.invoice, showGuides: s.showGuides }),
    },
  ),
);

/** المفهوم المختار حالياً */
export const selectedConcept = (id: BrandIdentity) => id.concepts[id.selectedConcept] ?? id.concepts[0];
