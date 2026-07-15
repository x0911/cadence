/**
 * components/features/streak-orb/streak-orb-scene.tsx
 *
 * The actual Three.js Canvas scene — only loaded client-side via dynamic import.
 * Full 3D implementation (subdivided icosahedron, particle aura) in Phase 6.
 * This stub renders a basic sphere so Phase 0 build passes without errors.
 */
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { getCappedDPR } from "@/lib/device";
import type { StreakOrbFallbackProps } from "./streak-orb-fallback";

// Accent color from design tokens — §6 says orb color maps onto accent (#059669)
const ORB_COLORS: Record<number, string> = {
  0: "#94A3B8",
  1: "#34D399",
  2: "#059669",
  3: "#047857",
};

export function StreakOrbScene({ strengthLevel }: StreakOrbFallbackProps) {
  const color = ORB_COLORS[strengthLevel] ?? "#059669";

  return (
    <Canvas
      dpr={getCappedDPR()}
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={1.2} />
      {/* Placeholder sphere — Phase 6 replaces with subdivided icosahedron */}
      <mesh>
        <icosahedronGeometry args={[1, strengthLevel]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
