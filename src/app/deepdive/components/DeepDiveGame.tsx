"use client";

import * as THREE from "three";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import styles from "../deepdive.module.css";

// ── Constants ────────────────────────────────────────────────────────────────

const WORLD_LEFT = -7;
const WORLD_RIGHT = 7;
const SPAWN_Y = -10; // spawn below visible area
const DESPAWN_Y = 12; // despawn above visible area

const COLORS = {
  water: 0x000d1a,
  submarine: 0xe8e6e0,
  submarineDetail: 0xc8c6c0,
  accent: 0x00ff41,
  mine: 0xe05a5a,
  mineSpike: 0xc04040,
  orb: 0x00ff41,
  orbRare: 0xffdd00,
  angler: 0x2a4a2a,
  anglerLure: 0x5ab87e,
  barrier: 0x1a3a5a,
  barrierEdge: 0x00aaff,
  particle: 0x003322,
} as const;

const DEPTH_ZONES = [
  { name: "SURFACE", minDepth: 0, maxDepth: 50, spawnInterval: 3.5, scrollSpeed: 1.5 },
  { name: "OPERATIONAL", minDepth: 50, maxDepth: 150, spawnInterval: 2.5, scrollSpeed: 2.0 },
  { name: "STRATEGIC", minDepth: 150, maxDepth: 300, spawnInterval: 1.8, scrollSpeed: 2.8 },
  { name: "IMMERSION", minDepth: 300, maxDepth: Infinity, spawnInterval: 1.2, scrollSpeed: 3.5 },
] as const;

const BUZZWORDS = [
  "Insights Extracted™",
  "Deep Data Acquired.",
  "Analytics: Immersed.",
  "ROI: Subaqueous.",
  "Synergy at Depth.",
  "Deliverable Surfaced.",
  "Pressure-Tested Strategy.",
  "That's the Monochromacy Way.",
  "KPI: DEPTH",
  "Findings: Classified.",
  "Insight Velocity: Maximum.",
  "Data Harvested. Latitude: N/A.",
];

const MAX_DEPTH = 600; // cap for depth meter fill at 100%

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubmarineObj {
  group: THREE.Group;
  x: number;
  targetX: number;
  invincible: boolean;
}

interface Obstacle {
  group: THREE.Group;
  type: "mine" | "barrier" | "angler";
  worldY: number;
  disposed: boolean;
}

interface Orb {
  mesh: THREE.Mesh;
  worldY: number;
  value: number;
  rare: boolean;
  disposed: boolean;
}

interface GameState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  submarine: SubmarineObj | null;
  obstacles: Obstacle[];
  orbs: Orb[];
  particles: THREE.Points | null;
  particlePositions: Float32Array | null;
  depth: number;
  score: number;
  lives: number;
  gamePhase: "idle" | "playing" | "gameover";
  lastTime: number;
  spawnTimer: number;
  orbSpawnTimer: number;
  scrollY: number;
  invincibleTimer: number;
}

type Screen = "intro" | "playing" | "gameover";

// ── Geometry helpers ──────────────────────────────────────────────────────────

function createSubmarine(): THREE.Group {
  const group = new THREE.Group();

  // Main hull
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.65, 0.55),
    new THREE.MeshLambertMaterial({ color: COLORS.submarine })
  );
  hull.position.y = 0;
  group.add(hull);

  // Conning tower
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.45, 0.5),
    new THREE.MeshLambertMaterial({ color: COLORS.submarine })
  );
  tower.position.set(-0.3, 0.55, 0);
  group.add(tower);

  // Periscope
  const periscope = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.35, 0.08),
    new THREE.MeshLambertMaterial({ color: COLORS.submarineDetail })
  );
  periscope.position.set(-0.3, 0.95, 0);
  group.add(periscope);

  // Porthole (green accent circle, approximated with small box)
  const porthole = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.06),
    new THREE.MeshBasicMaterial({ color: COLORS.accent })
  );
  porthole.position.set(0.3, 0, 0.29);
  group.add(porthole);

  // Propeller (rear)
  const propHub = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.12),
    new THREE.MeshLambertMaterial({ color: COLORS.accent })
  );
  propHub.position.set(-1.3, 0, 0);
  group.add(propHub);

  const bladeMat = new THREE.MeshLambertMaterial({ color: COLORS.accent });
  const bladeGeo = new THREE.BoxGeometry(0.08, 0.4, 0.04);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(-1.3, 0, 0);
    blade.rotation.x = (i / 3) * Math.PI * 2;
    group.add(blade);
  }

  // Nose cone (tapered front using scaled box)
  const nose = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.5, 0.42),
    new THREE.MeshLambertMaterial({ color: COLORS.submarineDetail })
  );
  nose.position.set(1.25, 0, 0);
  group.add(nose);

  return group;
}

