import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
}

export interface ClockMeshResult {
  hourPivot: THREE.Group;
  minPivot: THREE.Group;
  secPivot: THREE.Group;
}

export function buildClockMesh(
  scene: THREE.Scene,
  gltf: GLTFResult,
): ClockMeshResult {
  const clockGroup = new THREE.Group();

  const model = gltf.scene;
  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = false;
      c.receiveShadow = false;
      // Plane_1 and Plane001_2 are the baked-in static hands — hide them,
      // animated procedural hands are overlaid instead
      if (c.parent?.name === "Plane_1" || c.parent?.name === "Plane001_2") {
        c.visible = false;
      }
    }
  });

  // Model face is already in the XY plane — no X rotation needed.
  // Scale to 1.0m using the largest of X/Y dimensions (the face plane).
  model.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  const rawDiam = Math.max(rawSize.x, rawSize.y);
  model.scale.setScalar(rawDiam > 0 ? 1.0 / rawDiam : 0.5);
  model.updateMatrixWorld(true);

  // Center inside clockGroup
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.sub(center);
  clockGroup.add(model);

  // ── Animated hands overlaid in front of clock face ────────────────────────
  const faceZ = 0.044;

  const handMat = new THREE.MeshStandardMaterial({ color: 0x111122 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xe84040 });

  function makeHand(
    w: number,
    len: number,
    m: THREE.Material,
    zOff: number,
  ): THREE.Group {
    const pivot = new THREE.Group();
    pivot.position.z = zOff;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.008), m);
    mesh.position.y = len / 2;
    pivot.add(mesh);
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(w * 1.1, len * 0.22, 0.008),
      m,
    );
    tail.position.y = -(len * 0.22) / 2;
    pivot.add(tail);
    return pivot;
  }

  const hourPivot = makeHand(0.019, 0.16, handMat, faceZ);
  const minPivot = makeHand(0.013, 0.23, handMat, faceZ + 0.008);
  const secPivot = makeHand(0.008, 0.27, redMat, faceZ + 0.016);

  const pin = new THREE.Mesh(
    new THREE.CircleGeometry(0.018, 14),
    new THREE.MeshStandardMaterial({ color: 0xe84040 }),
  );
  pin.position.z = faceZ + 0.02;
  clockGroup.add(hourPivot, minPivot, secPivot, pin);

  clockGroup.position.set(0.8, 4.2, -8.3);
  scene.add(clockGroup);

  return { hourPivot, minPivot, secPivot };
}
