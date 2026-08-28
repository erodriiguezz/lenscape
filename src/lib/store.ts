import { create } from "zustand";
import type { SceneNode } from "@/lib/scene-graph";
import {
  HEART_TOUR,
  type HotspotDefinition,
} from "@/lib/presentations/heart-tour";
import { speakNarration, stopNarration } from "@/lib/narration";
import { findNodeByName } from "@/lib/scene-utils";

export type AppMode = "edit" | "present";

export interface ModelMetadata {
  url: string;
  name: string;
  // TODO: persist uploaded model metadata (filename, size, uploadedAt) once backend exists
}

interface EditorState {
  model: ModelMetadata;
  sceneGraph: SceneNode | null;
  selectedNodeId: string | null;
  /**
   * Local overrides for non-hotspot mesh notes (keyed by node UUID).
   * Hotspot copy lives on hotspots[].description.
   */
  descriptions: Record<string, string>;

  mode: AppMode;
  hotspots: HotspotDefinition[];
  currentStepIndex: number;
  /** Description panel open after clicking a hotspot pin */
  hotspotPanelOpen: boolean;
  isPlaying: boolean;
  isNarrating: boolean;
  autoAdvance: boolean;

  /**
   * Exploded-view separation amount (0 = assembled, 1 = fully expanded).
   * Hotspot focus can still pull a related part out when this is 0.
   */
  explodeAmount: number;
  /**
   * Node name isolated for its own explode, independent of the global
   * dial and of any hotspot focus. Set from the Inspector when a plain
   * mesh (not a hotspot) is selected.
   */
  isolatedExplodeNodeName: string | null;

  /** Animation clip names available on the currently loaded model, if any. */
  availableAnimations: string[];
  /** Clip name currently playing, or null if nothing is playing. */
  playingAnimation: string | null;

  setSceneGraph: (graph: SceneNode | null) => void;
  selectNode: (uuid: string | null) => void;
  setDescription: (uuid: string, description: string) => void;
  updateHotspotTitle: (hotspotId: string, title: string) => void;
  updateHotspotDescription: (hotspotId: string, description: string) => void;
  updateHotspotNarration: (hotspotId: string, narration: string) => void;
  updateHotspotCameraDirection: (
    hotspotId: string,
    axis: "x" | "y" | "z",
    value: number,
  ) => void;
  setExplodeAmount: (amount: number) => void;
  toggleExplode: () => void;
  /** Toggle isolated explode for one node — passing the already-isolated node clears it. */
  toggleIsolatedExplode: (nodeName: string) => void;

  setAvailableAnimations: (names: string[]) => void;
  playAnimation: (name: string) => void;
  stopAnimation: () => void;

  setMode: (mode: AppMode) => void;
  /** Open a hotspot: show description panel, focus camera, optionally speak description */
  openHotspot: (index: number, opts?: { speak?: boolean }) => void;
  closeHotspotPanel: () => void;
  goToStep: (index: number, opts?: { speak?: boolean }) => void;
  nextStep: () => void;
  prevStep: () => void;
  playTour: () => void;
  pauseTour: () => void;
  stopTour: () => void;

  // TODO: AI generation — draft / regenerate hotspot description
  // TODO: hotspot persistence — save/load descriptions + anchors
  // TODO: public viewer mode — /view/[id]
}

