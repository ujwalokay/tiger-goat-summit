import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
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

function Tiger({ position, selected }: { position: [number, number, number]; selected: boolean }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.12, 6]} />
        <meshStandardMaterial color={selected ? "#ffd166" : "#c2410c"} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.34, 0]}>
        <coneGeometry args={[0.19, 0.36, 6]} />
        <meshStandardMaterial
          color={selected ? "#fbbf24" : "#f97316"}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
      <mesh castShadow position={[0, 0.56, 0]}>
        <icosahedronGeometry args={[0.11, 0]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Goat({ position, selected }: { position: [number, number, number]; selected: boolean }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.08, 8]} />
        <meshStandardMaterial color={selected ? "#a3e635" : "#d6d3d1"} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.24, 0]}>
        <dodecahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color={selected ? "#bef264" : "#f5f5f4"} roughness={0.5} />
      </mesh>
    </group>
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
  return (
    <mesh
      position={[pos[0], 0.305, pos[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
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
      <circleGeometry args={highlighted ? 0.22 : 0.11, 24]} />
      <meshStandardMaterial
        color={highlighted ? (hover ? "#fde047" : "#84cc16") : "#3f2412"}
        transparent
        opacity={highlighted ? 0.9 : 1}
      />
    </mesh>
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
    <Canvas shadows camera={{ position: [0, 6.2, 6.4], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#7fb3d5"]} />
      <fog attach="fog" args={["#7fb3d5", 14, 26]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Scene {...props} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#4f8a3d" roughness={1} />
      </mesh>
      <Environment preset="park" />
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={5}
        maxDistance={12}
      />
    </Canvas>
  );
}
