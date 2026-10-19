"use client";
// قفل التحميل: تسجيل + حفظ التصميم + دفع
import { useBrand } from "@/store/brand-store";
import { ensurePaid } from "../account/account-client";

export function paidGate(reason = "لتحميل ملفات هويتك.") {
  return ensurePaid(async () => {
    await useBrand.getState().saveToAccount(true);
    return useBrand.getState().saved?.id;
  }, reason);
}
