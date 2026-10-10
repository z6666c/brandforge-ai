// لوحة الإدارة (حساب الإدارة فقط — محمية أيضاً في proxy.ts)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, readToken, accounts, authSecret } from "@/lib/auth";
import { compositionSpace, totalSpace } from "@/lib/logo";
import { readName } from "@/lib/logo/name-families";
import { Row } from "@/components/admin/row";
import { LogoutButton } from "@/components/admin/logout";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const s = await readToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (s?.r !== "admin") redirect("/login?next=/admin");
  const accs = accounts();
  const sample = compositionSpace(readName("زهرة", undefined, "beauty"));
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted">BrandForge AI</div>
          <h1 className="font-display text-2xl font-bold">لوحة الإدارة</h1>
        </div>
        <div className="flex gap-2">
          <a href="/" className="rounded-xl border border-line bg-white px-4 py-2 text-sm">فتح الاستوديو</a>
          <LogoutButton />
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-2 font-semibold">الحسابات</h2>
        {accs.map((a) => <Row key={a.username} label={a.role === "admin" ? "إدارة — صلاحيات كاملة" : "ديمو — محرك محلي بدون استهلاك Gemini"} value={a.username} ok />)}
        {!accs.some((a) => a.role === "demo") && <Row label="حساب الديمو" value="معطّل (DEMO_ENABLED=false)" ok={false} />}
        <p className="mt-3 text-xs leading-relaxed text-muted">تُغيَّر بيانات الدخول من متغيرات البيئة: ADMIN_USERNAME، ADMIN_PASSWORD، DEMO_USERNAME، DEMO_PASSWORD، DEMO_ENABLED.</p>
      </section>

      <section className="mb-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-2 font-semibold">الإعدادات</h2>
        <Row label="مفتاح الجلسات AUTH_SECRET" value={process.env.AUTH_SECRET ? "مضبوط" : authSecret() ? "افتراضي للتطوير فقط" : "غير مضبوط"} ok={!!process.env.AUTH_SECRET} />
        <Row label="Gemini (صياغة الهوية)" value={process.env.GEMINI_API_KEY ? process.env.GEMINI_MODEL || "gemini-3.8-flash" : "غير مفعّل — يعمل المحرك المحلي"} ok={!!process.env.GEMINI_API_KEY} />
        <Row label="أداة الشعارات التجريبية" value="Pollinations.ai (تجريبي، مجاني)" ok />
        <Row label="بيئة التشغيل" value={process.env.NODE_ENV ?? "development"} />
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-2 font-semibold">محرك الشعارات</h2>
        <Row label="التركيبات الممكنة لعلامة نموذجية («زهرة» — تجميل)" value={sample.toLocaleString("ar-SA")} />
        <Row label="إجمالي التركيبات عبر كل الرموز والحروف" value={totalSpace().toLocaleString("ar-SA")} />
        <p className="mt-3 text-xs leading-relaxed text-muted">الهويات تُولّد وتُحفظ في متصفح المستخدم (لا تُرسل للخادم إلا عند طلب صياغة Gemini).</p>
      </section>
    </main>
  );
}
