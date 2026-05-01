import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
}

export function buildBookshelf(
  scene: THREE.Scene,
  gltf: GLTFResult,
): THREE.Group {
  const model = gltf.scene;
  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  // Scale so bookshelf height ≈ 2.8m
  model.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  const scale = 2.8 / rawSize.y;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  // Center XZ, floor at y=0
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;

  const bookshelfGroup = new THREE.Group();
  bookshelfGroup.add(model);
  bookshelfGroup.position.set(5, 0, -10.5);
  bookshelfGroup.rotation.y = -1.55;
  scene.add(bookshelfGroup);

  return bookshelfGroup;
}
