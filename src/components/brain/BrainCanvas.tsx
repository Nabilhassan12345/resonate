"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface BrainCanvasProps {
  className?: string;
  roiActivations?: { region: string; activation: number }[];
  highlightRegion?: string | null;
  autoRotate?: boolean;
  showLegend?: boolean;
  transparent?: boolean;
  view?: "lateral" | "anterior";
  inflated?: boolean;
}

const ROI_POSITIONS: Record<string, THREE.Vector3> = {
  fusiform_face: new THREE.Vector3(0.55, -0.15, 0.45),
  early_visual: new THREE.Vector3(0.0, -0.05, -0.75),
  auditory_cortex: new THREE.Vector3(-0.75, 0.05, 0.15),
  language_network: new THREE.Vector3(-0.55, -0.1, 0.45),
  default_mode: new THREE.Vector3(0.0, 0.5, 0.0),
  reward_anticipation: new THREE.Vector3(0.0, 0.1, 0.55),
};

function hotColor(t: number): THREE.Color {
  const k = Math.max(0, Math.min(1, t));
  if (k < 0.12) {
    const u = k / 0.12;
    return new THREE.Color(0.92, 0.88 - u * 0.28, 0.86 - u * 0.32);
  }
  if (k < 0.3) {
    const u = (k - 0.12) / 0.18;
    return new THREE.Color(0.92 + u * 0.03, 0.6 - u * 0.36, 0.54 - u * 0.34);
  }
  if (k < 0.55) {
    const u = (k - 0.3) / 0.25;
    return new THREE.Color(0.95 + u * 0.05, 0.24 - u * 0.04, 0.2 - u * 0.06);
  }
  if (k < 0.78) {
    const u = (k - 0.55) / 0.23;
    return new THREE.Color(1, 0.2 + u * 0.5, 0.14 + u * 0.1);
  }
  if (k < 0.92) {
    const u = (k - 0.78) / 0.14;
    return new THREE.Color(1, 0.7 + u * 0.25, 0.24 + u * 0.2);
  }
  const u = (k - 0.92) / 0.08;
  return new THREE.Color(1, 0.95 + u * 0.05, 0.44 + u * 0.5);
}

