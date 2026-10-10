"use client";
// ستوديو المحاكاة: مشاهد واقعية بمنظور ثلاثي الأبعاد عبر CSS 3D (بدون مكتبات ثقيلة)
import * as React from "react";
import type { BrandIdentity, ContactInfo } from "@/lib/types";
import { selectedConcept } from "@/store/brand-store";
import { bestTextOn, hexToOklch, oklchToHex } from "@/lib/color";
import { BusinessCardBack, BusinessCardFront } from "../print/business-card";
import { Letterhead } from "../print/letterhead";
import { EnvelopeFront } from "../print/envelope";
import { LockupBox, PatternLayer, PX_PER_MM } from "../print/kit";

interface P { identity: BrandIdentity; contact: ContactInfo }
export const SCENE_W = 960, SCENE_H = 600;

const shade = (hex: string, dl: number) => {
  const o = hexToOklch(hex);
  return oklchToHex({ ...o, l: Math.max(0, Math.min(1, o.l + dl)) });
};

/** يضع مكون طباعة بمقاس حقيقي داخل صندوق بحجم بكسلي محدد */
function Scaled({ wMm, hMm, px, children }: { wMm: number; hMm: number; px: number; children: React.ReactNode }) {
  const s = px / (wMm * PX_PER_MM);
  return (
    <div style={{ width: px, height: hMm * PX_PER_MM * s, position: "relative", overflow: "hidden" }}>
      <div style={{ transform: `scale(${s})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>{children}</div>
    </div>
  );
}

const paperShadow = "0 1px 1px rgba(0,0,0,.08), 0 12px 24px -6px rgba(0,0,0,.28), 0 40px 60px -20px rgba(0,0,0,.25)";

export function DeskScene({ identity, contact, sceneRef }: P & { sceneRef?: React.Ref<HTMLDivElement> }) {
  const p = identity.palette;
  return (
    <div ref={sceneRef} style={{ width: SCENE_W, height: SCENE_H, position: "relative", overflow: "hidden", background: `radial-gradient(120% 90% at 30% 20%, #F4F1EA 0%, #DCD6CA 55%, #C9C1B2 100%)` }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: "repeating-linear-gradient(97deg, rgba(120,100,80,.05) 0 2px, transparent 2px 9px)" }} />
      <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
        <div style={{ position: "absolute", left: 360, top: -40, transform: "rotateX(38deg) rotateZ(-14deg)", transformStyle: "preserve-3d" }}>
          <div style={{ boxShadow: paperShadow, overflow: "hidden" }}>
            <Scaled wMm={216} hMm={303} px={380}><Letterhead identity={identity} contact={contact} /></Scaled>
          </div>
        </div>
        <div style={{ position: "absolute", left: 40, top: 300, transform: "rotateX(40deg) rotateZ(10deg)" }}>
          <div style={{ boxShadow: paperShadow }}>
            <Scaled wMm={226} hMm={116} px={400}><EnvelopeFront identity={identity} contact={contact} /></Scaled>
          </div>
        </div>
        <div style={{ position: "absolute", left: 90, top: 80, transform: "rotateX(40deg) rotateZ(-22deg)" }}>
          <div style={{ boxShadow: paperShadow, borderRadius: 4, overflow: "hidden" }}>
            <Scaled wMm={96} hMm={56} px={230}><BusinessCardBack identity={identity} contact={contact} /></Scaled>
          </div>
        </div>
        <div style={{ position: "absolute", left: 140, top: 150, transform: "rotateX(40deg) rotateZ(-8deg)" }}>
          <div style={{ boxShadow: paperShadow, borderRadius: 4, overflow: "hidden" }}>
            <Scaled wMm={96} hMm={56} px={230}><BusinessCardFront identity={identity} contact={contact} /></Scaled>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 40, bottom: 26, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${shade(p.secondary.hex, 0.15)}, ${p.secondary.hex})`, boxShadow: "0 18px 30px -10px rgba(0,0,0,.4)" }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #6b4a33, #2a1a10)" }} />
      </div>
    </div>
  );
}

export function CardsScene({ identity, contact, sceneRef }: P & { sceneRef?: React.Ref<HTMLDivElement> }) {
  const p = identity.palette;
  const bg = shade(p.neutralLight.hex, -0.06);
  return (
    <div ref={sceneRef} style={{ width: SCENE_W, height: SCENE_H, position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${p.neutralLight.hex} 0%, ${bg} 100%)` }}>
      <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
        {[
          { el: <BusinessCardFront identity={identity} contact={contact} />, l: 120, t: 120, r: "rotateY(18deg) rotateX(14deg) rotateZ(-8deg)" },
          { el: <BusinessCardBack identity={identity} contact={contact} />, l: 470, t: 230, r: "rotateY(-16deg) rotateX(12deg) rotateZ(6deg)" },
        ].map((c, i) => (
          <div key={i} style={{ position: "absolute", left: c.l, top: c.t, transform: c.r }}>
            <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 30px 50px -18px rgba(0,0,0,.45), 0 8px 14px -6px rgba(0,0,0,.2)" }}>
              <Scaled wMm={96} hMm={56} px={370}>{c.el}</Scaled>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 120, top: 400, width: 340, height: 30, background: "radial-gradient(ellipse at center, rgba(0,0,0,.18), transparent 70%)", filter: "blur(6px)" }} />
    </div>
  );
}

export function BagScene({ identity, sceneRef }: P & { sceneRef?: React.Ref<HTMLDivElement> }) {
  const p = identity.palette;
  const c = selectedConcept(identity);
  const front = p.primary.hex;
  const side = shade(front, -0.08);
  const onPrimary = bestTextOn(front, p.neutralLight.hex, p.neutralDark.hex);
  const variant = onPrimary === p.neutralLight.hex ? "mono-light" : "mono-dark";
  const W = 300, Hh = 360, D = 110;
  const bag = (x: number, scale: number, rot: number, colorFront: string, colorSide: string, inverse = false) => (
    <div style={{ position: "absolute", left: x, top: 150 + (1 - scale) * 200, perspective: 1600 }}>
      <div style={{ position: "relative", width: W, height: Hh, transformStyle: "preserve-3d", transform: `scale(${scale}) rotateX(-6deg) rotateY(${rot}deg)` }}>
        {/* المقابض */}
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: W / 2 - 55, top: -78, width: 110, height: 120, border: `7px solid ${shade(colorFront, -0.2)}`, borderBottom: "none", borderRadius: "60px 60px 0 0", transform: `translateZ(${i ? -D + 8 : -8}px)` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: colorSide, transform: `translateZ(${-D}px)` }} />
        <div style={{ position: "absolute", top: 0, left: W, width: D, height: Hh, background: `linear-gradient(90deg, ${colorSide}, ${shade(colorSide, -0.06)})`, transformOrigin: "left", transform: "rotateY(90deg)" }}>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,.15)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: colorFront, overflow: "hidden", boxShadow: "inset 0 -40px 60px -40px rgba(0,0,0,.25)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, opacity: inverse ? 0.6 : 1 }}>
            <PatternLayer concept={c} color={inverse ? p.primary.hex : onPrimary} opacity={0.2} scale={0.7} />
          </div>
          <div style={{ position: "absolute", inset: "0 0 70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LockupBox identity={identity} layout="vertical" variant={inverse ? "color" : variant} heightMm={46} showTagline={false} />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 26, background: "linear-gradient(rgba(0,0,0,.18), transparent)" }} />
        </div>
      </div>
    </div>
  );
  return (
    <div ref={sceneRef} style={{ width: SCENE_W, height: SCENE_H, position: "relative", overflow: "hidden", background: `linear-gradient(180deg, ${shade(p.neutralLight.hex, -0.02)} 0%, ${shade(p.neutralLight.hex, -0.1)} 72%, ${shade(p.neutralLight.hex, -0.16)} 72%, ${shade(p.neutralLight.hex, -0.12)} 100%)` }}>
      <div style={{ position: "absolute", left: 130, top: 500, width: 700, height: 50, background: "radial-gradient(ellipse at center, rgba(0,0,0,.28), transparent 70%)", filter: "blur(8px)" }} />
      {bag(160, 0.86, -26, p.neutralLight.hex, shade(p.neutralLight.hex, -0.07), true)}
      {bag(470, 1, -22, front, side)}
    </div>
  );
}

export const SCENES = [
  { id: "desk", label: "مكتب العمل", C: DeskScene },
  { id: "cards", label: "بطاقات الأعمال", C: CardsScene },
  { id: "bag", label: "أكياس التسوق", C: BagScene },
] as const;
