"use client";

import { useState } from "react";
import {
  ArrowRight,
  AudioLines,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  UnfoldHorizontal,
  Volume2,
} from "lucide-react";
import { findNode } from "@/lib/scene-graph";
import { resolveFocusedPartIds } from "@/lib/explode";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";
import { speakNarration, stopNarration } from "@/lib/narration";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const AXES: { key: "x" | "y" | "z"; color: string }[] = [
  { key: "x", color: "text-studio-error" },
  { key: "y", color: "text-studio-tertiary" },
  { key: "z", color: "text-studio-secondary" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-studio-heading text-studio-label-sm text-studio-text-muted">
      {children}
    </label>
  );
}

const studioInput =
  "w-full rounded-studio border border-studio-border-subtle bg-studio-bg-canvas px-3 py-2 font-studio-body text-studio-body-md text-studio-on-surface outline-none focus:border-studio-primary";

function InspectorTab({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: typeof SlidersHorizontal;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (active) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center justify-center gap-2 border-b border-studio-primary py-2 font-studio-heading text-studio-label-sm font-bold text-studio-primary"
      >
        <Icon className="size-4" />
        {label}
      </button>
    );
  }
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        title="Coming soon"
        className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 py-2 font-studio-heading text-studio-label-sm text-studio-text-muted/60"
      >
        <Icon className="size-4" />
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-2 py-2 font-studio-heading text-studio-label-sm text-studio-text-muted transition-colors hover:text-studio-on-surface"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export function Inspector() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const descriptions = useEditorStore((s) => s.descriptions);
  const setDescription = useEditorStore((s) => s.setDescription);
  const hotspots = useEditorStore((s) => s.hotspots);
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);
  const openHotspot = useEditorStore((s) => s.openHotspot);
  const updateHotspotTitle = useEditorStore((s) => s.updateHotspotTitle);
  const updateHotspotDescription = useEditorStore(
    (s) => s.updateHotspotDescription,
  );
  const updateHotspotNarration = useEditorStore(
    (s) => s.updateHotspotNarration,
  );
  const updateHotspotCameraDirection = useEditorStore(
    (s) => s.updateHotspotCameraDirection,
  );
  const isNarrating = useEditorStore((s) => s.isNarrating);
  const isolatedExplodeNodeName = useEditorStore(
    (s) => s.isolatedExplodeNodeName,
  );
  const toggleIsolatedExplode = useEditorStore(
    (s) => s.toggleIsolatedExplode,
  );
  const availableAnimations = useEditorStore((s) => s.availableAnimations);
  const playingAnimation = useEditorStore((s) => s.playingAnimation);
  const playAnimation = useEditorStore((s) => s.playAnimation);
  const stopAnimation = useEditorStore((s) => s.stopAnimation);
  const currentHotspot = useCurrentHotspot();
  const [regenerating, setRegenerating] = useState(false);
  const [tab, setTab] = useState<"properties" | "animation">("properties");

  const selected = selectedNodeId
    ? findNode(sceneGraph, selectedNodeId)
    : null;
  const meshNote = selectedNodeId
    ? (descriptions[selectedNodeId] ?? "")
    : "";

  const hotspotFromSelection = selected
    ? (hotspots.find((h) => h.targetNodeName === selected.name) ??
      hotspots.find((h) => h.highlightNodeNames?.includes(selected.name)) ??
      null)
    : null;

  // Prefer selection match; if a hotspot pin opened the panel, show that stop
  const activeHotspot =
    hotspotFromSelection ?? (hotspotPanelOpen ? currentHotspot : null);

  const showHotspot = Boolean(activeHotspot);

  const contextLabel = activeHotspot
    ? `Hotspot · ${activeHotspot.title}`
    : selected
      ? `Node · ${selected.name}`
      : "No selection";

  return (
    <aside className="flex h-full w-studio-inspector shrink-0 flex-col border-l border-studio-border-subtle bg-studio-surface-container-high text-studio-on-surface">
      <div className="flex items-center gap-3 border-b border-studio-border-subtle p-4">
        <SlidersHorizontal className="size-[18px] text-studio-primary" />
        <div className="min-w-0">
          <h2 className="font-studio-heading text-studio-label-md tracking-wider text-studio-text-muted uppercase">
            Inspector
          </h2>
          <p className="truncate font-studio-body text-studio-label-sm text-studio-on-surface">
            {contextLabel}
          </p>
        </div>
      </div>

      <nav className="flex border-b border-studio-border-subtle">
        <InspectorTab
          icon={SlidersHorizontal}
          label="Properties"
          active={tab === "properties"}
          onClick={() => setTab("properties")}
        />
        <InspectorTab
          icon={AudioLines}
          label="Animation"
          active={tab === "animation"}
          disabled={availableAnimations.length === 0}
          onClick={() => setTab("animation")}
        />
        <InspectorTab icon={Sparkles} label="AI Tools" disabled />
      </nav>

      {tab === "animation" ? (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          <h3 className="mb-1 font-studio-heading text-studio-label-sm text-studio-text-muted">
            Animation clips
          </h3>
          {availableAnimations.map((name) => {
            const isPlaying = playingAnimation === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => (isPlaying ? stopAnimation() : playAnimation(name))}
                className={cn(
                  "flex items-center gap-2 rounded-studio border px-3 py-2 text-left font-studio-heading text-studio-label-md transition-colors",
                  isPlaying
                    ? "border-studio-primary bg-studio-primary/15 text-studio-primary"
                    : "border-studio-border-subtle text-studio-on-surface-variant hover:border-studio-primary hover:text-studio-primary",
                )}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
                {name}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
          {!selected && !showHotspot ? (
            <p className="font-studio-body text-studio-body-md text-studio-text-muted">
              Select a mesh or click a hotspot pin to open its properties.
            </p>
          ) : activeHotspot ? (
            <>
              <div className="space-y-2">
                <FieldLabel>Step Title</FieldLabel>
                <input
                  type="text"
                  className={studioInput}
                  value={activeHotspot.title}
                  onChange={(e) =>
                    updateHotspotTitle(activeHotspot.id, e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1 font-studio-heading text-studio-label-sm text-studio-text-muted">
                    <Sparkles className="size-3.5 text-studio-tertiary" />
                    Description
                  </label>
                  <button
                    type="button"
                    title="AI regeneration is coming soon"
                    disabled={regenerating}
                    onClick={() => {
                      // TODO: AI generation — regenerate this description
                      setRegenerating(true);
                      window.setTimeout(() => setRegenerating(false), 900);
                    }}
                    className="flex items-center gap-1 font-studio-heading text-studio-label-sm text-studio-tertiary transition-colors hover:text-studio-tertiary-fixed-dim disabled:opacity-60"
                  >
                    {regenerating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    Re-generate
                  </button>
                </div>
                <textarea
                  rows={4}
                  className={cn(studioInput, "resize-none")}
                  value={activeHotspot.description}
                  onChange={(e) =>
                    updateHotspotDescription(activeHotspot.id, e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel>Narration script</FieldLabel>
                  <button
                    type="button"
                    title={isNarrating ? "Stop reading" : "Read narration"}
                    onClick={() => {
                      if (isNarrating) {
                        stopNarration();
                        useEditorStore.setState({ isNarrating: false });
                        return;
                      }
                      speakNarration(
                        activeHotspot.narration ?? activeHotspot.description,
                        {
                          onStart: () =>
                            useEditorStore.setState({ isNarrating: true }),
                          onEnd: () =>
                            useEditorStore.setState({ isNarrating: false }),
                        },
                      );
                    }}
                    className="text-studio-on-surface-variant transition-colors hover:text-studio-on-surface"
                  >
                    <Volume2
                      className={cn(
                        "size-4",
                        isNarrating && "animate-pulse text-studio-primary",
                      )}
                    />
                  </button>
                </div>
                <textarea
                  rows={3}
                  className={cn(studioInput, "resize-none")}
                  value={activeHotspot.narration ?? activeHotspot.description}
                  onChange={(e) =>
                    updateHotspotNarration(activeHotspot.id, e.target.value)
                  }
                />
              </div>

              <p className="font-studio-body text-studio-body-md text-studio-text-muted">
                Step{" "}
                {hotspots.findIndex((h) => h.id === activeHotspot.id) + 1} of{" "}
                {hotspots.length}
                {!hotspotPanelOpen && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="font-medium text-studio-primary underline-offset-2 hover:underline"
                      onClick={() => {
                        const idx = hotspots.findIndex(
                          (h) => h.id === activeHotspot.id,
                        );
                        if (idx >= 0) openHotspot(idx, { speak: false });
                      }}
                    >
                      Focus in view
                    </button>
                  </>
                )}
              </p>

              <div className="space-y-3 border-t border-studio-border-subtle pt-4">
                <h3 className="font-studio-heading text-studio-label-sm text-studio-text-muted">
                  Camera Direction
                </h3>
                <div className="space-y-1.5">
                  <span className="font-studio-mono text-studio-mono text-studio-on-surface-variant">
                    Look from
                  </span>
                  <div className="flex gap-1.5">
                    {AXES.map(({ key, color }) => (
                      <div
                        key={key}
                        className="flex min-w-0 flex-1 items-center gap-1 rounded-studio border border-studio-border-subtle bg-studio-bg-canvas px-1.5 py-1"
                      >
                        <span className={cn("shrink-0 text-[10px]", color)}>
                          {key.toUpperCase()}
                        </span>
                        <input
                          type="number"
                          step={0.05}
                          className="w-full min-w-0 border-none bg-transparent p-0 text-right font-studio-mono text-studio-mono text-studio-on-surface outline-none focus:ring-0"
                          value={
                            activeHotspot.cameraDirection[
                              key === "x" ? 0 : key === "y" ? 1 : 2
                            ]
                          }
                          onChange={(e) =>
                            updateHotspotCameraDirection(
                              activeHotspot.id,
                              key,
                              Number(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeHotspot.connections && activeHotspot.connections.length > 0 && (
                <div className="space-y-2 border-t border-studio-border-subtle pt-4">
                  <h3 className="font-studio-heading text-studio-label-sm text-studio-text-muted">
                    Connections
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {activeHotspot.connections.map((conn) => {
                      const targetIndex = hotspots.findIndex(
                        (h) => h.id === conn.hotspotId,
                      );
                      const target = hotspots[targetIndex];
                      if (!target) return null;
                      return (
                        <button
                          key={conn.hotspotId}
                          type="button"
                          onClick={() =>
                            openHotspot(targetIndex, { speak: false })
                          }
                          className="flex items-center justify-between gap-2 rounded-studio border border-studio-border-subtle bg-studio-bg-canvas px-3 py-2 text-left transition-colors hover:border-studio-primary"
                        >
                          <span className="font-studio-body text-studio-body-md text-studio-text-muted">
                            {conn.label}
                          </span>
                          <span className="flex shrink-0 items-center gap-1 font-studio-heading text-studio-label-sm text-studio-primary">
                            {target.title}
                            <ArrowRight className="size-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1">
                <p className="font-studio-heading text-studio-label-sm text-studio-text-muted">
                  Name
                </p>
                <p className="font-studio-body text-studio-body-md break-all text-studio-on-surface">
                  {selected?.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-studio-heading text-studio-label-sm text-studio-text-muted">
                  Node
                </p>
                <p className="font-studio-mono text-studio-mono break-all text-studio-text-muted">
                  {selected?.type}
                </p>
              </div>

              {selected &&
                resolveFocusedPartIds(new Set([selected.name])).size > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleIsolatedExplode(selected.name)}
                    aria-pressed={isolatedExplodeNodeName === selected.name}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-studio border py-2 font-studio-heading text-studio-label-md transition-colors",
                      isolatedExplodeNodeName === selected.name
                        ? "border-studio-primary bg-studio-primary/15 text-studio-primary"
                        : "border-studio-border-subtle text-studio-on-surface-variant hover:border-studio-primary hover:text-studio-primary",
                    )}
                  >
                    <UnfoldHorizontal className="size-4" />
                    {isolatedExplodeNodeName === selected.name
                      ? "Assemble this part"
                      : "Explode this part"}
                  </button>
                )}

              <Separator className="bg-studio-border-subtle" />

              <div className="flex flex-1 flex-col gap-2">
                <FieldLabel>Notes</FieldLabel>
                <textarea
                  placeholder="Add notes for this part…"
                  value={meshNote}
                  onChange={(e) =>
                    selectedNodeId &&
                    setDescription(selectedNodeId, e.target.value)
                  }
                  className={cn(studioInput, "min-h-32 flex-1 resize-none")}
                />
                {/* TODO: promote notes → hotspot description */}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
