// المحرك المحلي لصياغة نظام الهوية — يعمل دون مفتاح API، ويُستخدم احتياطياً عند تعذر الاتصال بالنموذج
import type { BrandIdentity, BrandSystemAI, IntakeInput, LogoConcept, Palette } from "./types";
import { mulberry32, pick, range, chance, hashString } from "./random";
import { arabicColorName, hexToOklch, normalizeHex, oklchToHex } from "./color";
import { normalizePalette } from "./validate";
import { DEFAULT_TYPOGRAPHY, sanitizeTypography } from "./fonts";
import { label } from "./labels";

const HUE_RANGES = { warm: [22, 78], earth: [48, 100], cool: [195, 272] } as const;
const INDUSTRY_HUE: Record<string, number> = {
  tech: 255, realestate: 60, food: 40, ecommerce: 300, finance: 240, health: 175, education: 230, beauty: 350, logistics: 215, other: 200,
};

export function generateLocalPalette(input: IntakeInput, seed: number): Palette {
  const rng = mulberry32(seed ^ 0xa5a5a5a5);
  const v = new Set(input.brandValues);
  let h: number, c: number, l: number;
  const custom = input.colorPreference === "custom" ? normalizeHex(input.customColor ?? "") : null;
  if (custom) {
    const o = hexToOklch(custom);
    h = o.h; c = Math.max(0.04, o.c); l = o.l;
  } else {
    const pref = input.colorPreference === "custom" ? "cool" : input.colorPreference;
    const [a, b] = HUE_RANGES[pref];
    const ind = INDUSTRY_HUE[input.industry] ?? 200;
    const inRange = ind >= a && ind <= b;
    h = inRange && chance(rng, 0.5) ? ind + range(rng, -10, 10) : range(rng, a, b);
    c = pref === "earth" ? range(rng, 0.05, 0.085) : range(rng, 0.11, 0.16);
    l = range(rng, 0.42, 0.55);
  }
  if (v.has("luxury")) { l = Math.min(l, range(rng, 0.3, 0.38)); c *= 0.85; }
  if (v.has("playful")) { c *= 1.2; l = Math.max(l, 0.55); }
  if (v.has("simple")) c *= 0.8;
  if (v.has("trust") && input.colorPreference === "cool") h = range(rng, 235, 262);

  // الثانوي متناغم (مجاور أو أحادي الدرجة) والتباين القوي محجوز للون التمييزي
  const harmony = chance(rng, 0.75)
    ? { name: "analogous", d: range(rng, 24, 46) * (chance(rng, 0.5) ? 1 : -1) }
    : { name: "tonal", d: range(rng, -8, 8) };
  const primary = oklchToHex({ l, c, h });
  const sl = l < 0.45 ? range(rng, 0.58, 0.68) : range(rng, 0.3, 0.4);
  const secondary = oklchToHex({ l: sl, c: c * range(rng, 0.6, 0.9), h: (h + harmony.d + 360) % 360 });
  const accent = v.has("luxury") && chance(rng, 0.7)
    ? oklchToHex({ l: range(rng, 0.72, 0.78), c: 0.11, h: range(rng, 78, 90) })
    : oklchToHex({ l: range(rng, 0.7, 0.8), c: Math.min(0.19, c * 1.4 + 0.03), h: (h + pick(rng, [150, 180, 210, 45, -45]) + 360) % 360 });
  const neutralDark = oklchToHex({ l: range(rng, 0.17, 0.22), c: 0.018, h });
  const neutralLight = oklchToHex({ l: range(rng, 0.965, 0.98), c: 0.01, h });

  const raw = {
    primary: { hex: primary, cmyk: "", pantone: "", name: "" },
    secondary: { hex: secondary, cmyk: "", pantone: "", name: "" },
    accent: { hex: accent, cmyk: "", pantone: "", name: "" },
    neutralDark: { hex: neutralDark, cmyk: "" },
    neutralLight: { hex: neutralLight, cmyk: "" },
  };
  return normalizePalette(raw, raw as Palette).palette;
}

const VALUE_PHRASE: Record<string, string> = {
  luxury: "الرقيّ والتميز الهادئ",
  modern: "التجديد والريادة",
  simple: "الوضوح والصدق",
  playful: "البهجة والقرب من الناس",
  trust: "الثقة والالتزام",
  authentic: "الأصالة والجذور العميقة",
};
const ARCHETYPE: Record<string, string> = {
  luxury: "الحاكم",
  modern: "المبتكر",
  simple: "البريء",
  playful: "المرح",
  trust: "الراعي",
  authentic: "الحكيم",
};

function colorMeaning(hex: string): string {
  const { h, c, l } = hexToOklch(hex);
  if (c < 0.04) return "الرصانة والاتزان";
  if (h < 45 || h >= 340) return "الحيوية والشغف";
  if (h < 70) return l < 0.5 ? "الدفء والقرب من الأرض" : "الطاقة والدفء";
  if (h < 105) return "الإشراق والقيمة";
  if (h < 170) return "النمو والطمأنينة";
  if (h < 210) return "الصفاء والتوازن";
  if (h < 275) return "الثقة والعمق";
  return "الإبداع والتفرد";
}

