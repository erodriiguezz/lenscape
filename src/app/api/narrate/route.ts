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
// How many candidate voices to probe (real TTS calls) when nothing is
// configured and nothing is cached yet — bounds the worst-case latency
// and API usage of a cold start.
const MAX_DISCOVERY_ATTEMPTS = 5;

async function callTts(
  apiKey: string,
  voiceId: string,
  text: string,
): Promise<Response | null> {
  let res: Response;
  try {
    res = await fetch(
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
    return null;
  }
  return res.ok ? res : null;
}

async function listVoiceIds(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`${ELEVENLABS_VOICES_URL}?page_size=100`, {
      headers: { "xi-api-key": apiKey },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { voices?: { voice_id?: string }[] };
    return (data.voices ?? [])
      .map((v) => v.voice_id)
      .filter((id): id is string => Boolean(id));
  } catch {
    return [];
  }
}

// Whether a voice is callable via TTS on the current plan isn't something
// ElevenLabs exposes as a field on /v2/voices (not `is_owner`, not
// `category`) — free-tier keys can only call voices they've actually
// generated/cloned, and some premade voices work while others 402
// unpredictably. So we discover a working one by actually calling it, and
// cache whichever succeeds for the life of the server process.
let cachedVoiceId: string | undefined;

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

  // An explicit voice — from the caller or from env — is used as-is, no
  // discovery fallback, so a bad override fails loudly instead of silently
  // trying other voices.
  const explicitVoiceId =
    (typeof body.voiceId === "string" && body.voiceId) ||
    process.env.ELEVENLABS_VOICE_ID ||
    null;

  if (explicitVoiceId) {
    const upstream = await callTts(apiKey, explicitVoiceId, text);
    if (!upstream) {
      return Response.json(
        { error: `ElevenLabs rejected voice "${explicitVoiceId}".` },
        { status: 502 },
      );
    }
    return streamAudio(upstream);
  }

  // No voice configured — try the cached one first.
  if (cachedVoiceId) {
    const upstream = await callTts(apiKey, cachedVoiceId, text);
    if (upstream) return streamAudio(upstream);
    cachedVoiceId = undefined; // stopped working; rediscover below
  }

  const candidates = await listVoiceIds(apiKey);
  for (const candidate of candidates.slice(0, MAX_DISCOVERY_ATTEMPTS)) {
    const upstream = await callTts(apiKey, candidate, text);
    if (upstream) {
      cachedVoiceId = candidate;
      return streamAudio(upstream);
    }
  }

  return Response.json(
    {
      error:
        "No usable ElevenLabs voice found on this account. Set ELEVENLABS_VOICE_ID to a voice_id from your ElevenLabs dashboard.",
    },
    { status: 502 },
  );
}

// Raw audio bytes (mp3, per output_format above) — stream straight through.
function streamAudio(upstream: Response): Response {
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
    },
  });
}
