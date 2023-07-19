// Forked from https://codesandbox.io/s/building-live-envmaps-lwo219
import { scroll } from 'motion'
import { interpolate } from '@motionone/utils'
import { cubicBezier } from '@motionone/easing'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, applyProps, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Float, useGLTF, BakeShadows, ContactShadows } from '@react-three/drei'
import { LayerMaterial, Base, Depth } from 'lamina'

export const App = () => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [-10, 0, 15], fov: 30 }}>
    <Porsche scale={1.6} position={[-0.5, -0.18, 0]} rotation={[0, Math.PI / 5, 0]} />
    <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} castShadow intensity={2} shadow-bias={-0.0001} />
    <ambientLight intensity={0.2} />
    <ContactShadows resolution={1024} frames={1} position={[0, -1.16, 0]} scale={10} blur={3} opacity={1} far={10} />

    {/* Renders contents "live" into a HDRI environment (scene.environment). */}
    <Environment frames={Infinity} resolution={256}>
      {/* Ceiling */}
      <Lightformer intensity={0.75} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
      <MovingSpots />
      {/* Sides */}
      <Lightformer intensity={4} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.1, 1]} />
      <Lightformer rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
      <Lightformer rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1, 1]} />
      {/* Accent (red) */}
      <Float speed={5} floatIntensity={2} rotationIntensity={2}>
        <Lightformer form="ring" color="#ff1231" intensity={1} scale={10} position={[-15, 4, -18]} target={[0, 0, 0]} />
      </Float>
      {/* Background */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 64, 64]} />
        <LayerMaterial side={THREE.BackSide}>
          <Base color="#444" alpha={1} mode="normal" />
          <Depth colorA="#0d63f8" colorB="black" alpha={0.5} mode="normal" near={0} far={300} origin={[100, 100, 100]} />
        </LayerMaterial>
      </mesh>
    </Environment>

    <BakeShadows />
    <CameraRig />
  </Canvas>
)

function Porsche(props) {
  const { scene, nodes, materials } = useGLTF('/911-transformed.glb')
  useMemo(() => {
    Object.values(nodes).forEach((node) => node.isMesh && (node.receiveShadow = node.castShadow = true))
    applyProps(materials.rubber, { color: '#222', roughness: 0.6, roughnessMap: null, normalScale: [4, 4] })
    applyProps(materials.window, { color: 'black', roughness: 0, clearcoat: 0.1 })
    applyProps(materials.coat, { envMapIntensity: 4, roughness: 0.5, metalness: 1 })
    applyProps(materials.paint, { roughness: 0.5, metalness: 0.8, color: '#555', envMapIntensity: 2 })
  }, [nodes, materials])
  return <primitive object={scene} {...props} />
}

function CameraRig({ v = new THREE.Vector3() }) {
  const { camera } = useThree()
  useEffect(() => {
    const radius = interpolate([10, 5, 10], [0, 0.5, 1], cubicBezier(0.5, 0, 0.3, 0.98))

    return scroll((info) => {
      const p = info.y.progress
      camera.position.set(Math.sin(p * Math.PI * 2) * radius(p), 0, Math.cos(p * Math.PI * 2) * radius(p))
      camera.lookAt(0, 0, 0)
    })
  }, [])
  return null
}

function MovingSpots({ positions = [2, 0, 2, 0, 2, 0, 2, 0] }) {
  const group = useRef()
  useFrame((state, delta) => (group.current.position.z += delta * 15) > 60 && (group.current.position.z = -60))
  return (
    <group rotation={[0, 0.5, 0]}>
      <group ref={group}>
        {positions.map((x, i) => (
          <Lightformer form="circle" intensity={4} rotation={[Math.PI / 2, 0, 0]} position={[x, 4, i * 4]} scale={[3, 1, 1]} />
        ))}
      </group>
    </group>
  )
}
