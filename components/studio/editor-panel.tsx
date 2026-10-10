"use client";
// المحرر المباشر (Live Co-Pilot): أي تعديل هنا ينعكس فوراً على كل المعاينات والمطبوعات
import * as React from "react";
import { ChevronDown, Plus, Trash2, WandSparkles } from "lucide-react";
import { useBrand } from "@/store/brand-store";
import type { ContactInfo, PaletteKey, Typography } from "@/lib/types";
import { normalizeHex } from "@/lib/color";
import { FONT_CHOICES } from "@/lib/fonts";
import { cn, Input } from "../ui/primitives";

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-line last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-semibold">
        {title}
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-3 px-5 pb-5">{children}</div>}
    </div>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1 block text-xs text-muted">{label}</span>
    {children}
  </label>
);

const COLOR_ROWS: { key: PaletteKey; label: string }[] = [
  { key: "primary", label: "الرئيسي" },
  { key: "secondary", label: "الثانوي" },
  { key: "accent", label: "التمييزي" },
  { key: "neutralDark", label: "محايد داكن" },
  { key: "neutralLight", label: "محايد فاتح" },
];

function ColorRow({ k, label }: { k: PaletteKey; label: string }) {
  const hex = useBrand((s) => s.identity!.palette[k].hex);
  const update = useBrand((s) => s.updateColor);
  const [draft, setDraft] = React.useState(hex);
  React.useEffect(() => setDraft(hex), [hex]);
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={hex} onChange={(e) => update(k, e.target.value)} className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-black/10" aria-label={label} />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted">{label}</div>
        <input
          value={draft}
          dir="ltr"
          onChange={(e) => { setDraft(e.target.value); const n = normalizeHex(e.target.value); if (n) update(k, n); }}
          onBlur={() => setDraft(hex)}
          className="w-full bg-transparent font-latin text-sm font-semibold uppercase tracking-wide outline-none"
        />
      </div>
    </div>
  );
}

export function EditorPanel() {
  const identity = useBrand((s) => s.identity)!;
  const contact = useBrand((s) => s.contact);
  const invoice = useBrand((s) => s.invoice);
  const tab = useBrand((s) => s.tab);
  const { updateMeta, updateTypography, updateContact, updateInvoice, updateItem, addItem, removeItem } = useBrand.getState();
  const contactField = (k: keyof ContactInfo, label: string, ltr = false) => (
    <Field label={label}>
      <Input value={contact[k]} dir={ltr ? "ltr" : "rtl"} onChange={(e) => updateContact({ [k]: e.target.value })} className="h-9 text-sm" />
    </Field>
  );
  return (
    <aside className="scrollbar-thin h-full overflow-y-auto bg-white">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <WandSparkles className="h-4 w-4 text-ember" />
        <div>
          <div className="text-sm font-semibold">المحرر المباشر</div>
          <div className="text-xs text-muted">كل تعديل يظهر فوراً في جميع المطبوعات</div>
        </div>
      </div>

      <Section title="الاسم والشعار اللفظي">
        <Field label="اسم العلامة">
          <Input value={identity.metadata.brandName} onChange={(e) => updateMeta({ brandName: e.target.value })} className="h-9 text-sm" />
        </Field>
        <Field label="الاسم باللاتينية">
          <Input value={identity.metadata.brandNameEn ?? ""} dir="ltr" onChange={(e) => updateMeta({ brandNameEn: e.target.value })} className="h-9 text-sm" />
        </Field>
        <Field label="الشعار اللفظي">
          <Input value={identity.metadata.tagline ?? ""} onChange={(e) => updateMeta({ tagline: e.target.value })} className="h-9 text-sm" />
        </Field>
      </Section>

      <Section title="الألوان">
        {COLOR_ROWS.map((r) => <ColorRow key={r.key} k={r.key} label={r.label} />)}
      </Section>

      <Section title="الخطوط">
        {(["arabicHeading", "englishHeading"] as (keyof Typography)[]).map((k) => (
          <Field key={k} label={k === "arabicHeading" ? "العناوين العربية" : "العناوين الإنجليزية"}>
            <div className="flex gap-2">
              {(FONT_CHOICES[k as "arabicHeading" | "englishHeading"] as readonly string[]).map((f) => (
                <button
                  key={f}
                  onClick={() => updateTypography(k, f)}
                  className={cn("flex-1 rounded-lg border px-2 py-2 text-sm transition", identity.typography[k] === f ? "border-ink bg-ink text-paper" : "border-line hover:border-ink/40")}
                >
                  {f}
                </button>
              ))}
            </div>
          </Field>
        ))}
        <p className="text-xs text-muted">النصوص: {identity.typography.arabicBody} / {identity.typography.englishBody}</p>
      </Section>

      <Section title="بيانات التواصل" defaultOpen={tab === "print" || tab === "mockups"}>
        {contactField("personName", "الاسم")}
        {contactField("jobTitle", "المسمى الوظيفي")}
        {contactField("phone", "الهاتف", true)}
        {contactField("email", "البريد الإلكتروني", true)}
        {contactField("website", "الموقع", true)}
        {contactField("address", "العنوان")}
        <div className="grid grid-cols-2 gap-2">
          {contactField("crNumber", "السجل التجاري", true)}
          {contactField("vatNumber", "الرقم الضريبي", true)}
        </div>
      </Section>

      {tab === "print" && (
        <Section title="بنود الفاتورة" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <Field label="رقم الفاتورة">
              <Input value={invoice.number} dir="ltr" onChange={(e) => updateInvoice({ number: e.target.value })} className="h-9 text-sm" />
            </Field>
            <Field label="التاريخ">
              <Input type="date" value={invoice.date} dir="ltr" onChange={(e) => updateInvoice({ date: e.target.value })} className="h-9 text-sm" />
            </Field>
          </div>
          <Field label="اسم العميل">
            <Input value={invoice.clientName} onChange={(e) => updateInvoice({ clientName: e.target.value })} className="h-9 text-sm" />
          </Field>
          {invoice.items.map((it) => (
            <div key={it.id} className="space-y-2 rounded-xl bg-paper p-3">
              <div className="flex gap-2">
                <Input value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} className="h-9 text-sm" />
                <button onClick={() => removeItem(it.id)} className="shrink-0 rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="حذف البند">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" min={0} value={it.qty} dir="ltr" onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} className="h-9 text-sm" aria-label="الكمية" />
                <Input type="number" min={0} value={it.unitPrice} dir="ltr" onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) })} className="h-9 text-sm" aria-label="سعر الوحدة" />
              </div>
            </div>
          ))}
          <button onClick={addItem} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-2.5 text-sm text-muted hover:border-ink/40 hover:text-ink">
            <Plus className="h-4 w-4" /> إضافة بند
          </button>
        </Section>
      )}
    </aside>
  );
}
