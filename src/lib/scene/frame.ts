import * as THREE from "three";
import { gloss } from "./materials";

export interface FrameResult {
  wallFrameGroup: THREE.Group;
  wfSkyMat: THREE.MeshStandardMaterial;
  wfMtnMat: THREE.MeshStandardMaterial;
  wfMoon: THREE.Mesh;
  wfSun: THREE.Mesh;
  wfStars: THREE.Mesh[];
  wfBldMats: THREE.MeshStandardMaterial[];
  wfWinMats: THREE.MeshStandardMaterial[];
}

export function buildFrame(scene: THREE.Scene): FrameResult {
  const wallFrameGroup = new THREE.Group();
  const wfStars: THREE.Mesh[] = [];
  const wfBldMats: THREE.MeshStandardMaterial[] = [];
  const wfWinMats: THREE.MeshStandardMaterial[] = [];

  // Silver/brushed metal frame (office aesthetic)
  const frameMat = gloss(0xc0bdb8, { roughness: 0.25, metalness: 0.65 });
  const frameW = 1.6,
    frameH = 1.15,
    thick = 0.07,
    depth = 0.055;

  (
    [
      [frameW + thick * 2, thick, depth, 0, frameH / 2 + thick / 2, 0],
      [frameW + thick * 2, thick, depth, 0, -frameH / 2 - thick / 2, 0],
      [thick, frameH, depth, -frameW / 2 - thick / 2, 0, 0],
      [thick, frameH, depth, frameW / 2 + thick / 2, 0, 0],
    ] as any[]
  ).forEach(([w, h, d, x, y]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
    bar.position.set(x, y, 0);
    bar.castShadow = true;
    wallFrameGroup.add(bar);
  });

  // Canvas background (lighter daytime office feel)
  const canvas3d = new THREE.Mesh(
    new THREE.PlaneGeometry(frameW, frameH),
    new THREE.MeshStandardMaterial({ color: 0x2255aa, roughness: 0.92 }),
  );
  canvas3d.position.z = 0.015;
  wallFrameGroup.add(canvas3d);

  // Sky gradient (lighter blues for office)
  const wfSkyMat = new THREE.MeshStandardMaterial({
    color: 0x2277bb,
    roughness: 0.9,
  });
  const skyGrad = new THREE.Mesh(
    new THREE.PlaneGeometry(frameW * 0.95, frameH * 0.95),
    wfSkyMat,
  );
  skyGrad.position.z = 0.018;
  wallFrameGroup.add(skyGrad);

  // Mountain silhouette (softer greens for day)
  const mountainPoints: [number, number][] = [
    [-0.78, -0.42],
    [0.78, -0.42],
    [0.78, -0.1],
    [0.55, -0.1],
    [0.4, -0.3],
    [0.22, -0.06],
    [0.05, -0.28],
    [-0.18, -0.02],
    [-0.38, -0.3],
    [-0.55, -0.1],
    [-0.78, -0.1],
  ];
  const shape = new THREE.Shape();
  shape.moveTo(...mountainPoints[0]);
  mountainPoints.slice(1).forEach((p) => shape.lineTo(...p));
  shape.closePath();
  const wfMtnMat = new THREE.MeshStandardMaterial({
    color: 0x1e3e18,
    roughness: 0.9,
  });
  const mtn = new THREE.Mesh(new THREE.ShapeGeometry(shape), wfMtnMat);
  mtn.position.z = 0.022;
  wallFrameGroup.add(mtn);

  // Moon
  const wfMoon = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfffde8,
      emissive: 0xffeeaa,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 1,
    }),
  );
  wfMoon.position.set(0.4, 0.28, 0.023);
  wallFrameGroup.add(wfMoon);

  // Sun (more visible in daytime office)
  const wfSun = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffee55,
      emissive: 0xffaa00,
      emissiveIntensity: 1.6,
      transparent: true,
      opacity: 0,
    }),
  );
  wfSun.position.set(0.35, 0.28, 0.023);
  wfSun.visible = false;
  wallFrameGroup.add(wfSun);

  // Stars
  for (let i = 0; i < 18; i++) {
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 1,
    });
    const star = new THREE.Mesh(
      new THREE.CircleGeometry(0.008 + Math.random() * 0.007, 6),
      starMat,
    );
    star.position.set(
      (Math.random() - 0.5) * 1.4,
      Math.random() * 0.55 - 0.05,
      0.024,
    );
    wfStars.push(star);
    wallFrameGroup.add(star);
  }

  // City buildings (lighter palette to match office)
  for (let i = 0; i < 14; i++) {
    const bh = 0.06 + Math.random() * 0.16;
    const bw = 0.04 + Math.random() * 0.06;
    const bldMat = new THREE.MeshStandardMaterial({
      color: 0x2d3050,
      roughness: 0.9,
    });
    wfBldMats.push(bldMat);
    const bld = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.01), bldMat);
    bld.position.set(-0.62 + i * 0.095, -0.42 + bh / 2, 0.025);
    wallFrameGroup.add(bld);
    if (Math.random() > 0.4) {
      const winMat = new THREE.MeshStandardMaterial({
        color: 0xffee88,
        emissive: 0xffdd44,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 1,
      });
      wfWinMats.push(winMat);
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.012, 0.002),
        winMat,
      );
      win.position.set(-0.62 + i * 0.095, -0.42 + bh * 0.6, 0.027);
      wallFrameGroup.add(win);
    }
  }

  wallFrameGroup.position.set(-1.8, 4.0, -8.49);
  wallFrameGroup.scale.set(1.3, 1.3, 1.3);
  scene.add(wallFrameGroup);

  return {
    wallFrameGroup,
    wfSkyMat,
    wfMtnMat,
    wfMoon,
    wfSun,
    wfStars,
    wfBldMats,
    wfWinMats,
  };
}

