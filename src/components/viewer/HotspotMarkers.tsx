"use client";

import { Html } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useEditorStore } from "@/lib/store";
import { findObjectByName } from "@/lib/scene-utils";
import { cn } from "@/lib/utils";

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _size = new THREE.Vector3();

function HotspotMarker({
  index,
  nodeName,
  title,
  active,
}: {
  index: number;
  nodeName: string;
  title: string;
  active: boolean;
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
            // Open description panel; speak only during an active presentation
            openHotspot(index, { speak: mode === "present" });
          }}
          className={cn(
            "flex size-8 items-center justify-center rounded-full border font-studio-heading text-studio-label-sm shadow-lg backdrop-blur-md transition-transform",
            active
              ? "scale-110 border-studio-primary bg-studio-primary-container text-studio-on-primary-container shadow-[0_0_12px_rgba(208,188,255,0.4)]"
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

  return (
    <group>
      {hotspots.map((h, i) => (
        <HotspotMarker
          key={h.id}
          index={i}
          nodeName={h.targetNodeName}
          title={h.title}
          active={hotspotPanelOpen && i === currentStepIndex}
        />
      ))}
    </group>
  );
}
