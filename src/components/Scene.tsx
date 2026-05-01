"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import gsap from "gsap";

import {
  setProgress,
  setFocus,
  setWebGLSupport,
  useSceneStore,
} from "@/store/sceneStore";
import { openPanel, closePanel } from "@/store/uiStore";

import { createLights, updateRoomLighting } from "@/lib/scene/lighting";
import { buildRoom } from "@/lib/scene/room";
import { buildDesk } from "@/lib/scene/desk";
import { buildLamp } from "@/lib/scene/lamp";
import { buildLaptop } from "@/lib/scene/laptop";
import { buildImac } from "@/lib/scene/imac";
import { buildBookshelf } from "@/lib/scene/bookshelf";
import { buildFrame, updateWallFrameTime } from "@/lib/scene/frame";
import { buildChair, CHAIR_ROT_Y } from "@/lib/scene/chair";
import { buildSofa } from "@/lib/scene/sofa";
import { buildClockMesh } from "@/lib/scene/clock-mesh";
import { buildProps } from "@/lib/scene/props";

const DEFAULT_CAM_POS = new THREE.Vector3(0, 2.8, 5.2);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 1.4, -3.5);

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);

  const focusKey = useSceneStore((s) => s.focus.key);

  const focusObjectFnRef = useRef<((obj: any) => void) | null>(null);
  const interactiveObjectsRef = useRef<any[]>([]);
  const focusedObjectRef = useRef<any>(null);

  // ── Sync focus store → Three.js (nav-dot clicks) ──────────────────────────
  useEffect(() => {
    if (!focusKey || !focusObjectFnRef.current) return;
    const obj = interactiveObjectsRef.current.find(
      (o: any) => o.key === focusKey,
    );
    if (
      obj &&
      (!focusedObjectRef.current || focusedObjectRef.current.key !== focusKey)
    )
      focusObjectFnRef.current(obj);
  }, [focusKey]);

  // ── Main scene setup ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let disposeScene: (() => void) | null = null;

    async function setup() {
      const canvasEl = canvasRef.current!;
      const labelsEl = labelsRef.current!;

      try {
        const c = document.createElement("canvas");
        if (!c.getContext("webgl2") && !c.getContext("webgl")) {
          setWebGLSupport(false);
          return;
        }
      } catch {
        setWebGLSupport(false);
        return;
      }
      setWebGLSupport(true);

      const isMobile =
        window.innerWidth <= 600 ||
        ("ontouchstart" in window && window.innerWidth <= 1024);

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: !isMobile,
      });
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
      );
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = !isMobile;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.8;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xd0ccc8);
      scene.fog = new THREE.FogExp2(0xd0ccc8, 0.01);

      // Camera
      const defaultFov = isMobile ? 65 : 55;
      const camera = new THREE.PerspectiveCamera(
        defaultFov,
        window.innerWidth / window.innerHeight,
        0.1,
        60,
      );
      camera.position.set(0, 7, 14);
      camera.lookAt(DEFAULT_CAM_TARGET);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.copy(DEFAULT_CAM_TARGET);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.minDistance = isMobile ? 2 : 2.5;
      controls.maxDistance = isMobile ? 12 : 9;
      controls.maxPolarAngle = Math.PI / 2.08;
      controls.minPolarAngle = 0.15;
      controls.enabled = false;

      setProgress(15, "Loading models…");
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(
        "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
      );
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      const loadGLTF = (url: string) =>
        new Promise<any>((resolve, reject) =>
          loader.load(url, resolve, undefined, reject),
        );

      const [
        ownerOnChairGLTF,
        clockGLTF,
        sofaGLTF,
        coffeeTableGLTF,
        deskGLTF,
        macbookGLTF,
        tableLampGLTF,
        imacGLTF,
        bookshelfGLTF,
        floorLampGLTF,
      ] = await Promise.all([
        loadGLTF("/api/models/owner_on_chair.glb"),
        loadGLTF("/api/models/wall_clock.glb"),
        loadGLTF("/api/models/sofa.glb"),
        loadGLTF("/api/models/coffee_table.glb"),
        loadGLTF("/api/models/desk.glb"),
        loadGLTF("/api/models/macbook_pro.glb"),
        loadGLTF("/api/models/table_lamp.glb"),
        loadGLTF("/api/models/imac_green.glb"),
        loadGLTF("/api/models/bookshelf.glb"),
        loadGLTF("/api/models/floor_lamp.glb"),
      ]);

      if (cancelled) return;

      setProgress(40, "Setting up lights…");
      const lights = createLights(scene);
      const lampLightRef = { current: lights.lampLight };
      const lampLightBaseRef = { current: 5.0 };

      setProgress(52, "Building room…");
      const { winPaneMats, winLight, ceilPanel } = buildRoom(scene);

      setProgress(62, "Placing furniture…");
      buildDesk(scene, deskGLTF);

      const { lampMeshes, shadeMat, bulb } = buildLamp(scene, tableLampGLTF);
      const lampShadeMatRef = { current: shadeMat };
      const lampBulbRef = { current: bulb };
      let lampOn = true;

      const laptopScreenMats: THREE.MeshStandardMaterial[] = [];
      const laptopGroup = buildLaptop(scene, laptopScreenMats, macbookGLTF);
      const imacGroup = buildImac(scene, laptopScreenMats, imacGLTF);
      const bookshelfGroup = buildBookshelf(scene, bookshelfGLTF);
      const frameResult = buildFrame(scene);
      const { wallFrameGroup } = frameResult;

      // Owner on chair — Contact interactive
      const chairGroup = buildChair(scene, ownerOnChairGLTF);
      buildSofa(scene, sofaGLTF, coffeeTableGLTF, floorLampGLTF);

      setProgress(78, "Hanging clock…");
      const { hourPivot, minPivot, secPivot } = buildClockMesh(
        scene,
        clockGLTF,
      );
      const { particleGeo, PARTICLE_COUNT } = buildProps(scene, isMobile);

      setProgress(86, "Wiring interactions…");

      // ── Floating labels ───────────────────────────────────────────────────
      labelsEl.innerHTML = "";
      const labelDefs: any[] = [
        {
          key: "imac",
          mesh: laptopGroup,
          icon: "🖼️",
          text: "About Me",
          offset: new THREE.Vector3(0, 0.7, 0),
        },
        {
          key: "bookshelf",
          mesh: bookshelfGroup,
          icon: "📚",
          text: "Skills",
          offset: new THREE.Vector3(0, 2.3, 0),
        },
        {
          key: "macbook",
          mesh: imacGroup,
          icon: "💻",
          text: "Projects",
          offset: new THREE.Vector3(0, 1.0, 0),
        },
        {
          key: "character",
          mesh: chairGroup,
          icon: "🪑",
          text: "Contact",
          offset: new THREE.Vector3(0, 2.0, 0),
        },
      ];
      const labelEls: Record<string, HTMLElement> = {};
      labelDefs.forEach((def) => {
        const div = document.createElement("div");
        div.className = "scene-label";
        div.innerHTML = `<span class="label-emoji">${def.icon}</span><span class="label-text">${def.text}</span>`;
        if ("ontouchstart" in window) {
          div.style.pointerEvents = "auto";
          div.addEventListener("click", (e: Event) => {
            e.stopPropagation();
            const obj = interactiveObjectsRef.current.find(
              (o: any) => o.key === def.key,
            );
            if (obj) focusObject(obj);
          });
        }
        labelsEl.appendChild(div);
        labelEls[def.key] = div;
      });

      // ── Interactive objects ───────────────────────────────────────────────
      const interactiveObjects: any[] = [
        {
          mesh: laptopGroup,
          key: "imac",
          camPos: new THREE.Vector3(0.1, 1.8, -6.6),
          camTarget: new THREE.Vector3(-1.0, 1.4, -6.8),
          camFov: 20,
        },
        {
          mesh: bookshelfGroup,
          key: "bookshelf",
          camPos: new THREE.Vector3(1.6, 2.4, -5.5),
          camTarget: new THREE.Vector3(3.5, 2.0, -7.2),
          camFov: defaultFov,
        },
        {
          mesh: imacGroup,
          key: "macbook",
          camPos: new THREE.Vector3(-0.4, 1.9, -6.8),
          camTarget: new THREE.Vector3(-0.4, 1.5, -5.9),
          camFov: 25,
        },
        {
          // Recliner chair → Contact
          mesh: chairGroup,
          key: "character",
          camPos: new THREE.Vector3(-0.2, 2.2, -0.5),
          camTarget: new THREE.Vector3(1.6, 0.9, -2.2),
          camFov: defaultFov,
        },
      ];
      interactiveObjectsRef.current = interactiveObjects;

      const meshToObject = new Map<THREE.Object3D, any>();
      function getAllMeshes(obj: THREE.Object3D) {
        const out: THREE.Object3D[] = [];
        obj.traverse((c: any) => {
          if (c.isMesh) out.push(c);
        });
        return out;
      }
      const allInteractiveMeshes: THREE.Object3D[] = [];
      interactiveObjects.forEach((o) =>
        getAllMeshes(o.mesh).forEach((m) => {
          allInteractiveMeshes.push(m);
          meshToObject.set(m, o);
        }),
      );

      function setEmissive(
        group: THREE.Object3D,
        color: number,
        intensity: number,
      ) {
        group.traverse((c: any) => {
          if (!c.isMesh) return;
          (Array.isArray(c.material) ? c.material : [c.material]).forEach(
            (m: any) => {
              if (m.emissive) {
                m.emissive.set(color);
                m.emissiveIntensity = intensity;
              }
            },
          );
        });
      }
      function clearEmissive(group: THREE.Object3D) {
        setEmissive(group, 0x000000, 0);
      }

      // ── Lighting update ───────────────────────────────────────────────────
      const deskGlowBase = { value: 2.2 };

      function doUpdateLighting(now: Date) {
        updateRoomLighting(
          {
            lights,
            winPaneMats,
            winLight,
            ceilPanel,
            laptopScreenMats,
            lampOn,
            onDeskGlowBase: (v) => {
              deskGlowBase.value = v;
            },
            onLampLightBase: (v) => {
              lampLightBaseRef.current = v;
            },
          },
          now,
        );
      }

      function doUpdateWallFrame(now: Date) {
        updateWallFrameTime(frameResult, now);
      }

      // ── Clock tick ────────────────────────────────────────────────────────
      let simTime: Date | null = null;
      (window as any).setSimHour = (h: number, m = 0) => {
        simTime = new Date(2024, 0, 1, h, m, 0);
      };

      function tickScene() {
        const now = simTime ? new Date(simTime) : new Date();
        const h = now.getHours() % 12;
        const m = now.getMinutes();
        const s = now.getSeconds();
        const ms = now.getMilliseconds();
        secPivot.rotation.z = -((s + ms / 1000) / 60) * Math.PI * 2;
        minPivot.rotation.z = -((m + (s + ms / 1000) / 60) / 60) * Math.PI * 2;
        hourPivot.rotation.z = -((h + m / 60) / 12) * Math.PI * 2;
        doUpdateWallFrame(now);
        doUpdateLighting(now);
      }

      // ── Raycasting & interactions ─────────────────────────────────────────
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let lastTouchEndTime = 0;
      let isAnimating = false;
      let hoveredObject: any = null;

      function updatePointer(e: MouseEvent | Touch) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      }

      function animateCamera(
        toPos: THREE.Vector3,
        toTarget: THREE.Vector3,
        toFov?: number,
        onComplete?: () => void,
      ) {
        isAnimating = true;
        controls.enabled = false;
        const fromPos = camera.position.clone();
        const fromTarget = controls.target.clone();
        const fromFov = camera.fov;
        const proxy = { t: 0 };
        gsap.to(proxy, {
          t: 1,
          duration: 1.45,
          ease: "power2.inOut",
          onUpdate() {
            camera.position.lerpVectors(fromPos, toPos, proxy.t);
            controls.target.lerpVectors(fromTarget, toTarget, proxy.t);
            camera.lookAt(controls.target);
            if (toFov !== undefined) {
              camera.fov = fromFov + (toFov - fromFov) * proxy.t;
              camera.updateProjectionMatrix();
            }
          },
          onComplete() {
            isAnimating = false;
            onComplete?.();
          },
        });
      }

      function focusObject(obj: any) {
        if (hoveredObject) {
          clearEmissive(hoveredObject.mesh);
          hoveredObject = null;
        }
        if (focusedObjectRef.current && focusedObjectRef.current !== obj)
          clearEmissive(focusedObjectRef.current.mesh);
        focusedObjectRef.current = obj;
        setEmissive(obj.mesh, 0xfff5e0, 0.35);
        setFocus(obj.key);
        animateCamera(obj.camPos, obj.camTarget, obj.camFov, () => {
          clearEmissive(obj.mesh);
        });
        setTimeout(() => openPanel(obj.key), 320);
      }
      focusObjectFnRef.current = focusObject;

      function doResetCamera() {
        if (focusedObjectRef.current) {
          clearEmissive(focusedObjectRef.current.mesh);
          focusedObjectRef.current = null;
        }
        setFocus(null);
        closePanel();
        animateCamera(DEFAULT_CAM_POS, DEFAULT_CAM_TARGET, defaultFov, () => {
          controls.enabled = true;
        });
      }

      // ── Lamp toggle ────────────────────────────────────────────────────────
      function toggleLampState() {
        lampOn = !lampOn;
        if (lampOn) {
          lampLightRef.current.intensity = lampLightBaseRef.current;
          if (lampShadeMatRef.current) {
            lampShadeMatRef.current.emissive.set(0x555555);
            lampShadeMatRef.current.emissiveIntensity = 0.5;
          }
          (
            lampBulbRef.current.material as THREE.MeshStandardMaterial
          ).emissiveIntensity = 4.0;
        } else {
          lampLightRef.current.intensity = 0;
          if (lampShadeMatRef.current) {
            lampShadeMatRef.current.emissive.set(0x000000);
            lampShadeMatRef.current.emissiveIntensity = 0;
          }
          (
            lampBulbRef.current.material as THREE.MeshStandardMaterial
          ).emissiveIntensity = 0;
        }
      }

      canvasEl.addEventListener("mousemove", (e: MouseEvent) => {
        if (isAnimating || focusedObjectRef.current) return;
        updatePointer(e);
        raycaster.setFromCamera(pointer, camera);
        const lampHover = raycaster.intersectObjects(lampMeshes, false);
        if (lampHover.length > 0) {
          if (hoveredObject) {
            clearEmissive(hoveredObject.mesh);
            hoveredObject = null;
          }
          canvasEl.style.cursor = "pointer";
          return;
        }
        const hits = raycaster.intersectObjects(allInteractiveMeshes, false);
        const obj =
          hits.length > 0 ? (meshToObject.get(hits[0].object) ?? null) : null;
        if (obj) {
          if (obj !== hoveredObject) {
            if (hoveredObject) clearEmissive(hoveredObject.mesh);
            hoveredObject = obj;
            setEmissive(hoveredObject.mesh, 0xfff5e0, 0.2);
          }
          canvasEl.style.cursor = "pointer";
        } else {
          if (hoveredObject) {
            clearEmissive(hoveredObject.mesh);
            hoveredObject = null;
          }
          canvasEl.style.cursor = "default";
        }
      });

      function onWindowClick(e: MouseEvent) {
        if (isAnimating) return;
        if (Date.now() - lastTouchEndTime < 350) return;
        updatePointer(e);
        raycaster.setFromCamera(pointer, camera);
        const lampHits = raycaster.intersectObjects(lampMeshes, false);
        if (lampHits.length > 0) {
          toggleLampState();
          return;
        }
        const hits = raycaster.intersectObjects(allInteractiveMeshes, false);
        if (hits.length > 0) {
          const obj = meshToObject.get(hits[0].object) ?? null;
          if (obj) {
            focusObject(obj);
            return;
          }
        }
        if (focusedObjectRef.current) doResetCamera();
      }

      function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && focusedObjectRef.current) doResetCamera();
      }

      function onTouchStart(e: TouchEvent) {
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(t.clientY / window.innerHeight) * 2 + 1;
      }

      function onTouchEnd(e: TouchEvent) {
        lastTouchEndTime = Date.now();
        const t = e.changedTouches[0];
        updatePointer(t);
        raycaster.setFromCamera(pointer, camera);
        const lampHits = raycaster.intersectObjects(lampMeshes, false);
        if (lampHits.length > 0) {
          toggleLampState();
          return;
        }
        const hits = raycaster.intersectObjects(allInteractiveMeshes, false);
        const obj =
          hits.length > 0 ? (meshToObject.get(hits[0].object) ?? null) : null;
        if (obj) focusObject(obj);
        else if (focusedObjectRef.current) doResetCamera();
      }

      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      window.addEventListener("click", onWindowClick);
      window.addEventListener("keydown", onKeydown);
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("resize", onResize);

      // ── Label projection ──────────────────────────────────────────────────
      const _vProj = new THREE.Vector3();
      function updateLabels(hideDueToFocus: boolean) {
        labelDefs.forEach((def: any) => {
          const el = labelEls[def.key];
          if (!el) return;
          if (hideDueToFocus) {
            el.style.opacity = "0";
            return;
          }
          const wp = new THREE.Vector3();
          def.mesh.getWorldPosition(wp);
          wp.add(def.offset);
          _vProj.copy(wp).project(camera);
          if (_vProj.z > 1) {
            el.style.opacity = "0";
            return;
          }
          const x = (_vProj.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-_vProj.y * 0.5 + 0.5) * window.innerHeight;
          el.style.transform = `translate(-50%, -100%) translate(${x}px,${y}px)`;
          el.style.opacity = "1";
        });
      }

      tickScene();
      setProgress(100, "Ready!");

      // Intro fly-in
      gsap.to(camera.position, {
        x: DEFAULT_CAM_POS.x,
        y: DEFAULT_CAM_POS.y,
        z: DEFAULT_CAM_POS.z,
        duration: 2.2,
        ease: "power3.inOut",
        onUpdate() {
          camera.lookAt(DEFAULT_CAM_TARGET);
        },
        onComplete() {
          controls.enabled = true;
        },
      });

      // ── Render loop ───────────────────────────────────────────────────────
      let lastTime = 0;
      let raf: number;
      function animate(time: number) {
        raf = requestAnimationFrame(animate);
        const dt = Math.min((time - lastTime) * 0.001, 0.05);
        lastTime = time;

        tickScene();

        // Subtle desk glow pulse
        lights.deskGlow.intensity =
          deskGlowBase.value + Math.sin(time * 0.0028) * 0.06;
        if (lampOn)
          lampLightRef.current.intensity =
            lampLightBaseRef.current + Math.sin(time * 0.0031 + 1.2) * 0.06;

        // Particle drift
        const posAttr = particleGeo.attributes.position;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          posAttr.setY(i, posAttr.getY(i) + dt * 0.04);
          if (posAttr.getY(i) > 6.2) posAttr.setY(i, 0.4);
          posAttr.setX(
            i,
            posAttr.getX(i) + Math.sin(time * 0.0004 + i) * dt * 0.01,
          );
        }
        posAttr.needsUpdate = true;

        // Character idle sway
        chairGroup.rotation.y = CHAIR_ROT_Y + Math.sin(time * 0.0009) * 0.028;

        updateLabels(!!focusedObjectRef.current);
        controls.update();
        renderer.render(scene, camera);
      }
      animate(0);

      disposeScene = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("click", onWindowClick);
        window.removeEventListener("keydown", onKeydown);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
      };
    } // end setup()

    setup();

    return () => {
      cancelled = true;
      disposeScene?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 0,
        }}
        aria-label="Interactive 3D office portfolio — use mouse to orbit, click objects to explore"
      />
      <div
        ref={labelsRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
        aria-hidden="true"
      />
    </>
  );
}
