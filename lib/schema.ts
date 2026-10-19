// نموذج الإخراج المنظم للذكاء الاصطناعي — كما ورد في الوثيقة (القسم 4)
import type { IntakeInput } from "./types";
import { label } from "./labels";

const swatchFull = {
  type: "object",
  properties: { hex: { type: "string" }, cmyk: { type: "string" }, pantone: { type: "string" }, name: { type: "string" } },
  required: ["hex", "cmyk", "pantone", "name"],
};
const swatchNeutral = {
  type: "object",
  properties: { hex: { type: "string" }, cmyk: { type: "string" } },
  required: ["hex", "cmyk"],
};

export const brandSystemJSONSchema = {
  type: "object",
  properties: {
    brandStory: { type: "string", description: "فقرة عربية بليغة تشرح فلسفة الهوية ودلالات اختيار عناصرها" },
    archetype: { type: "string", description: "النمط النفسي للعلامة (مثل: المبتكر، الحكيم، البطل، المكتشف)" },
    palette: {
      type: "object",
      properties: {
        primary: swatchFull,
        secondary: swatchFull,
        accent: swatchFull,
        neutralDark: swatchNeutral,
        neutralLight: swatchNeutral,
      },
      required: ["primary", "secondary", "accent", "neutralDark", "neutralLight"],
    },
    typography: {
      type: "object",
      properties: {
        arabicHeading: { type: "string" },
        arabicBody: { type: "string" },
        englishHeading: { type: "string" },
        englishBody: { type: "string" },
      },
      required: ["arabicHeading", "arabicBody", "englishHeading", "englishBody"],
    },
    guidelines: {
      type: "object",
      properties: {
        clearSpaceRatio: { type: "string" },
        dos: { type: "array", items: { type: "string" } },
        donts: { type: "array", items: { type: "string" } },
      },
      required: ["clearSpaceRatio", "dos", "donts"],
    },
  },
  required: ["brandStory", "archetype", "palette", "typography", "guidelines"],
} as const;

/** القائمة السلبية الصارمة (Negative Prompting) */
export const NEGATIVE_LIST = [
  "أيقونة المنزل أو السقف المثلث المبتذلة للعقارات",
  "عربة التسوق أو الحقيبة البسيطة للتجارة الإلكترونية",
  "الدوائر المزدوجة المتطابقة",
  "الشارات والأختام الجاهزة (Badges)",
  "فنجان القهوة البخاري المكرر للمقاهي",
  "القلب أو الصليب الطبي المكرر للرعاية الصحية",
  "الأسهم الصاعدة المستهلكة والرسوم البيانية للمالية",
  "اللمبة والترس للتقنية",
  "الألوان النيون الصارخة إن لم تطلب",
];

export function buildBrandPrompt(input: IntakeInput, seed: number): string {
  return `أنت مدير إبداعي متخصص في الهويات البصرية العربية. صِغ نظام هوية متكاملاً ومبتكراً للعلامة التالية:

- اسم العلامة: ${input.brandName}${input.brandNameEn ? ` (بالإنجليزية: ${input.brandNameEn})` : ""}
- الشعار اللفظي: ${input.tagline || "—"}
- القطاع: ${label.industry(input.industry, input.industryOther)}
- القيم: ${input.brandValues.map(label.value).join("، ") || "—"}
- النمط البصري: ${label.style(input.visualStyle)}
- الفئة المستهدفة: ${input.targetAudience || "—"}
- تفضيل الألوان: ${input.colorPreference === "custom" ? `مخصص حول اللون ${input.customColor}` : input.colorPreference}
- نوع الشعار المفضل: ${input.logoTypes?.join("، ") || "—"}
- عناصر يحب رؤيتها: ${input.likes || "—"}
- عناصر يتجنبها: ${input.avoid || "—"}

قواعد إلزامية:
1. brandStory: فقرة عربية فصيحة وبليغة (70–110 كلمة) تشرح فلسفة الهوية ودلالة الألوان والأسلوب، دون مبالغات فارغة.
2. palette: ألوان متناغمة ومتمايزة بوضوح، HEX بصيغة #RRGGBB. يجب أن يحقق neutralDark على neutralLight تبايناً لا يقل عن 7:1، وأن يكون primary مقروءاً على neutralLight (3:1 على الأقل). name اسم عربي قصير للون.
3. typography: اختر حصراً من: العناوين العربية (Readex Pro أو Tajawal)، النصوص العربية (IBM Plex Sans Arabic)، العناوين الإنجليزية (Inter أو Outfit)، النصوص الإنجليزية (Plus Jakarta Sans).
4. guidelines: clearSpaceRatio بصيغة مثل "0.5x"، و5 إرشادات مسموحة و5 ممنوعة بالعربية، محددة وعملية.
5. تجنّب تماماً هذه الكليشيهات: ${NEGATIVE_LIST.join("، ")}.
6. بذرة التفرد لهذا الطلب: ${seed.toString(36)} — استخدمها لتنويع اختياراتك عن أي هوية سابقة؛ لا تكرر لوحات الألوان الشائعة.`;
}
