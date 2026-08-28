"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CloudUpload, File as FileIcon, HelpCircle, UserRound, X } from "lucide-react";
import { TopNav } from "@/components/studio/TopNav";
import { useUploadFlowStore } from "@/lib/upload-store";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".glb", ".gltf"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

export default function UploadPage() {
  const router = useRouter();
  const startUpload = useUploadFlowStore((s) => s.startUpload);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(true);

  const canUpload = Boolean(file) && projectName.trim().length > 0;

  function handleFiles(fileList: FileList | null) {
    const next = fileList?.[0];
    if (!next) return;
    setFile(next);
    if (!projectName) {
      setProjectName(next.name.replace(/\.(glb|gltf)$/i, ""));
    }
  }

  function handleSubmit() {
    if (!file || !canUpload) return;
    startUpload({
      fileName: file.name,
      fileSizeBytes: file.size,
      projectName: projectName.trim(),
      autoGenerateSteps: autoGenerate,
    });
    router.push("/upload/processing");
  }

  return (
    <div className="lenscape-studio flex h-dvh flex-col overflow-hidden bg-studio-bg-canvas font-studio-body text-studio-body-md text-studio-on-surface">
      <TopNav
        actions={
          <>
            <button
              type="button"
              disabled
              title="Help is coming soon"
              className="cursor-not-allowed rounded-studio-full p-2 text-studio-on-surface-variant/60"
            >
              <HelpCircle className="size-[18px]" />
            </button>
            <button
              type="button"
              disabled
              title="Account settings are coming soon"
              className="ml-2 flex size-8 cursor-not-allowed items-center justify-center overflow-hidden rounded-full border border-studio-border-subtle bg-studio-surface-container-highest"
            >
              <UserRound className="size-4 text-studio-on-surface-variant" />
            </button>
          </>
        }
      />

      <main className="flex flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="w-full max-w-2xl rounded-studio-lg border border-studio-border-subtle bg-studio-surface-container p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-studio-heading text-studio-headline-lg text-studio-on-surface">
              Upload New Model
            </h1>
            <p className="font-studio-body text-studio-body-md text-studio-text-muted">
              Drop your .glb or .gltf file here to begin
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              "group relative mb-8 flex h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-studio-lg border-2 border-dashed bg-studio-bg-canvas transition-colors",
              dragActive
                ? "border-studio-primary bg-studio-primary-container/10"
                : "border-studio-outline-variant hover:border-studio-primary",
            )}
          >
            {dragActive && <div className="studio-scanner-beam" />}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {file ? (
              <>
                <FileIcon className="size-10 text-studio-primary" />
                <div className="px-4 text-center">
                  <p className="truncate font-studio-body text-studio-body-lg text-studio-on-surface">
                    {file.name}
                  </p>
                  <p className="mt-1 font-studio-heading text-studio-label-sm text-studio-text-functional">
                    {formatBytes(file.size)} · click to choose a different
                    file
                  </p>
                </div>
                <button
                  type="button"
                  title="Remove file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-studio-full bg-studio-surface-overlay text-studio-on-surface-variant hover:text-studio-on-surface"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <>
                <CloudUpload className="size-10 text-studio-text-muted transition-colors group-hover:text-studio-primary" />
                <div className="text-center">
                  <p className="font-studio-body text-studio-body-lg text-studio-on-surface">
                    Drag &amp; Drop
                  </p>
                  <p className="mt-1 font-studio-heading text-studio-label-sm text-studio-text-functional">
                    or click to browse files
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="project-name"
                className="mb-2 block font-studio-heading text-studio-label-md text-studio-on-surface-variant"
              >
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                placeholder="e.g., Architectural_Viz_01"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-studio border border-studio-border-subtle bg-studio-bg-canvas px-4 py-2 font-studio-body text-studio-body-md text-studio-on-surface outline-none focus:border-studio-primary"
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-studio-lg border border-studio-border-subtle bg-studio-surface-container-highest p-4">
              <div>
                <p className="font-studio-body text-studio-body-md text-studio-on-surface">
                  Auto-generate initial tour steps with AI
                </p>
                <p className="font-studio-heading text-studio-label-sm text-studio-text-functional">
                  Lenscape AI will analyze the geometry and suggest keyframes.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoGenerate}
                onClick={() => setAutoGenerate((v) => !v)}
                className={cn(
                  "relative h-6 w-11 shrink-0 cursor-pointer rounded-studio-full transition-colors",
                  autoGenerate
                    ? "bg-studio-primary"
                    : "bg-studio-surface-muted",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 size-5 rounded-full border border-studio-outline bg-studio-on-surface transition-transform",
                    autoGenerate && "translate-x-full border-white",
                  )}
                />
              </button>
            </div>

            <div className="flex justify-end gap-4 border-t border-studio-border-subtle pt-4">
              <Link
                href="/"
                className="rounded-studio border border-studio-border-subtle px-6 py-2 font-studio-heading text-studio-label-md text-studio-text-muted transition-colors hover:bg-studio-surface-container-high"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={!canUpload}
                onClick={handleSubmit}
                className="flex cursor-pointer items-center gap-2 rounded-studio bg-studio-primary px-6 py-2 font-studio-heading text-studio-label-md text-studio-on-primary transition-colors hover:bg-studio-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CloudUpload className="size-4" />
                Upload Model
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
