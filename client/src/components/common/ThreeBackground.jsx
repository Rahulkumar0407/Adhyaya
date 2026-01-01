import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Create floating shapes
        const shapes = [];
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0),
            new THREE.TorusGeometry(0.8, 0.3, 8, 16),
            new THREE.BoxGeometry(1, 1, 1),
        ];

        // Orange gradient material
        const material = new THREE.MeshBasicMaterial({
            color: 0xf97316,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
        });

        // Create multiple shapes - positioned to the sides
        for (let i = 0; i < 15; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const mesh = new THREE.Mesh(geometry, material.clone());

            // Random position - pushed to LEFT or RIGHT sides
            const side = i % 2 === 0 ? -1 : 1; // Alternate between left (-1) and right (1)
            mesh.position.x = side * (20 + Math.random() * 25); // Position far left or far right
            mesh.position.y = (Math.random() - 0.5) * 50;
            mesh.position.z = (Math.random() - 0.5) * 30 - 10;

            // Random scale
            const scale = Math.random() * 2 + 0.5;
            mesh.scale.set(scale, scale, scale);

            // Random rotation speed
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.01,
                },
                floatSpeed: Math.random() * 0.5 + 0.2,
                floatOffset: Math.random() * Math.PI * 2,
            };

            // Lower opacity for better content visibility
            mesh.material.opacity = Math.random() * 0.15 + 0.05;

            shapes.push(mesh);
            scene.add(mesh);
        }

        // Add some ambient particles
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Position particles on left or right sides
            const side = (i / 3) % 2 === 0 ? -1 : 1;
            positions[i] = side * (15 + Math.random() * 30); // Left or right sides
            positions[i + 1] = (Math.random() - 0.5) * 60;
            positions[i + 2] = (Math.random() - 0.5) * 40 - 10;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xf97316,
            size: 0.1,
            transparent: true,
            opacity: 0.4,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Animation
        let animationId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Rotate and float shapes
            shapes.forEach((shape) => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.rotation.z += shape.userData.rotationSpeed.z;

                // Floating motion
                shape.position.y += Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.01;
            });

            // Slowly rotate particles
            particles.rotation.y = elapsedTime * 0.02;

            renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            geometries.forEach(g => g.dispose());
            material.dispose();
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
