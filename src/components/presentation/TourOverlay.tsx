"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Square,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TourOverlay() {
  const mode = useEditorStore((s) => s.mode);
  const hotspots = useEditorStore((s) => s.hotspots);
  const currentStepIndex = useEditorStore((s) => s.currentStepIndex);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const isNarrating = useEditorStore((s) => s.isNarrating);
  const playTour = useEditorStore((s) => s.playTour);
  const pauseTour = useEditorStore((s) => s.pauseTour);
  const nextStep = useEditorStore((s) => s.nextStep);
  const prevStep = useEditorStore((s) => s.prevStep);
  const stopTour = useEditorStore((s) => s.stopTour);
  const goToStep = useEditorStore((s) => s.goToStep);
  const hotspot = useCurrentHotspot();

  if (mode !== "present" || !hotspot) return null;

  const progress = ((currentStepIndex + 1) / hotspots.length) * 100;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-4 md:p-6">
      <div className="pointer-events-auto mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/85 text-white shadow-2xl backdrop-blur-md">
        <div className="h-0.5 bg-white/10">
          <div
            className="h-full bg-sky-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] tracking-[0.18em] text-sky-300/90 uppercase">
                Step {currentStepIndex + 1} of {hotspots.length}
              </p>
              <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                {hotspot.title}
              </h2>
            </div>
            {isNarrating && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs text-sky-200">
                <Volume2 className="size-3.5 animate-pulse" />
                Narrating
              </span>
            )}
          </div>

          <p className="max-h-28 overflow-y-auto text-sm leading-relaxed text-neutral-300 md:max-h-32">
            {hotspot.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                aria-label="Previous step"
              >
                <ChevronLeft />
              </Button>

              {isPlaying ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={pauseTour}
                >
                  <Pause className="size-3.5" />
                  Pause
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={playTour}
                >
                  <Play className="size-3.5" />
                  {currentStepIndex === hotspots.length - 1 && !isNarrating
                    ? "Replay"
                    : "Play"}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={nextStep}
                disabled={currentStepIndex >= hotspots.length - 1}
                aria-label="Next step"
              >
                <ChevronRight />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-neutral-300 hover:bg-white/10 hover:text-white"
              onClick={stopTour}
            >
              <Square className="size-3" />
              Exit tour
            </Button>
          </div>

          <div className="flex gap-1 overflow-x-auto pt-1">
            {hotspots.map((h, i) => (
              <button
                key={h.id}
                type="button"
                title={h.title}
                onClick={() => goToStep(i, { speak: true })}
                className={cn(
                  "h-1.5 w-6 shrink-0 rounded-full transition-colors",
                  i === currentStepIndex
                    ? "bg-sky-400"
                    : i < currentStepIndex
                      ? "bg-white/40"
                      : "bg-white/15 hover:bg-white/25",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
