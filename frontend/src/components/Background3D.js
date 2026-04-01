import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Background3D() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const geometriesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0015);

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 3;
    cameraRef.current = camera;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0a0015, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xc084a8, 1.5);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe8c4d4, 1);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Create floating geometric shapes
    const createFloatingShape = (type, position, color, scale) => {
      let geometry;
      
      switch (type) {
        case 'sphere':
          geometry = new THREE.IcosahedronGeometry(scale, 5);
          break;
        case 'cube':
          geometry = new THREE.BoxGeometry(scale, scale, scale);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(scale, scale * 0.4, 8, 100);
          break;
        case 'pyramid':
          geometry = new THREE.TetrahedronGeometry(scale);
          break;
        default:
          geometry = new THREE.OctahedronGeometry(scale);
      }

      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: new THREE.Color(color).multiplyScalar(0.3),
        wireframe: false,
        shininess: 100,
        transparent: true,
        opacity: 0.7
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.userData = {
        velocity: [
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        ],
        rotationSpeed: [
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        ],
        originalPosition: [...position]
      };

      scene.add(mesh);
      geometriesRef.current.push(mesh);
      return mesh;
    };

    // Create floating particles (representing shared expenses/collaboration)
    const createParticles = () => {
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 100;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xc084a8,
        size: 0.05,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
      particlesRef.current = particles;
    };

    // Create animated background shapes representing collaboration
    createFloatingShape('sphere', [0, 1.5, 0], 0xc084a8, 0.3);
    createFloatingShape('cube', [-1.5, -0.5, -0.5], 0xe8c4d4, 0.25);
    createFloatingShape('torus', [1.5, 0.5, -1], 0xd8b3d0, 0.35);
    createFloatingShape('pyramid', [0, -1, -0.3], 0xc084a8, 0.3);
    createFloatingShape('sphere', [-1, 1, -1], 0xe8c4d4, 0.2);
    createFloatingShape('cube', [1, -1, 0.5], 0xd8b3d0, 0.2);

    createParticles();

    // Create gradient background overlay
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 45);
    gradient.addColorStop(0, 'rgba(192, 132, 168, 0.15)');
    gradient.addColorStop(1, 'rgba(10, 0, 21, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const bgGeometry = new THREE.PlaneGeometry(10, 10);
    const bgMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.position.z = -5;
    scene.add(bgMesh);

    // Animation loop
    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth mouse tracking
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      // Update geometries
      geometriesRef.current.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotationSpeed[0];
        mesh.rotation.y += mesh.userData.rotationSpeed[1];
        mesh.rotation.z += mesh.userData.rotationSpeed[2];

        mesh.position.x += mesh.userData.velocity[0];
        mesh.position.y += mesh.userData.velocity[1];
        mesh.position.z += mesh.userData.velocity[2];

        // Boundary wrapping
        const bounds = 3;
        if (Math.abs(mesh.position.x) > bounds)
          mesh.userData.velocity[0] *= -1;
        if (Math.abs(mesh.position.y) > bounds)
          mesh.userData.velocity[1] *= -1;
        if (Math.abs(mesh.position.z) > bounds)
          mesh.userData.velocity[2] *= -1;

        // Mouse interaction
        mesh.position.x += mouse.x * 0.01;
        mesh.position.y += mouse.y * 0.01;
      });

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.0001;
        particlesRef.current.rotation.y += 0.0002;
      }

      // Rotate lights around
      pointLight1.position.x = Math.sin(Date.now() * 0.0005) * 5;
      pointLight1.position.y = Math.cos(Date.now() * 0.0004) * 5;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}

export default Background3D;
