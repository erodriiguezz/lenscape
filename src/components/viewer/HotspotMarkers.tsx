"use client";

import { Html } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEditorStore } from "@/lib/store";
import { findNode } from "@/lib/scene-graph";
import { findObjectByName } from "@/lib/scene-utils";
import { consumeWasDrag } from "@/lib/pointer-drag";
import { cn } from "@/lib/utils";

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _size = new THREE.Vector3();

function HotspotMarker({
  index,
  nodeName,
  title,
  active,
  highlighted,
}: {
  index: number;
  nodeName: string;
  title: string;
  active: boolean;
  /** Corresponding layer is selected in the sidebar/viewport, but this isn't the open tour step */
  highlighted: boolean;
}) {
  const scene = useThree((s) => s.scene);
  const sceneGraph = useEditorStore((s) => s.sceneGraph);
  const openHotspot = useEditorStore((s) => s.openHotspot);
  const mode = useEditorStore((s) => s.mode);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group || !sceneGraph) {
      if (group) group.visible = false;
      return;
    }
    const obj = findObjectByName(scene, nodeName);
    if (!obj) {
      group.visible = false;
      return;
    }
    _box.setFromObject(obj);
    if (_box.isEmpty()) {
      group.visible = false;
      return;
    }
    _box.getCenter(_center);
    _box.getSize(_size);
    _center.y += Math.max(_size.y * 0.15, 0.3);
    group.position.copy(_center);
    group.visible = true;
  });

  if (!sceneGraph) return null;

  return (
    <group ref={groupRef} visible={false}>
      <Html center distanceFactor={22} zIndexRange={[20, 0]}>
        <button
          type="button"
          title={title}
          onClick={(e) => {
            e.stopPropagation();
            // A rotate-drag that releases over a pin shouldn't select it.
            if (consumeWasDrag()) return;
            // Open description panel; speak only during an active presentation
            openHotspot(index, { speak: mode === "present" });
          }}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border font-studio-heading text-studio-label-sm shadow-lg backdrop-blur-md transition-transform",
            active
              ? "scale-110 border-studio-primary bg-studio-primary-container text-studio-on-primary-container shadow-[0_0_12px_rgba(208,188,255,0.4)]"
              : highlighted
                ? "scale-105 border-studio-secondary bg-studio-surface-overlay text-studio-secondary shadow-[0_0_10px_rgba(173,198,255,0.35)]"
                : "border-studio-border-subtle bg-studio-surface-overlay text-studio-on-surface hover:scale-105 hover:border-studio-primary",
          )}
        >
          {index + 1}
        </button>
      </Html>
    </group>
  );
}

export function HotspotMarkers() {
  const hotspots = useEditorStore((s) => s.hotspots);
  const currentStepIndex = useEditorStore((s) => s.currentStepIndex);
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);
  const sceneGraph = useEditorStore((s) => s.sceneGraph);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);

  // Sync layer-tree selection → hotspot pins, so picking a part in the
  // sidebar highlights whichever pins reference it.
  const selectedNode = selectedNodeId ? findNode(sceneGraph, selectedNodeId) : null;

  return (
    <group>
      {hotspots.map((h, i) => {
        const matchesSelection = Boolean(
          selectedNode &&
            (h.targetNodeName === selectedNode.name ||
              h.highlightNodeNames?.includes(selectedNode.name)),
        );
        return (
          <HotspotMarker
            key={h.id}
            index={i}
            nodeName={h.targetNodeName}
            title={h.title}
            active={hotspotPanelOpen && i === currentStepIndex}
            highlighted={matchesSelection}
          />
        );
      })}
    </group>
  );
}
