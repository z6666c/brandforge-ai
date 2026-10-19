// لوحة التحكم (حساب الإدارة فقط — محمية أيضاً في proxy.ts)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, readToken } from "@/lib/auth";
import { kvAvailable } from "@/lib/kv";
import { checkStaff } from "@/lib/api-guard";
import { settingsRows } from "@/lib/admin-settings";
import { compositionSpace, totalSpace } from "@/lib/logo";
import { readName } from "@/lib/logo/name-families";
import { AdminDashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const s = await readToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (await checkStaff(s, "read")) redirect("/login?next=/admin");
  const me = { username: s!.u, owner: !s!.m, level: s!.m ? (s!.lv ?? "viewer") : ("owner" as const) };
  const settings = [
    ...settingsRows(),
    { label: "محرك الشعارات — تركيبات علامة نموذجية", value: compositionSpace(readName("زهرة", undefined, "beauty")).toLocaleString("ar-SA") },
    { label: "محرك الشعارات — إجمالي التركيبات", value: totalSpace().toLocaleString("ar-SA") },
  ];
  return <AdminDashboard me={me} brand="BrandForge AI — مولّد الهويات" settings={settings} kvReady={kvAvailable()} />;
}
