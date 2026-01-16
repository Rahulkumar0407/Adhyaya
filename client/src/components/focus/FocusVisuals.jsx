import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const BreathingOrb = ({ color }) => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Breathing animation: Scale pulses gently
        const scale = 1 + Math.sin(time * 0.5) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);

        // Gentle rotation
        meshRef.current.rotation.y += 0.002;
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.5, 64, 64]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.4}
                    metalness={0.1}
                    emissive={color}
                    emissiveIntensity={0.2}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </Float>
    );
};

const BackgroundParticles = ({ count = 200, color }) => {
    return (
        <Sparkles
            count={count}
            scale={12}
            size={4}
            speed={0.4}
            opacity={0.5}
            color={color}
        />
    );
};

const Scene = ({ sessionType }) => {
    // Determine color based on session type
    const color = useMemo(() => {
        switch (sessionType) {
            case 'coding': return '#10b981'; // Emerald
            case 'study': return '#6366f1';  // Indigo
            case 'revision': return '#f59e0b'; // Amber
            case 'interview-prep': return '#ec4899'; // Pink
            default: return '#3b82f6'; // Blue
        }
    }, [sessionType]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color={color} />

            <BreathingOrb color={color} />
            <BackgroundParticles color={color} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Fog for depth */}
            <fog attach="fog" args={['#050505', 5, 20]} />
        </>
    );
};

const FocusVisuals = ({ sessionType = 'general', enabled = true }) => {
    if (!enabled) return null;

    return (
        <div className="absolute inset-0 z-0 opacity-60 transition-opacity duration-1000">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <Scene sessionType={sessionType} />
            </Canvas>
        </div>
    );
};

export default FocusVisuals;
