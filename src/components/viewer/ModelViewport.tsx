"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, Environment } from "@react-three/drei";
import { Model } from "@/components/viewer/Model";
import { TourCamera } from "@/components/viewer/TourCamera";
import { KeyboardCameraControls } from "@/components/viewer/KeyboardCameraControls";
import { HotspotMarkers } from "@/components/viewer/HotspotMarkers";
import { ExplodeControls } from "@/components/viewer/ExplodeControls";
import { useEditorStore } from "@/lib/store";
import { trackPointerDown, trackPointerMove } from "@/lib/pointer-drag";

/**
 * Tracks pointer movement globally so click handlers (mesh selection,
 * hotspot pins) can tell a drag-release apart from a real click.
 * See src/lib/pointer-drag.ts for why this can't be scoped to the canvas.
 */
function useDragGuard() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => trackPointerDown(e.clientX, e.clientY);
    const onMove = (e: PointerEvent) => trackPointerMove(e.clientX, e.clientY);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
}

// drei's <Bounds> defaults to a 1s fit-in animation (maxDuration). Block
// orbit input for slightly longer than that whenever it (re)mounts, so a
// drag can't start mid-animation and fight it for the camera — that race
// is what made the model "jump" between framings instead of settling once.
const BOUNDS_FIT_MS = 1100;

function LoaderFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#94a3b8" wireframe />
    </mesh>
  );
}

export function ModelViewport() {
  const modelUrl = useEditorStore((s) => s.model.url);
  const selectNode = useEditorStore((s) => s.selectNode);
  const mode = useEditorStore((s) => s.mode);
  const hotspotPanelOpen = useEditorStore((s) => s.hotspotPanelOpen);
  const useBounds = mode === "edit" && !hotspotPanelOpen;

  useDragGuard();

  // Adjust state during render when `useBounds` newly turns on, per React's
  // pattern for deriving state from a prop change — avoids the extra
  // render an effect-based setState would otherwise add.
  const [prevUseBounds, setPrevUseBounds] = useState(useBounds);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  if (useBounds !== prevUseBounds) {
    setPrevUseBounds(useBounds);
    if (useBounds) setOrbitEnabled(false);
  }

  useEffect(() => {
    if (orbitEnabled) return;
    const timer = setTimeout(() => setOrbitEnabled(true), BOUNDS_FIT_MS);
    return () => clearTimeout(timer);
  }, [orbitEnabled]);

  return (
    <div className="relative h-full w-full bg-studio-bg-canvas">
      <Canvas
        // TODO: heart-model-specific — derive from the model's actual bounds
        // once uploads support arbitrary models instead of the one sample.
        camera={{ position: [12, 145, 18], fov: 40, near: 0.1, far: 2000 }}
        gl={{ antialias: true }}
        onPointerMissed={() => selectNode(null)}
      >
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[40, 160, 30]} intensity={1.2} />
        <directionalLight position={[-30, 140, -20]} intensity={0.4} />
        <Suspense fallback={<LoaderFallback />}>
          {useBounds ? (
            <Bounds fit clip observe margin={1.35}>
              <Model url={modelUrl} />
            </Bounds>
          ) : (
            <Model url={modelUrl} />
          )}
          <HotspotMarkers />
          <Environment preset="city" />
        </Suspense>
        <TourCamera />
        <KeyboardCameraControls />
        <OrbitControls
          makeDefault
          enabled={orbitEnabled}
          // Matches the heart model's approximate center. Without this,
          // the pivot defaults to (0,0,0) — ~137 units below the model —
          // so the very first rendered frame (before <Bounds> has fit
          // anything) shows a cropped sliver at the top of the viewport
          // instead of the model, on every load and every reload.
          target={[0, 137, 0]}
          enableDamping
          dampingFactor={0.08}
          minDistance={0.5}
          maxDistance={80}
        />
        {/* TODO: storyboard camera bookmarks — animate OrbitControls target/position per tour step */}
      </Canvas>

      <div className="pointer-events-none absolute top-3 right-3 z-10 w-[220px]">
        <div className="pointer-events-auto">
          <ExplodeControls compact />
        </div>
      </div>
    </div>
  );
}
