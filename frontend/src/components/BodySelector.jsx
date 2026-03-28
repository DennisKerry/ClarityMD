import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

const SKIN_COLOR = '#e8d5c4';
const DEFAULT_JOINT_COLOR = '#e7ebf0';
const HOVER_COLOR = '#0066CC';
const SELECTED_COLOR = '#003087';

const JOINT_HOTSPOTS = [
  { joint: 'Knee', side: 'left', position: [-0.3, -1.2, 0] },
  { joint: 'Knee', side: 'right', position: [0.3, -1.2, 0] },
  { joint: 'Shoulder', side: 'left', position: [-0.6, 0.6, 0] },
  { joint: 'Shoulder', side: 'right', position: [0.6, 0.6, 0] },
  { joint: 'Hip', side: 'left', position: [-0.3, -0.3, 0] },
  { joint: 'Hip', side: 'right', position: [0.3, -0.3, 0] },
  { joint: 'Ankle', side: 'left', position: [-0.3, -2.1, 0] },
  { joint: 'Ankle', side: 'right', position: [0.3, -2.1, 0] },
  { joint: 'Elbow', side: 'left', position: [-0.9, 0.1, 0] },
  { joint: 'Elbow', side: 'right', position: [0.9, 0.1, 0] },
];

function JointHotspot({ hotspot, selectedJoint, onJointSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedJoint === hotspot.joint;

  const color = isSelected ? SELECTED_COLOR : isHovered ? HOVER_COLOR : DEFAULT_JOINT_COLOR;
  const emissiveIntensity = isSelected ? 1.0 : isHovered ? 0.6 : 0.2;
  const opacity = isSelected ? 1 : 0.65;
  const scale = isSelected ? 1.3 : 1;

  return (
    <group>
      <mesh
        position={hotspot.position}
        scale={[scale, scale, scale]}
        onPointerOver={(event) => {
          event.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setIsHovered(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onJointSelect(hotspot.joint);
        }}
      >
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
      <Text
        position={[
          hotspot.position[0] + (hotspot.side === 'left' ? -0.18 : 0.18),
          hotspot.position[1] + 0.12,
          hotspot.position[2] + 0.02,
        ]}
        fontSize={0.09}
        color={isSelected ? '#ffffff' : '#2C3E50'}
        anchorX={hotspot.side === 'left' ? 'right' : 'left'}
        anchorY="middle"
        fontWeight={isSelected ? 'bold' : 'normal'}
      >
        {hotspot.joint}
      </Text>
    </group>
  );
}

function AnatomicalBody({ selectedJoint, onJointSelect }) {
  const hotspots = useMemo(() => JOINT_HOTSPOTS, []);

  return (
    <group>
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.7} />
      </mesh>

      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 1.0, 0.3]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.75} />
      </mesh>

      <mesh position={[-0.75, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.55, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>
      <mesh position={[0.75, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.55, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>

      <mesh position={[-0.95, -0.25, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.8, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>
      <mesh position={[0.95, -0.25, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.8, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>

      <mesh position={[-0.3, -0.75, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.95, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>
      <mesh position={[0.3, -0.75, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.95, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>

      <mesh position={[-0.3, -1.65, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.9, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>
      <mesh position={[0.3, -1.65, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.9, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.72} />
      </mesh>

      {hotspots.map((hotspot) => (
        <JointHotspot
          key={`${hotspot.joint}-${hotspot.side}`}
          hotspot={hotspot}
          selectedJoint={selectedJoint}
          onJointSelect={onJointSelect}
        />
      ))}
    </group>
  );
}

export default function BodySelector({ selectedJoint, onJointSelect }) {
  return (
    <div style={{ width: '100%', height: '420px' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        onCreated={({ gl, events }) => {
          events.connect(gl.domElement);
          gl.domElement.style.touchAction = 'pan-y';
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={1} />

        <AnatomicalBody selectedJoint={selectedJoint} onJointSelect={onJointSelect} />

        <OrbitControls makeDefault enableRotate enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