function createMine(): THREE.Group {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 8, 8),
    new THREE.MeshLambertMaterial({ color: COLORS.mine })
  );
  group.add(body);

  // Spikes
  const spikeMat = new THREE.MeshLambertMaterial({ color: COLORS.mineSpike });
  const spikeGeo = new THREE.BoxGeometry(0.08, 0.3, 0.08);
  const spikeOffsets = [
    [0, 0.52, 0], [0, -0.52, 0], [0.52, 0, 0], [-0.52, 0, 0],
    [0.37, 0.37, 0], [-0.37, 0.37, 0], [0.37, -0.37, 0], [-0.37, -0.37, 0],
  ];
  for (const [x, y, z] of spikeOffsets) {
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.position.set(x, y, z);
    spike.lookAt(x * 2, y * 2, z * 2);
    group.add(spike);
  }

  return group;
}

function createBarrier(gapX: number): THREE.Group {
  const group = new THREE.Group();

  const gapHalfWidth = 1.6;
  const totalWidth = WORLD_RIGHT - WORLD_LEFT; // 14
  const leftWidth = (gapX - WORLD_LEFT) - gapHalfWidth;
  const rightWidth = (WORLD_RIGHT - gapX) - gapHalfWidth;

  const mat = new THREE.MeshLambertMaterial({ color: COLORS.barrier });
  const edgeMat = new THREE.MeshBasicMaterial({ color: COLORS.barrierEdge });

  if (leftWidth > 0) {
    const leftPanel = new THREE.Mesh(
      new THREE.BoxGeometry(leftWidth, 0.35, 0.5),
      mat
    );
    leftPanel.position.x = WORLD_LEFT + leftWidth / 2;
    group.add(leftPanel);

    // Edge glow
    const leftEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.36, 0.52),
      edgeMat
    );
    leftEdge.position.x = WORLD_LEFT + leftWidth;
    group.add(leftEdge);
  }

  if (rightWidth > 0) {
    const rightPanel = new THREE.Mesh(
      new THREE.BoxGeometry(rightWidth, 0.35, 0.5),
      mat
    );
    rightPanel.position.x = WORLD_RIGHT - rightWidth / 2;
    group.add(rightPanel);

    // Edge glow
    const rightEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.36, 0.52),
      edgeMat
    );
    rightEdge.position.x = WORLD_RIGHT - rightWidth;
    group.add(rightEdge);
  }

  return group;
}

function createAnglerfish(): THREE.Group {
  const group = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.7, 0.5),
    new THREE.MeshLambertMaterial({ color: COLORS.angler })
  );
  group.add(body);

  // Jaw
  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.2, 0.45),
    new THREE.MeshLambertMaterial({ color: COLORS.angler })
  );
  jaw.position.set(0.4, -0.35, 0);
  group.add(jaw);

  // Teeth (white spikes)
  const toothMat = new THREE.MeshLambertMaterial({ color: 0xe8e6e0 });
  for (let i = 0; i < 4; i++) {
    const tooth = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.15, 0.07),
      toothMat
    );
    tooth.position.set(0.12 + i * 0.16, -0.28, 0);
    group.add(tooth);
  }

  // Lure wire
  const wire = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.6, 0.04),
    new THREE.MeshBasicMaterial({ color: COLORS.anglerLure })
  );
  wire.position.set(0.35, 0.65, 0);
  group.add(wire);

  // Lure bulb (glowing)
  const lure = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({ color: COLORS.anglerLure })
  );
  lure.position.set(0.35, 1.0, 0);
  group.add(lure);

  // Point light for lure glow
  const light = new THREE.PointLight(COLORS.anglerLure, 2, 4);
  light.position.set(0.35, 1.0, 0);
  group.add(light);

  return group;
}

