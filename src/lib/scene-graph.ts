import type { Object3D } from "three";

export interface SceneNode {
  uuid: string;
  name: string;
  type: string;
  isMesh: boolean;
  children: SceneNode[];
}

/**
 * Walk a Three.js object tree and build a nested SceneNode graph.
 * Named meshes/nodes are logged for the future layer panel.
 */
export function buildSceneGraph(root: Object3D): SceneNode {
  function walk(obj: Object3D): SceneNode {
    const name = obj.name || `(unnamed ${obj.type})`;
    const isMesh = obj.type === "Mesh" || obj.type === "SkinnedMesh";

    return {
      uuid: obj.uuid,
      name,
      type: obj.type,
      isMesh,
      children: obj.children.map(walk),
    };
  }

  console.log("[scene-graph] Walking glTF scene graph…");
  const graph = walk(root);
  let named = 0;
  root.traverse((o) => {
    if (o.name) named += 1;
  });
  console.log(`[scene-graph] Done — ${named} named nodes`);
  return graph;
}

export function findNode(
  root: SceneNode | null,
  uuid: string,
): SceneNode | null {
  if (!root) return null;
  if (root.uuid === uuid) return root;
  for (const child of root.children) {
    const found = findNode(child, uuid);
    if (found) return found;
  }
  return null;
}
