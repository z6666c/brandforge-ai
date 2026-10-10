"use client";
import { useEffect, useMemo, useState } from "react";
import type { BrandIdentity } from "@/lib/types";
import { lockupSvg, type LockupLayout, type LockupVariant } from "@/lib/logo/render";
import { browserMeasure, resetMeasureCache } from "@/lib/measure";
import { selectedConcept } from "@/store/brand-store";

/** يعيد رقماً يتغير بعد اكتمال تحميل الخطوط لإعادة قياس النصوص */
export function useFontsVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    const bump = () => { resetMeasureCache(); if (alive) setV((x) => x + 1); };
    document.fonts.ready.then(bump);
    document.fonts.addEventListener?.("loadingdone", bump);
    return () => { alive = false; document.fonts.removeEventListener?.("loadingdone", bump); };
  }, []);
  return v;
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function useLockup(
  identity: BrandIdentity,
  layout: LockupLayout,
  variant: LockupVariant = "color",
  opts: { showTagline?: boolean; fontMode?: "app" | "file"; conceptIndex?: number } = {},
) {
  const fv = useFontsVersion();
  const concept = opts.conceptIndex !== undefined ? identity.concepts[opts.conceptIndex] : selectedConcept(identity);
  return useMemo(
    () =>
      lockupSvg({
        concept,
        palette: identity.palette,
        typography: identity.typography,
        name: identity.metadata.brandName,
        nameEn: identity.metadata.brandNameEn,
        tagline: identity.metadata.tagline,
        layout,
        variant,
        measure: browserMeasure,
        showTagline: opts.showTagline,
        fontMode: opts.fontMode ?? "app",
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [concept, identity.palette, identity.typography, identity.metadata, layout, variant, opts.showTagline, opts.fontMode, fv],
  );
}
