import { useMemo } from "react";

function Tree({
  position,
  scale = 1,
  tint = "#2f7d32",
}: {
  position: [number, number, number];
  scale?: number;
  tint?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.11, 0.16, 1, 5]} />
        <meshStandardMaterial color="#6b4423" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]}>
        <icosahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial color={tint} roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[0.18, 1.95, -0.1]}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#3f9142" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

function Temple({
  position,
  rotation = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* stone base */}
      <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[3, 0.3, 3]} />
        <meshStandardMaterial color="#cfc7b3" roughness={1} flatShading />
      </mesh>
      {/* walls */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[2.2, 1.3, 2.2]} />
        <meshStandardMaterial color="#e8dfc9" roughness={0.95} flatShading />
      </mesh>
      {/* doorway */}
      <mesh position={[0, 0.7, 1.12]}>
        <boxGeometry args={[0.7, 1, 0.05]} />
        <meshStandardMaterial color="#4a2c14" roughness={1} />
      </mesh>
      {/* lower roof */}
      <mesh castShadow position={[0, 1.85, 0]}>
        <coneGeometry args={[2.2, 0.8, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshStandardMaterial color="#e2601a" roughness={0.8} flatShading />
      </mesh>
      {/* upper roof */}
      <mesh castShadow position={[0, 2.6, 0]}>
        <coneGeometry args={[1.4, 0.9, 4]} />
        <meshStandardMaterial color="#c2410c" roughness={0.8} flatShading />
      </mesh>
      <mesh castShadow position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
        <meshStandardMaterial color="#f5c542" metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Banner({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.8, 6]} />
        <meshStandardMaterial color="#5b3a1a" roughness={1} />
      </mesh>
      <mesh castShadow position={[0.45, 1.9, 0]}>
        <boxGeometry args={[0.9, 1.6, 0.05]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.45, 2.1, 0.04]}>
        <circleGeometry args={[0.22, 6]} />
        <meshStandardMaterial color="#f5c542" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Stone({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <mesh position={position} scale={[scale, scale * 0.3, scale]} receiveShadow>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#b8b2a4" roughness={1} flatShading />
    </mesh>
  );
}

export default function Scenery() {
  const trees = useMemo(() => {
    const out: Array<{ p: [number, number, number]; s: number; tint: string }> = [];
    const tints = ["#2f7d32", "#3f9142", "#57a044", "#276d2d"];
    let seed = 7;
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 34; i++) {
      const a = rand() * Math.PI * 2;
      const r = 7.5 + rand() * 9;
      out.push({
        p: [Math.cos(a) * r, 0, Math.sin(a) * r],
        s: 0.7 + rand() * 0.9,
        tint: tints[Math.floor(rand() * tints.length)]!,
      });
    }
    return out;
  }, []);

  const stones = useMemo(() => {
    const out: Array<{ p: [number, number, number]; s: number }> = [];
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      out.push({ p: [-4.2 - t * 6, 0.02, 3.6 + Math.sin(t * 4) * 1.2], s: 0.6 + (i % 3) * 0.12 });
      out.push({ p: [4.2 + t * 6, 0.02, 3.4 + Math.cos(t * 4) * 1.1], s: 0.6 + (i % 2) * 0.15 });
    }
    return out;
  }, []);

  return (
    <group>
      {/* distant hills */}
      {[
        [-16, -18, 5],
        [10, -22, 6.5],
        [22, -10, 4.5],
        [-24, -6, 5.5],
      ].map(([x, z, s], i) => (
        <mesh key={`h${i}`} position={[x!, -0.5, z!]} castShadow={false}>
          <coneGeometry args={[s! * 1.6, s! * 1.6, 5]} />
          <meshStandardMaterial color={i % 2 ? "#4d7c4a" : "#5f8f56"} roughness={1} flatShading />
        </mesh>
      ))}

      <Temple position={[-9, 0, -7]} rotation={0.5} scale={1.1} />
      <Temple position={[8.5, 0, -8]} rotation={-0.4} scale={0.9} />
      <Temple position={[0, 0, -13]} rotation={0} scale={1.3} />

      <Banner position={[-4.6, 0, 4.2]} rotation={0.3} />
      <Banner position={[4.6, 0, 4.2]} rotation={-0.3 + Math.PI} />

      {trees.map((t, i) => (
        <Tree key={`t${i}`} position={t.p} scale={t.s} tint={t.tint} />
      ))}

      {stones.map((s, i) => (
        <Stone key={`s${i}`} position={s.p} scale={s.s} />
      ))}
    </group>
  );
}
