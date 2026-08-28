"use client";

import dynamic from "next/dynamic";
import { Play, Settings, Share2, UserRound } from "lucide-react";
import { NodeTree } from "@/components/editor/NodeTree";
import { Inspector } from "@/components/editor/Inspector";
import { TourStoryboard } from "@/components/editor/TourStoryboard";
import { TourOverlay } from "@/components/presentation/TourOverlay";
import { HotspotDescriptionPanel } from "@/components/presentation/HotspotDescriptionPanel";
import { InertNavLink } from "@/components/studio/InertNavLink";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ModelViewport = dynamic(
  () =>
    import("@/components/viewer/ModelViewport").then((m) => m.ModelViewport),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-studio-bg-canvas font-studio-body text-studio-body-md text-studio-text-muted">
        Loading 3D viewport…
      </div>
    ),
  },
);

export function EditorLayout() {
  const mode = useEditorStore((s) => s.mode);
  const playTour = useEditorStore((s) => s.playTour);
  const setMode = useEditorStore((s) => s.setMode);

  const presenting = mode === "present";

  return (
    <div className="lenscape-studio flex h-dvh flex-col overflow-hidden bg-studio-background font-studio-body text-studio-body-md text-studio-on-surface">
      <nav className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-studio-border-subtle bg-studio-surface px-4">
        <div className="flex items-center gap-6">
          <span className="font-studio-heading text-studio-headline-lg font-bold text-studio-primary">
            Lenscape
          </span>
          <div className="hidden items-center gap-4 md:flex">
            <InertNavLink label="Scene" active />
            <InertNavLink label="Assets" />
            <InertNavLink label="Collaborate" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            title="Share"
            className="flex items-center justify-center rounded-studio-full p-2 text-studio-on-surface-variant transition-colors hover:bg-studio-surface-variant"
          >
            <Share2 className="size-[18px]" />
          </button>
          <button
            type="button"
            title="Settings"
            className="flex items-center justify-center rounded-studio-full p-2 text-studio-on-surface-variant transition-colors hover:bg-studio-surface-variant"
          >
            <Settings className="size-[18px]" />
          </button>

          {presenting ? (
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="rounded-studio border border-studio-primary px-4 py-1.5 font-studio-heading text-studio-label-md text-studio-primary transition-colors hover:bg-studio-surface-variant"
            >
              Exit preview
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={playTour}
                className="flex items-center gap-1.5 rounded-studio border border-studio-primary px-4 py-1.5 font-studio-heading text-studio-label-md text-studio-primary transition-colors hover:bg-studio-surface-variant"
              >
                <Play className="size-3.5" />
                Preview
              </button>
              <button
                type="button"
                title="Publishing is coming soon"
                disabled
                className="cursor-not-allowed rounded-studio bg-studio-primary/40 px-4 py-1.5 font-studio-heading text-studio-label-md text-studio-on-primary/70"
              >
                Publish
              </button>
              {/* TODO: public viewer mode — publish flow to /view/[id] */}
            </>
          )}

          <div className="ml-2 flex size-8 items-center justify-center overflow-hidden rounded-full border border-studio-border-subtle bg-studio-surface-variant">
            <UserRound className="size-4 text-studio-on-surface-variant" />
          </div>
        </div>
      </nav>

      <div className={cn("flex min-h-0 flex-1")}>
        {!presenting && <NodeTree />}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <ModelViewport />
            <TourOverlay />
            <HotspotDescriptionPanel />
          </div>
          {!presenting && <TourStoryboard />}
        </main>
        {!presenting && <Inspector />}
      </div>
    </div>
  );
}
