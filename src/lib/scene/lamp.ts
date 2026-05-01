import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
}

export interface LampResult {
  lampGroup: THREE.Group;
  lampMeshes: THREE.Object3D[];
  shadeMat: THREE.MeshStandardMaterial;
  bulb: THREE.Mesh;
}

export function buildLamp(scene: THREE.Scene, gltf: GLTFResult): LampResult {
  const lampMeshes: THREE.Object3D[] = [];

  // Collect a shade/emissive material and create a dummy bulb for the toggle system
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e0,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 6, 4),
    new THREE.MeshStandardMaterial({
      color: 0xffffee,
      emissive: new THREE.Color(0xffffaa),
      emissiveIntensity: 0,
    }),
  );

  const model = gltf.scene;
  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
      lampMeshes.push(c);
      // Wire up the first emissive-capable mesh as the shade for the toggle
      const name = (c.name || "").toLowerCase();
      if (
        name.includes("shade") ||
        name.includes("lamp") ||
        name.includes("light")
      ) {
        const m = c.material as THREE.MeshStandardMaterial;
        if (m && "emissiveIntensity" in m) {
          Object.assign(shadeMat, { color: m.color, roughness: m.roughness });
          c.material = shadeMat;
        }
      }
    }
  });

  // Scale so lamp height ≈ 0.55m (desk lamp proportions)
  model.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  const scale = 0.55 / rawSize.y;
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  // Floor at y=0, center XZ
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;

  const lampGroup = new THREE.Group();
  lampGroup.add(model);
  lampGroup.add(bulb);
  bulb.position.set(0, 0.5, 0); // near top of lamp

  lampGroup.position.set(-1.1, 1.17, -5.85);
  lampGroup.rotation.y = -0.5;
  scene.add(lampGroup);

  return { lampGroup, lampMeshes, shadeMat, bulb };
}
