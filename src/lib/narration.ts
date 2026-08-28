"use client";

/**
 * Narration playback. Tries the server-side ElevenLabs voice API first —
 * see src/app/api/narrate/route.ts — and falls back to the browser's Web
 * Speech API when no ELEVENLABS_API_KEY is configured, or the request
 * fails for any other reason. Callers don't need to know which path was
 * used.
 */

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

function speakWithWebSpeech(
  text: string,
  opts?: { onStart?: () => void; onEnd?: () => void },
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    opts?.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = "en-US";

  utterance.onstart = () => opts?.onStart?.();
  utterance.onend = () => opts?.onEnd?.();
  utterance.onerror = () => opts?.onEnd?.();

  window.speechSynthesis.speak(utterance);
}

/** Returns true if playback actually started — false means "fall back". */
async function speakWithElevenLabs(
  text: string,
  opts?: { onStart?: () => void; onEnd?: () => void },
): Promise<boolean> {
  let res: Response;
  try {
    res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    return false;
  }
  if (!res.ok) return false;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  audio.onplay = () => opts?.onStart?.();
  const cleanup = () => {
    URL.revokeObjectURL(url);
    if (currentObjectUrl === url) currentObjectUrl = null;
    if (currentAudio === audio) currentAudio = null;
    opts?.onEnd?.();
  };
  audio.onended = cleanup;
  audio.onerror = cleanup;

  try {
    await audio.play();
  } catch {
    URL.revokeObjectURL(url);
    return false;
  }

  currentAudio = audio;
  currentObjectUrl = url;
  return true;
}

export function speakNarration(
  text: string,
  opts?: {
    onEnd?: () => void;
    onStart?: () => void;
  },
): void {
  stopNarration();

  speakWithElevenLabs(text, opts)
    .then((started) => {
      if (!started) speakWithWebSpeech(text, opts);
    })
    .catch(() => speakWithWebSpeech(text, opts));
}

export function stopNarration(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isNarrating(): boolean {
  if (currentAudio) return true;
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
