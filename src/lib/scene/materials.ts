import * as THREE from "three";

export const mat = (c: number, o: any = {}) =>
  new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.78,
    metalness: 0.04,
    ...o,
  });

export const gloss = (c: number, o: any = {}) =>
  new THREE.MeshStandardMaterial({
    color: c,
    roughness: 0.22,
    metalness: 0.35,
    ...o,
  });

export const emMat = (c: number, e: number, i = 1) =>
  new THREE.MeshStandardMaterial({
    color: c,
    emissive: e,
    emissiveIntensity: i,
    roughness: 0.4,
  });
