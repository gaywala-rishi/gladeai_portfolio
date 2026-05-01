// setup.ts — renderer, camera, and OrbitControls initialisation.
// Called once from Scene.svelte's onMount. Returns refs used by other modules.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export const DEFAULT_CAM_POS = new THREE.Vector3(0, 2.8, 5.2);
export const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 1.4, -3.5);

export function createRenderer(canvas: HTMLCanvasElement, isMobile: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.2;
  return renderer;
}

export function createCamera(isMobile: boolean) {
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 65 : 55,
    window.innerWidth / window.innerHeight,
    0.1,
    60,
  );
  // Start high for intro fly-in
  camera.position.set(0, 7, 14);
  camera.lookAt(DEFAULT_CAM_TARGET);
  return camera;
}

export function createControls(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
  isMobile: boolean,
) {
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(DEFAULT_CAM_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = isMobile ? 2 : 2.5;
  controls.maxDistance = isMobile ? 12 : 9;
  controls.maxPolarAngle = Math.PI / 2.08;
  controls.minPolarAngle = 0.15;
  controls.enabled = false; // enabled after intro fly-in completes
  return controls;
}

export function handleResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/** Detect WebGL 2 support without creating a full renderer. */
export function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
