"use client";

import {
  ChevronRight,
  GitBranch,
  History,
  MapPin,
  Package,
  Plus,
  HelpCircle,
  Terminal,
  Boxes,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SceneNode } from "@/lib/scene-graph";
import { useEditorStore } from "@/lib/store";
import { cn, stripExtension } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

function countNodes(node: SceneNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

function NodeRow({ node, depth }: { node: SceneNode; depth: number }) {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.uuid;

  return (
    <div>
      <div
        className={cn(
          "flex w-full items-center gap-1.5 rounded-studio px-1.5 py-1 font-studio-mono text-studio-mono text-studio-on-surface-variant transition-colors hover:bg-studio-surface-container-highest",
          isSelected &&
            "border-l-2 border-studio-primary bg-studio-surface-variant text-studio-primary hover:bg-studio-surface-variant",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            className="flex size-4 shrink-0 items-center justify-center rounded-studio hover:bg-studio-surface-container-highest"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronRight
              className={cn(
                "size-3.5 text-studio-text-muted transition-transform",
                open && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left"
          title={node.name}
          onClick={() => selectNode(node.uuid)}
        >
          {node.name}
        </button>
      </div>
      {hasChildren && open && (
        <div className="mt-1 ml-3.5 space-y-1 border-l border-studio-border-subtle pl-3">
          {node.children.map((child) => (
            <NodeRow key={child.uuid} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarNavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof GitBranch;
  label: string;
  active?: boolean;
}) {
  if (active) {
    return (
      <div className="flex items-center gap-3 rounded-studio border-l-2 border-studio-primary bg-studio-surface-variant px-3 py-2 font-studio-heading text-studio-label-md text-studio-primary">
        <Icon className="size-[18px] text-studio-primary" />
        {label}
      </div>
    );
  }
  // TODO: Hotspots / Library / History panels — not implemented yet.
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className="flex cursor-not-allowed items-center gap-3 rounded-studio px-3 py-2 font-studio-heading text-studio-label-md text-studio-text-muted/60"
    >
      <Icon className="size-[18px]" />
      {label}
    </button>
  );
}

export function NodeTree() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph);
  const modelName = useEditorStore((s) => s.model.name);

  const nodeCount = useMemo(
    () => (sceneGraph ? countNodes(sceneGraph) : 0),
    [sceneGraph],
  );

  return (
    <aside className="flex h-full w-studio-sidebar shrink-0 flex-col border-r border-studio-border-subtle bg-studio-surface-container-low text-studio-on-surface">
      <div className="flex items-center gap-3 border-b border-studio-border-subtle p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-studio border border-studio-border-subtle bg-studio-surface-variant">
          <Boxes className="size-4 text-studio-primary" />
        </div>
        <div className="min-w-0">
          <h2
            className="truncate font-studio-heading text-studio-headline-md text-studio-on-surface"
            title={modelName}
          >
            {stripExtension(modelName)}
          </h2>
          <p className="font-studio-heading text-studio-label-sm text-studio-text-muted">
            {sceneGraph ? `${nodeCount} nodes` : "Loading…"}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="py-2">
          <ul className="space-y-1 px-2">
            <li>
              <SidebarNavItem icon={GitBranch} label="Hierarchy" active />
            </li>
            <li>
              <SidebarNavItem icon={MapPin} label="Hotspots" />
            </li>
            <li>
              <SidebarNavItem icon={Package} label="Library" />
            </li>
            <li>
              <SidebarNavItem icon={History} label="History" />
            </li>
          </ul>

          <div className="mt-6 px-4">
            <h3 className="mb-3 font-studio-heading text-studio-label-sm tracking-wider text-studio-text-muted uppercase">
              Scene
            </h3>
            {!sceneGraph ? (
              <p className="py-4 font-studio-body text-studio-body-md text-studio-text-muted">
                Loading scene…
              </p>
            ) : (
              <NodeRow node={sceneGraph} depth={0} />
            )}
          </div>
        </nav>
      </ScrollArea>

      <div className="border-t border-studio-border-subtle p-4">
        <button
          type="button"
          disabled
          title="Hotspot authoring is coming soon"
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-studio bg-studio-primary/40 py-2 font-studio-heading text-studio-label-md text-studio-on-primary/70"
        >
          <Plus className="size-[18px]" />
          Add Hotspot
        </button>
        {/* TODO: hotspot authoring — raycast placement + store creation */}
      </div>
      <div className="flex justify-around border-t border-studio-border-subtle p-2">
        <button
          type="button"
          title="Help"
          className="rounded-studio p-2 text-studio-on-surface-variant transition-all hover:bg-studio-surface-container-highest hover:text-studio-on-surface"
        >
          <HelpCircle className="size-[18px]" />
        </button>
        <button
          type="button"
          title="Console"
          className="rounded-studio p-2 text-studio-on-surface-variant transition-all hover:bg-studio-surface-container-highest hover:text-studio-on-surface"
        >
          <Terminal className="size-[18px]" />
        </button>
      </div>
    </aside>
  );
}
