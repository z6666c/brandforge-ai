// صفحة اختبار للوحة التحكم (ليست جزءاً من مشروع Next.js)
import { createRoot } from "react-dom/client";
import { AdminDashboard, type AdminMe } from "@/components/admin/dashboard";
const settings = [{ label: "قاعدة البيانات", value: "ملف محلي (تطوير)", ok: false }, { label: "التسجيل بالبريد", value: "وضع تجربة", ok: false }];
fetch("/api/auth/me").then((r) => r.json()).then((m) => {
  const me: AdminMe = { username: m.username ?? "", owner: !!m.owner, level: m.owner ? "owner" : m.level ?? "viewer" };
  createRoot(document.getElementById("root")!).render(<AdminDashboard me={me} brand="BrandForge AI — اختبار" settings={settings} kvReady />);
});
