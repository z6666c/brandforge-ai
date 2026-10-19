// صفحة اختبار للوحة التحكم (ليست جزءاً من مشروع Next.js)
import { createRoot } from "react-dom/client";
import { AdminDashboard } from "@/components/admin/dashboard";
const settings = [{ label: "قاعدة البيانات", value: "ملف محلي (تطوير)", ok: false }, { label: "التسجيل بالبريد", value: "وضع تجربة", ok: false }];
createRoot(document.getElementById("root")!).render(<AdminDashboard brand="BrandForge AI — اختبار" settings={settings} kvReady />);
