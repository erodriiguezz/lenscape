"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useCurrentHotspot, useEditorStore } from "@/lib/store";
import { findObjectByName } from "@/lib/scene-utils";

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _size = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _camGoal = new THREE.Vector3();
const _targetGoal = new THREE.Vector3();

/**
 * Animates the orbit camera to frame the active tour hotspot.
 * TODO: storyboard camera bookmarks — persist exact lookAt + position per step.
 */
export function TourCamera() {
  const hotspot = useCurrentHotspot();
  const mode = useEditorStore((s) => s.mode);
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);
  const { camera, scene, controls } = useThree();
  const orbit = controls as OrbitControlsImpl | null;

  const goals = useRef({
    cam: new THREE.Vector3().copy(camera.position),
    target: new THREE.Vector3(0, 137, 0),
    active: false,
  });

  useEffect(() => {
    const shouldFocus =
      hotspot && (mode === "present" || hotspotPanelOpen);
    if (!shouldFocus || !hotspot) {
      goals.current.active = false;
      return;
    }

    const obj = findObjectByName(scene, hotspot.targetNodeName);
    if (!obj) {
      console.warn(`[tour] node not found: ${hotspot.targetNodeName}`);
      return;
    }

    _box.setFromObject(obj);
    if (_box.isEmpty()) return;

    _box.getCenter(_center);
    _box.getSize(_size);
    const radius = Math.max(_size.length() * 0.5, 0.5);
    const distance = radius * (hotspot.distanceFactor ?? 2.5);

    _dir.set(...hotspot.cameraDirection).normalize();
    _camGoal.copy(_center).addScaledVector(_dir, distance);
    _targetGoal.copy(_center);

    goals.current.cam.copy(_camGoal);
    goals.current.target.copy(_targetGoal);
    goals.current.active = true;
  }, [hotspot, mode, hotspotPanelOpen, scene, camera]);

  useFrame((_, delta) => {
    if (!goals.current.active || !orbit) return;
    const t = 1 - Math.exp(-delta * 2.4);
    camera.position.lerp(goals.current.cam, t);
    orbit.target.lerp(goals.current.target, t);
    orbit.update();
  });

  return null;
}
