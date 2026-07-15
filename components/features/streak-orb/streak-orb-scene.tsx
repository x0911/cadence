"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { getCappedDPR } from "@/lib/device";
import { StreakOrbParticles } from "./streak-orb-particles";
import type { StreakOrbFallbackProps } from "./streak-orb-fallback";
import * as THREE from "three";

// Accents mapping matching tailwind variables
const ORB_COLORS: Record<number, string> = {
  0: "#94A3B8", // slate (dormant)
  1: "#34D399", // emerald light (building)
  2: "#059669", // emerald solid (established)
  3: "#047857", // emerald dark (strong)
};

// Configuration tokens per strength level
const LEVEL_CONFIG = {
  0: { amplitude: 0.0, speed: 0.0, freq: 0.0, metalness: 0.1, roughness: 0.5 },
  1: { amplitude: 0.04, speed: 1.2, freq: 2.0, metalness: 0.2, roughness: 0.4 },
  2: { amplitude: 0.09, speed: 2.5, freq: 3.5, metalness: 0.4, roughness: 0.3 },
  3: { amplitude: 0.16, speed: 4.5, freq: 5.0, metalness: 0.7, roughness: 0.2 },
};

function DisplacedOrb({ strengthLevel }: { strengthLevel: 0 | 1 | 2 | 3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.IcosahedronGeometry>(null);
  
  // Keep track of the original vertex positions on load
  const originalPositions = useRef<Float32Array | null>(null);

  const config = LEVEL_CONFIG[strengthLevel] ?? LEVEL_CONFIG[0];
  const color = ORB_COLORS[strengthLevel] ?? ORB_COLORS[0];

  useFrame((state) => {
    if (!geoRef.current || !meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const positionAttr = geoRef.current.attributes.position;
    
    // Lazy initialize original positions cache
    if (!originalPositions.current) {
      originalPositions.current = positionAttr.array.slice() as Float32Array;
    }

    const orig = originalPositions.current;
    const current = positionAttr.array as Float32Array;

    const { amplitude, speed, freq } = config;

    // Displace vertices on CPU if amplitude > 0
    if (amplitude > 0) {
      for (let i = 0; i < positionAttr.count; i++) {
        const x = orig[i * 3];
        const y = orig[i * 3 + 1];
        const z = orig[i * 3 + 2];

        // 3D vector coordinates normalized
        const vx = new THREE.Vector3(x, y, z);
        vx.normalize();

        // Wave formula using X/Y/Z coords + time
        const wave =
          Math.sin(x * freq + time * speed) *
          Math.cos(y * freq + time * speed) *
          Math.sin(z * freq + time * speed);

        const displacement = 1.0 + wave * amplitude;
        
        current[i * 3] = x * displacement;
        current[i * 3 + 1] = y * displacement;
        current[i * 3 + 2] = z * displacement;
      }
      
      positionAttr.needsUpdate = true;
      geoRef.current.computeVertexNormals();
    }

    // Gentle passive orbit rotation
    meshRef.current.rotation.y = time * 0.15;
    meshRef.current.rotation.x = time * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      {/* Subdivided icosahedron (subdivision 3 = 162 vertices, smooth but light) */}
      <icosahedronGeometry ref={geoRef} args={[1, 3]} />
      <meshStandardMaterial
        color={color}
        roughness={config.roughness}
        metalness={config.metalness}
        wireframe={strengthLevel === 0} // Wireframe for dormant state looks cool/empty
      />
    </mesh>
  );
}

// Orbiting Ring components (Torus) representing established routine paths
function OrbitRings({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.z = time * 0.2;
      groupRef.current.rotation.x = time * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.22, 0.012, 8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[1.32, 0.008, 8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export function StreakOrbScene({ strengthLevel, maxStreak, activeHabitsCount }: StreakOrbFallbackProps) {
  const color = ORB_COLORS[strengthLevel] ?? ORB_COLORS[0];

  return (
    <div className="relative w-full h-full">
      <Canvas
        dpr={getCappedDPR()}
        camera={{ position: [0, 0, 3.85], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <pointLight position={[-5, -3, -2]} intensity={0.5} color={color} />

        {/* 3D Displaced Mesh */}
        <DisplacedOrb strengthLevel={strengthLevel} />

        {/* Orbit paths for Established (2) and Strong (3) states */}
        {strengthLevel >= 2 && <OrbitRings color={color} />}

        {/* Instanced Aura particles for Strong (3) state */}
        {strengthLevel === 3 && <StreakOrbParticles color={color} count={70} />}

        {/* Prevent zoom/pan interactions, only soft rotation allowed */}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Screen-reader-only accessible descriptors */}
      <span className="sr-only">
        Streak Orb status: Strength level {strengthLevel} representing {activeHabitsCount} active rituals and best streak of {maxStreak} days.
      </span>
    </div>
  );
}
