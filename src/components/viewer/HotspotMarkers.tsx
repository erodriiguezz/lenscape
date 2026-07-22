"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEditorStore } from "@/lib/store";
import { findObjectByName } from "@/lib/scene-utils";
import { cn } from "@/lib/utils";

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

  const position = useMemo(() => {
    if (!sceneGraph) return null;
    const obj = findObjectByName(scene, nodeName);
    if (!obj) return null;
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return null;
    const center = box.getCenter(new THREE.Vector3());
    center.y += Math.max(box.getSize(new THREE.Vector3()).y * 0.15, 0.3);
    return center.toArray() as [number, number, number];
  }, [scene, nodeName, sceneGraph]);

  if (!position) return null;

  return (
    <group position={position}>
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
            "flex size-7 items-center justify-center rounded-full border text-xs font-semibold shadow-lg transition-transform",
            active
              ? "scale-110 border-sky-300 bg-sky-500 text-white"
              : "border-white/40 bg-neutral-900/80 text-white hover:scale-105 hover:bg-neutral-800",
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
