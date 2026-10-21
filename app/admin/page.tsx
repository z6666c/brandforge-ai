// لوحة التحكم (حساب الإدارة فقط — محمية أيضاً في proxy.ts)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, readToken } from "@/lib/auth";
import { kvAvailable, kvMemory } from "@/lib/kv";
import { checkStaff } from "@/lib/api-guard";
import { effectivePerms, getMember } from "@/lib/team";
import { settingsRows } from "@/lib/admin-settings";
import { compositionSpace, totalSpace } from "@/lib/logo";
import { readName } from "@/lib/logo/name-families";
import { AdminDashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const s = await readToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (await checkStaff(s, "read")) redirect("/login?next=/admin");
  const member = s!.m ? await getMember(s!.u) : null;
  const me = { username: s!.u, owner: !s!.m, level: member ? member.level : ("owner" as const), perms: member ? effectivePerms(member) : [] };
  const settings = [
    ...settingsRows(),
    { label: "محرك الشعارات — تركيبات علامة نموذجية", value: compositionSpace(readName("زهرة", undefined, "beauty")).toLocaleString("ar-SA-u-nu-latn") },
    { label: "محرك الشعارات — إجمالي التركيبات", value: totalSpace().toLocaleString("ar-SA-u-nu-latn") },
  ];
  return <AdminDashboard me={me} brand="BrandForge AI — مولّد الهويات" settings={settings} kvReady={kvAvailable() || kvMemory()} demoStore={kvMemory()} />;
}
