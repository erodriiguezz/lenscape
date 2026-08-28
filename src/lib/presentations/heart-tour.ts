/**
 * Authored heart presentation — AI-written hotspot tour for the sample model.
 * TODO: replace with generated content from LLM once generateDescription is wired.
 */

export interface HotspotDefinition {
  id: string;
  title: string;
  /** Primary glTF node name to focus / highlight */
  targetNodeName: string;
  /** Extra node names to highlight with the target (e.g. group parts) */
  highlightNodeNames?: string[];
  /**
   * Full description — shown when the hotspot is opened.
   * Editable in the editor.
   */
  description: string;
  /**
   * Narration script spoken by TTS. Optional — falls back to `description`
   * when unset, so existing hotspots keep working without a separate script.
   */
  narration?: string;
  /** Shorter blurb for cards / lists */
  summary: string;
  /**
   * Related structures this part connects to — rendered in the Inspector
   * as quick-jump chips (e.g. "From the AV node"). `hotspotId` must match
   * another entry's `id` in this same tour.
   */
  connections?: { label: string; hotspotId: string }[];
  /**
   * Camera look-from direction in world space (normalized at runtime).
   * Heart model is roughly centered near y≈137.
   */
  cameraDirection: [number, number, number];
  /** Multiplier on bounding-sphere radius for camera distance */
  distanceFactor?: number;
}

