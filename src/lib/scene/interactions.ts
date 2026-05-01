// interactions.ts — Raycasting, hover cursor, and click dispatch.
// Decoupled from DOM: fires callbacks that Scene.svelte wires to stores.

import * as THREE from "three";
import type { SceneObjectKey } from "@/store/sceneStore";

export type InteractiveObject = {
  key: SceneObjectKey;
  meshes: THREE.Object3D[];
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

/** Map from mesh uuid → owning object key, built once after the scene loads. */
const meshToKey = new Map<string, SceneObjectKey>();

export function registerInteractiveObjects(objects: InteractiveObject[]) {
  meshToKey.clear();
  for (const obj of objects) {
    for (const mesh of obj.meshes) {
      mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshToKey.set(child.uuid, obj.key);
        }
      });
    }
  }
}

/** Returns the first hit object key, or null. */
function resolveHit(intersects: THREE.Intersection[]): SceneObjectKey {
  for (const hit of intersects) {
    const key = meshToKey.get(hit.object.uuid);
    if (key) return key;
  }
  return null;
}

export function onPointerMove(
  event: PointerEvent,
  camera: THREE.Camera,
  scene: THREE.Scene,
  canvas: HTMLCanvasElement,
  allMeshes: THREE.Object3D[],
) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(allMeshes, true);
  const key = resolveHit(hits);
  canvas.style.cursor = key ? "pointer" : "grab";
}

export function onPointerClick(
  event: PointerEvent,
  camera: THREE.Camera,
  allMeshes: THREE.Object3D[],
  canvas: HTMLCanvasElement,
  onHit: (key: SceneObjectKey) => void,
) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(allMeshes, true);
  const key = resolveHit(hits);
  if (key) onHit(key);
}
