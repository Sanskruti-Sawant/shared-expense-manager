import React, { useEffect, useRef } from 'react';

function LofiBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Generate background stars
    const generateStars = (container, count, maxTop = 60) => {
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star-bg';
        star.style.cssText = `
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          opacity: 0.3;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * maxTop}%;
          animation: twinkle ${(Math.random() * 2 + 2)}s ease-in-out infinite;
          animation-delay: ${Math.random() * 3}s;
        `;
        container.appendChild(star);
      }
    };

    if (containerRef.current) {
      const starsBg = containerRef.current.querySelector('.stars-bg');
      const windowStars = containerRef.current.querySelector('.window-stars');
      const starfield = containerRef.current.querySelector('.starfield');

      if (starsBg) generateStars(starsBg, 50, 60);
      if (windowStars) generateStars(windowStars, 30, 100);
      if (starfield) {
        for (let i = 0; i < 25; i++) {
          const star = document.createElement('div');
          star.className = 'monitor-star';
          star.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            opacity: 0.8;
            left: ${Math.random() * 100}%;
            animation: starDrift linear ${(Math.random() * 4 + 4)}s infinite;
            animation-delay: ${Math.random() * 8}s;
            box-shadow: 0 0 3px rgba(138, 92, 245, 0.8);
          `;
          starfield.appendChild(star);
        }
      }
    }

    // Mouse parallax effect
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      const nebula = containerRef.current?.querySelector('.nebula');
      if (nebula) {
        nebula.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 50%, #1a0b2e 100%)',
      }}
    >
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.8; }
        }

        @keyframes windowTwinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        @keyframes starDrift {
          from {
            transform: translateY(0px);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          to {
            transform: translateY(250px);
            opacity: 0;
          }
        }

        @keyframes nebulaDrift {
          0%, 100% { 
            background-position: 0% 0%;
            opacity: 0.8;
          }
          50% { 
            background-position: 2% 2%;
            opacity: 1;
          }
        }

        @keyframes glowFlicker {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }

        @keyframes catBreathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes tailSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }

        @keyframes leafSway {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          50% { transform: rotate(5deg) translateX(2px); }
        }

        .nebula {
          position: absolute;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(138, 92, 245, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, rgba(75, 42, 109, 0.2) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(138, 92, 245, 0.08) 0%, transparent 50%);
          animation: nebulaDrift 60s ease-in-out infinite;
        }

        .stars-bg {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .window-frame {
          position: absolute;
          top: 50px;
          right: 80px;
          width: 400px;
          height: 300px;
          border: 12px solid rgba(75, 42, 109, 0.4);
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(26, 11, 46, 0.6), rgba(45, 27, 78, 0.6));
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.7),
            inset 0 0 40px rgba(138, 92, 245, 0.1);
          z-index: 2;
        }

        .window-stars {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .bookshelf {
          position: absolute;
          top: 20%;
          right: 10%;
          width: 150px;
          height: 60%;
          background: linear-gradient(to right, rgba(26, 11, 46, 0.4), rgba(45, 27, 78, 0.3));
          border-right: 3px solid rgba(75, 42, 109, 0.3);
          z-index: 1;
        }

        .shelf {
          position: absolute;
          width: 100%;
          height: 2px;
          background: rgba(75, 42, 109, 0.2);
          border-bottom: 1px solid rgba(138, 92, 245, 0.1);
        }

        .cabinet {
          position: absolute;
          bottom: 100px;
          left: 80px;
          width: 60px;
          height: 80px;
          background: linear-gradient(135deg, #2a1550, #1a0b2e);
          border: 2px solid #3d2463;
          border-radius: 5px;
          z-index: 11;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .cabinet::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 10px;
          width: 40px;
          height: 8px;
          background: linear-gradient(to right, #4b2a6d, #3d2463);
          border-radius: 4px;
        }

        .cabinet::after {
          content: '';
          position: absolute;
          bottom: 15px;
          left: 10px;
          width: 40px;
          height: 8px;
          background: linear-gradient(to right, #4b2a6d, #3d2463);
          border-radius: 4px;
        }

        .plant-container {
          position: absolute;
          z-index: 11;
        }

        .plant-left {
          bottom: 100px;
          left: 50px;
        }

        .plant-right {
          bottom: 80px;
          right: 100px;
        }

        .pot {
          width: 50px;
          height: 45px;
          background: linear-gradient(135deg, #3d2463, #2a1550);
          border-radius: 0 0 30% 30%;
          position: relative;
          border: 2px solid #4b2a6d;
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.5);
        }

        .soil {
          position: absolute;
          bottom: 5px;
          left: 0;
          width: 100%;
          height: 12px;
          background: linear-gradient(to bottom, #4b2a6d, #3a1f52);
          border-radius: 0 0 30% 30%;
        }

        .leaf {
          position: absolute;
          background: linear-gradient(135deg, #5a3f8f, #4b2a6d);
          border-radius: 50% 0;
          transform-origin: bottom center;
          animation: leafSway 4s ease-in-out infinite;
        }

        .leaf-1 {
          top: -40px;
          left: 10px;
          width: 15px;
          height: 40px;
          animation-delay: 0s;
        }

        .leaf-2 {
          top: -35px;
          left: 25px;
          width: 15px;
          height: 35px;
          animation-delay: 0.5s;
        }

        .leaf-3 {
          top: -32px;
          right: 8px;
          width: 12px;
          height: 32px;
          animation-delay: 1s;
        }

        .cat {
          position: absolute;
          bottom: 100px;
          right: 120px;
          width: 80px;
          height: 100px;
          z-index: 12;
          animation: catBreathing 4s ease-in-out infinite;
        }

        .cat-body {
          position: absolute;
          top: 30px;
          left: 15px;
          width: 50px;
          height: 50px;
          background: #0f0620;
          border-radius: 35% 35% 40% 40%;
        }

        .cat-head {
          position: absolute;
          top: 0;
          left: 25px;
          width: 30px;
          height: 35px;
          background: #0f0620;
          border-radius: 50% 50% 45% 45%;
        }

        .cat-ear {
          position: absolute;
          width: 12px;
          height: 20px;
          background: #0f0620;
          border-radius: 50% 50% 40% 40%;
          top: -5px;
        }

        .cat-ear-left {
          left: 20px;
        }

        .cat-ear-right {
          right: 20px;
        }

        .cat-ear::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 6px;
          height: 10px;
          background: #4b2a6d;
          border-radius: 50%;
        }

        .cat-tail {
          position: absolute;
          bottom: 10px;
          right: -5px;
          width: 40px;
          height: 8px;
          background: #0f0620;
          border-radius: 50%;
          transform-origin: left center;
          animation: tailSway 3s ease-in-out infinite;
        }

        .keyboard {
          position: absolute;
          bottom: 40px;
          left: 35%;
          width: 200px;
          height: 50px;
          background: linear-gradient(to bottom, #2a1550, #1f0f3d);
          border-radius: 8px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.8),
            inset 0 0 15px rgba(138, 92, 245, 0.1);
          z-index: 11;
        }

        .monitor {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 320px;
          background: linear-gradient(135deg, #2a1550, #1a0b2e);
          border: 10px solid #3d2463;
          border-radius: 15px;
          box-shadow: 
            0 30px 70px rgba(0, 0, 0, 0.8),
            inset 0 0 30px rgba(138, 92, 245, 0.2),
            0 0 40px rgba(138, 92, 245, 0.3);
          z-index: 15;
          overflow: hidden;
        }

        .monitor::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
          z-index: 2;
        }

        .monitor-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 250px;
          background: radial-gradient(ellipse at center, rgba(138, 92, 245, 0.3) 0%, transparent 70%);
          filter: blur(30px);
          animation: glowFlicker 3s ease-in-out infinite;
          pointer-events: none;
        }

        .starfield {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .monitor-stand {
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 30px;
          background: linear-gradient(to bottom, #3d2463, #2a1550);
          border-radius: 5px;
          z-index: 14;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .desk {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 40%;
          background: linear-gradient(to bottom, rgba(26, 11, 46, 0.3), rgba(20, 8, 35, 0.8));
          z-index: 10;
        }

        @media (max-width: 1024px) {
          .monitor {
            width: 350px;
            height: 220px;
            bottom: 60px;
          }

          .monitor-glow {
            width: 280px;
            height: 180px;
          }

          .cat {
            width: 60px;
            height: 80px;
            right: 80px;
            bottom: 80px;
          }

          .window-frame {
            width: 300px;
            height: 220px;
            top: 30px;
            right: 30px;
          }
        }

        @media (max-width: 768px) {
          .monitor {
            width: 280px;
            height: 180px;
            bottom: 50px;
          }

          .window-frame {
            display: none;
          }

          .bookshelf {
            display: none;
          }

          .cat {
            width: 50px;
            height: 65px;
            right: 60px;
            bottom: 70px;
          }
        }
      `}</style>

      {/* Background nebula */}
      <div className="nebula"></div>

      {/* Background stars */}
      <div className="stars-bg"></div>

      {/* Bookshelf */}
      <div className="bookshelf">
        <div className="shelf"></div>
        <div className="shelf"></div>
        <div className="shelf"></div>
        <div className="shelf"></div>
      </div>

      {/* File cabinet */}
      <div className="cabinet"></div>

      {/* Left plant */}
      <div className="plant-container plant-left">
        <div className="pot">
          <div className="soil"></div>
          <div className="leaf leaf-1"></div>
          <div className="leaf leaf-2"></div>
          <div className="leaf leaf-3"></div>
        </div>
      </div>

      {/* Right plant */}
      <div className="plant-container plant-right">
        <div className="pot">
          <div className="soil"></div>
          <div className="leaf leaf-1"></div>
          <div className="leaf leaf-2"></div>
          <div className="leaf leaf-3"></div>
        </div>
      </div>

      {/* Cat */}
      <div className="cat">
        <div className="cat-head">
          <div className="cat-ear cat-ear-left"></div>
          <div className="cat-ear cat-ear-right"></div>
        </div>
        <div className="cat-body"></div>
        <div className="cat-tail"></div>
      </div>

      {/* Keyboard */}
      <div className="keyboard"></div>

      {/* Desk */}
      <div className="desk"></div>
    </div>
  );
}

export default LofiBackground;