export const HEART_TOUR: HotspotDefinition[] = [
  {
    id: "overview",
    title: "The Human Heart",
    targetNodeName: "heart_1",
    description:
      "Welcome. This is a detailed anatomical model of the human heart — a muscular pump about the size of a fist, beating roughly one hundred thousand times a day. We'll travel chamber by chamber, meet the valves that keep blood flowing one way, then follow the coronary vessels and the electrical system that sets the rhythm.",
    summary: "Overview of the heart as a four-chambered muscular pump.",
    cameraDirection: [0.6, 0.25, 0.75],
    distanceFactor: 2.2,
  },
  {
    id: "right-atrium",
    title: "Right Atrium",
    targetNodeName: "right_atrium_1",
    highlightNodeNames: ["right_atrium_cut_face_1", "right_auricle_1"],
    description:
      "Deoxygenated blood returns from the body into the right atrium. This thin-walled receiving chamber collects venous blood from the superior and inferior vena cava, then passes it through the tricuspid valve into the right ventricle when the atrium contracts.",
    summary: "Receives deoxygenated blood from the body.",
    connections: [
      { label: "To right ventricle, via", hotspotId: "tricuspid" },
      { label: "Houses the pacemaker,", hotspotId: "sa-node" },
    ],
    cameraDirection: [0.9, 0.15, 0.35],
    distanceFactor: 2.8,
  },
  {
    id: "right-ventricle",
    title: "Right Ventricle",
    targetNodeName: "right_ventricle_1",
    description:
      "The right ventricle pumps blood into the pulmonary trunk toward the lungs. Its wall is thinner than the left ventricle's — it only needs to push blood through the nearby pulmonary circuit, not the entire body.",
    summary: "Pumps blood to the lungs via the pulmonary trunk.",
    connections: [
      { label: "From right atrium, via", hotspotId: "tricuspid" },
      { label: "To the lungs, via", hotspotId: "pulmonary-valve" },
    ],
    cameraDirection: [0.75, -0.1, 0.65],
    distanceFactor: 2.6,
  },
  {
    id: "left-atrium",
    title: "Left Atrium",
    targetNodeName: "left_atrium_1",
    highlightNodeNames: ["left_atrium_cut_face_1", "left_auricle_1"],
    description:
      "Oxygen-rich blood returns from the lungs into the left atrium. From here it flows through the mitral valve into the powerful left ventricle — the chamber that will send it out to the rest of the body.",
    summary: "Receives oxygenated blood from the lungs.",
    connections: [
      { label: "To left ventricle, via", hotspotId: "mitral" },
    ],
    cameraDirection: [-0.85, 0.2, 0.4],
    distanceFactor: 2.8,
  },
  {
    id: "left-ventricle",
    title: "Left Ventricle",
    targetNodeName: "left_ventricle_1",
    description:
      "The left ventricle is the heart's strongest chamber. Its thick muscular wall generates the high pressure needed to drive oxygenated blood through the aorta and into systemic circulation — every organ, muscle, and neuron depends on this beat.",
    summary: "Powerful chamber that pumps blood into the aorta.",
    connections: [
      { label: "From left atrium, via", hotspotId: "mitral" },
      { label: "To the body, via", hotspotId: "aortic-valve" },
      { label: "Separated from right ventricle by", hotspotId: "septum" },
    ],
    cameraDirection: [-0.7, -0.05, 0.7],
    distanceFactor: 2.6,
  },
  {
    id: "septum",
    title: "Interventricular Septum",
    targetNodeName: "interventricular_septum_1",
    description:
      "The interventricular septum is the muscular wall separating the left and right ventricles. It keeps oxygen-rich and oxygen-poor blood apart, and it also carries part of the heart's electrical conduction pathways deep within its tissue.",
    summary: "Wall separating the left and right ventricles.",
    connections: [
      { label: "Separates", hotspotId: "left-ventricle" },
      { label: "from", hotspotId: "right-ventricle" },
    ],
    cameraDirection: [0.15, 0.1, 1],
    distanceFactor: 3.0,
  },
  {
    id: "tricuspid",
    title: "Tricuspid Valve",
    targetNodeName: "tricuspid_valve_1",
    description:
      "The tricuspid valve sits between the right atrium and right ventricle. Its three leaflets open to fill the ventricle, then snap shut so blood cannot wash back into the atrium when the ventricle contracts.",
    summary: "One-way valve between right atrium and ventricle.",
    connections: [
      { label: "From", hotspotId: "right-atrium" },
      { label: "To", hotspotId: "right-ventricle" },
    ],
    cameraDirection: [0.55, 0.35, 0.75],
    distanceFactor: 3.2,
  },
  {
    id: "pulmonary-valve",
    title: "Pulmonary Valve",
    targetNodeName: "pulmonary_valve_1",
    description:
      "At the exit of the right ventricle, the pulmonary valve opens into the pulmonary trunk. During systole it lets blood rush toward the lungs; during diastole it closes to prevent backflow into the ventricle.",
    summary: "Guards the exit from the right ventricle to the lungs.",
    connections: [
      { label: "From", hotspotId: "right-ventricle" },
      { label: "To", hotspotId: "pulmonary-trunk" },
    ],
    cameraDirection: [0.2, 0.7, 0.7],
    distanceFactor: 3.4,
  },
  {
    id: "mitral",
    title: "Mitral Valve",
    targetNodeName: "mitral_valve_1",
    description:
      "The mitral valve — also called the bicuspid valve — has two leaflets between the left atrium and left ventricle. It is under enormous pressure; when it fails to seal, blood leaks backward and the body pays the price in fatigue and congestion.",
    summary: "Two-leaflet valve between left atrium and ventricle.",
    connections: [
      { label: "From", hotspotId: "left-atrium" },
      { label: "To", hotspotId: "left-ventricle" },
    ],
    cameraDirection: [-0.5, 0.4, 0.75],
    distanceFactor: 3.2,
  },
  {
    id: "aortic-valve",
    title: "Aortic Valve",
    targetNodeName: "aortic_valve_1",
    description:
      "The aortic valve is the gateway from the left ventricle into the aorta. Each heartbeat forces it open; between beats it closes, protecting the ventricle from the high-pressure column of blood in the arterial tree.",
    summary: "Exit valve from the left ventricle into the aorta.",
    connections: [
      { label: "From", hotspotId: "left-ventricle" },
      { label: "To", hotspotId: "aorta" },
    ],
    cameraDirection: [-0.15, 0.75, 0.65],
    distanceFactor: 3.4,
  },
  {
    id: "aorta",
    title: "Aorta",
    targetNodeName: "aorta_1",
    description:
      "The aorta is the body's largest artery. Leaving the heart, it arches upward and then descends, branching into vessels that deliver oxygenated blood to the brain, arms, organs, and legs.",
    summary: "Main artery carrying blood from the heart to the body.",
    connections: [
      { label: "From left ventricle, via", hotspotId: "aortic-valve" },
      { label: "Feeds the heart itself via the", hotspotId: "coronary" },
    ],
    cameraDirection: [-0.35, 0.85, 0.4],
    distanceFactor: 2.8,
  },
  {
    id: "pulmonary-trunk",
    title: "Pulmonary Trunk",
    targetNodeName: "pulmonary_trunk_1",
    description:
      "The pulmonary trunk rises from the right ventricle and quickly divides into the left and right pulmonary arteries. This short, wide vessel is the start of the journey blood takes to pick up oxygen in the lungs.",
    summary: "Carries deoxygenated blood toward the lungs.",
    connections: [
      { label: "From right ventricle, via", hotspotId: "pulmonary-valve" },
    ],
    cameraDirection: [0.35, 0.8, 0.5],
    distanceFactor: 2.8,
  },
  {
    id: "coronary",
    title: "Coronary Arteries",
    targetNodeName: "coronary_arteries_2",
    highlightNodeNames: [
      "left_coronary_artery_2",
      "right_coronary_artery_2",
      "anterior_interventricular_branch_of_left_coronary_artery_2",
      "circumflex_branch_of_left_coronary_artery_2",
    ],
    description:
      "The heart feeds itself through the coronary arteries, which branch from the base of the aorta and spread across the muscle like a crown — corona. Blockage here is what we call a heart attack: the pump is starved of the oxygen it needs to keep pumping.",
    summary: "Vessels that supply the heart muscle itself.",
    connections: [{ label: "Branches from the base of the", hotspotId: "aorta" }],
    cameraDirection: [0.4, 0.3, 0.85],
    distanceFactor: 2.4,
  },
  {
    id: "sa-node",
    title: "Sinoatrial Node",
    targetNodeName: "SA_node_1",
    highlightNodeNames: ["cardiac_conduction_system_1"],
    description:
      "Deep in the right atrium lies the sinoatrial node — the heart's natural pacemaker. Pacemaker cells here spontaneously fire electrical impulses that spread across the atria, telling them to contract and beginning each heartbeat.",
    summary: "Natural pacemaker that initiates each heartbeat.",
    connections: [
      { label: "Signal continues to the", hotspotId: "av-node" },
    ],
    cameraDirection: [0.95, 0.35, 0.15],
    distanceFactor: 3.6,
  },
  {
    id: "av-node",
    title: "Atrioventricular Node",
    targetNodeName: "AV_node_1",
    description:
      "The signal reaches the atrioventricular node, which briefly delays the impulse. That pause lets the ventricles finish filling before they contract — a tiny wait that makes the difference between an efficient pump and a chaotic one.",
    summary: "Delays the impulse so ventricles can fill before contracting.",
    connections: [
      { label: "From the", hotspotId: "sa-node" },
      { label: "Signal continues to the", hotspotId: "bundle-purkinje" },
    ],
    cameraDirection: [0.7, 0.2, 0.7],
    distanceFactor: 3.6,
  },
  {
    id: "bundle-purkinje",
    title: "Bundle of His & Purkinje Fibers",
    targetNodeName: "bundle_of_His_1",
    highlightNodeNames: [
      "right_bundle_branch_1",
      "left_bundle_branch_1",
      "right_purkinje_fibers_1",
      "left_purkinje_fibers_1",
      "left_anterior_fascicle_1",
      "left_posterior_fascicle_1",
    ],
    description:
      "From the AV node, the Bundle of His splits into right and left bundle branches, then fans into Purkinje fibers that lace the ventricular walls. The result is a near-simultaneous squeeze from apex toward base — ejecting blood with remarkable efficiency. That completes our tour of the heart.",
    summary: "Rapid pathways that coordinate ventricular contraction.",
    connections: [{ label: "From the", hotspotId: "av-node" }],
    cameraDirection: [0.2, -0.15, 0.95],
    distanceFactor: 3.0,
  },
];
