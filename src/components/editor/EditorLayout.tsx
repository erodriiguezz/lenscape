"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Play, Settings, Share2, UserRound } from "lucide-react";
import { NodeTree } from "@/components/editor/NodeTree";
import { Inspector } from "@/components/editor/Inspector";
import { TourStoryboard } from "@/components/editor/TourStoryboard";
import { TourOverlay } from "@/components/presentation/TourOverlay";
import { HotspotDescriptionPanel } from "@/components/presentation/HotspotDescriptionPanel";
import { TopNav } from "@/components/studio/TopNav";
import { useEditorStore } from "@/lib/store";
import { cn, stripExtension } from "@/lib/utils";

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
  const modelName = useEditorStore((s) => s.model.name);

  const presenting = mode === "present";

  return (
    <div className="lenscape-studio flex h-dvh flex-col overflow-hidden bg-studio-bg-canvas font-studio-body text-studio-body-md text-studio-on-surface">
      <TopNav
        nav={
          <>
            <span className="text-studio-border-subtle" aria-hidden>
              /
            </span>
            <Link
              href="/"
              title="Back to projects"
              className="flex shrink-0 items-center gap-1.5 rounded-studio px-2 py-1 font-studio-heading text-studio-label-md text-studio-on-surface-variant transition-colors hover:bg-studio-surface-variant hover:text-studio-on-surface"
            >
              <ArrowLeft className="size-3.5" />
              Projects
            </Link>
            <span className="text-studio-border-subtle" aria-hidden>
              /
            </span>
            <span
              className="truncate font-studio-heading text-studio-label-md text-studio-on-surface"
              title={modelName}
            >
              {stripExtension(modelName)}
            </span>
          </>
        }
        actions={
          <>
            <button
              type="button"
              disabled
              title="Sharing is coming soon"
              className="flex cursor-not-allowed items-center justify-center rounded-studio-full p-2 text-studio-on-surface-variant/60"
            >
              <Share2 className="size-[18px]" />
            </button>
            <button
              type="button"
              disabled
              title="Settings are coming soon"
              className="flex cursor-not-allowed items-center justify-center rounded-studio-full p-2 text-studio-on-surface-variant/60"
            >
              <Settings className="size-[18px]" />
            </button>

            {presenting ? (
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="cursor-pointer rounded-studio border border-studio-primary px-4 py-1.5 font-studio-heading text-studio-label-md text-studio-primary transition-colors hover:bg-studio-surface-variant"
              >
                Exit preview
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={playTour}
                  className="flex cursor-pointer items-center gap-1.5 rounded-studio border border-studio-primary px-4 py-1.5 font-studio-heading text-studio-label-md text-studio-primary transition-colors hover:bg-studio-surface-variant"
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

            <button
              type="button"
              disabled
              title="Account settings are coming soon"
              className="ml-2 flex size-8 cursor-not-allowed items-center justify-center overflow-hidden rounded-full border border-studio-border-subtle bg-studio-surface-variant"
            >
              <UserRound className="size-4 text-studio-on-surface-variant" />
            </button>
          </>
        }
      />

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
