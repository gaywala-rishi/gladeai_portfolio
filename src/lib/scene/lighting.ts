import * as THREE from "three";
import { updateClock } from "@/store/sceneStore";

export interface SceneLights {
  ambient: THREE.AmbientLight;
  dirLight: THREE.DirectionalLight;
  fillLeft: THREE.PointLight;
  fillRight: THREE.PointLight;
  deskGlow: THREE.PointLight;
  lampLight: THREE.PointLight;
  ceilBounce: THREE.PointLight;
  charLight: THREE.PointLight;
}

export function createLights(scene: THREE.Scene): SceneLights {
  const ambient = new THREE.AmbientLight(0xfff5ee, 2.0);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
  dirLight.position.set(3, 8, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -10;
  dirLight.shadow.camera.right = dirLight.shadow.camera.top = 10;
  dirLight.shadow.bias = -0.001;
  scene.add(dirLight);

  // Warm fill from left (window side)
  const fillLeft = new THREE.PointLight(0xd4eaf5, 1.8, 16);
  fillLeft.position.set(-3, 4.5, -5);
  scene.add(fillLeft);

  // Warm fill from right
  const fillRight = new THREE.PointLight(0xffe8cc, 1.5, 14);
  fillRight.position.set(4, 4.5, -3);
  scene.add(fillRight);

  // Desk area glow (screen + lamp)
  const deskGlow = new THREE.PointLight(0xfff0dd, 2.4, 5);
  deskGlow.position.set(-0.3, 3.2, -5.5);
  scene.add(deskGlow);

  // Floor lamp light near sofa
  const lampLight = new THREE.PointLight(0xffcc66, 5.0, 10);
  lampLight.castShadow = false;
  lampLight.position.set(-2.2, 2.8, -2.8);
  scene.add(lampLight);

  // Ceiling bounce (warm white for office)
  const ceilBounce = new THREE.PointLight(0xfff8e8, 2.0, 18);
  ceilBounce.position.set(0, 6.0, -4.0);
  scene.add(ceilBounce);

  // Character area light
  const charLight = new THREE.PointLight(0xfff0e8, 1.5, 7);
  charLight.position.set(2, 4, -1.5);
  scene.add(charLight);

  return {
    ambient,
    dirLight,
    fillLeft,
    fillRight,
    deskGlow,
    lampLight,
    ceilBounce,
    charLight,
  };
}

export interface UpdateLightingArgs {
  lights: SceneLights;
  winPaneMats: THREE.MeshStandardMaterial[];
  winLight: THREE.PointLight;
  ceilPanel: THREE.Mesh;
  nightLightPt?: THREE.SpotLight;
  laptopScreenMats: THREE.MeshStandardMaterial[];
  lampOn: boolean;
  onDeskGlowBase: (v: number) => void;
  onLampLightBase: (v: number) => void;
}

export function updateRoomLighting(args: UpdateLightingArgs, now: Date): void {
  const {
    lights,
    winPaneMats,
    winLight,
    laptopScreenMats,
    lampOn,
    onDeskGlowBase,
    onLampLightBase,
  } = args;
  const { ambient, dirLight, fillLeft, fillRight, ceilBounce, charLight } =
    lights;

  const h24 = now.getHours() + now.getMinutes() / 60;
  // Office stays well-lit even at night (min 0.6)
  const dayT =
    h24 < 5
      ? 0
      : h24 < 7
        ? (h24 - 5) / 2
        : h24 < 18
          ? 1
          : h24 < 20
            ? 1 - (h24 - 18) / 2
            : 0;
  const officeDayT = 0.6 + dayT * 0.4; // clamp to [0.6, 1.0] for office feel
  const glowT =
    h24 >= 5 && h24 < 8
      ? Math.sin(((h24 - 5) / 3) * Math.PI)
      : h24 >= 17 && h24 < 20
        ? Math.sin(((h24 - 17) / 3) * Math.PI)
        : 0;

  // Ambient stays bright in office, shifts slightly warmer at night
  ambient.color.lerpColors(
    new THREE.Color(0xfff0e0),
    new THREE.Color(0xfff5ee),
    dayT,
  );
  ambient.intensity = 1.5 + officeDayT * 0.5;

  dirLight.color.lerpColors(
    new THREE.Color(0xd0d8e8),
    new THREE.Color(0xfff8f0),
    dayT,
  );
  if (glowT > 0) dirLight.color.lerp(new THREE.Color(0xff8844), glowT * 0.5);
  dirLight.intensity = 1.2 + dayT * 1.6;

  // Window glass color: daytime bright blue-white, evening warm, night dark
  const paneDay = new THREE.Color(0xc8d8e8);
  const paneNight = new THREE.Color(0x1a2030);
  const paneColor = paneNight.clone().lerp(paneDay, dayT);
  if (glowT > 0) paneColor.lerp(new THREE.Color(0xff9944), glowT * 0.5);
  winPaneMats.forEach((m) => {
    m.color.copy(paneColor);
    m.emissive.copy(dayT > 0.3 ? paneDay : new THREE.Color(0x222840));
    m.emissiveIntensity = 0.3 + dayT * 0.5 + glowT * 0.3;
  });
  winLight.color.lerpColors(
    new THREE.Color(0x7090b0),
    new THREE.Color(0xd4eaf5),
    dayT,
  );
  if (glowT > 0) winLight.color.lerp(new THREE.Color(0xff8844), glowT * 0.4);
  winLight.intensity = 0.4 + dayT * 1.0 + glowT * 0.3;

  fillLeft.intensity = 1.2 + officeDayT * 0.6;
  fillRight.intensity = 1.0 + officeDayT * 0.5;
  ceilBounce.intensity = 1.4 + officeDayT * 0.6;
  charLight.intensity = 1.2 + officeDayT * 0.3;

  onDeskGlowBase(2.0 + (1 - dayT) * 0.8);
  onLampLightBase(lampOn ? 5.0 - dayT * 1.5 : 0);

  const screenOn = h24 >= 7 && h24 < 23;
  laptopScreenMats.forEach((m: any) => {
    m.emissiveIntensity = screenOn ? (m._baseIntensity ?? 1.2) : 0;
  });

  updateClock(now.getHours(), now.getMinutes(), dayT);
}
