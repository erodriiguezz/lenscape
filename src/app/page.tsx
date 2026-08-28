"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Heart,
  HelpCircle,
  LayoutGrid,
  List,
  ListFilter,
  Pencil,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { InertNavLink } from "@/components/studio/InertNavLink";
import { TopNav } from "@/components/studio/TopNav";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  category: string;
  fileName: string;
  status: "draft" | "published";
  href: string;
  /** Placeholder thumbnail icon — swap for a real render once one exists. */
  icon: typeof Heart;
}

// TODO: multi-project persistence — load from a backend once projects can be
// saved/created. For now this reflects the single bundled sample model.
const PROJECTS: Project[] = [
  {
    id: "heart",
    name: "Human Heart Anatomy",
    category: "Medical",
    fileName: "heart.glb",
    status: "draft",
    href: "/editor",
    icon: Heart,
  },
];

export default function HomePage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");

  const projects = useMemo(
    () =>
      PROJECTS.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="lenscape-studio flex min-h-dvh flex-col bg-studio-bg-canvas font-studio-body text-studio-body-md text-studio-on-surface">
      <TopNav
        nav={
          <nav className="hidden items-center gap-6 md:flex">
            <InertNavLink label="Projects" active />
            <InertNavLink label="Assets" />
            <InertNavLink label="Analytics" />
            <InertNavLink label="Settings" />
          </nav>
        }
        actions={
          <>
            <div className="relative hidden w-64 lg:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-studio-text-muted" />
              <input
                type="text"
                placeholder="Search projects…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-studio border border-studio-border-subtle bg-studio-surface-muted py-1.5 pr-3 pl-9 font-studio-body text-studio-body-md text-studio-on-surface outline-none placeholder:text-studio-text-muted focus:border-studio-primary"
              />
            </div>
            <button
              type="button"
              title="Notifications"
              className="flex size-8 items-center justify-center rounded-full text-studio-text-muted transition-colors hover:bg-studio-surface-container-high hover:text-studio-on-surface"
            >
              <Bell className="size-[18px]" />
            </button>
            <button
              type="button"
              title="Help"
              className="flex size-8 items-center justify-center rounded-full text-studio-text-muted transition-colors hover:bg-studio-surface-container-high hover:text-studio-on-surface"
            >
              <HelpCircle className="size-[18px]" />
            </button>
            <Link
              href="/upload"
              className="hidden items-center gap-2 rounded-studio bg-studio-primary px-4 py-2 font-studio-heading text-studio-label-md text-studio-on-primary transition-colors hover:bg-studio-primary/90 md:flex"
            >
              <Plus className="size-4" />
              Create Tour
            </Link>
            <div className="ml-2 flex size-8 items-center justify-center overflow-hidden rounded-full border border-studio-border-subtle bg-studio-surface-container-highest">
              <UserRound className="size-4 text-studio-on-surface-variant" />
            </div>
          </>
        }
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 p-6 lg:p-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 font-studio-heading text-studio-headline-lg text-studio-on-surface">
              Recent Projects
            </h1>
            <p className="font-studio-body text-studio-body-md text-studio-text-muted">
              Manage and author your 3D interactive tours.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-studio border border-studio-border-subtle bg-studio-surface-muted p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "flex items-center gap-2 rounded-studio-sm px-3 py-1.5 font-studio-heading text-studio-label-md transition-colors",
                  view === "grid"
                    ? "bg-studio-surface-container-high text-studio-on-surface"
                    : "text-studio-text-muted hover:text-studio-on-surface",
                )}
              >
                <LayoutGrid className="size-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-2 rounded-studio-sm px-3 py-1.5 font-studio-heading text-studio-label-md transition-colors",
                  view === "list"
                    ? "bg-studio-surface-container-high text-studio-on-surface"
                    : "text-studio-text-muted hover:text-studio-on-surface",
                )}
              >
                <List className="size-4" />
                List
              </button>
            </div>
            {/* TODO: category/status filtering — no filter criteria defined yet */}
            <button
              type="button"
              disabled
              title="Filtering is coming soon"
              className="flex cursor-not-allowed items-center gap-2 rounded-studio border border-studio-border-subtle bg-studio-surface-muted px-4 py-2 font-studio-heading text-studio-label-md text-studio-on-surface/60 transition-colors"
            >
              <ListFilter className="size-4" />
              Filter
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <NewProjectCard />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
            <NewProjectRow />
          </div>
        )}

        {projects.length === 0 && (
          <p className="font-studio-body text-studio-body-md text-studio-text-muted">
            No projects match “{query}”.
          </p>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <div className="flex items-center gap-1.5 rounded-studio border border-studio-border-subtle bg-studio-surface-overlay px-2.5 py-1 backdrop-blur-md">
      <div
        className={cn(
          "size-1.5 rounded-full",
          status === "published"
            ? "bg-studio-tertiary"
            : "bg-studio-text-functional",
        )}
      />
      <span className="font-studio-heading text-studio-label-sm text-studio-on-surface capitalize">
        {status}
      </span>
    </div>
  );
}

