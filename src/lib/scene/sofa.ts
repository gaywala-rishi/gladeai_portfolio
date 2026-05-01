import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
}

export function buildSofa(
  scene: THREE.Scene,
  gltf: GLTFResult,
  coffeeTableGltf: GLTFResult,
  floorLampGltf: GLTFResult,
): void {
  // ── GLB sofa model ─────────────────────────────────────────────────────────
  const model = gltf.scene;
  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  // Use largest dimension (any axis) to drive scale — sofa may be in any orientation
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  // Target 3.5m for the largest dimension (sofa length)
  const scale = 3.5 / maxDim;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  // Center XZ, floor at y=0
  const scaledBox = new THREE.Box3().setFromObject(model);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);
  model.position.x -= scaledCenter.x;
  model.position.z -= scaledCenter.z;
  model.position.y -= scaledBox.min.y;

  const sofaGroup = new THREE.Group();
  sofaGroup.add(model);
  sofaGroup.position.set(-2.6, 0, -1.3);
  sofaGroup.rotation.y = Math.PI / 2;
  sofaGroup.scale.setScalar(1.3);

  // ── Coffee table (GLB model) ───────────────────────────────────────────────
  const tableModel = coffeeTableGltf.scene;
  tableModel.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  tableModel.updateMatrixWorld(true);
  const tBox = new THREE.Box3().setFromObject(tableModel);
  const tSize = new THREE.Vector3();
  tBox.getSize(tSize);
  const tScale = 1.1 / Math.max(tSize.x, tSize.z);
  tableModel.scale.setScalar(tScale);
  tableModel.updateMatrixWorld(true);

  const tBox2 = new THREE.Box3().setFromObject(tableModel);
  const tCenter = new THREE.Vector3();
  tBox2.getCenter(tCenter);
  tableModel.position.x -= tCenter.x;
  tableModel.position.z -= tCenter.z;
  tableModel.position.y -= tBox2.min.y;

  const tableGroup = new THREE.Group();
  tableGroup.add(tableModel);
  tableGroup.position.set(-2.0, 0, -0.6);
  tableGroup.scale.setScalar(1.56);

  // ── Floor lamp (GLTF model) ───────────────────────────────────────────────
  const floorLampModel = floorLampGltf.scene;
  floorLampModel.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  floorLampModel.updateMatrixWorld(true);
  const flBox = new THREE.Box3().setFromObject(floorLampModel);
  const flSize = new THREE.Vector3();
  flBox.getSize(flSize);
  const flScale = 1.7 / flSize.y;
  floorLampModel.scale.setScalar(flScale);
  floorLampModel.updateMatrixWorld(true);

  const flBox2 = new THREE.Box3().setFromObject(floorLampModel);
  const flCenter = new THREE.Vector3();
  flBox2.getCenter(flCenter);
  floorLampModel.position.x -= flCenter.x;
  floorLampModel.position.z -= flCenter.z;
  floorLampModel.position.y -= flBox2.min.y;

  const floorLampGroup = new THREE.Group();
  floorLampGroup.add(floorLampModel);
  floorLampGroup.position.set(-4.2, 0, -3.5);
  floorLampGroup.rotation.y = 0.6;

  // ── Sofa area group ───────────────────────────────────────────────────────
  const sofaAreaGroup = new THREE.Group();
  sofaAreaGroup.add(sofaGroup);
  sofaAreaGroup.add(tableGroup);
  sofaAreaGroup.add(floorLampGroup);
  sofaAreaGroup.scale.setScalar(1.3);
  sofaAreaGroup.position.z = -0.2;
  scene.add(sofaAreaGroup);
}
