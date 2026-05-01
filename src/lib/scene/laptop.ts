import * as THREE from "three";

interface GLTFResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

export function buildLaptop(
  scene: THREE.Scene,
  screenMats: THREE.MeshStandardMaterial[],
  gltf: GLTFResult,
): THREE.Group {
  const model = gltf.scene;
  model.traverse((c: any) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
      // Collect likely screen meshes for day/night emissive toggle
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

  // ── Open lid as static pose ───────────────────────────────────────────────
  // Strategy 1: sample the built-in animation at 25% (typically "fully open")
  if (gltf.animations && gltf.animations.length > 0) {
    const clip =
      gltf.animations.find((a) => a.name.toLowerCase().includes("open")) ??
      gltf.animations[0];
    const mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(clip);
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    action.play();
    mixer.update(clip.duration * 0.25);
  }

  // Strategy 2: directly rotate the lid hinge node as a fallback
  // Cube_9 is the Object3D that parents the screen/lid assembly
  model.traverse((c: any) => {
    if (c.name === "Cube_9") {
      c.rotation.x = -THREE.MathUtils.degToRad(110);
    }
  });

  // Scale to 0.52m wide
  model.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);
  const scale = 0.52 / Math.max(rawSize.x, rawSize.z);
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);

  // Center XZ, floor at y=0
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;

  const laptopGroup = new THREE.Group();
  laptopGroup.add(model);
  laptopGroup.position.set(-1.4, 1.08, -6.8);
  laptopGroup.rotation.y = 1.6;

  // Invisible hit-proxy so raycasting reliably detects the laptop regardless
  // of bounding-sphere staleness after animation posing.
  const hitProxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.5, 0.45),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitProxy.position.set(0, 0.25, 0);
  laptopGroup.add(hitProxy);

  scene.add(laptopGroup);

  return laptopGroup;
}
