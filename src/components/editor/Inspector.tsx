"use client";

import { ExplodeControls } from "@/components/viewer/ExplodeControls";
import { findNode } from "@/lib/scene-graph";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function Inspector() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const descriptions = useEditorStore((s) => s.descriptions);
  const setDescription = useEditorStore((s) => s.setDescription);
  const hotspots = useEditorStore((s) => s.hotspots);
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);
  const openHotspot = useEditorStore((s) => s.openHotspot);
  const updateHotspotDescription = useEditorStore(
    (s) => s.updateHotspotDescription,
  );
  const currentHotspot = useCurrentHotspot();

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

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-3 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Inspector
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        <ExplodeControls />
        <Separator />

        {!selected && !showHotspot ? (
          <p className="text-sm text-muted-foreground">
            Select a mesh or click a hotspot pin to open its description.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {activeHotspot ? "Hotspot" : "Name"}
              </p>
              <p className="text-sm font-medium break-all">
                {activeHotspot?.title ?? selected?.name}
              </p>
            </div>

            {selected && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Node</p>
                <p className="text-sm break-all text-muted-foreground">
                  {selected.name}
                  <span className="text-muted-foreground/70">
                    {" "}
                    · {selected.type}
                  </span>
                </p>
              </div>
            )}

            <Separator />

            {activeHotspot ? (
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="hotspot-description"
                    className="text-xs text-muted-foreground"
                  >
                    Description (narrated)
                  </label>
                  {!hotspotPanelOpen && (
                    <button
                      type="button"
                      className="text-xs font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                      onClick={() => {
                        const idx = hotspots.findIndex(
                          (h) => h.id === activeHotspot.id,
                        );
                        if (idx >= 0) openHotspot(idx, { speak: false });
                      }}
                    >
                      Focus in view
                    </button>
                  )}
                </div>
                <Textarea
                  id="hotspot-description"
                  placeholder="Description read aloud during the tour…"
                  value={activeHotspot.description}
                  onChange={(e) =>
                    updateHotspotDescription(activeHotspot.id, e.target.value)
                  }
                  className="min-h-36 flex-1 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Step{" "}
                  {hotspots.findIndex((h) => h.id === activeHotspot.id) + 1} of{" "}
                  {hotspots.length}
                </p>
                {/* TODO: AI generation — regenerate this description */}
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-2">
                <label
                  htmlFor="node-description"
                  className="text-xs text-muted-foreground"
                >
                  Notes
                </label>
                <Textarea
                  id="node-description"
                  placeholder="Add notes for this part…"
                  value={meshNote}
                  onChange={(e) =>
                    selectedNodeId &&
                    setDescription(selectedNodeId, e.target.value)
                  }
                  className="min-h-32 flex-1 resize-none"
                />
                {/* TODO: promote notes → hotspot description */}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
