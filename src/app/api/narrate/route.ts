/**
 * Server-side text-to-speech proxy for ElevenLabs.
 *
 * The API key can't live in the browser, so narration.ts posts here and we
 * forward the request to ElevenLabs with the key attached server-side.
 * Returns 501 if ELEVENLABS_API_KEY isn't configured — narration.ts falls
 * back to the browser's Web Speech API in that case, so the app works with
 * or without a key.
 *
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech/convert
 */

const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const ELEVENLABS_VOICES_URL = "https://api.elevenlabs.io/v2/voices";
const MAX_TEXT_LENGTH = 5_000;
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

// Which voices are usable via the API depends on the account's plan —
// shared "voice library" voices (e.g. the well-known "Rachel" preset)
// return 402 payment_required on free-tier keys. Resolve a voice the
// *current* key can actually use instead of hardcoding one, and cache it
// per server process so we're not calling /v2/voices on every request.
let cachedVoiceId: string | null | undefined;

async function resolveAccountVoiceId(apiKey: string): Promise<string | null> {
  if (cachedVoiceId !== undefined) return cachedVoiceId;
  try {
    const res = await fetch(`${ELEVENLABS_VOICES_URL}?page_size=1`, {
      headers: { "xi-api-key": apiKey },
    });
    if (!res.ok) {
      cachedVoiceId = null;
      return null;
    }
    const data = (await res.json()) as { voices?: { voice_id?: string }[] };
    cachedVoiceId = data.voices?.[0]?.voice_id ?? null;
  } catch {
    cachedVoiceId = null;
  }
  return cachedVoiceId;
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ELEVENLABS_API_KEY is not configured on the server." },
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
    (typeof body.voiceId === "string" && body.voiceId) ||
    process.env.ELEVENLABS_VOICE_ID ||
    (await resolveAccountVoiceId(apiKey));

  if (!voiceId) {
    return Response.json(
      {
        error:
          "No usable ElevenLabs voice found on this account. Set ELEVENLABS_VOICE_ID to a voice_id from your ElevenLabs dashboard.",
      },
      { status: 502 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${ELEVENLABS_TTS_URL}/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, model_id: DEFAULT_MODEL_ID }),
      },
    );
  } catch {
    return Response.json(
      { error: "Could not reach the ElevenLabs API." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return Response.json(
      { error: `ElevenLabs API error (${upstream.status}): ${detail}` },
      { status: upstream.status },
    );
  }

  // Raw audio bytes (mp3, per output_format above) — stream straight through.
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
    },
  });
}
