/**
 * Major anatomical groups used for exploded / expanded views of the heart model.
 * Linked nodes share one offset so cut-faces and auricles stay with their chamber.
 */

export interface ExplodePart {
  id: string;
  label: string;
  /** Primary glTF node — used for outward direction from model center */
  nodeName: string;
  /** Extra nodes that move with the same world-space offset */
  linkedNodeNames?: string[];
  /** Optional authored direction (world space); otherwise radial from center */
  direction?: [number, number, number];
  /** Multiplier on the global explode distance */
  distanceScale?: number;
}

export const HEART_EXPLODE_PARTS: ExplodePart[] = [
  {
    id: "right-ventricle",
    label: "Right ventricle",
    nodeName: "right_ventricle_1",
    direction: [0.85, -0.15, 0.35],
    distanceScale: 1.1,
  },
  {
    id: "left-ventricle",
    label: "Left ventricle",
    nodeName: "left_ventricle_1",
    direction: [-0.85, -0.1, 0.4],
    distanceScale: 1.1,
  },
  {
    id: "septum",
    label: "Interventricular septum",
    nodeName: "interventricular_septum_1",
    direction: [0.05, -0.35, 0.9],
    distanceScale: 0.7,
  },
  {
    id: "right-atrium",
    label: "Right atrium",
    nodeName: "right_atrium_1",
    linkedNodeNames: ["right_atrium_cut_face_1"],
    direction: [0.95, 0.2, -0.15],
    distanceScale: 1.15,
  },
  {
    id: "right-auricle",
    label: "Right auricle",
    nodeName: "right_auricle_1",
    linkedNodeNames: ["right_auricle_cut_face_1"],
    direction: [1, 0.35, 0.1],
    distanceScale: 1.2,
  },
  {
    id: "left-atrium",
    label: "Left atrium",
    nodeName: "left_atrium_1",
    linkedNodeNames: ["left_atrium_cut_face_1"],
    direction: [-0.95, 0.25, -0.1],
    distanceScale: 1.15,
  },
  {
    id: "left-auricle",
    label: "Left auricle",
    nodeName: "left_auricle_1",
    linkedNodeNames: ["left_auricle_cut_face_1"],
    direction: [-1, 0.4, 0.15],
    distanceScale: 1.2,
  },
  {
    id: "aorta",
    label: "Aorta",
    nodeName: "aorta_1",
    direction: [-0.25, 1, 0.15],
    distanceScale: 1.25,
  },
  {
    id: "pulmonary-trunk",
    label: "Pulmonary trunk",
    nodeName: "pulmonary_trunk_1",
    direction: [0.3, 1, 0.2],
    distanceScale: 1.25,
  },
  {
    id: "ligamentum",
    label: "Ligamentum arteriosum",
    nodeName: "ligamentum_arteriosum_1",
    direction: [0.05, 1, -0.2],
    distanceScale: 1.1,
  },
  {
    id: "aortic-valve",
    label: "Aortic valve",
    nodeName: "aortic_valve_1",
    direction: [-0.15, 0.85, 0.5],
    distanceScale: 0.85,
  },
  {
    id: "pulmonary-valve",
    label: "Pulmonary valve",
    nodeName: "pulmonary_valve_1",
    direction: [0.2, 0.85, 0.5],
    distanceScale: 0.85,
  },
  {
    id: "mitral-valve",
    label: "Mitral valve",
    nodeName: "mitral_valve_1",
    direction: [-0.55, 0.45, 0.7],
    distanceScale: 0.8,
  },
  {
    id: "tricuspid-valve",
    label: "Tricuspid valve",
    nodeName: "tricuspid_valve_1",
    direction: [0.55, 0.4, 0.7],
    distanceScale: 0.8,
  },
  {
    id: "coronary",
    label: "Coronary vessels",
    nodeName: "coronary_vessels_1",
    direction: [0.15, 0.1, 1],
    distanceScale: 1.05,
  },
  {
    id: "cardiac-fat",
    label: "Cardiac fat",
    nodeName: "cardiac_fat_1",
    direction: [0.1, -0.6, -0.8],
    distanceScale: 0.9,
  },
  {
    id: "conduction",
    label: "Conduction system",
    nodeName: "cardiac_conduction_system_1",
    direction: [0.35, 0.15, -1],
    distanceScale: 1.35,
  },
];

/** World-space travel at explodeAmount = 1 for distanceScale = 1 */
export const EXPLODE_BASE_DISTANCE = 7.5;

/**
 * Effective per-part explode amount:
 * - Global slider drives the overview split
 * - Active hotspot pulls its related part out even when assembled,
 *   and emphasizes it further when already exploded
 */
export function partExplodeAmount(
  globalAmount: number,
  partFocused: boolean,
): number {
  if (partFocused) {
    if (globalAmount < 0.02) return 0.42;
    return Math.min(1.45, globalAmount * 1.35 + 0.08);
  }
  return globalAmount;
}

/** Map focus node names → explode part ids that should emphasize */
export function resolveFocusedPartIds(focusNames: Set<string>): Set<string> {
  const ids = new Set<string>();
  if (focusNames.size === 0) return ids;

  for (const part of HEART_EXPLODE_PARTS) {
    const names = [part.nodeName, ...(part.linkedNodeNames ?? [])];
    if (names.some((n) => focusNames.has(n))) {
      ids.add(part.id);
    }
  }

  // Child targets (valves already listed; conduction children; coronary branches)
  const childToPart: Record<string, string> = {
    SA_node_1: "conduction",
    AV_node_1: "conduction",
    bundle_of_His_1: "conduction",
    right_bundle_branch_1: "conduction",
    left_bundle_branch_1: "conduction",
    right_purkinje_fibers_1: "conduction",
    left_purkinje_fibers_1: "conduction",
    left_anterior_fascicle_1: "conduction",
    left_posterior_fascicle_1: "conduction",
    bachmanns_bundle_1: "conduction",
    coronary_arteries_2: "coronary",
    left_coronary_artery_2: "coronary",
    right_coronary_artery_2: "coronary",
    anterior_interventricular_branch_of_left_coronary_artery_2: "coronary",
    circumflex_branch_of_left_coronary_artery_2: "coronary",
  };

  for (const name of focusNames) {
    const id = childToPart[name];
    if (id) ids.add(id);
  }

  // Overview focuses whole heart — no single-part emphasis
  if (focusNames.has("heart_1") && focusNames.size === 1) {
    return new Set();
  }

  return ids;
}
