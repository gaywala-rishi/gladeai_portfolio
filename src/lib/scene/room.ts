import * as THREE from "three";
import { mat, gloss } from "./materials";

export interface RoomResult {
  winPaneMats: THREE.MeshStandardMaterial[];
  winLight: THREE.PointLight;
}

export function buildRoom(scene: THREE.Scene): RoomResult {
  const ROOM_W = 13,
    ROOM_D = 11.7,
    ROOM_H = 6.5,
    ROOM_CZ = -5.2;
  const wallColor = 0xd8d4ce;
  const ceilColor = 0xf2f0ee;
  const trimColor = 0xe8e6e0;

  // ── Floor (wood texture) ──────────────────────────────────────────────────
  const texLoader = new THREE.TextureLoader();
  const floorRepeat = new THREE.Vector2(9, 8);

  function floorTex(name: string, srgb = false) {
    const t = texLoader.load(`/textures/wood_floor/${name}`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.copy(floorRepeat);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const colorMap = floorTex("wood_floor_Color.png", true);
  const normalMap = floorTex("wood_floor_NormalGL.png");
  const roughMap = floorTex("wood_floor_Roughness.png");
  const aoMap = floorTex("wood_floor_AmbientOcclusion.png");
  const dispMap = floorTex("wood_floor_Displacement.png");

  // r152+ uses 'uv1' (channel 1) for aoMap; add enough segments for displacement
  const floorGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D, 64, 64);
  floorGeo.setAttribute("uv1", floorGeo.attributes.uv.clone());

  const floorMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    normalMapType: THREE.TangentSpaceNormalMap,
    normalScale: new THREE.Vector2(1.5, 1.5),
    roughnessMap: roughMap,
    roughness: 0.8,
    aoMap,
    aoMapIntensity: 1.2,
    displacementMap: dispMap,
    displacementScale: 0.008,
    displacementBias: -0.004,
    metalness: 0.0,
  });

  const floorBase = new THREE.Mesh(floorGeo, floorMat);
  floorBase.rotation.x = -Math.PI / 2;
  floorBase.position.set(0, 0, ROOM_CZ);
  floorBase.receiveShadow = true;
  scene.add(floorBase);

  // ── Wall & ceiling PBR textures ───────────────────────────────────────────
  function wallTex(name: string, rx: number, ry: number, srgb = false) {
    const t = texLoader.load(`/textures/wall/${name}`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeWallMat(rx: number, ry: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      map: wallTex("wall.jpg", rx, ry, true),
      roughness: 0.88,
      metalness: 0.0,
    });
  }

  // ── Walls ──────────────────────────────────────────────────────────────────
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_H, 32, 20),
    makeWallMat(4, 2),
  );
  backWall.position.set(0, ROOM_H / 2, -11.05);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_D, ROOM_H, 28, 20),
    makeWallMat(3.5, 2),
  );
  leftWall.position.set(-6.5, ROOM_H / 2, ROOM_CZ);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_D, ROOM_H, 28, 20),
    makeWallMat(3.5, 2),
  );
  rightWall.position.set(6.5, ROOM_H / 2, ROOM_CZ);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Ceiling
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_D, 32, 28),
    makeWallMat(5, 4),
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, ROOM_H, ROOM_CZ);
  scene.add(ceil);

  // ── Crown molding (white) ──────────────────────────────────────────────────
  (
    [
      [ROOM_W, new THREE.Vector3(0, ROOM_H - 0.06, -11.0), 0],
      [ROOM_D, new THREE.Vector3(-6.46, ROOM_H - 0.06, ROOM_CZ), Math.PI / 2],
      [ROOM_D, new THREE.Vector3(6.46, ROOM_H - 0.06, ROOM_CZ), Math.PI / 2],
    ] as any[]
  ).forEach(([w, pos, ry]) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.12, 0.08),
      mat(trimColor),
    );
    m.position.copy(pos);
    m.rotation.y = ry;
    scene.add(m);
  });

  // Baseboard (white)
  (
    [
      [ROOM_W, new THREE.Vector3(0, 0.07, -11.0), 0],
      [ROOM_D, new THREE.Vector3(-6.46, 0.07, ROOM_CZ), Math.PI / 2],
      [ROOM_D, new THREE.Vector3(6.46, 0.07, ROOM_CZ), Math.PI / 2],
    ] as any[]
  ).forEach(([w, pos, ry]) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.14, 0.05),
      mat(trimColor),
    );
    m.position.copy(pos);
    m.rotation.y = ry;
    scene.add(m);
  });

  // ── Large back-wall windows with roller blinds ─────────────────────────────
  const winPaneMats: THREE.MeshStandardMaterial[] = [];
  const frameMat = mat(0x888880, { roughness: 0.4, metalness: 0.5 });

  // 3 window panels centered on back wall
  const winPanelW = 2.6,
    winH = 4.5,
    winY = 3.0,
    winGap = 0.14;
  const winXPositions = [-2.86, 0, 2.86];

  winXPositions.forEach((wx) => {
    // Outer frame
    const frameTop = new THREE.Mesh(
      new THREE.BoxGeometry(winPanelW + 0.1, 0.08, 0.06),
      frameMat,
    );
    frameTop.position.set(wx, winY + winH / 2 + 0.04, -11.06);
    scene.add(frameTop);
    const frameBot = new THREE.Mesh(
      new THREE.BoxGeometry(winPanelW + 0.1, 0.08, 0.06),
      frameMat,
    );
    frameBot.position.set(wx, winY - winH / 2 - 0.04, -11.06);
    scene.add(frameBot);
    const frameL = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, winH, 0.06),
      frameMat,
    );
    frameL.position.set(wx - winPanelW / 2 - 0.03, winY, -11.06);
    scene.add(frameL);
    const frameR = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, winH, 0.06),
      frameMat,
    );
    frameR.position.set(wx + winPanelW / 2 + 0.03, winY, -11.06);
    scene.add(frameR);
    // Center mullion
    const mullion = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, winH, 0.05),
      frameMat,
    );
    mullion.position.set(wx, winY, -11.06);
    scene.add(mullion);

    // Glass panes (left + right of mullion)
    [-winPanelW / 4, winPanelW / 4].forEach((ox) => {
      const paneMat = new THREE.MeshStandardMaterial({
        color: 0xc8d8e8,
        emissive: 0xaac8e0,
        emissiveIntensity: 0.6,
        roughness: 0.08,
        metalness: 0.1,
        transparent: true,
        opacity: 0.55,
      });
      winPaneMats.push(paneMat);
      const pane = new THREE.Mesh(
        new THREE.PlaneGeometry(winPanelW / 2 - winGap, winH - winGap),
        paneMat,
      );
      pane.position.set(wx + ox, winY, -11.07);
      scene.add(pane);
    });

    // Roller blind (white, partially lowered — covers top ~55%)
    const blindH = winH * 0.55;
    const blindMat = mat(0xf5f3f0, { roughness: 0.95 });
    const blind = new THREE.Mesh(
      new THREE.PlaneGeometry(winPanelW - 0.12, blindH),
      blindMat,
    );
    blind.position.set(wx, winY + winH / 2 - blindH / 2, -11.03);
    scene.add(blind);

    // Blind housing at top
    const blindRail = new THREE.Mesh(
      new THREE.BoxGeometry(winPanelW + 0.06, 0.06, 0.08),
      mat(0x999890, { roughness: 0.4, metalness: 0.4 }),
    );
    blindRail.position.set(wx, winY + winH / 2 + 0.03, -11.03);
    scene.add(blindRail);
  });

  // Window point light
  const winLight = new THREE.PointLight(0xd4eaf5, 0.8, 12);
  winLight.position.set(0, winY, -9.75);
  scene.add(winLight);

  // ── Wall accent panel (right wall, behind bookshelf area) ─────────────────
  const accentPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 4.0),
    mat(0xcfcbc4, { roughness: 0.9 }),
  );
  accentPanel.position.set(6.46, 3.9, -8.45);
  accentPanel.rotation.y = -Math.PI / 2;
  scene.add(accentPanel);

  // ── Ceiling border trim ───────────────────────────────────────────────────
  const borderMat = gloss(0xdddbd6, { roughness: 0.5, metalness: 0.1 });
  [
    [ROOM_W, 0, ROOM_H - 0.02, -11.0, 0, 0.08, 0.04],
    [ROOM_D, -6.46, ROOM_H - 0.02, ROOM_CZ, Math.PI / 2, 0.08, 0.04],
    [ROOM_D, 6.46, ROOM_H - 0.02, ROOM_CZ, Math.PI / 2, 0.08, 0.04],
  ].forEach(([w, x, y, z, ry, h, d]) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w as number, h as number, d as number),
      borderMat,
    );
    m.position.set(x as number, y as number, z as number);
    m.rotation.y = ry as number;
    scene.add(m);
  });

  return { winPaneMats, winLight };
}