function clampStep(index: number, length: number) {
  if (length === 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

function speakHotspotDescription(
  hotspot: HotspotDefinition,
  stepIndex: number,
  set: (partial: Partial<EditorState>) => void,
  get: () => EditorState,
) {
  speakNarration(hotspot.narration ?? hotspot.description, {
    onStart: () => set({ isNarrating: true }),
    onEnd: () => {
      set({ isNarrating: false });
      const state = get();
      if (
        state.isPlaying &&
        state.autoAdvance &&
        state.currentStepIndex === stepIndex
      ) {
        if (stepIndex < state.hotspots.length - 1) {
          state.openHotspot(stepIndex + 1, { speak: true });
        } else {
          set({ isPlaying: false });
        }
      }
    },
  });
}

export const useEditorStore = create<EditorState>((set, get) => ({
  model: {
    url: "/models/heart.glb?v=2",
    name: "heart.glb",
  },
  sceneGraph: null,
  selectedNodeId: null,
  descriptions: {},

  mode: "edit",
  hotspots: HEART_TOUR,
  currentStepIndex: 0,
  hotspotPanelOpen: false,
  isPlaying: false,
  isNarrating: false,
  autoAdvance: true,

  explodeAmount: 0,
  isolatedExplodeNodeName: null,

  availableAnimations: [],
  playingAnimation: null,

  setSceneGraph: (graph) => set({ sceneGraph: graph }),

  selectNode: (uuid) => set({ selectedNodeId: uuid }),

  setDescription: (uuid, description) =>
    set((state) => ({
      descriptions: { ...state.descriptions, [uuid]: description },
    })),

  updateHotspotTitle: (hotspotId, title) =>
    set((state) => ({
      hotspots: state.hotspots.map((h) =>
        h.id === hotspotId ? { ...h, title } : h,
      ),
    })),

  updateHotspotDescription: (hotspotId, description) =>
    set((state) => ({
      hotspots: state.hotspots.map((h) =>
        h.id === hotspotId ? { ...h, description } : h,
      ),
    })),

  updateHotspotNarration: (hotspotId, narration) =>
    set((state) => ({
      hotspots: state.hotspots.map((h) =>
        h.id === hotspotId ? { ...h, narration } : h,
      ),
    })),

  updateHotspotCameraDirection: (hotspotId, axis, value) =>
    set((state) => ({
      hotspots: state.hotspots.map((h) => {
        if (h.id !== hotspotId) return h;
        const next: [number, number, number] = [...h.cameraDirection];
        next[axis === "x" ? 0 : axis === "y" ? 1 : 2] = value;
        return { ...h, cameraDirection: next };
      }),
    })),

  setExplodeAmount: (amount) =>
    set({ explodeAmount: Math.max(0, Math.min(1, amount)) }),

  toggleExplode: () =>
    set((state) => ({
      explodeAmount: state.explodeAmount > 0.5 ? 0 : 1,
    })),

  toggleIsolatedExplode: (nodeName) =>
    set((state) => ({
      isolatedExplodeNodeName:
        state.isolatedExplodeNodeName === nodeName ? null : nodeName,
    })),

  setAvailableAnimations: (names) => set({ availableAnimations: names }),

  playAnimation: (name) => set({ playingAnimation: name }),

  stopAnimation: () => set({ playingAnimation: null }),

  setMode: (mode) => {
    if (mode === "edit") {
      stopNarration();
      set({
        mode,
        isPlaying: false,
        isNarrating: false,
        hotspotPanelOpen: false,
      });
      return;
    }
    set({ mode, currentStepIndex: 0, hotspotPanelOpen: true });
  },

  openHotspot: (index, opts) => {
    const { hotspots, isPlaying, mode, sceneGraph } = get();
    const next = clampStep(index, hotspots.length);
    const hotspot = hotspots[next];
    const shouldSpeak =
      opts?.speak ?? (isPlaying || mode === "present");

    // Sync Inspector / layer tree to the hotspot's target node
    const targetNode = hotspot
      ? findNodeByName(sceneGraph, hotspot.targetNodeName)
      : null;

    set({
      currentStepIndex: next,
      hotspotPanelOpen: true,
      selectedNodeId: targetNode?.uuid ?? null,
    });

    if (!hotspot || !shouldSpeak) {
      stopNarration();
      set({ isNarrating: false });
      return;
    }

    speakHotspotDescription(hotspot, next, set, get);
  },

  closeHotspotPanel: () => {
    stopNarration();
    set({ hotspotPanelOpen: false, isNarrating: false, isPlaying: false });
  },

  goToStep: (index, opts) => {
    get().openHotspot(index, opts);
  },

  nextStep: () => {
    const { currentStepIndex, hotspots, openHotspot } = get();
    if (currentStepIndex < hotspots.length - 1) {
      openHotspot(currentStepIndex + 1, { speak: true });
    }
  },

  prevStep: () => {
    const { currentStepIndex, openHotspot } = get();
    if (currentStepIndex > 0) {
      openHotspot(currentStepIndex - 1, { speak: true });
    }
  },

  playTour: () => {
    const { currentStepIndex, openHotspot } = get();
    set({ isPlaying: true, mode: "present", hotspotPanelOpen: true });
    openHotspot(currentStepIndex, { speak: true });
  },

  pauseTour: () => {
    stopNarration();
    set({ isPlaying: false, isNarrating: false });
  },

  stopTour: () => {
    stopNarration();
    set({
      isPlaying: false,
      isNarrating: false,
      currentStepIndex: 0,
      mode: "edit",
      hotspotPanelOpen: false,
    });
  },
}));

export function useCurrentHotspot(): HotspotDefinition | null {
  return useEditorStore((s) => s.hotspots[s.currentStepIndex] ?? null);
}
