/**
 * Server-side text-to-speech proxy for xAI's Grok voice API.
 *
 * The API key can't live in the browser, so narration.ts posts here and we
 * forward the request to xAI with the key attached server-side. Returns
 * 501 if XAI_API_KEY isn't configured — narration.ts falls back to the
 * browser's Web Speech API in that case, so the app works with or without
 * a key.
 *
 * Docs: https://docs.x.ai/developers/model-capabilities/audio/text-to-speech
 */

const XAI_TTS_URL = "https://api.x.ai/v1/tts";
const MAX_TEXT_LENGTH = 15_000;
const DEFAULT_VOICE_ID = "eve";

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "XAI_API_KEY is not configured on the server." },
      { status: 501 },
    );
  }

  let body: { text?: unknown; voiceId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json({ error: "`text` is required." }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json(
      { error: `\`text\` must be under ${MAX_TEXT_LENGTH} characters.` },
      { status: 400 },
    );
  }
  const voiceId =
    typeof body.voiceId === "string" && body.voiceId ? body.voiceId : DEFAULT_VOICE_ID;

  let upstream: Response;
  try {
    upstream = await fetch(XAI_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice_id: voiceId, language: "en" }),
    });
  } catch {
    return Response.json(
      { error: "Could not reach the xAI TTS API." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return Response.json(
      { error: `xAI TTS API error (${upstream.status}): ${detail}` },
      { status: upstream.status },
    );
  }

  // Default response is raw audio bytes (mp3) — stream it straight through.
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
    },
  });
}
