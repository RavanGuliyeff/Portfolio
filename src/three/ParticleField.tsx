import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const PARTICLE_COUNT = 2000

interface ParticlesProps {
  mouse: React.MutableRefObject<[number, number]>
}

const Particles: React.FC<ParticlesProps> = ({ mouse }) => {
  const meshRef = useRef<THREE.Points>(null)
  const { size } = useThree()

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      vel[i * 3]     = (Math.random() - 0.5) * 0.01
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01
      vel[i * 3 + 2] = 0
    }
    return [pos, vel]
  }, [])

  useFrame(state => {
    if (!meshRef.current) return
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime

    const mx = (mouse.current[0] / size.width  - 0.5) * 6
    const my = -(mouse.current[1] / size.height - 0.5) * 4

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3  = i * 3
      const dx  = positions[i3]     - mx
      const dy  = positions[i3 + 1] - my
      const inv = 1 / (dx * dx + dy * dy + 1)

      positions[i3]     += velocities[i3]     + dx * 0.0008 * inv + Math.sin(t * 0.3 + i * 0.001) * 0.003
      positions[i3 + 1] += velocities[i3 + 1] + dy * 0.0008 * inv + Math.cos(t * 0.3 + i * 0.002) * 0.003
      positions[i3 + 2] = Math.sin(t * 0.5 + i * 0.01) * 2

      // Wrap around bounds
      if (positions[i3]     >  12) positions[i3]     = -12
      if (positions[i3]     < -12) positions[i3]     = 12
      if (positions[i3 + 1] >  8)  positions[i3 + 1] = -8
      if (positions[i3 + 1] < -8)  positions[i3 + 1] = 8
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.rotation.z = t * 0.02
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#7c3aed"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

export const ParticleField: React.FC = () => {
  const reduced  = usePrefersReducedMotion()
  const mouseRef = useRef<[number, number]>([0, 0])

  if (reduced) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-accent-950/30 to-dark-bg" />
    )
  }

  return (
    <div
      className="absolute inset-0"
      onMouseMove={e => { mouseRef.current = [e.clientX, e.clientY] }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Particles mouse={mouseRef} />
      </Canvas>
    </div>
  )
}
