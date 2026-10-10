"use client";
import type { BrandIdentity, ContactInfo } from "@/lib/types";
import { selectedConcept } from "@/store/brand-store";
import { bestTextOn } from "@/lib/color";
import { fontStack } from "@/lib/fonts";
import { qrSvg } from "@/lib/qr";
import { IconBox, LockupBox, PatternLayer, PRINT_SPECS, Sheet } from "./kit";
import { SvgBox } from "../ui/primitives";
import { Globe, Mail, MapPin, Phone } from "lucide-react";

interface P { identity: BrandIdentity; contact: ContactInfo; guides?: boolean; printId?: string }

export function BusinessCardFront({ identity, guides, printId }: P) {
  const p = identity.palette;
  const c = selectedConcept(identity);
  const onPrimary = bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex);
  const variant = onPrimary === p.neutralLight.hex ? "mono-light" : "mono-dark";
  return (
    <Sheet spec={PRINT_SPECS.cardFront} bg={p.primary.hex} guides={guides} printId={printId}>
      {/* نمط زخرفي مقتطع بانحناءة */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "44%", overflow: "hidden", clipPath: "ellipse(100% 75% at 0% 50%)" }}>
        <div style={{ position: "absolute", inset: 0, background: p.secondary.hex, opacity: 0.55 }} />
        <PatternLayer concept={c} color={onPrimary} opacity={0.22} scale={0.32} />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingInlineStart: "14mm" }}>
        <LockupBox identity={identity} layout="vertical" variant={variant} heightMm={30} showTagline={!!identity.metadata.tagline} />
      </div>
      <div style={{ position: "absolute", bottom: `${PRINT_SPECS.cardFront.bleed}mm`, right: `${PRINT_SPECS.cardFront.bleed}mm`, width: "26mm", height: "1.2mm", background: p.accent.hex }} />
    </Sheet>
  );
}

export function vcardText(identity: BrandIdentity, contact: ContactInfo) {
  const clean = (s: string) => s.replace(/[;:,]/g, " ");
  return `MECARD:N:${clean(contact.personName)};ORG:${clean(identity.metadata.brandName)};TEL:${contact.phone.replace(/\s/g, "")};EMAIL:${contact.email};URL:${contact.website};;`;
}

export function BusinessCardBack({ identity, contact, guides, printId }: P) {
  const p = identity.palette;
  const c = selectedConcept(identity);
  const t = identity.typography;
  const b = PRINT_SPECS.cardBack.bleed;
  const qr = qrSvg(vcardText(identity, contact), { fg: p.neutralDark.hex, border: 0, ecc: "M" });
  const row = (Icon: typeof Phone, text: string, ltr = false) => (
    <div style={{ display: "flex", alignItems: ltr ? "center" : "flex-start", gap: "1.6mm", minHeight: "4.1mm", paddingTop: ltr ? 0 : "0.6mm" }}>
      <Icon style={{ width: "2.6mm", height: "2.6mm", color: p.primary.hex, flexShrink: 0 }} strokeWidth={2.2} />
      <span style={{ fontSize: "6.6pt", direction: ltr ? "ltr" : "rtl", fontFamily: ltr ? fontStack(t.englishBody) : fontStack(t.arabicBody), color: p.neutralDark.hex, whiteSpace: ltr ? "nowrap" : "normal", lineHeight: 1.35 }}>
        {text}
      </span>
    </div>
  );
  return (
    <Sheet spec={PRINT_SPECS.cardBack} bg={p.neutralLight.hex} guides={guides} printId={printId}>
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${b + 2.2}mm`, background: p.primary.hex }} />
      <div style={{ position: "absolute", top: `${b + 6}mm`, right: `${b + 7}mm`, left: `${b + 30}mm` }}>
        <div style={{ fontFamily: fontStack(t.arabicHeading), fontWeight: 700, fontSize: "11pt", color: p.neutralDark.hex, lineHeight: 1.25 }}>{contact.personName}</div>
        <div style={{ fontFamily: fontStack(t.arabicBody), fontSize: "7pt", color: p.secondary.hex, marginTop: "0.6mm" }}>{contact.jobTitle}</div>
        <div style={{ width: "10mm", height: "0.5mm", background: p.accent.hex, margin: "2.4mm 0 2mm" }} />
        {row(Phone, contact.phone, true)}
        {row(Mail, contact.email, true)}
        {row(Globe, contact.website, true)}
        {row(MapPin, contact.address)}
      </div>
      <div style={{ position: "absolute", top: `${b + 6}mm`, left: `${b + 6}mm`, width: "19mm", display: "flex", flexDirection: "column", alignItems: "center", gap: "2mm" }}>
        <SvgBox svg={qr} style={{ width: "19mm", height: "19mm" }} />
        <span style={{ fontSize: "5pt", color: p.neutralDark.hex, opacity: 0.6, fontFamily: fontStack(t.arabicBody) }}>امسح لحفظ جهة الاتصال</span>
      </div>
      <div style={{ position: "absolute", bottom: `${b + 4.5}mm`, left: `${b + 6}mm`, display: "flex", alignItems: "center", gap: "1.5mm" }}>
        <IconBox concept={c} palette={p} sizeMm={5} />
      </div>
    </Sheet>
  );
}
