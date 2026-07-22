"use client";

import dynamic from "next/dynamic";
import { Play } from "lucide-react";
import { NodeTree } from "@/components/editor/NodeTree";
import { Inspector } from "@/components/editor/Inspector";
import { TourOverlay } from "@/components/presentation/TourOverlay";
import { HotspotDescriptionPanel } from "@/components/presentation/HotspotDescriptionPanel";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";

const ModelViewport = dynamic(
  () =>
    import("@/components/viewer/ModelViewport").then((m) => m.ModelViewport),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-sm text-neutral-400">
        Loading 3D viewport…
      </div>
    ),
  },
);

export function EditorLayout() {
  const modelName = useEditorStore((s) => s.model.name);
  const mode = useEditorStore((s) => s.mode);
  const playTour = useEditorStore((s) => s.playTour);
  const setMode = useEditorStore((s) => s.setMode);
  const hotspotCount = useEditorStore((s) => s.hotspots.length);

  const presenting = mode === "present";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight">Lenscape</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">{modelName}</span>
          {presenting && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-sky-600">Presentation</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* TODO: storyboard / timeline — open storyboard panel, reorder tour steps */}
          {/* TODO: public viewer mode — "Publish" linking to /view/[id] */}
          {presenting ? (
            <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
              Back to editor
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5" onClick={playTour}>
              <Play className="size-3.5" />
              Present tour
              <span className="text-primary-foreground/70">
                ({hotspotCount})
              </span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {!presenting && <NodeTree />}
        <main className="relative min-w-0 flex-1">
          <ModelViewport />
          <TourOverlay />
          <HotspotDescriptionPanel />
        </main>
        {!presenting && <Inspector />}
      </div>
    </div>
  );
}
