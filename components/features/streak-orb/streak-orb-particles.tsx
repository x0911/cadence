"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StreakOrbParticlesProps {
  color: string;
  count?: number;
}

export function StreakOrbParticles({ color, count = 60 }: StreakOrbParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Track particle states: position, velocity, life
  const particles = useRef<
    {
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      scale: number;
      life: number;
      maxLife: number;
    }[]
  >([]);

  // Initialize particles
  useEffect(() => {
    const tempParticles = [];
    for (let i = 0; i < count; i++) {
      // Spawn scattered on a sphere surface initially
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.0 + Math.random() * 0.4; // just outside the 3D orb

      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      // Float slowly outward and upward
      const vel = pos.clone().normalize().multiplyScalar(0.15).add(new THREE.Vector3(0, 0.1, 0));
      const maxLife = 1.5 + Math.random() * 1.5;

      tempParticles.push({
        pos,
        vel,
        scale: 0.02 + Math.random() * 0.03,
        life: Math.random() * maxLife,
        maxLife,
      });
    }
    particles.current = tempParticles;
  }, [count]);

  const tempObject = new THREE.Object3D();

  useFrame((state) => {
    if (!meshRef.current) return;

    const delta = state.clock.getDelta() || 0.016;
    const time = state.clock.getElapsedTime();

    particles.current.forEach((p, idx) => {
      // Update life
      p.life += delta;
      if (p.life >= p.maxLife) {
        // Reset particle: spawn close to the center
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        p.pos.set(
          1.0 * Math.sin(phi) * Math.cos(theta),
          1.0 * Math.sin(phi) * Math.sin(theta),
          1.0 * Math.cos(phi)
        );
        p.vel.copy(p.pos).normalize().multiplyScalar(0.15).add(new THREE.Vector3(0, 0.15, 0));
        p.life = 0;
      }

      // Move particle
      // Add subtle wave noise to movement using sine wave
      const waveX = Math.sin(time * 3 + p.pos.y) * 0.05;
      const actualVel = p.vel.clone().add(new THREE.Vector3(waveX, 0, 0));
      p.pos.addScaledVector(actualVel, delta);

      // Set matrix position
      tempObject.position.copy(p.pos);
      
      // Scale down as life finishes
      const lifeRatio = 1 - p.life / p.maxLife;
      const currentScale = p.scale * lifeRatio;
      tempObject.scale.set(currentScale, currentScale, currentScale);
      
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(idx, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
