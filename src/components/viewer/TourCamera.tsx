"use client";

import { useEffect, useRef } from "react";
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
 * Flies the orbit camera to frame the active tour hotspot, then hands
 * control back to OrbitControls so the user can freely rotate/zoom/pan
 * around it instead of being locked to a fixed framing every frame.
 *
 * The idle/whole-model view is owned entirely by drei's <Bounds> (see
 * ModelViewport) — this component only takes over once a hotspot is
 * focused, and steps out of the way completely otherwise so it can't
 * fight Bounds' own fit-in animation.
 *
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
  /** Set once the user grabs the controls — releases the auto-frame lock. */
  const userTookControl = useRef(false);

  const computeGoal = () => {
    const shouldFocus = hotspot && (mode === "present" || hotspotPanelOpen);
    if (!shouldFocus || !hotspot) {
      goals.current.active = false;
      return false;
    }

    const obj = findObjectByName(scene, hotspot.targetNodeName);
    if (!obj) {
      console.warn(`[tour] node not found: ${hotspot.targetNodeName}`);
      return false;
    }

    _box.setFromObject(obj);
    if (_box.isEmpty()) return false;

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
    return true;
  };

  // A newly focused hotspot re-engages the fly-to, even if the user had
  // taken manual control of the previous one.
  useEffect(() => {
    userTookControl.current = false;
    computeGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspot?.id, mode, hotspotPanelOpen]);

  // Release the auto-frame lock the instant the user drags, zooms, or pans.
  useEffect(() => {
    if (!orbit) return;
    const release = () => {
      userTookControl.current = true;
    };
    orbit.addEventListener("start", release);
    return () => orbit.removeEventListener("start", release);
  }, [orbit]);

  useFrame((_, delta) => {
    // Keep the goal fresh while focused, so a still-exploding part stays
    // framed correctly — but only *apply* it if the user hasn't taken over.
    if (hotspot && (mode === "present" || hotspotPanelOpen)) {
      computeGoal();
    }
    if (!goals.current.active || !orbit || userTookControl.current) return;

    const t = 1 - Math.exp(-delta * 2.4);
    camera.position.lerp(goals.current.cam, t);
    orbit.target.lerp(goals.current.target, t);
    orbit.update();
  });

  return null;
}
