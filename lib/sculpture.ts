import type * as Three from "three";
import { createFrameLoop } from "./frame-loop";

export type Sculpture = {
  start: () => void;
  destroy: () => void;
};

// Webuilder's W outline, retaining the original proportions.
const outline = [
  [0, 0],
  [51, 0],
  [81, 145],
  [86, 145],
  [127, 0],
  [174, 0],
  [216, 145],
  [222, 145],
  [251, 0],
  [300, 0],
  [249, 216],
  [193, 216],
  [152, 69],
  [148, 69],
  [108, 216],
  [52, 216],
];

export async function createSculpture(
  host: HTMLDivElement,
  signal?: AbortSignal,
): Promise<Sculpture> {
  const T = await import("three");

  signal?.throwIfAborted();

  let disposed = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let age = reducedMotion.matches ? 3 : 0;
  let inView = true;

  const renderer = new T.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  renderer.setClearColor(0x050505, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new T.Scene();

  const camera = new T.PerspectiveCamera(32, 1, 0.1, 60);

  camera.position.set(0, 0, 8.5);
  camera.lookAt(0, 0, 0);

  // Create studio reflections locally.
  const studio = new T.Scene();
  studio.background = new T.Color(0x171717);

  function softbox(
    width: number,
    height: number,
    position: [number, number, number],
    color: number,
    strength: number,
  ) {
    const material = new T.MeshBasicMaterial({
      color: new T.Color(color).multiplyScalar(strength),
      side: T.DoubleSide,
    });

    const panel = new T.Mesh(new T.PlaneGeometry(width, height), material);

    panel.position.set(...position);
    panel.lookAt(0, 0, 0);

    studio.add(panel);
  }

  softbox(7, 10, [-5, 3, 6], 0xfff9ef, 5);
  softbox(2, 11, [6, 1, 3], 0xfff1c7, 3.5);
  softbox(9, 3, [0, 7, -1], 0xffffff, 4.5);
  softbox(5, 2, [-2, -5, 5], 0xe6c570, 1.5);
  softbox(3, 6, [2, 2, -7], 0xffdea1, 3);

  const pmrem = new T.PMREMGenerator(renderer);

  const environment = pmrem.fromScene(studio, 0.045, 0.1, 100);

  scene.environment = environment.texture;
  scene.environmentIntensity = 1.05;

  pmrem.dispose();

  studio.traverse((object) => {
    if (object instanceof T.Mesh) {
      object.geometry.dispose();
      (object.material as Three.Material).dispose();
    }
  });

  studio.clear();

  const key = new T.DirectionalLight(0xfff0d1, 4.5);
  key.position.set(-3, 5, 7);
  scene.add(key);

  const edge = new T.DirectionalLight(0xffdc87, 3);
  edge.position.set(5, -1, -3);
  scene.add(edge);

  // Generate fine surface grain.
  const resolution = 128;
  const grain = new Uint8Array(resolution * resolution * 4);

  let seed = 8192;

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;

      const value = Math.round(
        170 + (seed / 4294967296) * 65 + Math.sin(y * 2.1) * 13,
      );

      const index = (y * resolution + x) * 4;

      grain[index] = value;
      grain[index + 1] = value;
      grain[index + 2] = value;
      grain[index + 3] = 255;
    }
  }

  const finish = new T.DataTexture(grain, resolution, resolution, T.RGBAFormat);

  finish.wrapS = T.RepeatWrapping;
  finish.wrapT = T.RepeatWrapping;
  finish.repeat.set(1.8, 4);
  finish.magFilter = T.LinearFilter;
  finish.minFilter = T.LinearMipmapLinearFilter;
  finish.generateMipmaps = true;
  finish.needsUpdate = true;

  const faceGold = new T.MeshPhysicalMaterial({
    color: 0xf6c700,
    metalness: 1,
    roughness: 0.31,
    roughnessMap: finish,
    bumpMap: finish,
    bumpScale: 0.006,
    clearcoat: 0.32,
    clearcoatRoughness: 0.3,
  });

  const edgeGold = new T.MeshPhysicalMaterial({
    color: 0xd5a338,
    metalness: 1,
    roughness: 0.25,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
  });

  const graphite = new T.MeshStandardMaterial({
    color: 0x25221c,
    metalness: 0.95,
    roughness: 0.3,
  });

  const shape = new T.Shape();

  outline.forEach(([x, y], index) => {
    const sx = ((x - 150) / 300) * 4.15;
    const sy = ((108 - y) / 300) * 4.15;

    if (index === 0) {
      shape.moveTo(sx, sy);
    } else {
      shape.lineTo(sx, sy);
    }
  });

  shape.closePath();

  const sculpture = new T.Group();
  scene.add(sculpture);

  const plates: {
    mesh: Three.Mesh;
    z: number;
    entry: number;
  }[] = [];

  const plateSpecs = [
    {
      depth: 0.18,
      z: -0.38,
      bevel: 0.027,
      material: [faceGold, edgeGold],
      entry: 0,
    },
    {
      depth: 0.26,
      z: -0.08,
      bevel: 0.02,
      material: [graphite, graphite],
      entry: 0.15,
    },
    {
      depth: 0.27,
      z: 0.27,
      bevel: 0.038,
      material: [faceGold, edgeGold],
      entry: 0.3,
    },
  ];

  for (const spec of plateSpecs) {
    const geometry = new T.ExtrudeGeometry(shape, {
      depth: spec.depth,
      bevelEnabled: true,
      bevelThickness: spec.bevel,
      bevelSize: spec.bevel,
      bevelSegments: 5,
      steps: 1,
      curveSegments: 12,
    });

    geometry.translate(0, 0, -spec.depth / 2);

    const mesh = new T.Mesh(geometry, spec.material);

    sculpture.add(mesh);

    plates.push({
      mesh,
      z: spec.z,
      entry: spec.entry,
    });
  }

  const pointer = new T.Vector2();
  const smoothPointer = new T.Vector2();

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  let touchStart: {
    x: number;
    y: number;
  } | null = null;

  const pointerMove = (event: PointerEvent) => {
    if (disposed) return;

    if (event.pointerType === "touch") {
      if (!touchStart) return;

      pointer.set(
        T.MathUtils.clamp((event.clientX - touchStart.x) / 140, -1, 1),
        T.MathUtils.clamp((event.clientY - touchStart.y) / 180, -0.6, 0.6),
      );
    } else if (canHover.matches) {
      pointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    }
  };

  const pointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      touchStart = {
        x: event.clientX,
        y: event.clientY,
      };
    }
  };

  const pointerEnd = () => {
    touchStart = null;
    pointer.set(0, 0);
  };

  window.addEventListener("pointermove", pointerMove, { passive: true });

  host.addEventListener("pointerdown", pointerDown, { passive: true });

  window.addEventListener("pointerup", pointerEnd, { passive: true });

  window.addEventListener("pointercancel", pointerEnd, { passive: true });

  document.documentElement.addEventListener("pointerleave", pointerEnd);

  const ease = (value: number) =>
    1 - Math.pow(1 - T.MathUtils.clamp(value, 0, 1), 5);

  function updatePose(dt: number) {
    const intro = ease(age / 2.1);

    if (reducedMotion.matches) {
      pointer.set(0, 0);
      smoothPointer.set(0, 0);
    }

    smoothPointer.lerp(pointer, 1 - Math.exp(-4 * dt));

    sculpture.rotation.set(
      0.13 + Math.sin(age * 0.39) * 0.038 + smoothPointer.y * 0.13,

      -0.4 + Math.sin(age * 0.31) * 0.09 + smoothPointer.x * 0.26,

      -0.105 + Math.sin(age * 0.27) * 0.015,
    );

    sculpture.position.y = Math.sin(age * 0.65) * 0.065 - (1 - intro) * 0.3;

    sculpture.scale.setScalar(0.93 + intro * 0.07);

    for (const plate of plates) {
      const assembled = ease((age - plate.entry) / 1.75);

      plate.mesh.position.set(
        0,

        (1 - assembled) * (plate.entry * 1.5 - 0.18),

        plate.z + (1 - assembled) * (plate.z > 0 ? 1.7 : -0.85),
      );
    }

    key.position.x = -3 + Math.sin(age * 0.22) * 1.2;
  }

  const loop = createFrameLoop(
    (dt) => {
      age += dt;

      updatePose(dt);
      renderer.render(scene, camera);
    },
    {
      request: (callback) => requestAnimationFrame(callback),

      cancel: (handle) => cancelAnimationFrame(handle),

      now: () => performance.now(),

      // Recheck eligibility on every frame, including a frame already queued
      // when the operating system's motion preference changes.
      visible: () => !document.hidden && !reducedMotion.matches,
    },
  );

  function resize() {
    if (disposed) return;

    const { width, height } = host.getBoundingClientRect();

    if (width < 1 || height < 1) return;

    camera.aspect = width / height;

    const verticalFov = T.MathUtils.degToRad(camera.fov);

    // Higher value = smaller W with more space around it.
    const safety = 1.6;

    const verticalDistance = (safety * 3.9) / (2 * Math.tan(verticalFov / 2));

    const horizontalDistance =
      (safety * 5.25) / (2 * Math.tan(verticalFov / 2) * camera.aspect);

    camera.position.z = Math.max(verticalDistance, horizontalDistance);

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    loop.refresh();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(host);

  const syncMotion = () => {
    if (reducedMotion.matches) age = 3;
    loop.setInView(inView && !reducedMotion.matches);
  };
  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();

  const intersection = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      syncMotion();
    },
    { threshold: 0.01 },
  );

  intersection.observe(host);

  const visibility = () => loop.refresh();

  document.addEventListener("visibilitychange", visibility);

  host.appendChild(renderer.domElement);
  resize();

  function destroy() {
    if (disposed) return;

    disposed = true;

    loop.destroy();
    observer.disconnect();
    intersection.disconnect();
    reducedMotion.removeEventListener("change", syncMotion);

    window.removeEventListener("pointermove", pointerMove);

    host.removeEventListener("pointerdown", pointerDown);

    window.removeEventListener("pointerup", pointerEnd);

    window.removeEventListener("pointercancel", pointerEnd);

    document.documentElement.removeEventListener("pointerleave", pointerEnd);

    document.removeEventListener("visibilitychange", visibility);

    plates.forEach(({ mesh }) => {
      mesh.geometry.dispose();
    });

    faceGold.dispose();
    edgeGold.dispose();
    graphite.dispose();
    finish.dispose();
    environment.dispose();

    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  try {
    // Compile shaders and prepare the first frame while hidden.
    // The animation clock starts only when start() is called.
    await renderer.compileAsync(scene, camera);

    signal?.throwIfAborted();

    renderer.render(scene, camera);
  } catch (error) {
    destroy();
    throw error;
  }

  return {
    start: () => loop.start(),
    destroy,
  };
}
