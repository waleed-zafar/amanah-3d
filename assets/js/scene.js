/*!
 * Amanah Mall — Chapter 01 "The Arrival"
 * A procedural architectural interpretation of the building, built from its
 * published programme: 8 floors above ground, 4 basements below.
 *   B1–B4  underground parking
 *   L1–L4  retail podium
 *   L5–L8  leisure levels (food court, Magic Planet, fitness, cinema)
 * Scroll (read from window.AMANAH_STATE.heroProgress, set by main.js) drives a
 * camera move and then an exploded axonometric section of the stack.
 *
 * NOTE: no survey/BIM model of Amanah Mall was available. This is an honest
 * interpretation — replace the floor-building loop below with a GLTF of the real building if
 * one becomes available (see README).
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.querySelector('[data-canvas]');
const STATE = window.AMANAH_STATE || (window.AMANAH_STATE = { heroProgress: 0 });

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

if (canvas && webglAvailable()) {
  try { init(); } catch (err) { console.warn('[Amanah] 3D scene unavailable, using fallback.', err); }
}

function init() {
  const mqMobile = window.matchMedia('(max-width: 900px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mobile = mqMobile.matches;

  /* ---------- Renderer ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const NAVY = new THREE.Color(0x080d48);
  const scene = new THREE.Scene();
  scene.background = NAVY.clone();
  scene.fog = new THREE.FogExp2(0x080d48, 0.0125);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  if ('environmentIntensity' in scene) scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 600);

  /* ---------- Light ---------- */
  scene.add(new THREE.HemisphereLight(0x3d5cff, 0x080d48, 0.7));
  const moon = new THREE.DirectionalLight(0x9fc4ff, 1.1);
  moon.position.set(-30, 50, 20);
  scene.add(moon);
  const entrance = new THREE.PointLight(0xffd9a8, 40, 30, 2);
  entrance.position.set(0, 2.5, 9);
  scene.add(entrance);

  /* ---------- Materials ---------- */
  const M = {
    slab: new THREE.MeshStandardMaterial({ color: 0xdfe4f2, roughness: 0.75, metalness: 0.05 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0c2f8a, roughness: 0.08, metalness: 0.9, transparent: true, opacity: 0.74, depthWrite: false }),
    mullion: new THREE.MeshStandardMaterial({ color: 0xc9d3ea, roughness: 0.4, metalness: 0.6 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0x1b2470, roughness: 0.9 }),
    edge: new THREE.LineBasicMaterial({ color: 0x08a9e8, transparent: true, opacity: 0.0 }),
    fin: new THREE.MeshBasicMaterial({ color: 0x08a9e8, transparent: true, opacity: 0.95 }),
    ground: new THREE.MeshStandardMaterial({ color: 0x0a1052, roughness: 1, transparent: true, opacity: 1 }),
    road: new THREE.MeshStandardMaterial({ color: 0x050833, roughness: 0.6, metalness: 0.2, transparent: true, opacity: 1 }),
    city: new THREE.MeshStandardMaterial({ color: 0x0f1760, roughness: 0.85, metalness: 0.1 })
  };
  const ZONE = {
    parking: new THREE.Color(0x0873c8),
    retail: new THREE.Color(0xfff0d2),
    leisure: new THREE.Color(0x08a9e8)
  };

  /* ---------- The building ---------- */
  const FH = 1.6;                   // floor-to-floor height
  const PODIUM = { w: 18, d: 12, z: 0 };
  const TOWER = { w: 15, d: 10.5, z: -0.75 };
  const building = new THREE.Group();
  scene.add(building);

  const floors = [];               // { group, level, zone, baseY, glow }
  const glowMats = [];

  function mullionRing(spec, h) {
    const pts = [];
    const step = 1.2;
    for (let x = -spec.w / 2; x <= spec.w / 2 + 0.01; x += step) { pts.push([x, spec.d / 2]); pts.push([x, -spec.d / 2]); }
    for (let z = -spec.d / 2 + step; z < spec.d / 2 - 0.01; z += step) { pts.push([spec.w / 2, z]); pts.push([-spec.w / 2, z]); }
    const geo = new THREE.BoxGeometry(0.07, h, 0.07);
    const mesh = new THREE.InstancedMesh(geo, M.mullion, pts.length);
    const m4 = new THREE.Matrix4();
    pts.forEach((p, i) => { m4.makeTranslation(p[0], 0, p[1] + spec.z); mesh.setMatrixAt(i, m4); });
    return mesh;
  }

  for (let level = -4; level <= 7; level++) {
    const zone = level < 0 ? 'parking' : level < 4 ? 'retail' : 'leisure';
    const spec = level >= 4 ? TOWER : PODIUM;
    const g = new THREE.Group();
    const h = FH - 0.18;

    const slab = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.35, 0.18, spec.d + 0.35), M.slab);
    slab.position.set(0, 0.09, spec.z);
    g.add(slab);

    const gm = new THREE.MeshBasicMaterial({ color: ZONE[zone].clone() });
    gm.userData.base = ZONE[zone].clone();
    gm.userData.zone = zone;
    glowMats.push(gm);

    if (zone === 'parking') {
      const box = new THREE.Mesh(new THREE.BoxGeometry(spec.w, h, spec.d), M.concrete);
      box.position.set(0, 0.18 + h / 2, spec.z);
      g.add(box);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.02, 0.08, spec.d + 0.02), gm);
      strip.position.set(0, 0.18 + h * 0.5, spec.z);
      g.add(strip);
    } else {
      const glow = new THREE.Mesh(new THREE.BoxGeometry(spec.w - 0.8, h * (zone === 'retail' ? 0.62 : 0.5), spec.d - 0.8), gm);
      glow.position.set(0, 0.18 + h * 0.5, spec.z);
      g.add(glow);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(spec.w, h, spec.d), M.glass);
      glass.position.set(0, 0.18 + h / 2, spec.z);
      glass.renderOrder = 2;
      g.add(glass);
      const mull = mullionRing(spec, h);
      mull.position.y = 0.18 + h / 2;
      g.add(mull);
    }

    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(spec.w + 0.36, FH, spec.d + 0.36)), M.edge);
    edges.position.set(0, FH / 2, spec.z);
    g.add(edges);

    const baseY = level * FH;
    g.position.y = baseY;
    building.add(g);
    floors.push({ group: g, level, zone, baseY });
  }

  // Roof + crown fins (ride with the top floor)
  const top = floors[floors.length - 1].group;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(TOWER.w + 0.6, 0.3, TOWER.d + 0.6), M.slab);
  roof.position.set(0, FH + 0.15, TOWER.z);
  top.add(roof);
  const finGeo = new THREE.BoxGeometry(0.12, 2.2, 0.5);
  const fins = new THREE.InstancedMesh(finGeo, M.mullion, 13);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 13; i++) { m4.makeTranslation(-TOWER.w / 2 + 1.5 + i * ((TOWER.w - 3) / 12), FH + 1.4, TOWER.z + TOWER.d / 2 + 0.1); fins.setMatrixAt(i, m4); }
  top.add(fins);

  // Signature light fin on the podium corner
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 8 * FH + 2.4, 0.22), M.fin);
  fin.position.set(PODIUM.w / 2 + 0.25, (8 * FH + 2.4) / 2, PODIUM.d / 2 + 0.25);
  building.add(fin);

  // Signage over the retail podium (name, not the logo)
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024; signCanvas.height = 128;
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const drawSign = () => {
    const c = signCanvas.getContext('2d');
    c.clearRect(0, 0, 1024, 128);
    c.fillStyle = '#ffffff';
    c.font = '600 64px Manrope, system-ui, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if ('letterSpacing' in c) c.letterSpacing = '18px';
    c.fillText('AMANAH MALL', 512, 66);
    signTex.needsUpdate = true;
  };
  drawSign();
  if (document.fonts) document.fonts.ready.then(drawSign);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.125), new THREE.MeshBasicMaterial({ map: signTex, transparent: true }));
  sign.position.set(0, FH - 0.6, PODIUM.d / 2 + 0.2);
  floors.find(f => f.level === 3).group.add(sign);

  /* ---------- Context: ground, Link Road, city ---------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), M.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);
  const grid = new THREE.GridHelper(600, 150, 0x1f2c8a, 0x141d70);
  grid.material.transparent = true; grid.material.opacity = 0.35;
  grid.position.y = 0;
  scene.add(grid);

  const ROAD_Z = PODIUM.d / 2 + 8;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(600, 9), M.road);
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, ROAD_Z);
  scene.add(road);

  // Traffic light-trails on Link Road
  const CARS = mobile ? 24 : 48;
  const carGeo = new THREE.BoxGeometry(1.4, 0.08, 0.12);
  const lanes = [
    { mesh: new THREE.InstancedMesh(carGeo, new THREE.MeshBasicMaterial({ color: 0xfff2d6 }), CARS / 2), z: ROAD_Z - 1.6, dir: 1 },
    { mesh: new THREE.InstancedMesh(carGeo, new THREE.MeshBasicMaterial({ color: 0xff4a5e }), CARS / 2), z: ROAD_Z + 1.6, dir: -1 }
  ];
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  lanes.forEach(l => {
    l.cars = [];
    for (let i = 0; i < CARS / 2; i++) l.cars.push({ x: -150 + rand() * 300, v: 9 + rand() * 9, dz: (rand() - 0.5) * 0.9 });
    scene.add(l.mesh);
  });
  const updateCars = (dt) => {
    lanes.forEach(l => {
      l.cars.forEach((c, i) => {
        c.x += c.v * dt * l.dir;
        if (c.x > 150) c.x = -150; if (c.x < -150) c.x = 150;
        m4.makeTranslation(c.x, 0.35, l.z + c.dz);
        l.mesh.setMatrixAt(i, m4);
      });
      l.mesh.instanceMatrix.needsUpdate = true;
    });
  };
  updateCars(0);

  // Surrounding low-rise city as dark silhouettes
  const CITY = mobile ? 50 : 110;
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.city, CITY);
  const q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
  for (let i = 0; i < CITY; i++) {
    const a = rand() * Math.PI * 2;
    const r = 30 + rand() * 140;
    let x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(z - ROAD_Z) < 8) z += 14;               // keep Link Road clear
    const h = 1.5 + Math.pow(rand(), 2.2) * 16;
    s3.set(4 + rand() * 9, h, 4 + rand() * 9);
    p3.set(x, h / 2, z);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rand() - 0.5) * 0.3);
    city.setMatrixAt(i, new THREE.Matrix4().compose(p3, q, s3));
  }
  scene.add(city);

  /* ---------- Camera choreography ---------- */
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const KEYS = {
    desktop: {
      intro: { p: V(78, 46, 104), t: V(0, 5, 0), off: -4 },
      k0: { p: V(24, 3.2, 27), t: V(-1, 8.2, 0), off: -7.5 },
      k1: { p: V(-17, 11, 27), t: V(0, 7.5, 0), off: -6 },
      k2: { p: V(44, 9, 44), t: V(0, 4.2, 0), off: 7 }
    },
    mobile: {
      intro: { p: V(90, 60, 130), t: V(0, 2, 0), off: 0 },
      k0: { p: V(38, 12, 60), t: V(0, -1, 0), off: 0 },
      k1: { p: V(30, 16, 62), t: V(0, -1, 0), off: 0 },
      k2: { p: V(30, 16, 62), t: V(0, -1, 0), off: 0 }
    }
  };

  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();

  function pose(k, progress, out) {
    // returns blended pose for progress (0..1)
    const a = progress < 0.35 ? k.k0 : k.k1;
    const b = progress < 0.35 ? k.k1 : k.k2;
    const t = progress < 0.35 ? smooth(progress / 0.35) : smooth((progress - 0.35) / 0.2);
    out.p.lerpVectors(a.p, b.p, t);
    out.t.lerpVectors(a.t, b.t, t);
    out.off = a.off + (b.off - a.off) * t;
    // slow orbit while the exploded section holds
    if (progress > 0.55) {
      const ang = (progress - 0.55) * 0.7;
      const x = out.p.x, z = out.p.z;
      out.p.x = x * Math.cos(ang) - z * Math.sin(ang);
      out.p.z = x * Math.sin(ang) + z * Math.cos(ang);
    }
    return out;
  }

  /* ---------- State ---------- */
  let progress = 0;          // damped scroll progress
  let explode = 0;
  let intro = reduce ? 1 : 0;
  let introStart = null;
  let pointerX = 0, pointerY = 0, px = 0, py = 0;
  let running = false, visible = true, rafId = 0;
  const clock = new THREE.Clock();
  const out = { p: new THREE.Vector3(), t: new THREE.Vector3(), off: 0 };

  window.addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const startIntro = () => { if (introStart === null) introStart = performance.now(); };
  if (STATE.ready) startIntro();
  window.addEventListener('amanah:ready', startIntro);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    mobile = mqMobile.matches;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = mobile ? 42 : 35;
    camera.updateProjectionMatrix();
    if (reduce) renderFrame(0);
  }

  function renderFrame(dt) {
    const keys = mobile ? KEYS.mobile : KEYS.desktop;
    const target = STATE.heroProgress || 0;
    progress += (target - progress) * (reduce ? 1 : Math.min(1, dt * 5));

    if (!reduce && introStart !== null && intro < 1) intro = Math.min(1, (performance.now() - introStart) / 3600);
    const ie = easeOutExpo(intro);

    pose(keys, progress, out);
    camPos.lerpVectors(keys.intro.p, out.p, ie);
    camTgt.lerpVectors(keys.intro.t, out.t, ie);
    const off = keys.intro.off + (out.off - keys.intro.off) * ie;

    // pointer parallax + idle breathing
    if (!reduce) {
      px += (pointerX - px) * Math.min(1, dt * 2.5);
      py += (pointerY - py) * Math.min(1, dt * 2.5);
      const tt = clock.elapsedTime;
      camPos.x += px * 1.6 + Math.sin(tt * 0.25) * 0.4;
      camPos.y += -py * 0.9 + Math.sin(tt * 0.33) * 0.2;
    }
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    if (camera.filmOffset !== off) { camera.filmOffset = off; camera.updateProjectionMatrix(); }

    // Exploded section
    explode = mobile ? 0 : smooth((progress - 0.36) / 0.36);
    floors.forEach((f) => {
      const zoneGap = f.zone === 'parking' ? -1.6 : f.zone === 'leisure' ? 1.4 : 0;
      f.group.position.y = f.baseY + explode * (f.level * 0.95 + zoneGap);
    });
    M.edge.opacity = explode * 0.55;
    M.fin.opacity = 0.95 * (1 - explode);
    M.ground.opacity = 1 - explode * 0.82;
    M.road.opacity = 1 - explode * 0.7;
    grid.material.opacity = 0.35 * (1 - explode * 0.6);
    scene.fog.density = 0.0125 - explode * 0.005;
    glowMats.forEach((m) => {
      const boost = m.userData.zone === 'parking' ? 0.35 + explode * 0.9 : 0.75 + explode * 0.35;
      m.color.copy(m.userData.base).multiplyScalar(boost);
    });

    if (!reduce) updateCars(dt);
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    renderFrame(dt);
    rafId = requestAnimationFrame(loop);
  }
  function start() { if (running || reduce) return; running = true; clock.getDelta(); rafId = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  // Render only while the hero is on screen and the tab is visible
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    visible && !document.hidden ? start() : stop();
  }, { rootMargin: '100px' });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : (visible && start()); });

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  resize();

  if (reduce) {
    renderFrame(0);
    window.addEventListener('scroll', () => requestAnimationFrame(() => renderFrame(0)), { passive: true });
  } else {
    start();
  }
  document.documentElement.classList.add('has-webgl');
}
