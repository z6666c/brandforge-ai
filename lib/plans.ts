// الباقات: اشتراك شهري أو شراء مرة واحدة (الأسعار من البيئة دون تغيير الكود)
export type PlanKind = "once" | "monthly";
export interface Plan { kind: PlanKind; name: string; price: number; currency: string; period: string; months?: number; includes: string[] }

const CUR = "ر.س";
const COMMON = [
  "الشعار بكل نسخه: SVG متجهي وPNG شفاف 2048px وأيقونة الموقع",
  "النسخ الأحادية والمعكوسة للطباعة والخلفيات الداكنة",
  "بطاقة الأعمال والورق الرسمي والمظروف والفاتورة PDF جاهزة للمطبعة 300DPI",
  "دليل الهوية: الألوان (HEX وCMYK وPantone) والخطوط وقواعد الاستخدام",
  "صور المحاكاة والنمط الزخرفي",
];
export const PLANS: Record<PlanKind, Plan> = {
  once: {
    kind: "once", name: "شراء مرة واحدة", price: Number(process.env.NEXT_PUBLIC_PRICE_ONCE || 227), currency: CUR, period: "مرة واحدة",
    includes: [...COMMON, "ملكية دائمة للتصميم وتحميل في أي وقت"],
  },
  monthly: {
    kind: "monthly", name: "اشتراك شهري", price: Number(process.env.NEXT_PUBLIC_PRICE_MONTHLY || 49), currency: CUR, period: "شهرياً", months: 1,
    includes: [...COMMON, "تعديل وتحميل بلا حدود طوال الاشتراك", "إلغاء في أي وقت"],
  },
};
export const PREVIEW_NOTE = "المعاينة مجانية بعلامة مائية. التحميل يُفتح بعد الدفع.";
export const PLAN = PLANS.once;

/** الأسعار المعدّلة من لوحة التحكم تتقدم على أسعار البيئة */
export type PriceSet = Partial<Record<PlanKind, number>>;
export function withPrices(p?: PriceSet | null): Record<PlanKind, Plan> {
  const ok = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0;
  return {
    once: { ...PLANS.once, price: ok(p?.once) ? p!.once! : PLANS.once.price },
    monthly: { ...PLANS.monthly, price: ok(p?.monthly) ? p!.monthly! : PLANS.monthly.price },
  };
}
