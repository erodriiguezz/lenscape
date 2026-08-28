"use client";

/**
 * Description panel opened when a hotspot pin is clicked.
 * The description text here is what narration reads aloud.
 */

import { Volume2, X } from "lucide-react";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";
import { speakNarration, stopNarration } from "@/lib/narration";
import { cn } from "@/lib/utils";

export function HotspotDescriptionPanel() {
  const open = useEditorStore((s) => s.hotspotPanelOpen);
  const mode = useEditorStore((s) => s.mode);
  const isNarrating = useEditorStore((s) => s.isNarrating);
  const closeHotspotPanel = useEditorStore((s) => s.closeHotspotPanel);
  const updateHotspotDescription = useEditorStore(
    (s) => s.updateHotspotDescription,
  );
  const hotspot = useCurrentHotspot();

  // Present mode uses TourOverlay for the full chrome; this panel is for edit clicks
  if (!open || !hotspot || mode === "present") return null;

  const editable = mode === "edit";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex p-4 md:p-6">
      <div className="lenscape-studio pointer-events-auto mx-auto w-full max-w-lg overflow-hidden rounded-studio-lg border border-studio-border-subtle bg-studio-surface-container/95 text-studio-on-surface shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3 border-b border-studio-border-subtle px-4 py-3">
          <div className="min-w-0">
            <p className="font-studio-heading text-studio-label-sm tracking-[0.16em] text-studio-text-muted uppercase">
              Hotspot
            </p>
            <h2 className="truncate font-studio-heading text-studio-headline-md text-studio-on-surface">
              {hotspot.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={isNarrating ? "Stop reading" : "Read description"}
              onClick={() => {
                if (isNarrating) {
                  stopNarration();
                  useEditorStore.setState({ isNarrating: false });
                  return;
                }
                speakNarration(hotspot.narration ?? hotspot.description, {
                  onStart: () =>
                    useEditorStore.setState({ isNarrating: true }),
                  onEnd: () =>
                    useEditorStore.setState({ isNarrating: false }),
                });
              }}
              className="flex size-7 cursor-pointer items-center justify-center rounded-studio text-studio-on-surface-variant transition-colors hover:bg-studio-surface-variant hover:text-studio-on-surface"
            >
              <Volume2
                className={cn(
                  "size-4",
                  isNarrating && "animate-pulse text-studio-primary",
                )}
              />
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={closeHotspotPanel}
              className="flex size-7 cursor-pointer items-center justify-center rounded-studio text-studio-on-surface-variant transition-colors hover:bg-studio-surface-variant hover:text-studio-on-surface"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <p className="font-studio-heading text-studio-label-sm text-studio-text-muted">
            Description — this text is what viewers see
          </p>
          {editable ? (
            <textarea
              value={hotspot.description}
              onChange={(e) =>
                updateHotspotDescription(hotspot.id, e.target.value)
              }
              className="min-h-28 w-full resize-none rounded-studio border border-studio-border-subtle bg-studio-bg-canvas px-3 py-2 font-studio-body text-studio-body-md leading-relaxed text-studio-on-surface outline-none focus:border-studio-primary"
            />
          ) : (
            <p className="font-studio-body text-studio-body-md leading-relaxed text-studio-on-surface/90">
              {hotspot.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
