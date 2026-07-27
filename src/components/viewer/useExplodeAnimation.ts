"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  EXPLODE_BASE_DISTANCE,
  HEART_EXPLODE_PARTS,
  partExplodeAmount,
  resolveFocusedPartIds,
} from "@/lib/explode";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";

type PartRuntime = {
  id: string;
  objects: THREE.Object3D[];
  baseLocal: THREE.Vector3[];
  worldDir: THREE.Vector3;
  distanceScale: number;
  currentAmount: number;
};

const _world = new THREE.Vector3();
const _offset = new THREE.Vector3();

function applyPartAmount(part: PartRuntime, amount: number) {
  const distance = EXPLODE_BASE_DISTANCE * part.distanceScale * amount;
  _offset.copy(part.worldDir).multiplyScalar(distance);

  for (let i = 0; i < part.objects.length; i++) {
    const obj = part.objects[i];
    const parent = obj.parent;
    if (!parent) continue;

    _world.copy(part.baseLocal[i]);
    parent.localToWorld(_world);
    _world.add(_offset);
    parent.worldToLocal(_world);
    obj.position.copy(_world);
  }
}

/**
 * Animates authored explode groups on the cloned model root.
 * Call from inside the R3F tree that owns `root`.
 */
export function useExplodeAnimation(root: THREE.Object3D) {
  const { invalidate } = useThree();
  const explodeAmount = useEditorStore((s) => s.explodeAmount);
  const mode = useEditorStore((s) => s.mode);
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);
  const hotspot = useCurrentHotspot();

  const parts = useMemo(() => {
    root.updateMatrixWorld(true);

    const modelBox = new THREE.Box3().setFromObject(root);
    const modelCenter = modelBox.getCenter(new THREE.Vector3());

    const runtimes: PartRuntime[] = [];

    for (const def of HEART_EXPLODE_PARTS) {
      const names = [def.nodeName, ...(def.linkedNodeNames ?? [])];
      const objects: THREE.Object3D[] = [];
      for (const name of names) {
        let found: THREE.Object3D | null = null;
        root.traverse((obj) => {
          if (!found && obj.name === name) found = obj;
        });
        if (found) objects.push(found);
      }
      if (objects.length === 0) continue;

      const primary =
        objects.find((o) => o.name === def.nodeName) ?? objects[0];
      const partBox = new THREE.Box3().setFromObject(primary);
      if (partBox.isEmpty()) continue;

      const partCenter = partBox.getCenter(new THREE.Vector3());
      const worldDir = new THREE.Vector3();
      if (def.direction) {
        worldDir.set(...def.direction).normalize();
      } else {
        worldDir.subVectors(partCenter, modelCenter);
        if (worldDir.lengthSq() < 1e-6) worldDir.set(0, 1, 0);
        else worldDir.normalize();
      }

      runtimes.push({
        id: def.id,
        objects,
        baseLocal: objects.map((o) => o.position.clone()),
        worldDir,
        distanceScale: def.distanceScale ?? 1,
        currentAmount: 0,
      });
    }

    return runtimes;
  }, [root]);

  const focusedIds = useMemo(() => {
    const focusing = mode === "present" || hotspotPanelOpen;
    if (!focusing || !hotspot) return new Set<string>();
    const names = new Set<string>([hotspot.targetNodeName]);
    hotspot.highlightNodeNames?.forEach((n) => names.add(n));
    return resolveFocusedPartIds(names);
  }, [mode, hotspotPanelOpen, hotspot]);

  const focusedRef = useRef(focusedIds);
  const amountRef = useRef(explodeAmount);
  focusedRef.current = focusedIds;
  amountRef.current = explodeAmount;

  // Snap back to rest pose if the root is replaced
  useEffect(() => {
    return () => {
      for (const part of parts) {
        for (let i = 0; i < part.objects.length; i++) {
          part.objects[i].position.copy(part.baseLocal[i]);
        }
      }
    };
  }, [parts]);

  useFrame((_, delta) => {
    const globalAmount = amountRef.current;
    const focused = focusedRef.current;
    let dirty = false;
    const damp = 1 - Math.exp(-delta * 7);

    for (const part of parts) {
      const target = partExplodeAmount(globalAmount, focused.has(part.id));
      const next = part.currentAmount + (target - part.currentAmount) * damp;
      if (Math.abs(next - part.currentAmount) < 1e-4) {
        if (Math.abs(part.currentAmount - target) < 1e-4) continue;
        part.currentAmount = target;
      } else {
        part.currentAmount = next;
      }
      applyPartAmount(part, part.currentAmount);
      dirty = true;
    }

    if (dirty) invalidate();
  });
}
