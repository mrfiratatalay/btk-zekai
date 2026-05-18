"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { BodyZone } from "@/types/kombin";

// Avatar local space (RPM bind pose: feet≈0, hips≈0.95, head≈1.65)
export const ZONE_3D: Record<BodyZone, [number, number, number]> = {
  head:   [0,     1.62,  0.08],
  torso:  [0,     1.30,  0.12],
  back:   [0,     1.30, -0.12],
  hands:  [-0.42, 0.85,  0.02],
  wrist:  [0.42,  0.85,  0.02],
  feet:   [0,     0.05,  0.08],
};

// ── RPM avatar GLTF types ─────────────────────────────────────────────────────
type AvatarNodes = {
  Hips: THREE.Bone;
  Wolf3D_Body: THREE.SkinnedMesh;
  Wolf3D_Outfit_Bottom: THREE.SkinnedMesh;
  Wolf3D_Outfit_Footwear: THREE.SkinnedMesh;
  Wolf3D_Outfit_Top: THREE.SkinnedMesh;
  Wolf3D_Hair: THREE.SkinnedMesh;
  EyeLeft: THREE.SkinnedMesh;
  EyeRight: THREE.SkinnedMesh;
  Wolf3D_Head: THREE.SkinnedMesh;
  Wolf3D_Teeth: THREE.SkinnedMesh;
};
type AvatarGLTF = { nodes: AvatarNodes; materials: Record<string, THREE.Material> };

// ── Hotspot ───────────────────────────────────────────────────────────────────
function Hotspot({ position, active }: { position: [number, number, number]; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (meshRef.current) {
      const pulse = active ? 1 + Math.sin(t.current * 5) * 0.3 : 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (outerRef.current) {
      const expand = active ? 1 + Math.sin(t.current * 5 + Math.PI) * 0.15 : 1;
      outerRef.current.scale.setScalar(expand);
      (outerRef.current.material as THREE.MeshStandardMaterial).opacity =
        active ? 0.3 + Math.sin(t.current * 3) * 0.15 : 0;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[active ? 0.065 : 0.035, 16, 16]} />
        <meshStandardMaterial
          color={active ? "#ffffff" : "#334422"}
          emissive={active ? "#adff41" : "#1a2a0a"}
          emissiveIntensity={active ? 8 : 0.8}
          roughness={0}
          metalness={0}
        />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial
          color="#adff41"
          emissive="#adff41"
          emissiveIntensity={3}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── RPM Avatar Figure (inside Suspense) ───────────────────────────────────────
function RPMAvatarFigure({ activeZones }: { activeZones: Set<BodyZone> }) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF("/models/avatar.glb") as unknown as AvatarGLTF;

  return (
    <group ref={group} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />

      {(Object.entries(ZONE_3D) as [BodyZone, [number, number, number]][]).map(([zone, pos]) => (
        <Hotspot key={zone} position={pos} active={activeZones.has(zone)} />
      ))}
    </group>
  );
}

// ── Platform ring ─────────────────────────────────────────────────────────────
function PlatformRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.8;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.4;
  });

  return (
    <group position={[0, -0.95, 0]}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.014, 8, 100]} />
        <meshStandardMaterial color="#adff41" emissive="#adff41" emissiveIntensity={5} roughness={0} metalness={1} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.68, 0.007, 8, 100]} />
        <meshStandardMaterial color="#adff41" emissive="#adff41" emissiveIntensity={3} roughness={0} metalness={1} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[0.75, 64]} />
        <meshStandardMaterial color="#adff41" emissive="#adff41" emissiveIntensity={1} transparent opacity={0.07} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── Zone position projector ───────────────────────────────────────────────────
function ZoneProjector({
  onPositions,
}: {
  onPositions: (pos: Partial<Record<BodyZone, { x: number; y: number }>>) => void;
}) {
  const { camera, size } = useThree();
  useFrame(() => {
    const result: Partial<Record<BodyZone, { x: number; y: number }>> = {};
    for (const [zone, pos3d] of Object.entries(ZONE_3D) as [BodyZone, [number, number, number]][]) {
      const v = new THREE.Vector3(...pos3d).project(camera);
      result[zone] = {
        x: ((v.x + 1) / 2) * size.width,
        y: ((-v.y + 1) / 2) * size.height,
      };
    }
    onPositions(result);
  });
  return null;
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({
  activeZones,
  onZonePositions,
}: {
  activeZones: Set<BodyZone>;
  onZonePositions: (pos: Partial<Record<BodyZone, { x: number; y: number }>>) => void;
}) {
  return (
    <>
      <color attach="background" args={["#080808"]} />

      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 5, 3]} intensity={2.0} color="#fff8f0" />
      <directionalLight position={[-3, 2, 0]} intensity={0.6} color="#c8d8ff" />
      <pointLight position={[0, 2, -2]} intensity={1.5} color="#adff41" distance={6} />
      <pointLight position={[0, -0.5, 0.5]} intensity={1.0} color="#adff41" distance={4} />

      {/* Suspense — avatar/FBX yüklenirken sahne boş kalır, flash olmaz */}
      <Suspense fallback={null}>
        <group position={[0, -0.9, 0]}>
          <RPMAvatarFigure activeZones={activeZones} />
        </group>
      </Suspense>

      <PlatformRing />

      <ZoneProjector onPositions={onZonePositions} />

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.6}
        />
        <Vignette darkness={0.55} offset={0.3} />
      </EffectComposer>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
type Figure3DProps = {
  activeZones?: BodyZone[];
  onZonePositions?: (positions: Partial<Record<BodyZone, { x: number; y: number }>>) => void;
  className?: string;
};

export function Figure3D({ activeZones = [], onZonePositions, className }: Figure3DProps) {
  const zoneSet = useMemo(() => new Set(activeZones), [activeZones]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlePositions = useMemo(() => onZonePositions ?? (() => {}), []);

  return (
    <div className={className} style={{ background: "#080808" }}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene activeZones={zoneSet} onZonePositions={handlePositions} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/avatar.glb");
