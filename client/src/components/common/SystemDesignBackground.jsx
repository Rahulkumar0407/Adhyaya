import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SystemDesignBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create floating tech shapes
        const shapes = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TorusGeometry(0.8, 0.2, 8, 24),
            new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8),
            new THREE.DodecahedronGeometry(1, 0),
            new THREE.ConeGeometry(0.8, 1.5, 6),
        ];

        // Blue/Purple gradient materials
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.25 }),
            new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.25 }),
            new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.2 }),
            new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.2 }),
        ];

        // Create shapes spread across the scene
        for (let i = 0; i < 20; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)].clone();
            const mesh = new THREE.Mesh(geometry, material);

            // Position throughout the scene
            const angle = (i / 20) * Math.PI * 2;
            const radius = 15 + Math.random() * 30;
            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.y = (Math.random() - 0.5) * 40;
            mesh.position.z = (Math.random() - 0.5) * 30 - 15;

            // Random scale
            const scale = Math.random() * 2.5 + 0.8;
            mesh.scale.set(scale, scale, scale);

            // Random rotation speed
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.015,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.01,
                },
                floatSpeed: Math.random() * 0.4 + 0.2,
                floatOffset: Math.random() * Math.PI * 2,
                orbitSpeed: (Math.random() - 0.5) * 0.001,
                orbitRadius: radius,
                orbitAngle: angle,
            };

            shapes.push(mesh);
            scene.add(mesh);
        }

        // Particle system for nodes
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 150;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x3b82f6);
        const color2 = new THREE.Color(0x8b5cf6);
        const color3 = new THREE.Color(0x06b6d4);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 60;
            positions[i + 2] = (Math.random() - 0.5) * 50 - 20;

            const colorChoice = Math.random();
            const chosenColor = colorChoice < 0.33 ? color1 : colorChoice < 0.66 ? color2 : color3;
            colors[i] = chosenColor.r;
            colors[i + 1] = chosenColor.g;
            colors[i + 2] = chosenColor.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Animation
        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            shapes.forEach((shape) => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.rotation.z += shape.userData.rotationSpeed.z;
                shape.position.y += Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.015;
                shape.userData.orbitAngle += shape.userData.orbitSpeed;
                shape.position.x = Math.cos(shape.userData.orbitAngle) * shape.userData.orbitRadius;
            });

            particles.rotation.y = elapsedTime * 0.015;
            particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            geometries.forEach(g => g.dispose());
            materials.forEach(m => m.dispose());
            particleGeometry.dispose();
            particleMaterial.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
