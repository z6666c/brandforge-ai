"use client";
import type { BrandIdentity, ContactInfo } from "@/lib/types";
import { selectedConcept } from "@/store/brand-store";
import { bestTextOn } from "@/lib/color";
import { fontStack } from "@/lib/fonts";
import { symbolFlat } from "@/lib/logo/render";
import { LockupBox, PatternLayer, PRINT_SPECS, Sheet } from "./kit";
import { SvgBox } from "../ui/primitives";

interface P { identity: BrandIdentity; contact: ContactInfo; guides?: boolean; printId?: string }

export function Letterhead({ identity, contact, guides, printId }: P) {
  const p = identity.palette;
  const t = identity.typography;
  const c = selectedConcept(identity);
  const b = PRINT_SPECS.letterhead.bleed;
  const onPrimary = bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex);
  const small = { fontFamily: fontStack(t.arabicBody), fontSize: "8pt", color: p.neutralDark.hex };
  const ltr = { fontFamily: fontStack(t.englishBody), direction: "ltr" as const, unicodeBidi: "isolate" as const };
  return (
    <Sheet spec={PRINT_SPECS.letterhead} bg="#FFFFFF" guides={guides} printId={printId}>
      {/* شريط علوي رفيع */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${b + 3}mm`, background: p.primary.hex }} />
      <div style={{ position: "absolute", top: `${b + 3}mm`, right: 0, width: "62mm", height: "1.4mm", background: p.accent.hex }} />

      {/* الترويسة */}
      <div style={{ position: "absolute", top: `${b + 14}mm`, right: `${b + 18}mm`, left: `${b + 18}mm`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <LockupBox identity={identity} layout="horizontal" heightMm={17} showTagline={!!identity.metadata.tagline} />
        <div style={{ ...small, fontSize: "8.5pt", lineHeight: 2, minWidth: "48mm" }}>
          {["الرقم", "التاريخ", "المرفقات"].map((l) => (
            <div key={l} style={{ display: "flex", gap: "2mm", alignItems: "baseline" }}>
              <span style={{ color: p.secondary.hex, fontWeight: 600, width: "15mm" }}>{l}:</span>
              <span style={{ flex: 1, borderBottom: `0.2mm dotted ${p.neutralDark.hex}55`, height: "4mm" }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: `${b + 40}mm`, right: `${b + 18}mm`, left: `${b + 18}mm`, height: "0.3mm", background: `${p.neutralDark.hex}22` }} />

      {/* علامة مائية ناعمة */}
      <SvgBox
        svg={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${symbolFlat(c, p.primary.hex)}</svg>`}
        style={{ position: "absolute", width: "125mm", height: "125mm", top: "50%", left: "50%", transform: "translate(-50%,-46%)", opacity: 0.035 }}
      />

      {/* التذييل */}
      <div style={{ position: "absolute", bottom: `${b + 22}mm`, right: `${b + 18}mm`, left: `${b + 18}mm`, display: "flex", justifyContent: "space-between", ...small, fontSize: "7.5pt", opacity: 0.85 }}>
        <span>
          السجل التجاري: <span style={ltr}>{contact.crNumber}</span>
        </span>
        <span>
          الرقم الضريبي: <span style={ltr}>{contact.vatNumber}</span>
        </span>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${b + 17}mm`, background: p.primary.hex, overflow: "hidden" }}>
        <PatternLayer concept={c} color={onPrimary} opacity={0.1} scale={0.45} />
        <div
          style={{
            position: "absolute", top: "5.5mm", right: `${b + 18}mm`, left: `${b + 18}mm`, display: "flex", justifyContent: "space-between", alignItems: "center",
            color: onPrimary, fontFamily: fontStack(t.arabicBody), fontSize: "7.6pt",
          }}
        >
          <span style={ltr}>{contact.phone}</span>
          <span style={ltr}>{contact.email}</span>
          <span style={ltr}>{contact.website}</span>
          <span style={{ maxWidth: "62mm", lineHeight: 1.4 }}>{contact.address}</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: `${b + 17}mm`, left: 0, width: "40mm", height: "1.2mm", background: p.accent.hex }} />
    </Sheet>
  );
}