export function updateWallFrameTime(fr: FrameResult, now: Date): void {
  const { wfSkyMat, wfMtnMat, wfMoon, wfSun, wfStars, wfBldMats, wfWinMats } =
    fr;
  const h24 = now.getHours() + now.getMinutes() / 60;
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
  const glowT =
    h24 >= 5 && h24 < 8
      ? Math.sin(((h24 - 5) / 3) * Math.PI)
      : h24 >= 17 && h24 < 20
        ? Math.sin(((h24 - 17) / 3) * Math.PI)
        : 0;

  // Lighter sky range for office aesthetic
  const skyColor = new THREE.Color(0x0a1530).lerp(
    new THREE.Color(0x4499cc),
    dayT,
  );
  if (glowT > 0) skyColor.lerp(new THREE.Color(0xcc6622), glowT * 0.5);
  wfSkyMat.color.copy(skyColor);
  wfMtnMat.color.lerpColors(
    new THREE.Color(0x1a1a40),
    new THREE.Color(0x1e4018),
    dayT,
  );

  const moonAlpha = Math.max(0, 1 - dayT * 2.5);
  wfMoon.visible = moonAlpha > 0.02;
  (wfMoon.material as THREE.MeshStandardMaterial).opacity = moonAlpha;

  const sunAlpha = Math.min(1, dayT * 3);
  wfSun.visible = sunAlpha > 0.02;
  (wfSun.material as THREE.MeshStandardMaterial).opacity = sunAlpha;

  const sunAngle = Math.max(0, Math.min(Math.PI, ((h24 - 6) / 12) * Math.PI));
  wfSun.position.x = 0.48 * Math.cos(Math.PI - sunAngle);
  wfSun.position.y = 0.38 * Math.sin(sunAngle) + 0.04;
  const zenithT = Math.sin(sunAngle);
  (wfSun.material as THREE.MeshStandardMaterial).color.lerpColors(
    new THREE.Color(0xff8800),
    new THREE.Color(0xffee88),
    zenithT,
  );
  (wfSun.material as THREE.MeshStandardMaterial).emissiveIntensity =
    1.2 + zenithT * 0.6;

  const starAlpha = Math.max(0, 1 - dayT * 3);
  wfStars.forEach((s) => {
    s.visible = starAlpha > 0.02;
    (s.material as THREE.MeshStandardMaterial).opacity = starAlpha;
  });
  wfWinMats.forEach((m) => {
    m.emissiveIntensity = Math.max(0, 1.5 - dayT * 1.8);
    m.opacity = Math.max(0.1, 1 - dayT * 0.6);
  });
  wfBldMats.forEach((m) =>
    m.color.lerpColors(
      new THREE.Color(0x1a1d38),
      new THREE.Color(0x3d4468),
      dayT,
    ),
  );
}
