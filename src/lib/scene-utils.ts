import type { Object3D } from "three";
import type { SceneNode } from "@/lib/scene-graph";

export function findObjectByName(
  root: Object3D,
  name: string,
): Object3D | null {
  let found: Object3D | null = null;
  root.traverse((obj) => {
    if (!found && obj.name === name) found = obj;
  });
  return found;
}

export function findNodeByName(
  root: SceneNode | null,
  name: string,
): SceneNode | null {
  if (!root) return null;
  if (root.name === name) return root;
  for (const child of root.children) {
    const found = findNodeByName(child, name);
    if (found) return found;
  }
  return null;
}

export function collectNames(root: Object3D): string[] {
  const names: string[] = [];
  root.traverse((obj) => {
    if (obj.name) names.push(obj.name);
  });
  return names;
}
