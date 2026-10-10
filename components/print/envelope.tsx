"use client";
import type { BrandIdentity, ContactInfo } from "@/lib/types";
import { selectedConcept } from "@/store/brand-store";
import { bestTextOn } from "@/lib/color";
import { fontStack } from "@/lib/fonts";
import { IconBox, LockupBox, PatternLayer, PRINT_SPECS, Sheet } from "./kit";

interface P { identity: BrandIdentity; contact: ContactInfo; guides?: boolean; printId?: string }

export function EnvelopeFront({ identity, contact, guides, printId }: P) {
  const p = identity.palette;
  const t = identity.typography;
  const c = selectedConcept(identity);
  const b = PRINT_SPECS.envelopeFront.bleed;
  const onPrimary = bestTextOn(p.primary.hex, p.neutralLight.hex, p.neutralDark.hex);
  return (
    <Sheet spec={PRINT_SPECS.envelopeFront} bg="#FFFFFF" guides={guides} printId={printId}>
      <div style={{ position: "absolute", top: `${b + 10}mm`, right: `${b + 12}mm` }}>
        <LockupBox identity={identity} layout="horizontal" heightMm={13} showTagline={false} />
        <div style={{ marginTop: "3mm", fontFamily: fontStack(t.arabicBody), fontSize: "7pt", color: p.neutralDark.hex, opacity: 0.75, lineHeight: 1.6, maxWidth: "70mm" }}>
          <div>{contact.address}</div>
          <div style={{ direction: "ltr", textAlign: "right", fontFamily: fontStack(t.englishBody) }}>{contact.phone} · {contact.website}</div>
        </div>
      </div>
      {/* مكان عنوان المستلم */}
      <div
        style={{
          position: "absolute", bottom: `${b + 20}mm`, left: `${b + 18}mm`, width: "95mm", padding: "4mm 5mm",
          borderInlineStart: `1mm solid ${p.accent.hex}`, background: `${p.neutralLight.hex}`, fontFamily: fontStack(t.arabicBody), color: p.neutralDark.hex,
        }}
      >
        <div style={{ fontSize: "8pt", color: p.secondary.hex, fontWeight: 600, marginBottom: "2mm" }}>إلى السادة /</div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: "6.5mm", borderBottom: `0.2mm dotted ${p.neutralDark.hex}66` }} />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${b + 9}mm`, background: p.primary.hex, overflow: "hidden" }}>
        <PatternLayer concept={c} color={onPrimary} opacity={0.14} scale={0.4} />
      </div>
      <div style={{ position: "absolute", bottom: `${b + 9}mm`, right: 0, width: "52mm", height: "1.2mm", background: p.accent.hex }} />
    </Sheet>
  );
}

/** الوجه الخلفي: اللسان مع ختم الإغلاق المطبوع */
export function EnvelopeBack({ identity, guides, printId }: P) {
  const p = identity.palette;
  const c = selectedConcept(identity);
  const s = PRINT_SPECS.envelopeBack;
  const W = s.w + s.bleed * 2, H = s.h + s.bleed * 2;
  const flapH = 42;
  const sealFg = bestTextOn(p.accent.hex, p.neutralLight.hex, p.neutralDark.hex);
  return (
    <Sheet spec={s} bg={p.neutralLight.hex} guides={guides} printId={printId}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d={`M0 0H${W}L${W / 2} ${s.bleed + flapH}Z`} fill={p.primary.hex} />
        <path d={`M0 ${H}L${W / 2} ${H * 0.52}L${W} ${H}Z`} fill={p.neutralDark.hex} opacity="0.05" />
        <path d={`M0 0L${W / 2} ${s.bleed + flapH}L${W} 0`} fill="none" stroke={p.accent.hex} strokeWidth="0.6" />
      </svg>
      <div
        style={{
          position: "absolute", top: `${s.bleed + flapH - 11}mm`, left: "50%", transform: "translateX(-50%)", width: "22mm", height: "22mm", borderRadius: "50%",
          background: p.accent.hex, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 1.2mm ${p.neutralLight.hex}`,
        }}
      >
        <IconBox concept={c} palette={p} mono={sealFg} sizeMm={12} />
      </div>
    </Sheet>
  );
}