function ProjectThumbnail({ project }: { project: Project }) {
  const Icon = project.icon;
  return (
    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-studio-surface-container-lowest">
      <div className="absolute inset-0 bg-gradient-to-br from-studio-primary-container/20 via-transparent to-transparent" />
      <Icon className="size-16 text-studio-primary/30" />
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={project.href}
      className="group relative flex flex-col overflow-hidden rounded-studio-lg border border-studio-border-subtle bg-studio-surface-container transition-colors duration-300 hover:border-studio-outline-variant"
    >
      <div className="relative">
        <ProjectThumbnail project={project} />
        <div className="absolute top-3 left-3 z-20">
          <StatusBadge status={project.status} />
        </div>
        {/* Decorative — the whole card is already the link. */}
        <div
          aria-hidden
          className="absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-studio border border-studio-border-subtle bg-studio-surface-overlay text-studio-text-muted opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 group-hover:text-studio-primary"
        >
          <Pencil className="size-[18px]" />
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="truncate pr-4 font-studio-heading text-studio-headline-md text-studio-on-surface transition-colors group-hover:text-studio-primary">
          {project.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            <span className="font-studio-mono text-studio-mono text-studio-text-functional">
              {project.fileName}
            </span>
            <span className="font-studio-heading text-studio-label-md text-studio-text-muted">
              {project.category}
            </span>
          </div>
          <div className="flex size-6 items-center justify-center rounded-full border border-studio-surface-container bg-studio-surface-muted font-studio-heading text-[10px] text-studio-primary">
            You
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewProjectCard() {
  return (
    <Link
      href="/upload"
      className="group flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-studio-lg border border-dashed border-studio-outline-variant bg-studio-surface-container/50 p-6 transition-all duration-300 hover:border-studio-primary hover:bg-studio-surface-container"
    >
      <div className="flex size-16 items-center justify-center rounded-full border border-studio-border-subtle bg-studio-surface-muted transition-transform duration-300 group-hover:scale-110 group-hover:border-studio-primary">
        <Plus className="size-8 text-studio-text-muted transition-colors group-hover:text-studio-primary" />
      </div>
      <div className="text-center">
        <h3 className="mb-1 font-studio-heading text-studio-headline-md text-studio-on-surface transition-colors group-hover:text-studio-primary">
          New Project
        </h3>
        <p className="max-w-[200px] font-studio-body text-studio-body-md text-studio-text-muted">
          Upload a 3D model (.glTF, .glb) or start a blank scene.
        </p>
      </div>
    </Link>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const Icon = project.icon;
  return (
    <Link
      href={project.href}
      className="group flex items-center gap-4 rounded-studio-lg border border-studio-border-subtle bg-studio-surface-container p-3 transition-colors hover:border-studio-outline-variant"
    >
      <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-studio bg-studio-surface-container-lowest">
        <Icon className="size-6 text-studio-primary/30" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-studio-heading text-studio-headline-md text-studio-on-surface transition-colors group-hover:text-studio-primary">
          {project.name}
        </h3>
        <p className="font-studio-mono text-studio-mono text-studio-text-functional">
          {project.fileName} · {project.category}
        </p>
      </div>
      <StatusBadge status={project.status} />
      <Pencil className="size-4 shrink-0 text-studio-text-muted transition-colors group-hover:text-studio-primary" />
    </Link>
  );
}

function NewProjectRow() {
  return (
    <Link
      href="/upload"
      className="group flex items-center justify-center gap-3 rounded-studio-lg border border-dashed border-studio-outline-variant bg-studio-surface-container/50 p-4 transition-colors hover:border-studio-primary hover:bg-studio-surface-container"
    >
      <Plus className="size-4 text-studio-text-muted transition-colors group-hover:text-studio-primary" />
      <span className="font-studio-heading text-studio-label-md text-studio-on-surface transition-colors group-hover:text-studio-primary">
        New Project — upload a 3D model
      </span>
    </Link>
  );
}
