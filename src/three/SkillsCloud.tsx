import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ALL_SKILLS } from '@/constants/portfolio'

interface TagProps {
  text: string
  position: [number, number, number]
  mouse: React.MutableRefObject<[number, number]>
  index: number
}

const Tag: React.FC<TagProps> = ({ text, position, mouse, index }) => {
  const ref  = useRef<THREE.Group>(null)
  const { size } = useThree()

  useFrame(state => {
    if (!ref.current) return
    const t = state.clock.elapsedTime + index * 0.3
    const mx = (mouse.current[0] / size.width  - 0.5) * 2
    const my = -(mouse.current[1] / size.height - 0.5) * 2

    ref.current.position.x = position[0] * Math.cos(t * 0.2) - position[2] * Math.sin(t * 0.2) + mx * 0.3
    ref.current.position.y = position[1] + Math.sin(t * 0.4 + index) * 0.2 + my * 0.3
    ref.current.position.z = position[0] * Math.sin(t * 0.2) + position[2] * Math.cos(t * 0.2)

    // Face camera
    const dist  = Math.abs(ref.current.position.z)
    const scale = Math.max(0.4, 1 - dist * 0.06)
    ref.current.scale.setScalar(scale)
  })

  return (
    <group ref={ref} position={position}>
      <Text
        fontSize={0.22}
        color={`hsl(${(index * 17) % 360}, 70%, 75%)`}
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
      >
        {text}
      </Text>
    </group>
  )
}

const Cloud: React.FC<{ mouse: React.MutableRefObject<[number, number]> }> = ({ mouse }) => {
  const positions = useMemo<[number, number, number][]>(() => {
    return ALL_SKILLS.map((_, i) => {
      const phi   = Math.acos(-1 + (2 * i) / ALL_SKILLS.length)
      const theta = Math.sqrt(ALL_SKILLS.length * Math.PI) * phi
      const r = 3.2
      return [
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]
    })
  }, [])

  return (
    <>
      {ALL_SKILLS.map((skill, i) => (
        <Tag key={skill} text={skill} position={positions[i]} mouse={mouse} index={i} />
      ))}
    </>
  )
}

export const SkillsCloud: React.FC = () => {
  const reduced  = usePrefersReducedMotion()
  const mouseRef = useRef<[number, number]>([0, 0])

  if (reduced) {
    return (
      <div className="flex flex-wrap gap-2 justify-center p-6">
        {ALL_SKILLS.map(s => (
          <span key={s} className="tech-badge">{s}</span>
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full h-[380px]"
      onMouseMove={e => { mouseRef.current = [e.clientX, e.clientY] }}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} gl={{ alpha: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <Cloud mouse={mouseRef} />
      </Canvas>
    </div>
  )
}
