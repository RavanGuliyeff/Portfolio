import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createCodeScreen, TOTAL_CHARS } from './codeTexture'
import { useTheme } from '@/theme/ThemeProvider'

const BASE = { w: 3.3, d: 2.2, h: 0.1 }
const LID = { w: 3.3, h: 2.15, d: 0.07 }
const SCREEN = { w: 3.0, h: 1.875 }
const LID_TILT = -0.26 // radians back from vertical
const BEVEL = 0.012
const TOP = BASE.h / 2 + BEVEL // top surface of the base
const FRONT = LID.d / 2 + BEVEL // front surface of the lid

/** A box with rounded vertical edges, extruded from a 2D outline. */
function roundedSlab(w: number, d: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -d / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + d - r)
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  s.lineTo(x + r, y + d)
  s.quadraticCurveTo(x, y + d, x, y + d - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 2,
    curveSegments: 8,
  })
  geo.center()
  return geo
}

function useKeyLayout() {
  return useMemo(() => {
    const keys: { x: number; z: number; w: number }[] = []
    const rows = [
      { z: -0.62, n: 14 },
      { z: -0.44, n: 14 },
      { z: -0.26, n: 13 },
      { z: -0.08, n: 12 },
    ]
    const gap = 0.03
    const total = 2.7
    for (const row of rows) {
      const kw = (total - gap * (row.n - 1)) / row.n
      for (let i = 0; i < row.n; i++) keys.push({ x: -total / 2 + kw / 2 + i * (kw + gap), z: row.z, w: kw })
    }
    keys.push({ x: 0, z: 0.1, w: 1.3 }) // space bar
    return keys
  }, [])
}

function Keyboard({ color }: { color: string }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const keys = useKeyLayout()

  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    keys.forEach((k, i) => {
      m.compose(
        new THREE.Vector3(k.x, TOP + 0.006, k.z),
        new THREE.Quaternion(),
        new THREE.Vector3(k.w, 1, 1)
      )
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [keys])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, keys.length]}>
      <boxGeometry args={[1, 0.02, 0.15]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </instancedMesh>
  )
}

function Screen() {
  const screen = useMemo(() => createCodeScreen(), [])
  useEffect(() => () => screen.dispose(), [screen])

  useFrame(({ clock }) => {
    // Type for ~8s, hold for 4s, then start over.
    const cycle = 12
    const t = clock.elapsedTime % cycle
    const typed = Math.min(TOTAL_CHARS, Math.floor((t / 8) * TOTAL_CHARS))
    const blink = Math.floor(clock.elapsedTime * 2) % 2 === 0
    screen.draw(typed, blink)
  })

  return (
    <mesh position={[0, LID.h / 2, FRONT + 0.002]}>
      <planeGeometry args={[SCREEN.w, SCREEN.h]} />
      <meshBasicMaterial map={screen.texture} toneMapped={false} />
    </mesh>
  )
}

function ContactShadow() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, 'rgba(0,0,0,0.55)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -TOP - 0.01, 0.1]} scale={[5.2, 3.6, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

function Laptop({ dark }: { dark: boolean }) {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const baseGeo = useMemo(() => roundedSlab(BASE.w, BASE.d, BASE.h, 0.12), [])
  const lidGeo = useMemo(() => roundedSlab(LID.w, LID.h, LID.d, 0.12), [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(({ clock }, delta) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    const ease = 1 - Math.exp(-delta * 3) // frame-rate independent smoothing
    g.rotation.y += (-0.34 + pointer.current.x * 0.2 - g.rotation.y) * ease
    g.rotation.x += (pointer.current.y * 0.06 - g.rotation.x) * ease
    g.position.y = Math.sin(t * 0.9) * 0.04
  })

  const body = dark ? '#4a4a57' : '#c9c9d2'
  const deck = dark ? '#34343e' : '#b7b7c2'
  const keys = dark ? '#16161b' : '#2a2a31'

  return (
    <group ref={group}>
      {/* Base */}
      <mesh geometry={baseGeo} rotation-x={Math.PI / 2}>
        <meshStandardMaterial color={body} metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, TOP + 0.001, -0.25]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.86, 0.98]} />
        <meshStandardMaterial color={deck} roughness={0.8} />
      </mesh>
      <Keyboard color={keys} />
      <mesh position={[0, TOP + 0.001, 0.62]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.15, 0.62]} />
        <meshStandardMaterial color={deck} roughness={0.45} metalness={0.2} />
      </mesh>

      {/* Lid, hinged at the back edge of the base */}
      <group position={[0, TOP, -BASE.d / 2 + 0.06]} rotation-x={LID_TILT}>
        <mesh geometry={lidGeo} position={[0, LID.h / 2, 0]}>
          <meshStandardMaterial color={body} metalness={0.55} roughness={0.38} />
        </mesh>
        <mesh position={[0, LID.h / 2, FRONT + 0.001]}>
          <planeGeometry args={[LID.w - 0.12, LID.h - 0.12]} />
          <meshStandardMaterial color="#050507" roughness={0.25} />
        </mesh>
        <Screen />
      </group>

      <ContactShadow />
    </group>
  )
}

export default function LaptopScene() {
  const wrapper = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const { isDark } = useTheme()

  // Stop rendering entirely while the hero is scrolled out of view.
  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={wrapper}
      className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
    >
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.5, 7.9], fov: 34 }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.62, 0)
          setReady(true)
        }}
      >
        <hemisphereLight args={[isDark ? '#d6d2ff' : '#ffffff', isDark ? '#15151c' : '#d4d4dc', isDark ? 1.9 : 1.8]} />
        <directionalLight position={[3, 5, 4]} intensity={isDark ? 2.6 : 2.4} />
        <directionalLight position={[-4, 2, 3]} intensity={isDark ? 0.8 : 0.6} color="#c7d2fe" />
        <pointLight position={[-2.5, 2.2, -1.5]} intensity={18} color="#7c6cff" />
        <pointLight position={[0, 1.2, 2.2]} intensity={3} color="#a79dff" />
        <Laptop dark={isDark} />
      </Canvas>
    </div>
  )
}
