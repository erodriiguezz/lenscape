"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import type { SceneNode } from "@/lib/scene-graph";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
          "flex w-full items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent",
          isSelected && "bg-accent font-medium text-accent-foreground",
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            className="flex size-4 shrink-0 items-center justify-center rounded hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronRight
              className={cn(
                "size-3.5 text-muted-foreground transition-transform",
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
        <div>
          {node.children.map((child) => (
            <NodeRow key={child.uuid} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function NodeTree() {
  const sceneGraph = useEditorStore((s) => s.sceneGraph);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-3 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Layers
        </h2>
        {/* TODO: layer panel — visibility toggles, icons by type, search/filter */}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!sceneGraph ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">
              Loading scene…
            </p>
          ) : (
            <NodeRow node={sceneGraph} depth={0} />
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
