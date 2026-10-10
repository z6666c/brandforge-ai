// استدعاء Google Gemini بإخراج JSON منظم (يُستخدم على الخادم فقط)
import type { BrandSystemAI, IntakeInput } from "./types";
import { brandSystemJSONSchema, buildBrandPrompt } from "./schema";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** تحويل JSON Schema القياسي إلى صيغة responseSchema القديمة (أنواع بأحرف كبيرة) */
function toLegacySchema(s: unknown): unknown {
  if (Array.isArray(s)) return s.map(toLegacySchema);
  if (s && typeof s === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(s)) o[k] = k === "type" && typeof v === "string" ? v.toUpperCase() : toLegacySchema(v);
    return o;
  }
  return s;
}

export async function generateWithGemini(input: IntakeInput, seed: number, signal?: AbortSignal): Promise<BrandSystemAI> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("NO_KEY");
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const call = async (legacy: boolean) => {
    const generationConfig: Record<string, unknown> = {
      responseMimeType: "application/json",
      temperature: 1,
      seed: seed % 2147483647,
    };
    if (legacy) generationConfig.responseSchema = toLegacySchema(brandSystemJSONSchema);
    else generationConfig.responseJsonSchema = brandSystemJSONSchema;
    return fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: buildBrandPrompt(input, seed) }] }], generationConfig }),
      signal,
    });
  };

  let res = await call(false);
  if (res.status === 400) {
    const body = await res.text();
    if (/responseJsonSchema|Unknown name/i.test(body)) res = await call(true);
    else throw new Error(`Gemini 400: ${body.slice(0, 300)}`);
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) throw new Error("Gemini: استجابة فارغة");
  return JSON.parse(text) as BrandSystemAI;
}
