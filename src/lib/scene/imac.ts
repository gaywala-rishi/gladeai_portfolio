import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

export function buildImac(
  scene: THREE.Scene,
  screenMats: THREE.MeshStandardMaterial[],
  gltf: GLTFResult,
): THREE.Group {
  const model = gltf.scene;
  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
      const name = (c.name || "").toLowerCase();
      if (
        name.includes("screen") ||
        name.includes("display") ||
        name.includes("monitor")
      ) {
        const m = c.material as THREE.MeshStandardMaterial;
        if (m && "emissiveIntensity" in m) {
          m.emissive = new THREE.Color(0x2244cc);
          m.emissiveIntensity = 1.4;
          (m as any)._baseIntensity = 1.4;
          screenMats.push(m);
        }
      }
    }
  });

  // Scale so iMac height ≈ 0.52m
  model.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  const scale = (0.52 * 1.3) / rawSize.y;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  // Center XZ, floor at y=0
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;

  const imacGroup = new THREE.Group();
  imacGroup.add(model);
  imacGroup.position.set(0.1, 1.17, -5.9);
  imacGroup.rotation.y = 3.15;
  scene.add(imacGroup);

  return imacGroup;
}
