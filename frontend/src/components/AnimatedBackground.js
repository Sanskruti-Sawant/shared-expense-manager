import React, { useEffect, useRef } from 'react';
import '../styles/AnimatedBackground.css';

function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color palette matching the theme
    const colors = {
      primary: '#c084a8',
      secondary: '#e8c4d4',
      tertiary: '#d8b3d0',
      dark: '#0a0015',
      accent: '#a89aad'
    };

    // Particle system for floating elements
    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1;
        this.speedY = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = [colors.primary, colors.secondary, colors.tertiary][
          Math.floor(Math.random() * 3)
        ];
        this.life = Math.random() * 40 + 20;
        this.maxLife = this.life;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = (this.life / this.maxLife) * 0.6;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Connection lines between particles
    const connections = [];
    const connectionDistance = 150;

    // Draw gradient background
    const createGradient = () => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(192, 132, 168, 0.1)');
      gradient.addColorStop(0.5, 'rgba(152, 100, 128, 0.05)');
      gradient.addColorStop(1, 'rgba(10, 0, 21, 0)');
      return gradient;
    };

    // Geometric shapes for visual interest
    const shapes = [];
    class FloatingShape {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.rotation = Math.random() * Math.PI * 2;
        this.size = Math.random() * 40 + 20;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.type = Math.floor(Math.random() * 3);
        this.opacity = 0.15;
        this.color = [colors.primary, colors.secondary, colors.tertiary][
          Math.floor(Math.random() * 3)
        ];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Wrap around
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;

        switch (this.type) {
          case 0: // Circle
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 1: // Square
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            break;
          case 2: // Triangle
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(this.size / 2, this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.closePath();
            ctx.fill();
            break;
        }

        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    for (let i = 0; i < 8; i++) {
      shapes.push(new FloatingShape());
    }

    // Animation loop
    let time = 0;
    const animate = () => {
      time++;

      // Clear canvas with gradient
      ctx.fillStyle = colors.dark;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient overlay
      ctx.fillStyle = createGradient();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update shapes
      shapes.forEach((shape) => {
        shape.update();
        shape.draw();
      });

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        // Regenerate dead particles
        if (particle.life <= 0) {
          particles[index] = new Particle();
        }
      });

      // Draw connections between particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.strokeStyle = colors.primary;
            ctx.globalAlpha = (1 - distance / connectionDistance) * 0.2;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      // Draw grid overlay (subtle)
      const gridSize = 100;
      ctx.strokeStyle = `rgba(192, 132, 168, 0.03)`;
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="animated-background"
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

export default AnimatedBackground;
