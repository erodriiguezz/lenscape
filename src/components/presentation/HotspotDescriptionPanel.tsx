"use client";

/**
 * Description panel opened when a hotspot pin is clicked.
 * The description text here is what narration reads aloud.
 */

import { Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";
import { speakNarration, stopNarration } from "@/lib/narration";

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
      <div className="pointer-events-auto mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              Hotspot
            </p>
            <h2 className="truncate text-base font-semibold tracking-tight">
              {hotspot.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isNarrating ? "Stop reading" : "Read description"}
              onClick={() => {
                if (isNarrating) {
                  stopNarration();
                  useEditorStore.setState({ isNarrating: false });
                  return;
                }
                speakNarration(hotspot.description, {
                  onStart: () =>
                    useEditorStore.setState({ isNarrating: true }),
                  onEnd: () =>
                    useEditorStore.setState({ isNarrating: false }),
                });
              }}
            >
              <Volume2
                className={isNarrating ? "animate-pulse text-sky-600" : ""}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={closeHotspotPanel}
            >
              <X />
            </Button>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">
            Description — this text is what gets narrated
          </p>
          {editable ? (
            <Textarea
              value={hotspot.description}
              onChange={(e) =>
                updateHotspotDescription(hotspot.id, e.target.value)
              }
              className="min-h-28 resize-none text-sm leading-relaxed"
            />
          ) : (
            <p className="text-sm leading-relaxed text-foreground/90">
              {hotspot.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