function paintHeatmap(
  geometry: THREE.BufferGeometry,
  rois: { region: string; activation: number }[],
  highlight: string | null,
  bbox: THREE.Box3,
  time = 0,
) {
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const count = pos.count;

  const existing = geometry.attributes.color as THREE.BufferAttribute | undefined;
  const colors =
    existing && existing.array.length === count * 3
      ? (existing.array as Float32Array)
      : new Float32Array(count * 3);

  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  const v = new THREE.Vector3();

  // Drifting wobble per ROI — gives the "moving red" look.
  const wobbles = rois.map((r, idx) => {
    const seed = idx * 1.7 + r.region.length * 0.3;
    return new THREE.Vector3(
      Math.sin(time * 0.55 + seed) * 0.09,
      Math.cos(time * 0.42 + seed * 1.3) * 0.07,
      Math.sin(time * 0.37 + seed * 0.7) * 0.08,
    );
  });

  for (let i = 0; i < count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(center).divideScalar(maxDim);

    // Static mottling — keeps texture even where no ROI is active.
    const surfaceNoise =
      Math.sin(v.x * 13 + v.y * 7) * 0.05 +
      Math.cos(v.y * 11 + v.z * 5) * 0.05 +
      Math.sin(v.z * 9 - v.x * 6) * 0.04;

    // Slow temporal shimmer — varies across the surface, very subtle.
    const shimmer =
      Math.sin(time * 0.8 + v.x * 6 + v.z * 4) * 0.04 +
      Math.cos(time * 0.6 + v.y * 5) * 0.03;

    let total = 0.22 + surfaceNoise + shimmer;

    for (let r = 0; r < rois.length; r++) {
      const roi = rois[r];
      const base = ROI_POSITIONS[roi.region];
      if (!base) continue;
      const w = wobbles[r];
      const tx = base.x + w.x;
      const ty = base.y + w.y;
      const tz = base.z + w.z;
      const dx = v.x - tx;
      const dy = v.y - ty;
      const dz = v.z - tz;
      const d2 = dx * dx + dy * dy + dz * dz;

      const sigma = highlight === roi.region ? 0.34 : 0.22;
      const gauss = Math.exp(-d2 / (2 * sigma * sigma));

      // Pulse intensity over time so peaks "breathe".
      const pulse = 1 + Math.sin(time * 1.5 + r * 0.7) * 0.18;
      total += gauss * roi.activation * pulse * 1.6;
    }

    const t = Math.max(0, Math.min(1, total));
    const c = hotColor(t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  if (!existing || existing.array.length !== count * 3) {
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  } else {
    existing.needsUpdate = true;
  }
}

function GlbBrain({
  roiActivations = [],
  highlightRegion,
  autoRotate = true,
  view = "lateral",
  inflated = false,
}: {
  roiActivations?: { region: string; activation: number }[];
  highlightRegion?: string | null;
  autoRotate?: boolean;
  view?: "lateral" | "anterior";
  inflated?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/brain.glb");

  const { centered, bbox, meshes } = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetScale = 1.6 / maxDim;
    c.scale.setScalar(targetScale);

    const scaledBox = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    c.position.sub(center);

    const finalBox = new THREE.Box3().setFromObject(c);
    const collected: THREE.Mesh[] = [];
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geom = child.geometry as THREE.BufferGeometry;
        if (!geom.attributes.color) {
          const count = geom.attributes.position.count;
          const initial = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            initial[i * 3] = 0.85;
            initial[i * 3 + 1] = 0.28;
            initial[i * 3 + 2] = 0.26;
          }
          geom.setAttribute("color", new THREE.BufferAttribute(initial, 3));
        }
        child.material = new THREE.MeshStandardMaterial({
          vertexColors: true,
          metalness: 0.05,
          roughness: 0.55,
          emissive: new THREE.Color(0.05, 0.0, 0.0),
          emissiveIntensity: 0.25,
        });
        collected.push(child);
      }
    });
    return { centered: c, bbox: finalBox, meshes: collected };
  }, [scene]);

  const timeRef = useRef(0);
  const lastPaintRef = useRef(-1);

  useEffect(() => {
    for (const m of meshes) {
      paintHeatmap(
        m.geometry as THREE.BufferGeometry,
        roiActivations,
        highlightRegion ?? null,
        bbox,
        timeRef.current,
      );
    }
    lastPaintRef.current = timeRef.current;
  }, [meshes, roiActivations, highlightRegion, bbox]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const g = group.current;
    if (g) {
      const targetRotY = view === "anterior" ? 0 : Math.PI * 0.42;
      g.rotation.y += (targetRotY - g.rotation.y) * Math.min(1, delta * 4);
      if (autoRotate) g.rotation.y += delta * 0.25;
      const targetScale = inflated ? 1.18 : 1;
      const s = g.scale.x + (targetScale - g.scale.x) * Math.min(1, delta * 5);
      g.scale.setScalar(s);
    }
    if (timeRef.current - lastPaintRef.current > 0.1) {
      lastPaintRef.current = timeRef.current;
      for (const m of meshes) {
        paintHeatmap(
          m.geometry as THREE.BufferGeometry,
          roiActivations,
          highlightRegion ?? null,
          bbox,
          timeRef.current,
        );
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={centered} />
      {roiActivations
        .filter((r) => r.activation > 0.55 || highlightRegion === r.region)
        .map((r) => {
          const target = ROI_POSITIONS[r.region];
          if (!target) return null;
          const isHi = highlightRegion === r.region;
          return (
            <mesh key={r.region} position={target.toArray()}>
              <sphereGeometry args={[isHi ? 0.05 : 0.03, 12, 12]} />
              <meshBasicMaterial
                color={isHi ? "#fff7c0" : "#fde68a"}
                transparent
                opacity={isHi ? 0.95 : 0.7}
              />
            </mesh>
          );
        })}
    </group>
  );
}

function ProceduralBrain({
  roiActivations = [],
  highlightRegion,
  autoRotate = true,
  view = "lateral",
  inflated = false,
}: {
  roiActivations?: { region: string; activation: number }[];
  highlightRegion?: string | null;
  autoRotate?: boolean;
  view?: "lateral" | "anterior";
  inflated?: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  const hemispheres = useMemo(() => {
    const make = (sign: number) => {
      const geo = new THREE.SphereGeometry(0.55, 64, 64);
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const noise =
          Math.sin(x * 7) * 0.02 +
          Math.cos(y * 9) * 0.02 +
          Math.sin(z * 11) * 0.015 +
          Math.cos(x * 14 + y * 6) * 0.012;
        const nx = x + (x / 0.55) * noise;
        const ny = y + (y / 0.55) * noise;
        const nz = z + (z / 0.55) * noise;
        pos.setXYZ(i, nx, ny, nz);
      }
      geo.computeVertexNormals();
      const count = pos.count;
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        colors[i * 3] = 0.74;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.7;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return { geo, sign };
    };
    return [make(-1), make(1)];
  }, []);

  const bbox = useMemo(() => new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1)), []);

  const timeRef = useRef(0);
  const lastPaintRef = useRef(-1);

  useEffect(() => {
    for (const { geo } of hemispheres) {
      paintHeatmap(geo, roiActivations, highlightRegion ?? null, bbox, timeRef.current);
    }
    lastPaintRef.current = timeRef.current;
  }, [hemispheres, roiActivations, highlightRegion, bbox]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const g = group.current;
    if (g) {
      const targetRotY = view === "anterior" ? 0 : Math.PI * 0.42;
      g.rotation.y += (targetRotY - g.rotation.y) * Math.min(1, delta * 4);
      if (autoRotate) g.rotation.y += delta * 0.25;
      const targetScale = inflated ? 1.18 : 1;
      const s = g.scale.x + (targetScale - g.scale.x) * Math.min(1, delta * 5);
      g.scale.setScalar(s);
    }
    if (timeRef.current - lastPaintRef.current > 0.1) {
      lastPaintRef.current = timeRef.current;
      for (const { geo } of hemispheres) {
        paintHeatmap(geo, roiActivations, highlightRegion ?? null, bbox, timeRef.current);
      }
    }
  });

  return (
    <group ref={group}>
      {hemispheres.map(({ geo, sign }, i) => (
        <mesh key={i} geometry={geo} position={[sign * 0.22, 0, 0]}>
          <meshStandardMaterial vertexColors metalness={0.05} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, -0.55, 0.05]} scale={[0.35, 0.5, 0.35]}>
        <cylinderGeometry args={[0.18, 0.1, 0.4, 16]} />
        <meshStandardMaterial color="#9c8b8b" metalness={0.05} roughness={0.7} />
      </mesh>
    </group>
  );
}

