// صفحة اختبار للوحة التحكم (ليست جزءاً من مشروع Next.js)
import { createRoot } from "react-dom/client";
import { AdminDashboard, type AdminMe } from "@/components/admin/dashboard";
const settings = [
  { label: "مفتاح الجلسات AUTH_SECRET", value: "مضبوط", ok: true },
  { label: "حسابات الإدارة والديمو", value: "admin (إدارة)، demo (ديمو)" },
  { label: "الديمو العام بدون تسجيل", value: "مفعّل", ok: true, hint: "PUBLIC_DEMO" },
  { label: "قاعدة البيانات (العملاء والتصاميم)", value: "غير مربوطة — وضع العرض", ok: false, hint: "اربط Upstash من Vercel ← Storage" },
  { label: "الباقات", value: "مرة واحدة 227 ر.س · شهري 49 ر.س", hint: "NEXT_PUBLIC_PRICE_ONCE و NEXT_PUBLIC_PRICE_MONTHLY" },
  { label: "حفظ المسودة غير المدفوعة", value: "7 أيام لإكمال الشراء (لا توجد فترة مجانية)", hint: "DRAFT_DAYS" },
  { label: "طريقة الدفع", value: "يدوي — يطلب العميل التفعيل وتفعّله من «الطلبات والمدفوعات»", ok: false, hint: "NEXT_PUBLIC_PAYMENT_NOTE و NEXT_PUBLIC_WHATSAPP" },
  { label: "التسجيل بالبريد", value: "غير مفعّل", ok: false, hint: "RESEND_API_KEY و MAIL_FROM" },
  { label: "التسجيل بالجوال", value: "غير مفعّل", ok: false, hint: "TWILIO_* أو UNIFONIC_APP_SID" },
];
const demo = new URLSearchParams(location.search).has("demo");
fetch("/api/auth/me").then((r) => r.json()).then((m) => {
  const me: AdminMe = { username: m.username ?? "", owner: !!m.owner, level: m.owner ? "owner" : m.level ?? "viewer" };
  createRoot(document.getElementById("root")!).render(<AdminDashboard me={me} brand="BrandForge AI — مولّد الهويات" settings={settings} kvReady demoStore={demo} />);
});
