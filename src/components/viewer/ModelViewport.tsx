"use client";

import { Suspense, useEffect } from "react";
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

  return (
    <div className="relative h-full w-full bg-studio-bg-canvas">
      <Canvas
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
