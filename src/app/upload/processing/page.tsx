"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  CircleDot,
  Route,
  Sparkles,
  SwatchBook,
  XCircle,
} from "lucide-react";
import { useUploadFlowStore } from "@/lib/upload-store";
import { cn } from "@/lib/utils";

interface LogLine {
  at: number;
  text: string;
  tone?: "ok" | "active";
}

const LOG_LINES: LogLine[] = [
  { at: 0, text: "Parsing geometry data…" },
  { at: 20, text: "Identifying distinct material groups… OK", tone: "ok" },
  { at: 40, text: "Extracting diffuse textures…" },
  { at: 60, text: "Normalizing scale and origin points…" },
  { at: 82, text: "Generating low-poly proxy…", tone: "active" },
];

function stageFor(progress: number) {
  if (progress < 20) return "Analyzing scene hierarchy";
  if (progress < 50) return "Extracting materials";
  if (progress < 82) return "Optimizing geometry";
  if (progress < 100) return "Finalizing scene";
  return "Ready";
}

export default function ProcessingPage() {
  const router = useRouter();
  const pendingUpload = useUploadFlowStore((s) => s.pendingUpload);
  const clearUpload = useUploadFlowStore((s) => s.clearUpload);
  const [progress, setProgress] = useState(0);
  const redirected = useRef(false);

  // No in-flight upload (e.g. a direct link) — nothing to show, bounce back.
  // Skipped once we've started navigating away on completion, since clearing
  // the upload there would otherwise race this guard and win.
  useEffect(() => {
    if (!pendingUpload && !redirected.current) router.replace("/upload");
  }, [pendingUpload, router]);

  // Simulated ingestion pipeline. TODO: replace with real upload + AI
  // ingestion progress once a backend pipeline exists.
  useEffect(() => {
    if (!pendingUpload) return;
    const id = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 2 + Math.random() * 4));
    }, 160);
    return () => window.clearInterval(id);
  }, [pendingUpload]);

  useEffect(() => {
    if (progress < 100 || redirected.current) return;
    redirected.current = true;
    const id = window.setTimeout(() => {
      clearUpload();
      router.push("/editor");
    }, 900);
    return () => window.clearTimeout(id);
  }, [progress, clearUpload, router]);

  if (!pendingUpload) return null;

  const visibleLogs = LOG_LINES.filter((l) => progress >= l.at);

  return (
    <div className="lenscape-studio flex h-dvh flex-col overflow-hidden bg-studio-bg-canvas font-studio-body text-studio-body-md text-studio-on-surface">
      <main className="relative flex flex-1 items-center justify-center p-8">
        <div className="studio-mesh-bg pointer-events-none absolute inset-0 opacity-10" />

        <div className="relative z-10 flex h-full max-h-[700px] w-full max-w-[1200px] gap-3">
          <section className="relative flex flex-grow flex-col overflow-hidden rounded-studio-lg border border-studio-border-subtle bg-studio-surface">
            <div className="flex h-12 items-center justify-between border-b border-studio-border-subtle bg-studio-surface-container-low/50 px-4">
              <div className="flex items-center gap-2">
                <Boxes className="size-[18px] text-studio-text-muted" />
                <h2 className="font-studio-heading text-studio-headline-md text-studio-primary">
                  Model Ingestion
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-studio-mono text-studio-mono text-studio-text-functional">
                  {pendingUpload.projectName}
                </span>
                <div className="flex size-4 items-center justify-center rounded-full bg-studio-primary/20">
                  <div className="size-2 animate-pulse rounded-full bg-studio-primary" />
                </div>
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              <Boxes
                className="size-56 animate-spin text-studio-primary opacity-10"
                style={{ animationDuration: "18s" }}
              />

              <div className="absolute bottom-12 flex w-3/4 max-w-2xl flex-col gap-6 rounded-studio-lg border border-studio-border-subtle bg-studio-surface-overlay p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="mb-1 font-studio-heading text-studio-headline-lg text-studio-on-surface">
                      {progress < 100
                        ? "Deconstructing mesh…"
                        : "Ingestion complete"}
                    </h3>
                    <p className="font-studio-body text-studio-body-md text-studio-text-muted">
                      {stageFor(progress)}
                    </p>
                  </div>
                  <span className="font-studio-mono text-studio-mono text-studio-primary">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-studio-full bg-studio-surface-muted">
                  <div
                    className="h-full rounded-studio-full bg-studio-primary shadow-[0_0_15px_var(--studio-primary)] transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex h-20 flex-col gap-1 overflow-hidden font-studio-mono text-studio-mono text-studio-text-functional">
                  {visibleLogs.map((line) => (
                    <p
                      key={line.text}
                      className={cn(
                        line.tone === "ok" && "text-studio-tertiary",
                        line.tone === "active" && "text-studio-primary",
                      )}
                    >
                      &gt; {line.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="flex w-[320px] flex-col rounded-studio-lg border border-studio-border-subtle bg-studio-surface-container">
            <div className="flex items-center gap-3 border-b border-studio-border-subtle p-6">
              <Sparkles className="size-6 text-studio-primary" />
              <h3 className="font-studio-heading text-studio-headline-md text-studio-on-surface">
                AI Insights
              </h3>
            </div>
            <div className="flex flex-grow flex-col gap-6 overflow-y-auto p-6">
              <InsightCard
                icon={CircleDot}
                color="text-studio-primary"
                bg="bg-studio-primary/10"
                title="Semantic labeling"
                body="AI is grouping meshes into logical parts to speed up hotspot authoring."
              />
              <InsightCard
                icon={Route}
                color="text-studio-secondary"
                bg="bg-studio-secondary/10"
                title="Tour path generation"
                body="Analyzing navigable space to suggest camera paths for your tour."
              />
              <InsightCard
                icon={SwatchBook}
                color="text-studio-tertiary"
                bg="bg-studio-tertiary/10"
                title="Material optimization"
                body="Downsampling textures for fast web playback. Pending geometry pass."
                muted={progress < 82}
              />
            </div>
            <div className="border-t border-studio-border-subtle p-4">
              <button
                type="button"
                onClick={() => {
                  clearUpload();
                  router.push("/upload");
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-studio border border-studio-outline-variant px-4 py-3 font-studio-heading text-studio-label-md text-studio-on-surface transition-colors hover:bg-studio-surface-variant"
              >
                <XCircle className="size-4" />
                Cancel processing
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  color,
  bg,
  title,
  body,
  muted,
}: {
  icon: typeof CircleDot;
  color: string;
  bg: string;
  title: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-studio-lg border border-studio-border-subtle bg-studio-surface-container-high p-4 transition-colors hover:bg-studio-surface-container-highest",
        muted && "opacity-60",
      )}
    >
      <div className={cn("shrink-0 rounded-studio p-2", bg, color)}>
        <Icon className="size-5" />
      </div>
      <div>
        <h4 className="mb-1 font-studio-heading text-studio-label-md text-studio-on-surface">
          {title}
        </h4>
        <p className="font-studio-body text-studio-label-md text-studio-text-muted">
          {body}
        </p>
      </div>
    </div>
  );
}
