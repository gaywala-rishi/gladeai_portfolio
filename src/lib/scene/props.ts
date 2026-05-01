import * as THREE from "three";

export interface PropsResult {
  particleGeo: THREE.BufferGeometry;
  PARTICLE_COUNT: number;
}

export function buildProps(scene: THREE.Scene, isMobile: boolean): PropsResult {
  // ── Dust particles ─────────────────────────────────────────────────────────
  const PARTICLE_COUNT = isMobile ? 60 : 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particlePos[i * 3] = (Math.random() - 0.5) * 9;
    particlePos[i * 3 + 1] = Math.random() * 5.5 + 0.5;
    particlePos[i * 3 + 2] = Math.random() * -8 - 0.3;
  }
  particleGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePos, 3),
  );
  scene.add(
    new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0xd4cfc8,
        size: 0.038,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    ),
  );

  return { particleGeo, PARTICLE_COUNT };
}