function BrainScene({
  roiActivations,
  highlightRegion,
  useGlb,
  autoRotate,
  view,
  inflated,
  allowOrbit,
}: {
  roiActivations?: { region: string; activation: number }[];
  highlightRegion?: string | null;
  useGlb: boolean;
  autoRotate: boolean;
  view: "lateral" | "anterior";
  inflated: boolean;
  allowOrbit: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.5, 2, 3]} intensity={1.1} />
      <directionalLight position={[-2, 1, -2]} intensity={0.4} color="#fff1d0" />
      <pointLight position={[0, -2, 2]} intensity={0.3} color="#ffb070" />
      {useGlb ? (
        <GlbBrain
          roiActivations={roiActivations}
          highlightRegion={highlightRegion}
          autoRotate={autoRotate}
          view={view}
          inflated={inflated}
        />
      ) : (
        <ProceduralBrain
          roiActivations={roiActivations}
          highlightRegion={highlightRegion}
          autoRotate={autoRotate}
          view={view}
          inflated={inflated}
        />
      )}
      {allowOrbit && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      )}
    </>
  );
}

export function BrainCanvas({
  className = "",
  roiActivations,
  highlightRegion,
  autoRotate = true,
  showLegend = true,
  transparent = false,
  view = "lateral",
  inflated = false,
}: BrainCanvasProps) {
  const [useGlb, setUseGlb] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/brain.glb", { method: "HEAD" })
      .then((r) => {
        if (cancelled) return;
        setUseGlb(r.ok);
        setChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        setUseGlb(false);
        setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const wrapper = transparent
    ? `relative ${className}`
    : `relative overflow-hidden rounded-xl border border-zinc-800 bg-black ${className}`;

  return (
    <div className={wrapper}>
      <Canvas
        camera={{ position: [0, 0.1, 2.6], fov: 42 }}
        gl={{ antialias: true, alpha: transparent }}
        style={transparent ? { background: "transparent" } : undefined}
      >
        <Suspense fallback={null}>
          {checked && (
            <BrainScene
              roiActivations={roiActivations}
              highlightRegion={highlightRegion}
              useGlb={useGlb}
              autoRotate={autoRotate}
              view={view}
              inflated={inflated}
              allowOrbit={!transparent}
            />
          )}
        </Suspense>
      </Canvas>
      {showLegend && (
        <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-500">
          <span>low</span>
          <span className="h-1.5 w-24 rounded-full bg-gradient-to-r from-white via-yellow-300 via-orange-500 to-red-600" />
          <span>high</span>
        </div>
      )}
    </div>
  );
}

useGLTF.preload("/brain.glb");