function createParticles(): { points: THREE.Points; positions: Float32Array } {
  const count = 150;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: COLORS.particle,
    size: 0.12,
    transparent: true,
    opacity: 0.6,
  });
  return { points: new THREE.Points(geo, mat), positions };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DeepDiveGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>({
    scene: null,
    camera: null,
    renderer: null,
    submarine: null,
    obstacles: [],
    orbs: [],
    particles: null,
    particlePositions: null,
    depth: 0,
    score: 0,
    lives: 3,
    gamePhase: "idle",
    lastTime: 0,
    spawnTimer: 0,
    orbSpawnTimer: 0,
    scrollY: 0,
    invincibleTimer: 0,
  });
  const animFrameRef = useRef<number>(0);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const keysRef = useRef<Set<string>>(new Set());

  // React UI state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [depth, setDepth] = useState(0);
  const [zoneName, setZoneName] = useState("SURFACE");
  const [buzzword, setBuzzword] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("intro");
  const [finalDepth, setFinalDepth] = useState(0);

  // Stable callback refs
  const onScoreUpdate = useRef<(s: number, d: number, z: string) => void>(() => {});
  const onLivesUpdate = useRef<(l: number) => void>(() => {});
  const onBuzzwordTrigger = useRef<(w: string) => void>(() => {});
  const onGameOver = useRef<(finalScore: number, finalDepth: number) => void>(() => {});

  useEffect(() => {
    onScoreUpdate.current = (s, d, z) => {
      setScore(s);
      setDepth(d);
      setZoneName(z);
    };
    onLivesUpdate.current = (l) => setLives(l);
    onBuzzwordTrigger.current = (w) => {
      setBuzzword(null);
      requestAnimationFrame(() => setBuzzword(w));
    };
    onGameOver.current = (finalScore, fd) => {
      setScore(finalScore);
      setFinalDepth(fd);
      setScreen("gameover");
    };
  }, []);

  // ── Scene init ─────────────────────────────────────────────────────────────

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gs = gameStateRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.water);
    scene.fog = new THREE.Fog(COLORS.water, 18, 40);
    gs.scene = scene;

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);
    gs.camera = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    gs.renderer = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0x224466, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x00ff41, 0.3);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);

    // Background water plane (slightly behind gameplay)
    const bgPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshBasicMaterial({ color: 0x000810 })
    );
    bgPlane.position.z = -3;
    scene.add(bgPlane);

    // Bioluminescent particles
    const { points, positions } = createParticles();
    scene.add(points);
    gs.particles = points;
    gs.particlePositions = positions;

    const onResize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Zone helper ────────────────────────────────────────────────────────────

  function getZone(depth: number) {
    for (const zone of DEPTH_ZONES) {
      if (depth < zone.maxDepth) return zone;
    }
    return DEPTH_ZONES[DEPTH_ZONES.length - 1];
  }

  // ── Spawn helpers ──────────────────────────────────────────────────────────

  const spawnObstacle = useCallback((gs: GameState) => {
    const scene = gs.scene!;
    const zone = getZone(gs.depth);
    const zoneName = zone.name;

    // Pick obstacle type based on depth zone
    let type: "mine" | "barrier" | "angler";
    const roll = Math.random();
    if (zoneName === "SURFACE") {
      type = "mine";
    } else if (zoneName === "OPERATIONAL") {
      type = roll < 0.6 ? "mine" : "barrier";
    } else if (zoneName === "STRATEGIC") {
      if (roll < 0.4) type = "mine";
      else if (roll < 0.7) type = "barrier";
      else type = "angler";
    } else {
      if (roll < 0.35) type = "mine";
      else if (roll < 0.65) type = "barrier";
      else type = "angler";
    }

    let group: THREE.Group;
    if (type === "mine") {
      group = createMine();
      group.position.set(
        WORLD_LEFT + Math.random() * (WORLD_RIGHT - WORLD_LEFT),
        SPAWN_Y,
        0
      );
    } else if (type === "barrier") {
      const gapX = WORLD_LEFT + 2 + Math.random() * (WORLD_RIGHT - WORLD_LEFT - 4);
      group = createBarrier(gapX);
      group.position.set(0, SPAWN_Y, 0);
    } else {
      group = createAnglerfish();
      // Anglerfish appear on left or right side, facing inward
      const side = Math.random() > 0.5 ? 1 : -1;
      group.position.set(side * (4 + Math.random() * 2), SPAWN_Y, 0);
      group.scale.x = side; // flip if right side
    }

    scene.add(group);
    gs.obstacles.push({ group, type, worldY: SPAWN_Y, disposed: false });
  }, []);

  const spawnOrb = useCallback((gs: GameState) => {
    const scene = gs.scene!;
    const rare = gs.depth >= 150 && Math.random() < 0.25;
    const value = rare ? 50 : gs.depth >= 50 ? 25 : 10;

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 10),
      new THREE.MeshBasicMaterial({ color: rare ? COLORS.orbRare : COLORS.orb })
    );
    mesh.position.set(
      WORLD_LEFT + 1.5 + Math.random() * (WORLD_RIGHT - WORLD_LEFT - 3),
      SPAWN_Y,
      0
    );
    scene.add(mesh);
    gs.orbs.push({ mesh, worldY: SPAWN_Y, value, rare, disposed: false });
  }, []);

  const spawnPlayer = useCallback((gs: GameState) => {
    const scene = gs.scene!;
    const group = createSubmarine();
    group.position.set(0, 0, 0);
    scene.add(group);
    gs.submarine = { group, x: 0, targetX: 0, invincible: false };
  }, []);

  // ── Update functions ───────────────────────────────────────────────────────

  const updateParticles = useCallback((gs: GameState, delta: number) => {
    if (!gs.particles || !gs.particlePositions) return;
    const pos = gs.particlePositions;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += delta * 0.4; // drift upward slowly
      if (pos[i * 3 + 1] > 12) {
        pos[i * 3 + 1] = -12;
        pos[i * 3] = (Math.random() - 0.5) * 20;
      }
    }
    (gs.particles.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }, []);

  const updateSubmarine = useCallback((gs: GameState, delta: number) => {
    if (!gs.submarine) return;
    const sub = gs.submarine;

    // Horizontal input
    const moveSpeed = 8;
    if (keysRef.current.has("ArrowLeft") || keysRef.current.has("a") || keysRef.current.has("A")) {
      sub.targetX = Math.max(WORLD_LEFT + 1.5, sub.targetX - moveSpeed * delta);
    }
    if (keysRef.current.has("ArrowRight") || keysRef.current.has("d") || keysRef.current.has("D")) {
      sub.targetX = Math.min(WORLD_RIGHT - 1.5, sub.targetX + moveSpeed * delta);
    }

    sub.x += (sub.targetX - sub.x) * 10 * delta;
    sub.group.position.x = sub.x;

    // Propeller spin effect (rotate propeller blades - children 5,6,7)
    const propSpeed = 8;
    for (let i = 5; i <= 7; i++) {
      const blade = sub.group.children[i];
      if (blade) blade.rotation.x += propSpeed * delta;
    }

    if (gs.invincibleTimer > 0) {
      gs.invincibleTimer -= delta;
      sub.group.visible = Math.floor(gs.invincibleTimer * 8) % 2 === 0;
      if (gs.invincibleTimer <= 0) {
        sub.group.visible = true;
        sub.invincible = false;
        gs.invincibleTimer = 0;
      }
    }
  }, []);

  const triggerBuzzword = useCallback(() => {
    const word = BUZZWORDS[Math.floor(Math.random() * BUZZWORDS.length)];
    onBuzzwordTrigger.current(word);
  }, []);

  const handleOrbCollect = useCallback((gs: GameState, orb: Orb) => {
    const multiplier = 1 + Math.floor(gs.depth / 50) * 0.25;
    gs.score += Math.round(orb.value * multiplier);
    gs.scene!.remove(orb.mesh);
    orb.disposed = true;
    const zone = getZone(gs.depth);
    onScoreUpdate.current(gs.score, Math.floor(gs.depth), zone.name);
    triggerBuzzword();
  }, [triggerBuzzword]);

  const handleObstacleHit = useCallback((gs: GameState) => {
    if (!gs.submarine || gs.submarine.invincible) return;
    gs.lives--;
    gs.submarine.invincible = true;
    gs.invincibleTimer = 2.0;
    onLivesUpdate.current(gs.lives);

    if (gs.lives <= 0) {
      gs.gamePhase = "gameover";
      onGameOver.current(gs.score, Math.floor(gs.depth));
    }
  }, []);

  const checkCollisions = useCallback((gs: GameState) => {
    if (!gs.submarine || gs.submarine.invincible) return;
    const subBox = new THREE.Box3().setFromObject(gs.submarine.group);
    // Shrink hitbox slightly for fairness
    subBox.min.addScalar(0.2);
    subBox.max.addScalar(-0.2);

    // Orbs
    for (const orb of gs.orbs) {
      if (orb.disposed) continue;
      const orbBox = new THREE.Box3().setFromObject(orb.mesh);
      if (subBox.intersectsBox(orbBox)) {
        handleOrbCollect(gs, orb);
      }
    }

    // Obstacles
    for (const obs of gs.obstacles) {
      if (obs.disposed) continue;
      const obsBox = new THREE.Box3().setFromObject(obs.group);
      if (subBox.intersectsBox(obsBox)) {
        handleObstacleHit(gs);
        return;
      }
    }
  }, [handleOrbCollect, handleObstacleHit]);

  const updateWorld = useCallback((gs: GameState, delta: number) => {
    const zone = getZone(gs.depth);
    const scrollSpeed = zone.scrollSpeed;

    // Depth increases with scroll
    gs.depth += scrollSpeed * delta * 2.5;
    gs.scrollY += scrollSpeed * delta;

    // Move all obstacles and orbs upward
    for (const obs of gs.obstacles) {
      if (obs.disposed) continue;
      obs.group.position.y += scrollSpeed * delta;
      obs.worldY += scrollSpeed * delta;
      if (obs.worldY > DESPAWN_Y) {
        gs.scene!.remove(obs.group);
        obs.disposed = true;
      }
      // Rotate mines slowly
      if (obs.type === "mine") {
        obs.group.rotation.z += delta * 0.5;
      }
      // Bob anglerfish lure
      if (obs.type === "angler") {
        const lure = obs.group.children[obs.group.children.length - 1];
        if (lure) lure.position.y = Math.sin(Date.now() * 0.003) * 0.15;
      }
    }
    gs.obstacles = gs.obstacles.filter((o) => !o.disposed);

    for (const orb of gs.orbs) {
      if (orb.disposed) continue;
      orb.mesh.position.y += scrollSpeed * delta;
      orb.worldY += scrollSpeed * delta;
      // Pulsate orb scale
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
      orb.mesh.scale.setScalar(pulse);
      if (orb.worldY > DESPAWN_Y) {
        gs.scene!.remove(orb.mesh);
        orb.disposed = true;
      }
    }
    gs.orbs = gs.orbs.filter((o) => !o.disposed);

    // Spawner
    gs.spawnTimer += delta;
    if (gs.spawnTimer >= zone.spawnInterval) {
      gs.spawnTimer = 0;
      spawnObstacle(gs);
    }

    gs.orbSpawnTimer += delta;
    if (gs.orbSpawnTimer >= zone.spawnInterval * 0.7) {
      gs.orbSpawnTimer = 0;
      spawnOrb(gs);
    }

    // Update score with passive depth points
    gs.score += Math.floor(scrollSpeed * delta);

    const newZone = getZone(gs.depth);
    onScoreUpdate.current(gs.score, Math.floor(gs.depth), newZone.name);
  }, [spawnObstacle, spawnOrb]);

  // ── Start / reset ──────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    const gs = gameStateRef.current;

    if (gs.scene) {
      for (const obs of gs.obstacles) gs.scene.remove(obs.group);
      for (const orb of gs.orbs) gs.scene.remove(orb.mesh);
      if (gs.submarine) gs.scene.remove(gs.submarine.group);
    }

    gs.obstacles = [];
    gs.orbs = [];
    gs.submarine = null;
    gs.depth = 0;
    gs.score = 0;
    gs.lives = 3;
    gs.gamePhase = "playing";
    gs.lastTime = 0;
    gs.spawnTimer = 2.0; // delay first obstacle slightly
    gs.orbSpawnTimer = 1.0;
    gs.scrollY = 0;
    gs.invincibleTimer = 0;

    setScore(0);
    setLives(3);
    setDepth(0);
    setZoneName("SURFACE");
    setBuzzword(null);
    setFinalDepth(0);

    spawnPlayer(gs);
    setScreen("playing");
  }, [spawnPlayer]);

  // ── Scene init + loop ──────────────────────────────────────────────────────

  useEffect(() => {
    const cleanupResize = initScene();
    const gs = gameStateRef.current;

    if (gs.renderer && gs.scene && gs.camera) {
      gs.renderer.render(gs.scene, gs.camera);
    }

    function tick(timestamp: number) {
      const g = gameStateRef.current;
      if (!g.renderer || !g.scene || !g.camera) return;

      const delta = g.lastTime === 0 ? 0 : Math.min((timestamp - g.lastTime) / 1000, 0.1);
      g.lastTime = timestamp;

      if (g.gamePhase === "playing") {
        updateWorld(g, delta);
        updateSubmarine(g, delta);
        updateParticles(g, delta);
        checkCollisions(g);
      }

      g.renderer.render(g.scene, g.camera);
      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
      const g = gameStateRef.current;
      if (g.renderer) {
        g.renderer.dispose();
        g.renderer = null;
      }
      if (cleanupResize) cleanupResize();
    };
  }, [initScene, updateWorld, updateSubmarine, updateParticles, checkCollisions]);

  // ── Keyboard ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== "playing") return;

    function onKeyDown(e: KeyboardEvent) {
      keysRef.current.add(e.key);
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keysRef.current.clear();
    };
  }, [screen]);

  // ── Mobile input helpers ───────────────────────────────────────────────────

  const holdLeft = useCallback(() => {
    keysRef.current.add("ArrowLeft");
  }, []);
  const holdRight = useCallback(() => {
    keysRef.current.add("ArrowRight");
  }, []);
  const releaseLeft = useCallback(() => {
    keysRef.current.delete("ArrowLeft");
  }, []);
  const releaseRight = useCallback(() => {
    keysRef.current.delete("ArrowRight");
  }, []);

  // ── Verdict & zone ─────────────────────────────────────────────────────────

  function getVerdict(d: number) {
    if (d >= 300)
      return "Extraordinary depth achieved. Your data has been forwarded to the Board. The Board is also underwater. This was not planned.";
    if (d >= 150)
      return "Strategic depth reached. Insights are being processed. Processing will take 6–8 business weeks. You will not be credited.";
    return "Insufficient depth. Your findings have been classified as 'shallow.' A performance review has been scheduled. Bring a blazer.";
  }

  const depthFillPct = Math.min(100, (depth / MAX_DEPTH) * 100);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.gameContainer}>
      {/* Header bar */}
      <div className={styles.headerBar}>
        <div className={styles.logoGroup}>
          <span className={styles.logoText}>
            Deep Dive<span>™</span>
          </span>
          <span className={styles.headerMeta}>
            Analytics Division
          </span>
        </div>
        <div className={styles.o2Display}>
          <span>O₂</span>
          <div className={styles.tanks}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`${styles.o2Tank} ${i >= lives ? styles.o2TankLost : ""}`}
              >
                ◈
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className={styles.canvasWrapper} ref={containerRef}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Depth meter */}
        {screen === "playing" && (
          <>
            <div className={styles.depthMeterWrap}>
              <div
                className={styles.depthMeterFill}
                style={{ height: `${depthFillPct}%` }}
              />
            </div>
            <div className={styles.depthZoneLabel}>{zoneName}</div>
          </>
        )}

        {/* Intro overlay */}
        {screen === "intro" && (
          <div className={styles.overlay}>
            <div className={styles.introScreen}>
              <p className={styles.introTag}>
                Monochromacy · Analytics Division
              </p>
              <h1 className={styles.introTitle}>
                Deep Dive<span>™</span>
              </h1>
              <p className={styles.introSubtitle}>
                Strategic Immersion Platform · v1.0
              </p>
              <div className={styles.introBody}>
                <p>
                  You are a Monochromacy data scientist. You are in the submarine.
                  The submarine is going down. This was a budget decision.
                </p>
                <p>
                  Collect glowing data orbs to extract insights. Avoid mines,
                  pressure barriers, and the anglerfish — they are not partners,
                  they are obstacles. The deeper you go, the more valuable your findings.
                </p>
                <p>
                  Use <strong>← →</strong> or <strong>A / D</strong> to steer.
                  On mobile, use the buttons below.
                </p>
              </div>
              <div className={styles.disclaimer}>
                Monochromacy accepts no responsibility for depth-related incidents.
                The submarine has been safety-inspected. The inspector is unavailable
                for follow-up questions. That is unrelated.
              </div>
              <button className={styles.btnPrimary} onClick={startGame}>
                Begin Descent
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {screen === "gameover" && (
          <div className={styles.overlay}>
            <div className={styles.gameOverScreen}>
              <p className={styles.gameOverTag}>Surface Breach Detected</p>
              <h2 className={styles.gameOverTitle}>
                Ascent Involuntary
              </h2>
              <div className={styles.gameOverScore}>
                {score.toLocaleString()}
              </div>
              <p className={styles.gameOverScoreLabel}>
                Insight Units Recovered
              </p>
              <p className={styles.gameOverDepth}>
                Max Depth: {finalDepth}m — {getZone(finalDepth).name}
              </p>
              <div className={styles.gameOverVerdict}>
                {getVerdict(finalDepth)}
              </div>
              <div className={styles.gameOverActions}>
                <button className={styles.btnPrimary} onClick={startGame}>
                  Re-Deploy
                </button>
                <Link href="/portal" className={styles.btnGhost}>
                  Return to Portal
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Buzzword flash */}
        {screen === "playing" && buzzword && (
          <div key={buzzword + Date.now()} className={styles.buzzword}>
            {buzzword}
          </div>
        )}
      </div>

      {/* Mobile touch controls */}
      {screen === "playing" && (
        <div className={styles.touchControls}>
          <button
            className={styles.touchBtn}
            onPointerDown={(e) => { e.preventDefault(); holdLeft(); }}
            onPointerUp={releaseLeft}
            onPointerLeave={releaseLeft}
          >
            ◀ Left
          </button>
          <button
            className={styles.touchBtn}
            onPointerDown={(e) => { e.preventDefault(); holdRight(); }}
            onPointerUp={releaseRight}
            onPointerLeave={releaseRight}
          >
            Right ▶
          </button>
        </div>
      )}

      {/* Score bar */}
      <div className={styles.scoreBar}>
        <div className={styles.scoreStats}>
          <div className={styles.scoreStat}>
            <span className={styles.scoreLabel}>Score</span>
            <span className={styles.scoreValue}>{score.toLocaleString()}</span>
          </div>
          <div className={styles.scoreStat}>
            <span className={styles.scoreLabel}>Depth</span>
            <span className={styles.scoreValueNeutral}>{depth}m</span>
          </div>
          <div className={styles.scoreStat}>
            <span className={styles.scoreLabel}>Zone</span>
            <span className={styles.scoreValueZone}>{zoneName}</span>
          </div>
        </div>
        <div className={styles.controlsHint}>
          ← → Steer &nbsp;·&nbsp; Collect orbs &nbsp;·&nbsp; Avoid everything else
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footerBar}>
        <span>
          Deep Dive™ · Analytics Division · All findings are property of Monochromacy
        </span>
        <Link href="/portal" style={{ color: "var(--accent)", textDecoration: "none" }}>
          ← Portal
        </Link>
      </div>
    </div>
  );
}
