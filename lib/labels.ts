import type { BrandValue, ColorPreference, Industry, VisualStyle } from "./types";

export const INDUSTRIES: { id: Industry; label: string }[] = [
  { id: "tech", label: "تقنية" },
  { id: "realestate", label: "عقارات" },
  { id: "food", label: "مطاعم ومقاهي" },
  { id: "ecommerce", label: "تجارة إلكترونية" },
  { id: "finance", label: "مالية" },
  { id: "health", label: "رعاية صحية" },
  { id: "education", label: "تعليم وتدريب" },
  { id: "beauty", label: "تجميل وعناية" },
  { id: "logistics", label: "نقل وخدمات لوجستية" },
  { id: "other", label: "قطاع آخر" },
];

export const VALUES: { id: BrandValue; label: string; hint: string }[] = [
  { id: "luxury", label: "فخامة", hint: "رقي وتميز هادئ" },
  { id: "modern", label: "حداثة", hint: "تجديد وريادة" },
  { id: "simple", label: "بساطة", hint: "وضوح وصدق" },
  { id: "playful", label: "مرح", hint: "بهجة وقرب" },
  { id: "trust", label: "موثوقية", hint: "ثقة والتزام" },
  { id: "authentic", label: "أصالة", hint: "جذور وهوية" },
];

export const STYLES: { id: VisualStyle; label: string; hint: string }[] = [
  { id: "minimal", label: "مينيماليست", hint: "أقل عناصر، أكثر وضوح" },
  { id: "geometric", label: "هندسي معاصر", hint: "شبكات ونسب محسوبة" },
  { id: "islamic", label: "إسلامي / عربي متقدم", hint: "نجوم وكوفي مربع بروح حديثة" },
  { id: "tech3d", label: "ثلاثي الأبعاد وتقني", hint: "عمق ومنظور وكتل" },
];

export const COLOR_PREFS: { id: ColorPreference; label: string; swatches: string[] }[] = [
  { id: "warm", label: "ألوان دافئة", swatches: ["#C2410C", "#E8A33D", "#7C2D12"] },
  { id: "earth", label: "درجات ترابية", swatches: ["#8A6A4A", "#B9A27A", "#4B5A3A"] },
  { id: "cool", label: "باردة ومحايدة", swatches: ["#1E3A5F", "#3E7C8C", "#9AA7B4"] },
  { id: "custom", label: "تخصيص حر", swatches: [] },
];

export const label = {
  industry: (id: string, other?: string) => (id === "other" && other ? other : INDUSTRIES.find((i) => i.id === id)?.label ?? id),
  value: (id: string) => VALUES.find((v) => v.id === id)?.label ?? id,
  style: (id: string) => STYLES.find((s) => s.id === id)?.label ?? id,
};

export const LOGO_KINDS: { id: import("./types").LogoKind; label: string; hint: string }[] = [
  { id: "symbol", label: "رمز مجرد", hint: "شكل هندسي يعبّر عن الفكرة" },
  { id: "pictorial", label: "رمز تصويري", hint: "عنصر من النشاط أو معنى الاسم" },
  { id: "lettermark", label: "حرف / مونوغرام", hint: "الحرف الأول أو حرفان" },
  { id: "combo", label: "رمز + حرف", hint: "دمج الحرف مع عنصر" },
  { id: "emblem", label: "ختم / شارة", hint: "إطار دائري أو شعار كلاسيكي" },
];
