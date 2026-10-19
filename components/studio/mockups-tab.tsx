"use client";
import { ensureAccount, isCustomer } from "../account/account-client";
import * as React from "react";
import { Download, FileArchive, FileText, Image as ImageIcon, PenTool, Braces } from "lucide-react";
import { useBrand } from "@/store/brand-store";
import { SCENES, SCENE_W, SCENE_H } from "../mockups/scenes";
import { FitScale, PX_PER_MM } from "../print/kit";
import { Button, Card, Segmented, SectionTitle } from "../ui/primitives";
import { exportNodePng, exportPackage } from "./exporter";
import { slugName } from "@/lib/export/package";

export function MockupsTab() {
  const identity = useBrand((s) => s.identity)!;
  const contact = useBrand((s) => s.contact);
  const setNotice = useBrand((s) => s.setNotice);
  const [scene, setScene] = React.useState<(typeof SCENES)[number]["id"]>("desk");
  const [busy, setBusy] = React.useState(false);
  const S = SCENES.find((s) => s.id === scene)!.C;

  const downloadZip = async () => {
    if (!(await ensureAccount("لتحميل حزمة الهوية الكاملة."))) return;
    if (isCustomer()) await useBrand.getState().saveToAccount(true);
    setBusy(true);
    try {
      const warnings = await exportPackage();
      setNotice({ kind: warnings.length ? "warn" : "info", text: warnings.length ? `اكتمل التنزيل مع ملاحظات: ${warnings.join("، ")}` : "اكتمل تجهيز الحزمة الكاملة وتنزيلها." });
    } catch (e) {
      console.error(e);
      setNotice({ kind: "error", text: "تعذر تجهيز الحزمة: " + (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle
          eyebrow="Mockup Studio"
          title="المحاكاة على مشاهد واقعية"
          action={
            <Button variant="outline" size="sm" disabled={busy} onClick={() => exportNodePng(`scene-${scene}`, `${slugName(identity)}_mockup-${scene}.png`, 1920).catch(() => {})}>
              <ImageIcon className="h-4 w-4" /> تنزيل المشهد PNG
            </Button>
          }
        />
        <Segmented value={scene} onChange={setScene} options={SCENES.map((s) => ({ id: s.id, label: s.label }))} className="mb-4" />
        <div className="overflow-hidden rounded-2xl border border-line">
          <FitScale wMm={SCENE_W / PX_PER_MM} hMm={SCENE_H / PX_PER_MM}>
            <S identity={identity} contact={contact} />
          </FitScale>
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[1.2fr_1fr]">
          <div className="p-7">
            <div className="mb-1 text-xs font-medium text-ember">Full Brand Package</div>
            <h3 className="mb-2 font-display text-2xl font-bold">الحزمة الكاملة جاهزة للتسليم</h3>
            <p className="mb-6 text-sm leading-relaxed text-muted">ملف مضغوط واحد يضم كل ما تحتاجه المطبعة والمصمم والمطوّر، مولّد من حالة الهوية الحالية بكل تعديلاتك.</p>
            <Button variant="ember" size="lg" disabled={busy} onClick={downloadZip}>
              <FileArchive className="h-5 w-5" /> تنزيل الحزمة الكاملة (ZIP)
            </Button>
          </div>
          <div className="space-y-3 border-t border-line bg-paper p-7 md:border-t-0 md:border-s">
            {[
              { I: PenTool, t: "الشعارات المتجهية", d: "SVG بكل النسخ + PNG شفاف 2048px + Favicon" },
              { I: FileText, t: "مطبوعات جاهزة للطباعة", d: "PDF بدقة 300DPI مع القص وعلامات القص" },
              { I: Download, t: "دليل الهوية", d: "PDF من 3 صفحات" },
              { I: Braces, t: "بيانات الألوان والخطوط", d: "brand.json + tokens.css" },
              { I: ImageIcon, t: "صور المحاكاة", d: "3 مشاهد بدقة عالية" },
            ].map(({ I, t, d }) => (
              <div key={t} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-white p-2 ring-1 ring-line"><I className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="text-xs text-muted">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
