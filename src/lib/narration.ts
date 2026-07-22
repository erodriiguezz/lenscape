"use client";

/**
 * Lightweight narration via the Web Speech API.
 * TODO: swap for streamed TTS (OpenAI / ElevenLabs) once backend AI is wired.
 */

let current: SpeechSynthesisUtterance | null = null;

export function speakNarration(
  text: string,
  opts?: {
    onEnd?: () => void;
    onStart?: () => void;
  },
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    opts?.onEnd?.();
    return;
  }

  stopNarration();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = "en-US";

  utterance.onstart = () => opts?.onStart?.();
  utterance.onend = () => {
    current = null;
    opts?.onEnd?.();
  };
  utterance.onerror = () => {
    current = null;
    opts?.onEnd?.();
  };

  current = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopNarration(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  current = null;
}

export function isNarrating(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
