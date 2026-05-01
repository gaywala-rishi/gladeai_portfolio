import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
}

export const CHAIR_ROT_Y = -Math.PI * 0.18;

export function buildChair(scene: THREE.Scene, gltf: GLTFResult): THREE.Group {
  const model = gltf.scene;

  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  // Scale so model height ≈ 2m
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  const scale = 2 / rawSize.y;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  // Center XZ, floor at y=0
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= scaledBox.min.y;

  const chairGroup = new THREE.Group();
  chairGroup.add(model);
  chairGroup.position.set(0.5, 0, -7.3);
  chairGroup.rotation.y = CHAIR_ROT_Y;
  scene.add(chairGroup);

  return chairGroup;
}
