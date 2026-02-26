import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Home } from 'lucide-react'

const FloatingShape: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.3
    ref.current.rotation.y = clock.elapsedTime * 0.5
  })
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={ref}>
        <dodecahedronGeometry args={[1.8, 0]} />
        <MeshDistortMaterial color="#7c3aed" distort={0.3} speed={1.5} roughness={0.2} metalness={0.9} wireframe />
      </mesh>
    </Float>
  )
}

export const NotFound: React.FC = () => (
  <div className="min-h-screen dark:bg-dark-bg bg-light-bg flex flex-col items-center justify-center gap-8 px-4">
    <div className="w-full max-w-sm h-64">
      <Canvas camera={{ position: [0, 0, 5] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#7c3aed" />
        <FloatingShape />
      </Canvas>
    </div>

    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <p className="font-mono text-accent-400 text-sm tracking-widest mb-2">ERROR 404</p>
      <h1 className="font-heading font-bold text-5xl dark:text-white text-slate-900 mb-3">
        You seem lost.
      </h1>
      <p className="dark:text-slate-400 text-slate-600 mb-8 max-w-sm">
        This page doesn't exist — much like a runtime exception in production.
        Let's get you back to safety.
      </p>

      <Button
        as="a"
        href="/"
        variant="primary"
        size="lg"
        icon={<Home size={18} />}
        iconPosition="left"
      >
        Back to Home
      </Button>
    </motion.div>
  </div>
)
