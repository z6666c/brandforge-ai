// نقطة دخول التجربة المحلية (خارج Next.js) — تستخدم نفس مكونات التطبيق
import { createRoot } from "react-dom/client";
import BrandForgeApp from "../components/app";
createRoot(document.getElementById("root")!).render(<BrandForgeApp />);
