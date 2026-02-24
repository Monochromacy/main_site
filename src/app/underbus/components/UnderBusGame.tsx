"use client";

import * as THREE from "three";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import styles from "../underbus.module.css";

// ── Constants ────────────────────────────────────────────────────────────────

const LANE_Z = [-3, 0, 3] as const;
const BASE_BUS_SPEED = 5;
const SPEED_PER_LEVEL = 1;
const COWORKER_COUNT = 3;

const COLORS = {
  ground: 0x050f05,
  laneLine: 0x0a1a0a,
  curb: 0x00ff41,
  bus: 0xe8e6e0,
  busWindshield: 0x000000,
  player: 0x00ff41,
  coworker: 0xe8e6e0,
  coworkerHit: 0xe05a5a,
  selectionRing: 0xffff00,
} as const;

const BUZZWORDS = [
  "Blame Successfully Reallocated\u2122",
  "Accountability Optimized.",
  "Scapegoat KPI: MET",
  "Liability Transferred.",
  "Resource Redeployment Complete.",
  "Synergy Achieved.",
  "Performance Gap Closed.",
  "That's the Monochromacy Way.",
  "Incident Contained.",
  "Employee Rightsized.",
  "Optics: Improved.",
  "Pivot Executed.",
  "Root Cause: External.",
  "Headcount Optimized.",
  "You've Been Very Helpful.",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bus {
  group: THREE.Group;
  lane: number;
  disposed: boolean;
}

interface Coworker {
  group: THREE.Group;
  lane: number;
  targetZ: number;
  driftDir: number;
  speed: number;
  laneTimer: number;
  hitCooldown: number;
  beingThrown: boolean;
  selectionRing: THREE.Mesh | null;
  disposed: boolean;
}

interface Player {
  group: THREE.Group;
  lane: number;
  targetZ: number;
  invincible: boolean;
}

interface GameState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  buses: Bus[];
  coworkers: Coworker[];
  player: Player | null;
  selectedCoworker: Coworker | null;
  score: number;
  lives: number;
  level: number;
  consecutiveHits: number;
  gamePhase: "idle" | "playing" | "gameover";
  lastTime: number;
  spawnTimer: number;
  nextSpawnInterval: number;
}

type Screen = "intro" | "playing" | "gameover";

// ── Geometry helpers ──────────────────────────────────────────────────────────

function createBus(lane: number): THREE.Group {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 1.2, 1.8),
    new THREE.MeshLambertMaterial({ color: COLORS.bus })
  );
  body.position.y = 0.6;
  group.add(body);

  // Windshield stripe on left face (buses travel left→right)
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.55, 1.1),
    new THREE.MeshBasicMaterial({ color: COLORS.busWindshield })
  );
  windshield.position.set(-1.79, 0.85, 0);
  group.add(windshield);

  group.position.set(-22, 0, LANE_Z[lane as 0 | 1 | 2]);
  return group;
}

function createCharacter(color: number): THREE.Group {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.8, 0.4),
    new THREE.MeshLambertMaterial({ color })
  );
  body.position.y = 0.4;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.35, 0.35),
    new THREE.MeshLambertMaterial({ color })
  );
  head.position.y = 1.02;
  group.add(head);

  return group;
}

