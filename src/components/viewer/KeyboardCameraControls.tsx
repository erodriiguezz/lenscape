"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/** WASD mirrors the arrow keys — either hand can drive the camera. */
const KEY_ACTIONS_BY_CODE = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
} as const;

// `event.code` is the primary signal (layout-independent — WASD stays under
// the same physical keys on non-QWERTY layouts). Some input sources (e.g.
// synthetic/automation-dispatched events) leave `code` empty, so fall back
// to `event.key` too.
const KEY_ACTIONS_BY_KEY = {
  w: "forward",
  arrowup: "forward",
  s: "backward",
  arrowdown: "backward",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
} as const;

type Action = (typeof KEY_ACTIONS_BY_CODE)[keyof typeof KEY_ACTIONS_BY_CODE];

function actionForKeyEvent(e: KeyboardEvent): Action | undefined {
  return (
    KEY_ACTIONS_BY_CODE[e.code as keyof typeof KEY_ACTIONS_BY_CODE] ??
    KEY_ACTIONS_BY_KEY[e.key.toLowerCase() as keyof typeof KEY_ACTIONS_BY_KEY]
  );
}

const MOVE_SPEED = 0.9; // fraction of camera-to-target distance, per second

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _offset = new THREE.Vector3();

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * WASD + Arrow-key camera movement, supplementing mouse orbit/pan/zoom.
 * Translates the camera and orbit target together (a "fly" pan) along the
 * camera's current forward/right vectors, scaled by distance to target so
 * it feels equally responsive whether zoomed in on a valve or zoomed out
 * on the whole model.
 */
export function KeyboardCameraControls() {
  const { camera, controls } = useThree();
  const orbit = controls as OrbitControlsImpl | null;
  const pressed = useRef<Set<Action>>(new Set());
  const wasMoving = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = actionForKeyEvent(e);
      if (!action) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      pressed.current.add(action);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const action = actionForKeyEvent(e);
      if (!action) return;
      pressed.current.delete(action);
    };
    const onBlur = () => pressed.current.clear();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useFrame((_, delta) => {
    const keys = pressed.current;
    if (keys.size === 0) {
      wasMoving.current = false;
      return;
    }
    // Respect the same disabled window OrbitControls itself uses (e.g.
    // while <Bounds> is mid fit-in animation) — otherwise WASD can still
    // fight it even though mouse/wheel input can't.
    if (!orbit || !orbit.enabled) return;

    const distance = Math.max(camera.position.distanceTo(orbit.target), 1);
    const speed = distance * MOVE_SPEED * delta;

    _forward.subVectors(orbit.target, camera.position).normalize();
    _right.crossVectors(_forward, camera.up).normalize();

    _offset.set(0, 0, 0);
    if (keys.has("forward")) _offset.addScaledVector(_forward, speed);
    if (keys.has("backward")) _offset.addScaledVector(_forward, -speed);
    if (keys.has("right")) _offset.addScaledVector(_right, speed);
    if (keys.has("left")) _offset.addScaledVector(_right, -speed);

    if (_offset.lengthSq() === 0) return;

    if (!wasMoving.current) {
      // Let TourCamera know the user has taken manual control.
      orbit.dispatchEvent({ type: "start", target: orbit });
      wasMoving.current = true;
    }

    camera.position.add(_offset);
    orbit.target.add(_offset);
    orbit.update();
  });

  return null;
}