export function localStory(input: IntakeInput, palette: Palette, seed: number): string {
  const rng = mulberry32(seed ^ 0x51ed27);
  const name = input.brandName.trim();
  const values = input.brandValues.length ? input.brandValues : ["modern"];
  const phrases = values.map((v) => VALUE_PHRASE[v]);
  const joined = phrases.length > 1 ? phrases.slice(0, -1).join("، ") + " و" + phrases[phrases.length - 1] : phrases[0];
  const audience = input.targetAudience?.trim() || "جمهورها";
  const ind = label.industry(input.industry, input.industryOther);
  const openers = [
    `«${name}» ليست مجرد اسم في قطاع ${ind}؛ إنها وعدٌ بـ${joined}.`,
    `وُلدت «${name}» لتعيد تعريف التجربة في قطاع ${ind}، حاملةً قيم ${joined}.`,
    `في عالم ${ind} المزدحم، تختار «${name}» طريقها بثبات قائمٍ على ${joined}.`,
  ];
  const middles = [
    `صُممت هويتها لتخاطب ${audience} بلغة بصرية ${label.style(input.visualStyle)}، يتصدرها اللون ${palette.primary.name} الذي يجسد ${colorMeaning(palette.primary.hex)}، ويسانده ${palette.secondary.name} بإيقاع متوازن، بينما يضيف ${palette.accent.name} لمسة من ${colorMeaning(palette.accent.hex)} في المواضع التي تستحق الانتباه.`,
    `تتحدث الهوية إلى ${audience} بأسلوب ${label.style(input.visualStyle)} واضح: ${palette.primary.name} أساسٌ يعبّر عن ${colorMeaning(palette.primary.hex)}، و${palette.secondary.name} يمنح التوازن، و${palette.accent.name} شرارةٌ تقود العين إلى ما يهم.`,
  ];
  const closers = [
    "إنها هوية تُرى فتُتذكَّر، وتُستخدم فتزداد رسوخاً مع كل نقطة تواصل.",
    "والنتيجة نظام بصري متماسك يكبر مع العلامة دون أن يفقد روحه.",
    "هكذا تتحول كل بطاقة وورقة وشاشة إلى امتداد واحد لقصة واحدة.",
  ];
  const tag = input.tagline?.trim() ? ` وشعارها «${input.tagline.trim()}» يختصر هذه الرؤية في كلمات.` : "";
  return `${pick(rng, openers)} ${pick(rng, middles)}${tag} ${pick(rng, closers)}`;
}

export const DEFAULT_GUIDELINES = {
  clearSpaceRatio: "0.5x — مساحة أمان حول الشعار تعادل نصف ارتفاع الرمز من جميع الجهات",
  dos: [
    "استخدم الشعار بألوانه الأصلية على الخلفية الفاتحة المعتمدة.",
    "استخدم النسخة البيضاء فوق اللون الرئيسي أو الداكن.",
    "حافظ على مساحة الأمان المحددة حول الشعار دائماً.",
    "استخدم النسخة أحادية اللون في الطباعة بلون واحد والختم والحفر.",
    "التزم بأزواج الخطوط المعتمدة للعناوين والنصوص.",
  ],
  donts: [
    "لا تمطّ الشعار أو تضغطه أو تغيّر نسبه.",
    "لا تدوّر الشعار أو تميله.",
    "لا تغيّر ألوان الشعار خارج لوحة الهوية.",
    "لا تضف ظلالاً أو توهجاً أو تأثيرات على الشعار.",
    "لا تضع الشعار فوق صور أو خلفيات مزدحمة تضعف وضوحه.",
  ],
};

export function generateLocalSystem(input: IntakeInput, seed: number): BrandSystemAI {
  const rng = mulberry32(seed ^ hashString("system"));
  const palette = generateLocalPalette(input, seed);
  const v0 = input.brandValues[0] ?? (input.industry === "tech" ? "modern" : "trust");
  const typography = {
    ...DEFAULT_TYPOGRAPHY,
    arabicHeading: input.visualStyle === "islamic" || input.brandValues.includes("authentic") ? "Tajawal" : chance(rng, 0.7) ? "Readex Pro" : "Tajawal",
    englishHeading: input.visualStyle === "tech3d" || input.brandValues.includes("playful") ? "Outfit" : chance(rng, 0.6) ? "Inter" : "Outfit",
  };
  return {
    brandStory: localStory(input, palette, seed),
    archetype: ARCHETYPE[v0] ?? "المبتكر",
    palette,
    typography: sanitizeTypography(typography),
    guidelines: DEFAULT_GUIDELINES,
  };
}

/** تجميع كائن الهوية النهائي وفق مخطط BrandIdentity */
export function assembleIdentity(
  input: IntakeInput, system: BrandSystemAI, concepts: LogoConcept[], seed: number, source: "ai" | "local",
): BrandIdentity {
  return {
    id: `bf_${seed.toString(36)}`,
    seed,
    source,
    metadata: {
      brandName: input.brandName.trim(),
      brandNameEn: input.brandNameEn?.trim() || undefined,
      tagline: input.tagline?.trim() || undefined,
      industry: input.industry === "other" && input.industryOther ? input.industryOther : input.industry,
      values: input.brandValues,
      style: input.visualStyle,
      audience: input.targetAudience,
      createdAt: new Date().toISOString(),
    },
    strategy: { brandStory: system.brandStory, archetype: system.archetype },
    palette: system.palette,
    typography: system.typography,
    assets: { logoSvg: "", iconSvg: "", monochromeSvg: "", patternSvg: "" }, // تُملأ عند التصدير من المفهوم المختار
    guidelines: system.guidelines,
    concepts,
    selectedConcept: 0,
  };
}

export { arabicColorName };
