"use client";

import {
  Box,
  Camera,
  Heart,
  MapPin,
  Play,
  Plus,
  Route,
  Zap,
} from "lucide-react";
import type { HotspotDefinition } from "@/lib/presentations/heart-tour";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function iconFor(hotspot: HotspotDefinition) {
  const key = `${hotspot.id} ${hotspot.title}`.toLowerCase();
  if (key.includes("overview")) return Heart;
  if (key.includes("valve") || key.includes("camera")) return Camera;
  if (key.includes("node") || key.includes("bundle") || key.includes("purkinje"))
    return Zap;
  if (
    key.includes("aorta") ||
    key.includes("artery") ||
    key.includes("trunk") ||
    key.includes("coronary")
  )
    return Route;
  if (key.includes("ventricle") || key.includes("atrium") || key.includes("septum"))
    return Box;
  return MapPin;
}

export function TourStoryboard() {
  const hotspots = useEditorStore((s) => s.hotspots);
  const currentStepIndex = useEditorStore((s) => s.currentStepIndex);
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);
  const openHotspot = useEditorStore((s) => s.openHotspot);
  const playTour = useEditorStore((s) => s.playTour);

  return (
    <div className="flex h-studio-timeline shrink-0 flex-col border-t border-studio-border-subtle bg-studio-surface-container">
      <div className="flex items-center justify-between border-b border-studio-border-subtle bg-studio-surface-container-low px-4 py-2">
        <span className="font-studio-heading text-studio-label-sm tracking-wider text-studio-text-muted uppercase">
          Tour Storyboard
        </span>
        <button
          type="button"
          title="Play tour"
          onClick={playTour}
          className="cursor-pointer rounded-studio p-1 text-studio-on-surface-variant hover:bg-studio-surface-variant"
        >
          <Play className="size-[18px]" />
        </button>
      </div>
      <div className="flex flex-1 items-center gap-3 overflow-x-auto p-4">
        {hotspots.map((hotspot, index) => {
          const Icon = iconFor(hotspot);
          const active = hotspotPanelOpen && currentStepIndex === index;
          return (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => openHotspot(index, { speak: false })}
              className={cn(
                "relative flex h-full min-w-[160px] cursor-pointer flex-col items-start rounded-studio-lg border p-2 text-left transition-colors",
                active
                  ? "border-studio-primary bg-studio-primary-container/10 ring-1 ring-studio-primary"
                  : "border-studio-border-subtle bg-studio-surface-variant hover:bg-studio-surface-container-highest",
              )}
            >
              {active && (
                <div className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border border-studio-primary-container bg-studio-primary" />
              )}
              <div className="mb-2 flex h-20 w-full items-center justify-center rounded-studio bg-studio-surface-muted">
                <Icon
                  className={cn(
                    "size-7",
                    active ? "text-studio-primary" : "text-studio-text-muted",
                  )}
                />
              </div>
              <div
                className={cn(
                  "flex w-full items-center gap-2",
                  active ? "text-studio-primary" : "text-studio-on-surface-variant",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span
                  className={cn(
                    "truncate font-studio-heading text-studio-label-sm",
                    active && "font-bold",
                  )}
                >
                  {hotspot.title}
                </span>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          disabled
          title="Adding new steps is coming soon"
          className="group flex h-full min-w-[160px] cursor-not-allowed flex-col items-center justify-center rounded-studio-lg border border-dashed border-studio-border-subtle bg-studio-surface-variant/60 p-2 text-studio-text-muted/60"
        >
          <Plus className="mb-2 size-8" />
          <span className="font-studio-heading text-studio-label-sm">
            Add New Step
          </span>
        </button>
        {/* TODO: storyboard authoring — reorder steps, add/remove hotspots */}
      </div>
    </div>
  );
}
