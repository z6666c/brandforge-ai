import { NextResponse } from "next/server";
import { stat } from "@/lib/customers";
import type { BrandSystemAI, IntakeInput } from "@/lib/types";
import { generateWithGemini } from "@/lib/gemini";
import { generateLocalSystem, DEFAULT_GUIDELINES } from "@/lib/strategy";
import { normalizePalette } from "@/lib/validate";
import { sanitizeTypography } from "@/lib/fonts";
import { sessionFromRequest } from "@/lib/auth";
import { aiLimits, aiTier } from "@/lib/ai-tier";
import { clientIp, demoAiAllowed, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

// ملاحظة: brandSystemJSONSchema معرّف في lib/schema.ts ويُستخدم داخل generateWithGemini،
// لأن Next.js لا يسمح بتصدير أسماء إضافية من ملفات route.ts.

export async function POST(req: Request) {
  const session = await sessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401 });
  // حساب الديمو لا يستهلك رصيد نموذج الذكاء الاصطناعي المدفوع
  if (session.r === "demo" && !demoAiAllowed()) return NextResponse.json({ error: "DEMO" }, { status: 403 });
  // حد توليد الهوية بـ Gemini حسب نوع المستخدم (زائر بالساعة، والمسجّل يومياً) — بعده تُستخدم هوية المحرك المجاني
  const tier = await aiTier(session);
  const lim = aiLimits(tier);
  if (tier !== "admin" && !rateLimit(tier === "guest" ? `brand-ai:${clientIp(req)}` : `brand-ai:${tier}:${session.u}`, lim.identities, (tier === "guest" ? 1 : 24) * 3600_000)) {
    return NextResponse.json({ error: "DEMO_LIMIT" }, { status: 403 });
  }
  let body: { input?: IntakeInput; seed?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const input = body.input;
  const seed = Number(body.seed) >>> 0;
  if (!input?.brandName?.trim()) return NextResponse.json({ error: "اسم العلامة مطلوب" }, { status: 400 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "NO_KEY" }, { status: 501 });
  }

  try {
    const ai = await generateWithGemini(input, seed, AbortSignal.timeout(55_000));
    const local = generateLocalSystem(input, seed);
    // طبقة التحقق: لا نثق بقيم CMYK/Pantone من النموذج، ونصحح التباين والخطوط
    const { palette, notes } = normalizePalette(ai.palette, local.palette);
    const system: BrandSystemAI = {
      brandStory: typeof ai.brandStory === "string" && ai.brandStory.length > 40 ? ai.brandStory : local.brandStory,
      archetype: ai.archetype?.slice(0, 40) || local.archetype,
      palette,
      typography: sanitizeTypography(ai.typography),
      guidelines: {
        clearSpaceRatio: ai.guidelines?.clearSpaceRatio || DEFAULT_GUIDELINES.clearSpaceRatio,
        dos: Array.isArray(ai.guidelines?.dos) && ai.guidelines.dos.length >= 3 ? ai.guidelines.dos.slice(0, 6) : DEFAULT_GUIDELINES.dos,
        donts: Array.isArray(ai.guidelines?.donts) && ai.guidelines.donts.length >= 3 ? ai.guidelines.donts.slice(0, 6) : DEFAULT_GUIDELINES.donts,
      },
    };
    await stat("ai_identity");
    return NextResponse.json({ system, notes, model: process.env.GEMINI_MODEL || "gemini-3.8-flash" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطأ غير معروف";
    console.error("[brand/generate]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