function createSelectionRing(): THREE.Mesh {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.58, 16),
    new THREE.MeshBasicMaterial({
      color: COLORS.selectionRing,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  return ring;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UnderBusGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>({
    scene: null,
    camera: null,
    renderer: null,
    buses: [],
    coworkers: [],
    player: null,
    selectedCoworker: null,
    score: 0,
    lives: 3,
    level: 1,
    consecutiveHits: 0,
    gamePhase: "idle",
    lastTime: 0,
    spawnTimer: 0,
    nextSpawnInterval: 3.0,
  });
  const animFrameRef = useRef<number>(0);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // React UI state (only what the overlay needs)
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [buzzword, setBuzzword] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("intro");

  // Stable callback refs so the game loop can update React state without stale closures
  const onScoreUpdate = useRef<(s: number, st: number, lv: number) => void>(
    () => {}
  );
  const onLivesUpdate = useRef<(l: number) => void>(() => {});
  const onBuzzwordTrigger = useRef<(w: string) => void>(() => {});
  const onGameOver = useRef<(finalScore: number) => void>(() => {});

  useEffect(() => {
    onScoreUpdate.current = (s, st, lv) => {
      setScore(s);
      setStreak(st);
      setLevel(lv);
    };
    onLivesUpdate.current = (l) => setLives(l);
    onBuzzwordTrigger.current = (w) => {
      setBuzzword(null);
      // Next tick to retrigger animation
      requestAnimationFrame(() => setBuzzword(w));
    };
    onGameOver.current = (finalScore) => {
      setScore(finalScore);
      setScreen("gameover");
    };
  }, []);

  // ── Three.js scene init ────────────────────────────────────────────────────

  const initScene = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gs = gameStateRef.current;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    gs.scene = scene;

    // Camera — angled isometric view
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 12, 10);
    camera.lookAt(0, 0, 0);
    gs.camera = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    gs.renderer = renderer;

    // Lighting
    const ambient = new THREE.AmbientLight(0xe8e6e0, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x00ff41, 0.4);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 12),
      new THREE.MeshLambertMaterial({ color: COLORS.ground })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // Lane divider lines
    for (const zPos of [-1.5, 1.5]) {
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(44, 0.04, 0.08),
        new THREE.MeshBasicMaterial({ color: COLORS.laneLine })
      );
      divider.position.set(0, 0.01, zPos);
      scene.add(divider);
    }

    // Curbs (accent green strips)
    for (const zPos of [-5.4, 5.4]) {
      const curb = new THREE.Mesh(
        new THREE.BoxGeometry(44, 0.12, 0.4),
        new THREE.MeshBasicMaterial({ color: COLORS.curb })
      );
      curb.position.set(0, 0.06, zPos);
      scene.add(curb);
    }

    // Resize handler
    const onResize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── Spawn coworkers ────────────────────────────────────────────────────────

  const spawnCoworkers = useCallback((gs: GameState) => {
    const scene = gs.scene!;
    for (let i = 0; i < COWORKER_COUNT; i++) {
      const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      const group = createCharacter(COLORS.coworker);
      group.position.set(-8 + Math.random() * 16, 0, LANE_Z[lane]);
      scene.add(group);
      gs.coworkers.push({
        group,
        lane,
        targetZ: LANE_Z[lane],
        driftDir: Math.random() > 0.5 ? 1 : -1,
        speed: 0.8 + Math.random() * 0.6,
        laneTimer: 3 + Math.random() * 4,
        hitCooldown: 0,
        beingThrown: false,
        selectionRing: null,
        disposed: false,
      });
    }
  }, []);

  // ── Spawn player ───────────────────────────────────────────────────────────

  const spawnPlayer = useCallback((gs: GameState) => {
    const scene = gs.scene!;
    const group = createCharacter(COLORS.player);
    group.position.set(-2, 0, LANE_Z[1]);
    scene.add(group);
    gs.player = { group, lane: 1, targetZ: LANE_Z[1], invincible: false };
  }, []);

  // ── Game loop update functions ─────────────────────────────────────────────

  const triggerBuzzword = useCallback(() => {
    const word = BUZZWORDS[Math.floor(Math.random() * BUZZWORDS.length)];
    onBuzzwordTrigger.current(word);
  }, []);

  const updateBuses = useCallback((gs: GameState, delta: number) => {
    const speed = BASE_BUS_SPEED + (gs.level - 1) * SPEED_PER_LEVEL;
    for (const bus of gs.buses) {
      bus.group.position.x += speed * delta;
      if (bus.group.position.x > 24) {
        gs.scene!.remove(bus.group);
        bus.disposed = true;
      }
    }
    gs.buses = gs.buses.filter((b) => !b.disposed);
  }, []);

  const updateCoworkers = useCallback((gs: GameState, delta: number) => {
    for (const npc of gs.coworkers) {
      if (npc.disposed) continue;
      if (npc.hitCooldown > 0) {
        npc.hitCooldown -= delta;
        continue;
      }

      // X drift within bounds
      if (npc.group.position.x > 9) npc.driftDir = -1;
      if (npc.group.position.x < -9) npc.driftDir = 1;
      npc.group.position.x += npc.driftDir * npc.speed * delta;

      // Occasional lane switch
      npc.laneTimer -= delta;
      if (npc.laneTimer <= 0 && !npc.beingThrown) {
        const newLane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        npc.lane = newLane;
        npc.targetZ = LANE_Z[newLane];
        npc.laneTimer = 3 + Math.random() * 4;
      }

      // Lerp toward target lane Z
      npc.group.position.z +=
        (npc.targetZ - npc.group.position.z) * 4 * delta;
    }
  }, []);

  const updatePlayer = useCallback((gs: GameState, delta: number) => {
    if (!gs.player) return;
    gs.player.group.position.z +=
      (gs.player.targetZ - gs.player.group.position.z) * 10 * delta;
  }, []);

  const handleCoworkerHit = useCallback(
    (gs: GameState, npc: Coworker) => {
      npc.hitCooldown = 1.5;
      npc.beingThrown = false;
      gs.consecutiveHits++;
      gs.score += 100 + (gs.consecutiveHits > 1 ? (gs.consecutiveHits - 1) * 50 : 0);

      // Update level based on score
      gs.level = Math.floor(gs.score / 500) + 1;

      // Flash red
      npc.group.children.forEach((c) => {
        const mesh = c as THREE.Mesh;
        if (
          mesh.isMesh &&
          mesh.material instanceof THREE.MeshLambertMaterial
        ) {
          const mat = mesh.material as THREE.MeshLambertMaterial;
          const orig = COLORS.coworker;
          mat.color.setHex(COLORS.coworkerHit);
          setTimeout(() => {
            if (!npc.disposed) mat.color.setHex(orig);
          }, 300);
        }
      });

      // Remove selection ring if present
      if (npc.selectionRing) {
        npc.group.remove(npc.selectionRing);
        npc.selectionRing = null;
      }

      // Notify React
      onScoreUpdate.current(gs.score, gs.consecutiveHits, gs.level);
      triggerBuzzword();

      // Respawn coworker at new position
      setTimeout(() => {
        if (npc.disposed) return;
        const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        npc.lane = lane;
        npc.targetZ = LANE_Z[lane];
        npc.group.position.x = -9 + Math.random() * 18;
        npc.group.position.z = npc.targetZ;
        npc.hitCooldown = 0;
      }, 500);
    },
    [triggerBuzzword]
  );

  const handlePlayerHit = useCallback((gs: GameState) => {
    if (!gs.player || gs.player.invincible) return;
    gs.lives--;
    gs.player.invincible = true;
    gs.consecutiveHits = 0;
    onLivesUpdate.current(gs.lives);

    if (gs.lives <= 0) {
      gs.gamePhase = "gameover";
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
      onGameOver.current(gs.score);
      return;
    }

    // Invincibility flash (2 seconds)
    let flashCount = 0;
    if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    flashIntervalRef.current = setInterval(() => {
      if (!gs.player) return;
      gs.player.group.visible = !gs.player.group.visible;
      flashCount++;
      if (flashCount >= 8) {
        clearInterval(flashIntervalRef.current!);
        flashIntervalRef.current = null;
        if (gs.player) {
          gs.player.group.visible = true;
          gs.player.invincible = false;
        }
      }
    }, 250);
  }, []);

  const checkCollisions = useCallback(
    (gs: GameState) => {
      const busBoxTemp = new THREE.Box3();
      const targetBoxTemp = new THREE.Box3();

      for (const bus of gs.buses) {
        busBoxTemp.setFromObject(bus.group);

        // Check coworkers
        for (const npc of gs.coworkers) {
          if (npc.disposed || npc.hitCooldown > 0) continue;
          targetBoxTemp.setFromObject(npc.group);
          if (busBoxTemp.intersectsBox(targetBoxTemp)) {
            handleCoworkerHit(gs, npc);
          }
        }

        // Check player
        if (gs.player && !gs.player.invincible) {
          targetBoxTemp.setFromObject(gs.player.group);
          if (busBoxTemp.intersectsBox(targetBoxTemp)) {
            handlePlayerHit(gs);
          }
        }
      }
    },
    [handleCoworkerHit, handlePlayerHit]
  );

  const updateSpawner = useCallback((gs: GameState, delta: number) => {
    gs.spawnTimer += delta;
    if (gs.spawnTimer >= gs.nextSpawnInterval) {
      gs.spawnTimer = 0;
      const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      const busGroup = createBus(lane);
      gs.scene!.add(busGroup);
      gs.buses.push({ group: busGroup, lane, disposed: false });
      gs.nextSpawnInterval = Math.max(1.0, 3.0 - (gs.level - 1) * 0.25);
    }
  }, []);

  // ── Input: move player ─────────────────────────────────────────────────────

  const movePlayer = useCallback((gs: GameState, dir: -1 | 1) => {
    if (!gs.player) return;
    const newLane = Math.max(0, Math.min(2, gs.player.lane + dir)) as 0 | 1 | 2;
    gs.player.lane = newLane;
    gs.player.targetZ = LANE_Z[newLane];
  }, []);

  // ── Input: coworker selection ──────────────────────────────────────────────

  const selectCoworker = useCallback((gs: GameState, npc: Coworker) => {
    // Deselect previous
    if (gs.selectedCoworker && gs.selectedCoworker !== npc) {
      if (gs.selectedCoworker.selectionRing) {
        gs.selectedCoworker.group.remove(gs.selectedCoworker.selectionRing);
        gs.selectedCoworker.selectionRing = null;
      }
    }
    gs.selectedCoworker = npc;
    if (!npc.selectionRing) {
      const ring = createSelectionRing();
      npc.group.add(ring);
      npc.selectionRing = ring;
    }
  }, []);

  const deselectCoworker = useCallback((gs: GameState) => {
    if (gs.selectedCoworker?.selectionRing) {
      gs.selectedCoworker.group.remove(gs.selectedCoworker.selectionRing);
      gs.selectedCoworker.selectionRing = null;
    }
    gs.selectedCoworker = null;
  }, []);

  const throwSelectedCoworker = useCallback(
    (gs: GameState) => {
      if (!gs.selectedCoworker) return;
      const npc = gs.selectedCoworker;

      // Find nearest approaching bus (coming from the left, hasn't passed npc yet)
      const approaching = gs.buses
        .filter((b) => b.group.position.x < npc.group.position.x + 5)
        .sort(
          (a, b) => b.group.position.x - a.group.position.x
        );

      const nearestBus = approaching[0];
      if (!nearestBus) return;

      // Snap coworker into bus lane
      const lane = nearestBus.lane as 0 | 1 | 2;
      npc.lane = lane;
      npc.targetZ = LANE_Z[lane];
      npc.group.position.z = npc.targetZ;
      npc.beingThrown = true;

      deselectCoworker(gs);
    },
    [deselectCoworker]
  );

  // ── Canvas click: raycasting ───────────────────────────────────────────────

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const gs = gameStateRef.current;
      if (gs.gamePhase !== "playing" || !gs.camera || !gs.scene) return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();

      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, gs.camera);

      const meshes = gs.coworkers
        .filter((npc) => !npc.disposed && npc.hitCooldown <= 0)
        .flatMap((npc) =>
          npc.group.children.filter(
            (c): c is THREE.Mesh => (c as THREE.Mesh).isMesh
          )
        );

      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const npc = gs.coworkers.find((n) =>
          n.group.children.includes(hitMesh)
        );
        if (npc) selectCoworker(gs, npc);
      } else {
        deselectCoworker(gs);
      }
    },
    [selectCoworker, deselectCoworker]
  );

  const handleCanvasTouch = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      handleCanvasClick({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as React.MouseEvent<HTMLCanvasElement>);
    },
    [handleCanvasClick]
  );

  // ── Start / reset game ─────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    const gs = gameStateRef.current;

    // Clear previous state
    if (gs.scene) {
      for (const bus of gs.buses) gs.scene.remove(bus.group);
      for (const npc of gs.coworkers) gs.scene.remove(npc.group);
      if (gs.player) gs.scene.remove(gs.player.group);
    }

    gs.buses = [];
    gs.coworkers = [];
    gs.player = null;
    gs.selectedCoworker = null;
    gs.score = 0;
    gs.lives = 3;
    gs.level = 1;
    gs.consecutiveHits = 0;
    gs.gamePhase = "playing";
    gs.lastTime = 0;
    gs.spawnTimer = 0;
    gs.nextSpawnInterval = 3.0;

    setScore(0);
    setLives(3);
    setStreak(0);
    setLevel(1);
    setBuzzword(null);

    spawnCoworkers(gs);
    spawnPlayer(gs);
    setScreen("playing");
  }, [spawnCoworkers, spawnPlayer]);

  // ── Scene init + game loop ─────────────────────────────────────────────────

  useEffect(() => {
    const cleanupResize = initScene();

    const gs = gameStateRef.current;

    // Do one render so the scene is visible before game starts
    if (gs.renderer && gs.scene && gs.camera) {
      gs.renderer.render(gs.scene, gs.camera);
    }

    function tick(timestamp: number) {
      const g = gameStateRef.current;
      if (!g.renderer || !g.scene || !g.camera) return;

      const delta = g.lastTime === 0 ? 0 : Math.min((timestamp - g.lastTime) / 1000, 0.1);
      g.lastTime = timestamp;

      if (g.gamePhase === "playing") {
        updateBuses(g, delta);
        updateCoworkers(g, delta);
        updatePlayer(g, delta);
        checkCollisions(g);
        updateSpawner(g, delta);
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
  }, [initScene, updateBuses, updateCoworkers, updatePlayer, checkCollisions, updateSpawner]);

  // ── Keyboard controls ──────────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== "playing") return;

    function onKeyDown(e: KeyboardEvent) {
      const gs = gameStateRef.current;
      if (gs.gamePhase !== "playing") return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer(gs, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer(gs, 1);
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          throwSelectedCoworker(gs);
          break;
        case "Escape":
          deselectCoworker(gs);
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, movePlayer, throwSelectedCoworker, deselectCoworker]);

  // ── Score verdict ──────────────────────────────────────────────────────────

  function getVerdict(s: number) {
    if (s >= 2000)
      return "Outstanding. A citation has been added to your permanent record. Compliance Division is impressed. The submarine has been notified.";
    if (s >= 500)
      return "Acceptable. Your file has been updated. Accountability metrics are trending in a favorable direction. That's the Monochromacy Way.";
    return "Your performance metrics were insufficient. This has been noted. A follow-up email has been scheduled. You will not receive a response.";
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.gameContainer}>
      {/* Header bar */}
      <div className={styles.headerBar}>
        <div className={styles.logoGroup}>
          <span className={styles.logoText}>
            Under the Bus<span>™</span>
          </span>
          <span className={styles.headerMeta}>
            Talent Management Division
          </span>
        </div>
        <div className={styles.livesDisplay}>
          <span>Lives</span>
          <div className={styles.hearts}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`${styles.lifeHeart} ${i >= lives ? styles.lifeHeartLost : ""}`}
              >
                ♥
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className={styles.canvasWrapper} ref={containerRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasTouch}
        />

        {/* Intro overlay */}
        {screen === "intro" && (
          <div className={styles.overlay}>
            <div className={styles.introScreen}>
              <p className={styles.introTag}>
                Monochromacy · Talent Management Division
              </p>
              <h1 className={styles.introTitle}>
                Under the Bus<span>™</span>
              </h1>
              <p className={styles.introSubtitle}>
                Workforce Accountability Simulation · v1.0
              </p>
              <div className={styles.introBody}>
                <p>
                  You are a middle manager. Buses are incoming. Coworkers are
                  standing in the road. The quarterly review is in two hours.
                </p>
                <p>
                  Your mission: redirect accountability to available personnel.
                  Protect yourself. Optimize your blame metrics. Survive.
                </p>
                <p>
                  Use <strong>ARROW KEYS</strong> to switch lanes. Click a
                  coworker to select them. Press <strong>SPACE</strong> to throw
                  them into the path of the nearest bus. On mobile, tap a
                  coworker to select them and use the buttons below to move and
                  throw.
                </p>
              </div>
              <div className={styles.disclaimer}>
                Monochromacy accepts no liability for the outcomes of this
                simulation. All participants have signed a waiver. The waiver
                was in the onboarding packet. You should have read the
                onboarding packet.
              </div>
              <button className={styles.btnPrimary} onClick={startGame}>
                Initialize Simulation
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {screen === "gameover" && (
          <div className={styles.overlay}>
            <div className={styles.gameOverScreen}>
              <p className={styles.gameOverTag}>Session Terminated</p>
              <h2 className={styles.gameOverTitle}>
                You Have Been Restructured
              </h2>
              <div className={styles.gameOverScore}>
                {score.toLocaleString()}
              </div>
              <p className={styles.gameOverScoreLabel}>
                Accountability Points Logged
              </p>
              <div className={styles.gameOverVerdict}>
                {getVerdict(score)}
              </div>
              <div className={styles.gameOverActions}>
                <button className={styles.btnPrimary} onClick={startGame}>
                  Re-Onboard
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

        {/* Streak badge */}
        {screen === "playing" && streak >= 2 && (
          <div key={`streak-${streak}`} className={styles.streakBadge}>
            &times;{streak} Streak
          </div>
        )}
      </div>

      {/* Mobile touch controls */}
      {screen === "playing" && (
        <div className={styles.touchControls}>
          <button
            className={styles.touchBtn}
            onPointerDown={(e) => {
              e.preventDefault();
              movePlayer(gameStateRef.current, -1);
            }}
          >
            ▲ Lane Up
          </button>
          <button
            className={`${styles.touchBtn} ${styles.touchBtnThrow}`}
            onPointerDown={(e) => {
              e.preventDefault();
              throwSelectedCoworker(gameStateRef.current);
            }}
          >
            Throw
          </button>
          <button
            className={styles.touchBtn}
            onPointerDown={(e) => {
              e.preventDefault();
              movePlayer(gameStateRef.current, 1);
            }}
          >
            ▼ Lane Down
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
            <span className={styles.scoreLabel}>Level</span>
            <span className={styles.scoreValueNeutral}>{level}</span>
          </div>
          {streak >= 2 && (
            <div className={styles.scoreStat}>
              <span className={styles.scoreLabel}>Streak</span>
              <span className={styles.scoreValue}>&times;{streak}</span>
            </div>
          )}
        </div>
        <div className={styles.controlsHint}>
          ↑↓ Move &nbsp;·&nbsp; Click to select &nbsp;·&nbsp; Space to throw
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footerBar}>
        <span>
          Under the Bus™ · Talent Management Division · All throws are logged
        </span>
        <Link href="/portal" style={{ color: "var(--accent)", textDecoration: "none" }}>
          ← Portal
        </Link>
      </div>
    </div>
  );
}
