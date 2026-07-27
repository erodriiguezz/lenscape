"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useExplodeAnimation } from "@/components/viewer/useExplodeAnimation";
import { buildSceneGraph } from "@/lib/scene-graph";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";

const SELECT_EMISSIVE = new THREE.Color("#3b82f6");
const FOCUS_EMISSIVE = new THREE.Color("#38bdf8");
const SELECT_INTENSITY = 0.55;
const FOCUS_INTENSITY = 0.7;

function isUnderOrSelf(obj: THREE.Object3D, ancestor: THREE.Object3D) {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

function ensureMaterialBackup(mat: THREE.Material) {
  if (!mat.userData._lenscapeBackup) {
    const backup: {
      emissive?: THREE.Color;
      emissiveIntensity?: number;
      opacity: number;
      transparent: boolean;
    } = {
      opacity: mat.opacity,
      transparent: mat.transparent,
    };
    if ("emissive" in mat) {
      const m = mat as THREE.MeshStandardMaterial;
      backup.emissive = m.emissive.clone();
      backup.emissiveIntensity = m.emissiveIntensity;
    }
    mat.userData._lenscapeBackup = backup;
  }
}

function restoreMaterial(mat: THREE.Material) {
  const backup = mat.userData._lenscapeBackup as
    | {
        emissive?: THREE.Color;
        emissiveIntensity?: number;
        opacity: number;
        transparent: boolean;
      }
    | undefined;
  if (!backup) return;
  mat.opacity = backup.opacity;
  mat.transparent = backup.transparent;
  if ("emissive" in mat && backup.emissive) {
    const m = mat as THREE.MeshStandardMaterial;
    m.emissive.copy(backup.emissive);
    m.emissiveIntensity = backup.emissiveIntensity ?? 1;
  }
  mat.needsUpdate = true;
}

function applyFocusStyle(
  mat: THREE.Material,
  style: "focus" | "dim" | "select" | "none",
) {
  ensureMaterialBackup(mat);
  restoreMaterial(mat);

  if (style === "none") return;

  if (style === "dim") {
    mat.transparent = true;
    mat.opacity = 0.18;
    mat.needsUpdate = true;
    return;
  }

  if ("emissive" in mat) {
    const m = mat as THREE.MeshStandardMaterial;
    if (style === "focus") {
      m.emissive.copy(FOCUS_EMISSIVE);
      m.emissiveIntensity = FOCUS_INTENSITY;
    } else {
      m.emissive.copy(SELECT_EMISSIVE);
      m.emissiveIntensity = SELECT_INTENSITY;
    }
  }
}

function meshMaterials(mesh: THREE.Mesh): THREE.Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

export function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { invalidate } = useThree();
  const setSceneGraph = useEditorStore((s) => s.setSceneGraph);
  const selectNode = useEditorStore((s) => s.selectNode);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const mode = useEditorStore((s) => s.mode);
  const hotspot = useCurrentHotspot();
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);

  const root = useMemo(() => scene.clone(true), [scene]);

  useExplodeAnimation(root);

  useEffect(() => {
    const graph = buildSceneGraph(root);
    setSceneGraph(graph);
    return () => setSceneGraph(null);
  }, [root, setSceneGraph]);

  // Selection + presentation focus styling
  useEffect(() => {
    const focusNames = new Set<string>();
    const focusing = mode === "present" || hotspotPanelOpen;
    if (focusing && hotspot) {
      focusNames.add(hotspot.targetNodeName);
      hotspot.highlightNodeNames?.forEach((n) => focusNames.add(n));
    }

    const focusRoots: THREE.Object3D[] = [];
    if (focusNames.size > 0) {
      root.traverse((obj) => {
        if (obj.name && focusNames.has(obj.name)) focusRoots.push(obj);
      });
    }

    const selected =
      mode === "edit" && !hotspotPanelOpen && selectedNodeId
        ? root.getObjectByProperty("uuid", selectedNodeId)
        : null;

    root.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      let style: "focus" | "dim" | "select" | "none" = "none";

      if (focusing && focusRoots.length > 0) {
        const inFocus = focusRoots.some((r) => isUnderOrSelf(mesh, r));
        style = inFocus ? "focus" : "dim";
      } else if (selected && isUnderOrSelf(mesh, selected)) {
        style = "select";
      }

      meshMaterials(mesh).forEach((mat) => applyFocusStyle(mat, style));
    });

    invalidate();
  }, [
    selectedNodeId,
    root,
    invalidate,
    mode,
    hotspot,
    hotspotPanelOpen,
  ]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    let obj: THREE.Object3D | null = event.object;
    while (obj && !obj.name && obj.parent && obj.parent !== root.parent) {
      obj = obj.parent;
    }
    selectNode(obj?.uuid ?? event.object.uuid);

    // Clicking a mesh that belongs to a hotspot opens its description
    if (obj?.name) {
      const hotspots = useEditorStore.getState().hotspots;
      const idx = hotspots.findIndex(
        (h) =>
          h.targetNodeName === obj!.name ||
          h.highlightNodeNames?.includes(obj!.name),
      );
      if (idx >= 0) {
        useEditorStore.getState().openHotspot(idx, {
          speak: mode === "present",
        });
      }
    }
  };

  return (
    <primitive
      object={root}
      onClick={handleClick}
      // TODO: hotspot placement — raycast + store world position on double-click / modifier+click
    />
  );
}

useGLTF.preload("/models/heart.glb?v=2");
