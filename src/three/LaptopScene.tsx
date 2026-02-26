import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

const BASE_W = 3.2
const BASE_D = 2.0
const BASE_H = 0.12
const SCR_W  = 2.72
const SCR_H  = 1.72
const LID_ANGLE = -0.52

const KEY_MESHES = ((): { key: string; x: number; z: number; kw: number }[] => {
  const rows: { z: number; n: number; kw: number }[] = [
    { z: -0.30, n: 12, kw: 0.175 },
    { z: -0.12, n: 12, kw: 0.175 },
    { z:  0.06, n: 11, kw: 0.183 },
    { z:  0.24, n:  9, kw: 0.195 },
  ]
  const result: { key: string; x: number; z: number; kw: number }[] = []
  rows.forEach(({ z, n, kw }) => {
    const totalW = n * kw + (n - 1) * 0.012
    for (let i = 0; i < n; i++) {
      const x = -totalW / 2 + i * (kw + 0.012) + kw / 2
      result.push({ key: `${z}-${i}`, x, z, kw })
    }
  })
  return result
})()

const ScreenContent: React.FC = () => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const lines = useMemo(() => {
    const palette = ['#a78bfa', '#60a5fa', '#34d399', '#fb923c', '#f472b6', '#fbbf24', '#e879f9']
    const count   = 11
    const result: { x: number; y: number; w: number; color: string }[] = []
    const indents = [0, 0.15, 0.30, 0.15, 0, 0.15, 0.30, 0.15, 0, 0.15, 0.30]
    for (let i = 0; i < count; i++) {
      const indent = indents[i] ?? 0
      const maxW   = SCR_W * 0.8 - indent
      const w      = 0.18 + Math.random() * Math.min(0.75, maxW * 0.85)
      const x      = -(SCR_W / 2) * 0.78 + indent
      const y      = (SCR_H / 2) * 0.78 - i * ((SCR_H * 0.82) / count)
      result.push({ x, y, w, color: palette[i % palette.length] })
      const x2 = x + w + 0.09
      if (x2 + 0.1 < (SCR_W / 2) * 0.78) {
        result.push({ x: x2, y, w: 0.08 + Math.random() * 0.22, color: palette[(i + 3) % palette.length] })
      }
    }
    return result
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    meshRefs.current.forEach((m, i) => {
      if (!m) return
      ;(m.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.52 + Math.sin(t * 0.82 + i * 0.43) * 0.23
    })
  })

  return (
    <>
      <mesh position={[0, (SCR_H / 2) * 0.90, 0.002]}>
        <boxGeometry args={[SCR_W * 0.90, 0.038, 0.001]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.55} roughness={0.1} />
      </mesh>
      {([-SCR_W * 0.37, -SCR_W * 0.31, -SCR_W * 0.25] as number[]).map((x, i) => (
        <mesh key={i} position={[x, (SCR_H / 2) * 0.90, 0.003]}>
          <cylinderGeometry args={[0.026, 0.026, 0.002, 14]} />
          <meshStandardMaterial
            color={['#ff5f56', '#ffbd2e', '#27c93f'][i]}
            emissive={['#ff5f56', '#ffbd2e', '#27c93f'][i]}
            emissiveIntensity={0.85}
          />
        </mesh>
      ))}
      <mesh position={[-(SCR_W / 2) * 0.73, (SCR_H / 2) * 0.42, 0.002]}>
        <boxGeometry args={[0.022, 0.052, 0.001]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={1.0} />
      </mesh>
      {lines.map((l, i) => (
        <mesh key={i} ref={el => { meshRefs.current[i] = el }} position={[l.x + l.w / 2, l.y, 0.002]}>
          <boxGeometry args={[l.w, 0.030, 0.001]} />
          <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={0.58} roughness={0.1} />
        </mesh>
      ))}
    </>
  )
}

const Laptop: React.FC = () => {
  const groupRef      = useRef<THREE.Group>(null)
  const screenGlowRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.65) * 0.055
      groupRef.current.rotation.y = -0.28 + Math.sin(t * 0.38) * 0.07
    }
    if (screenGlowRef.current) {
      screenGlowRef.current.emissiveIntensity = 0.22 + Math.sin(t * 1.25) * 0.07
    }
  })

  const bodyMat = { color: '#1c1c2e' as const, metalness: 0.90, roughness: 0.09 }

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BASE_W, BASE_H, BASE_D]} />
        <meshStandardMaterial {...bodyMat} />
      </mesh>
      {([-BASE_W / 2 - 0.01, BASE_W / 2 + 0.01] as number[]).map((bx, i) => (
        <mesh key={i} position={[bx, 0, 0]}>
          <boxGeometry args={[0.022, BASE_H * 0.55, BASE_D * 0.97]} />
          <meshStandardMaterial color="#14142a" metalness={0.96} roughness={0.04} />
        </mesh>
      ))}
      {([
        [-1.35, -BASE_H / 2 - 0.012, -0.82],
        [ 1.35, -BASE_H / 2 - 0.012, -0.82],
        [-1.35, -BASE_H / 2 - 0.012,  0.82],
        [ 1.35, -BASE_H / 2 - 0.012,  0.82],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.075, 0.085, 0.022, 8]} />
          <meshStandardMaterial color="#090912" roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, BASE_H / 2 + 0.002, 0.08]}>
        <boxGeometry args={[2.58, 0.003, 1.68]} />
        <meshStandardMaterial color="#0e0e1c" roughness={0.97} />
      </mesh>
      {KEY_MESHES.map(({ key, x, z, kw }) => (
        <mesh key={key} position={[x, BASE_H / 2 + 0.006, z]}>
          <boxGeometry args={[kw, 0.007, 0.072]} />
          <meshStandardMaterial color="#131328" roughness={0.88} metalness={0.12} />
        </mesh>
      ))}
      <mesh position={[0.04, BASE_H / 2 + 0.006, 0.385]}>
        <boxGeometry args={[0.78, 0.007, 0.072]} />
        <meshStandardMaterial color="#13132a" roughness={0.88} metalness={0.12} />
      </mesh>
      <mesh position={[0, BASE_H / 2 + 0.003, 0.74]}>
        <boxGeometry args={[0.80, 0.003, 0.52]} />
        <meshStandardMaterial color="#101020" roughness={0.50} metalness={0.38} />
      </mesh>
      <mesh position={[0, BASE_H / 2 + 0.002, -(BASE_D / 2) + 0.045]}>
        <boxGeometry args={[BASE_W * 0.88, 0.016, 0.05]} />
        <meshStandardMaterial color="#0c0c1e" metalness={0.95} roughness={0.05} />
      </mesh>

      <group position={[0, BASE_H / 2, -(BASE_D / 2)]} rotation={[LID_ANGLE, 0, 0]}>
        <mesh position={[0, SCR_H / 2 + 0.04, 0]} castShadow>
          <boxGeometry args={[BASE_W, SCR_H + 0.12, 0.074]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>
        {([-BASE_W / 2 - 0.01, BASE_W / 2 + 0.01] as number[]).map((bx, i) => (
          <mesh key={i} position={[bx, SCR_H / 2 + 0.04, 0]}>
            <boxGeometry args={[0.022, SCR_H * 0.97, 0.052]} />
            <meshStandardMaterial color="#14142a" metalness={0.96} roughness={0.04} />
          </mesh>
        ))}
        <mesh position={[0, SCR_H / 2 + 0.04, -0.040]}>
          <cylinderGeometry args={[0.20, 0.20, 0.007, 36]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.60} roughness={0.18} metalness={0.45} />
        </mesh>
        <mesh position={[0, SCR_H / 2 + 0.04, 0.040]}>
          <boxGeometry args={[BASE_W - 0.04, SCR_H + 0.06, 0.009]} />
          <meshStandardMaterial color="#08080f" roughness={0.98} />
        </mesh>
        <mesh position={[0, SCR_H / 2 + 0.04, 0.046]}>
          <boxGeometry args={[SCR_W, SCR_H, 0.004]} />
          <meshStandardMaterial
            ref={screenGlowRef}
            color="#050510"
            emissive="#5b21b6"
            emissiveIntensity={0.22}
            roughness={0.04}
            metalness={0.06}
          />
        </mesh>
        <group position={[0, SCR_H / 2 + 0.04, 0.050]}>
          <ScreenContent />
        </group>
        <mesh position={[0, SCR_H + 0.08, 0.037]}>
          <cylinderGeometry args={[0.028, 0.028, 0.014, 12]} />
          <meshStandardMaterial color="#0c0c1a" roughness={0.18} metalness={0.4} />
        </mesh>
        <pointLight position={[0, SCR_H / 2, 0.6]} intensity={1.1} color="#7c3aed" distance={5} />
      </group>

      <pointLight position={[0, 0.8, 1.2]} intensity={0.45} color="#60a5fa" distance={5} />
    </group>
  )
}

interface LaptopSceneProps { className?: string }

export const LaptopScene: React.FC<LaptopSceneProps> = ({ className = '' }) => (
  <div className={`w-full h-full ${className}`} aria-hidden="true">
    <Canvas
      camera={{ position: [0, 2.5, 6.0], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      shadows
    >
      <ambientLight intensity={0.20} />
      <directionalLight position={[3, 6, 5]} intensity={0.75} color="#ffffff" castShadow />
      <pointLight position={[-4, 3, 2]} intensity={0.30} color="#60a5fa" />
      <pointLight position={[ 4, -1, 3]} intensity={0.18} color="#a78bfa" />
      <Environment preset="city" />
      <Laptop />
    </Canvas>
  </div>
)
