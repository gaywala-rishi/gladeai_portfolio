// camera-anim.ts — GSAP-powered camera fly-to and reset animations.
// Replaces inline GSAP calls scattered through the original index.html.

import * as THREE from "three";
import gsap from "gsap";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DEFAULT_CAM_POS, DEFAULT_CAM_TARGET } from "./setup";

export type CameraTarget = {
  pos: THREE.Vector3;
  target: THREE.Vector3;
};

// Per-object camera positions — mirrors the original flyTo data
export const CAMERA_TARGETS: Record<string, CameraTarget> = {
  laptop: {
    pos: new THREE.Vector3(-0.3, 1.8, -4.5),
    target: new THREE.Vector3(-0.3, 1.2, -6.5),
  },
  bookshelf: {
    pos: new THREE.Vector3(3.8, 2.0, -4.0),
    target: new THREE.Vector3(4.5, 1.5, -6.5),
  },
  frame: {
    pos: new THREE.Vector3(-2.5, 3.2, -4.0),
    target: new THREE.Vector3(-4.0, 3.3, -5.8),
  },
  character: {
    pos: new THREE.Vector3(-2.0, 2.5, -4.0),
    target: new THREE.Vector3(-3.5, 1.5, -7.0),
  },
  lamp: {
    pos: new THREE.Vector3(0.5, 2.2, -4.5),
    target: new THREE.Vector3(0.7, 1.13, -6.15),
  },
};

export function flyTo(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  target: CameraTarget,
  onComplete?: () => void,
) {
  controls.enabled = false;
  gsap.to(camera.position, {
    x: target.pos.x,
    y: target.pos.y,
    z: target.pos.z,
    duration: 1.2,
    ease: "power2.inOut",
    onUpdate() {
      camera.lookAt(target.target);
      controls.target.copy(target.target);
    },
    onComplete,
  });
}

export function resetCamera(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  onComplete?: () => void,
) {
  gsap.to(camera.position, {
    x: DEFAULT_CAM_POS.x,
    y: DEFAULT_CAM_POS.y,
    z: DEFAULT_CAM_POS.z,
    duration: 1.0,
    ease: "power2.inOut",
    onUpdate() {
      camera.lookAt(DEFAULT_CAM_TARGET);
      controls.target.copy(DEFAULT_CAM_TARGET);
    },
    onComplete() {
      controls.enabled = true;
      onComplete?.();
    },
  });
}

export function introFlyIn(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  onComplete?: () => void,
) {
  gsap.to(camera.position, {
    x: DEFAULT_CAM_POS.x,
    y: DEFAULT_CAM_POS.y,
    z: DEFAULT_CAM_POS.z,
    duration: 2.2,
    ease: "power3.inOut",
    onUpdate() {
      camera.lookAt(DEFAULT_CAM_TARGET);
    },
    onComplete() {
      controls.enabled = true;
      onComplete?.();
    },
  });
}
