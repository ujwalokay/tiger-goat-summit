import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Sky } from "@react-three/drei";
import Scenery from "./Scenery";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SIZE, neighbors, rc, type Cell } from "@/lib/baghchal";


const SPACING = 1.15;

export function nodePosition(i: number): [number, number, number] {
  const [r, c] = rc(i);
  return [(c - 2) * SPACING, 0.31, (r - 2) * SPACING];
}

function BoardLines() {
  const segments = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ a: number; b: number }> = [];
    for (let i = 0; i < SIZE * SIZE; i++) {
      for (const n of neighbors(i)) {
        const key = i < n ? `${i}-${n}` : `${n}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ a: i, b: n });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {segments.map(({ a, b }, k) => {
        const pa = new THREE.Vector3(...nodePosition(a));
        const pb = new THREE.Vector3(...nodePosition(b));
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const len = pa.distanceTo(pb);
        const angle = Math.atan2(pb.z - pa.z, pb.x - pa.x);
        return (
          <mesh key={k} position={[mid.x, 0.301, mid.z]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[len, 0.012, 0.035]} />
            <meshStandardMaterial color="#5a3a1c" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Smoothly eases a piece to its node and adds a gentle idle bob when selected. */
function PieceBase({
  position,
  selected,
  children,
}: {
  position: [number, number, number];
  selected: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(...position), [position]);
  const started = useRef(false);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    if (!started.current) {
      g.position.copy(target);
      g.position.y += 1.2;
      g.scale.setScalar(0.4);
      started.current = true;
    }
    const lift = selected ? 0.14 + Math.sin(state.clock.elapsedTime * 3) * 0.03 : 0;
    const k = 1 - Math.pow(0.001, dt);
    g.position.lerp(new THREE.Vector3(target.x, target.y + lift, target.z), k);
    const s = selected ? 1.08 : 1;
    g.scale.lerp(new THREE.Vector3(s, s, s), k);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, selected ? 0.5 : 0, k * 0.6);
  });

  return <group ref={ref}>{children}</group>;
}

function Tiger({ position, selected }: { position: [number, number, number]; selected: boolean }) {
  const body = selected ? "#fbbf24" : "#f97316";
  const dark = selected ? "#b45309" : "#9a3412";
  return (
    <PieceBase position={position} selected={selected}>
      {/* haunches */}
      <mesh castShadow position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.21, 0.27, 0.14, 8]} />
        <meshStandardMaterial color={dark} roughness={0.45} />
      </mesh>
      {/* body */}
      <mesh castShadow position={[0, 0.33, 0]}>
        <coneGeometry args={[0.2, 0.36, 8]} />
        <meshStandardMaterial color={body} roughness={0.35} />
      </mesh>
      {/* stripes */}
      {[0.24, 0.32, 0.4].map((y, k) => (
        <mesh key={k} position={[0, y, 0]}>
          <torusGeometry args={[0.19 - k * 0.035, 0.011, 6, 16]} />
          <meshStandardMaterial color={dark} roughness={0.6} />
        </mesh>
      ))}
      {/* head */}
      <mesh castShadow position={[0, 0.58, 0.02]}>
        <icosahedronGeometry args={[0.125, 0]} />
        <meshStandardMaterial color={body} roughness={0.4} />
      </mesh>
      {/* ears */}
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} castShadow position={[x, 0.68, 0]}>
          <coneGeometry args={[0.045, 0.07, 4]} />
          <meshStandardMaterial color={dark} roughness={0.5} />
        </mesh>
      ))}
      {/* snout */}
      <mesh position={[0, 0.55, 0.12]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>
      {/* tail */}
      <mesh castShadow position={[0, 0.3, -0.22]} rotation={[0.9, 0, 0]}>
        <capsuleGeometry args={[0.028, 0.22, 3, 6]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
    </PieceBase>
  );
}

function Goat({ position, selected }: { position: [number, number, number]; selected: boolean }) {
  const coat = selected ? "#bef264" : "#f5f5f4";
  const shade = selected ? "#a3e635" : "#d6d3d1";
  return (
    <PieceBase position={position} selected={selected}>
      {/* legs base */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.15, 0.19, 0.1, 8]} />
        <meshStandardMaterial color={shade} roughness={0.7} />
      </mesh>
      {/* body */}
      <mesh castShadow position={[0, 0.23, 0]}>
        <dodecahedronGeometry args={[0.155, 0]} />
        <meshStandardMaterial color={coat} roughness={0.55} />
      </mesh>
      {/* head */}
      <mesh castShadow position={[0, 0.4, 0.05]}>
        <icosahedronGeometry args={[0.085, 0]} />
        <meshStandardMaterial color={coat} roughness={0.5} />
      </mesh>
      {/* horns */}
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} castShadow position={[x, 0.48, 0]} rotation={[-0.4, 0, x > 0 ? -0.3 : 0.3]}>
          <coneGeometry args={[0.025, 0.1, 5]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.6} />
        </mesh>
      ))}
      {/* beard */}
      <mesh position={[0, 0.33, 0.09]}>
        <coneGeometry args={[0.03, 0.07, 5]} />
        <meshStandardMaterial color={shade} roughness={0.7} />
      </mesh>
    </PieceBase>
  );
}

function Node({
  i,
  highlighted,
  onClick,
}: {
  i: number;
  highlighted: boolean;
  onClick: (i: number) => void;
}) {
  const [hover, setHover] = useState(false);
  const pos = nodePosition(i);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ring.current) return;
    const pulse = highlighted ? 1 + Math.sin(state.clock.elapsedTime * 3.4) * 0.08 : 1;
    ring.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <mesh position={[pos[0], 0.303, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.075, 20]} />
        <meshStandardMaterial color="#3f2412" roughness={0.9} />
      </mesh>
      <mesh
        ref={ring}
        position={[pos[0], 0.307, pos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={highlighted}
        onClick={(e) => {
          e.stopPropagation();
          onClick(i);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <ringGeometry args={[0.13, 0.2, 28]} />
        <meshStandardMaterial
          color={hover ? "#fde047" : "#84cc16"}
          emissive={hover ? "#facc15" : "#4d7c0f"}
          emissiveIntensity={hover ? 0.7 : 0.3}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* invisible click pad so empty nodes stay clickable */}
      <mesh
        position={[pos[0], 0.302, pos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onClick(i);
        }}
      >
        <circleGeometry args={[0.24, 12]} />
      </mesh>
    </group>
  );
}


export interface BoardSceneProps {
  board: Cell[];
  selected: number | null;
  targets: number[];
  onNodeClick: (i: number) => void;
}

function Scene({ board, selected, targets, onNodeClick }: BoardSceneProps) {
  const group = useRef<THREE.Group>(null);
  return (
    <group ref={group}>
      {/* wooden board */}
      <mesh receiveShadow position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[5.6, 0.3, 5.6]} />
        <meshStandardMaterial color="#a1662f" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.301, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 5.2]} />
        <meshStandardMaterial color="#c08a4e" roughness={0.85} />
      </mesh>

      <BoardLines />

      {board.map((_, i) => (
        <Node key={`n${i}`} i={i} highlighted={targets.includes(i)} onClick={onNodeClick} />
      ))}

      {board.map((cell, i) => {
        if (cell === "empty") return null;
        const p = nodePosition(i);
        return cell === "tiger" ? (
          <group
            key={`p${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(i);
            }}
          >
            <Tiger position={p} selected={selected === i} />
          </group>
        ) : (
          <group
            key={`p${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(i);
            }}
          >
            <Goat position={p} selected={selected === i} />
          </group>
        );
      })}

      <ContactShadows position={[0, 0.31, 0]} opacity={0.35} scale={7} blur={2} far={2} />
    </group>
  );
}

export default function BoardScene(props: BoardSceneProps) {
  return (
    <Canvas
      shadows
      gl={{ alpha: true }}
      camera={{ position: [0, 5.4, 12.5], fov: 42 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#cfe8ff", "#4f7a35", 0.7]} />
      <directionalLight
        position={[6, 10, 5]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <Scene {...props} />
      <Environment preset="park" />

      <OrbitControls
        enablePan={false}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={7}
        maxDistance={22}
      />
    </Canvas>
  );
}
