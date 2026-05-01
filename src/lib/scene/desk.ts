import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
}

export function buildDesk(scene: THREE.Scene, gltf: GLTFResult): void {
  const model = gltf.scene;
  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  // Scale so desk width ≈ 3.8m
  model.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  // Scale so desk height ≈ 1.17m (50% bigger than standard 0.78m)
  const scale = 1.17 / rawSize.y;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  // Center XZ, floor at y=0
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;

  const deskGroup = new THREE.Group();
  deskGroup.add(model);
  deskGroup.position.set(-0.3, 0, -6.5);
  deskGroup.rotation.y = -Math.PI / 2; // 90° clockwise
  scene.add(deskGroup);
}
