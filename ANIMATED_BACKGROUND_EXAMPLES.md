# 🎨 Animated Background - Customization Examples

This file contains practical examples for customizing your animated background.

## Table of Contents
1. [Color Customization](#color-customization)
2. [Animation Speed](#animation-speed)
3. [Particle Behavior](#particle-behavior)
4. [Shape Properties](#shape-properties)
5. [Performance Tuning](#performance-tuning)
6. [Advanced Examples](#advanced-examples)

---

## Color Customization

### Example 1: Change to Blue Theme

Edit `src/components/AnimatedBackground.js`:

```javascript
// Find the colors object in createParticles() function
const colors = {
  primary: '#3b82f6',      // Blue instead of pink
  secondary: '#60a5fa',    // Light blue
  tertiary: '#93c5fd',     // Lighter blue
  dark: '#0a0015',         // Keep dark background
  accent: '#7c8fa8'        // Muted blue-gray
};

// Update shape colors too
const shapeColors = ['#3b82f6', '#60a5fa', '#93c5fd'];
```

### Example 2: Purple-Only Theme

```javascript
const colors = {
  primary: '#a855f7',      // Purple
  secondary: '#c084f7',    // Light purple
  tertiary: '#d8b4fe',     // Very light purple
  dark: '#0a0015',
  accent: '#9370be'
};
```

### Example 3: Multi-Color Rainbow Effect

```javascript
class Particle {
  constructor() {
    // ... existing code ...
    const rainbowColors = [
      '#ff0000', // Red
      '#ff7f00', // Orange
      '#ffff00', // Yellow
      '#00ff00', // Green
      '#0000ff', // Blue
      '#4b0082', // Indigo
      '#9400d3'  // Violet
    ];
    this.color = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
  }
}
```

---

## Animation Speed

### Example 1: Slower, More Relaxing Animation

```javascript
// In Particle class
class Particle {
  constructor() {
    // ... existing code ...
    // Reduce velocity by half
    this.speedX = (Math.random() - 0.5) * 0.5;  // Was 1
    this.speedY = (Math.random() - 0.5) * 0.5;  // Was 1
  }
}

// In FloatingShape class
class FloatingShape {
  constructor() {
    // ... existing code ...
    // Slower movement
    this.speedX = (Math.random() - 0.5) * 0.15;  // Was 0.3
    this.speedY = (Math.random() - 0.5) * 0.15;  // Was 0.3
    this.rotationSpeed = (Math.random() - 0.5) * 0.01;  // Was 0.02
  }
}
```

### Example 2: Fast, Energetic Animation

```javascript
class Particle {
  constructor() {
    // ... existing code ...
    // Double the velocity
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
  }
}

class FloatingShape {
  constructor() {
    // ... existing code ...
    this.speedX = (Math.random() - 0.5) * 0.6;  // Was 0.3
    this.speedY = (Math.random() - 0.5) * 0.6;  // Was 0.3
    this.rotationSpeed = (Math.random() - 0.5) * 0.04;  // Was 0.02
  }
}
```

### Example 3: Stop Movement, Only Rotation

```javascript
class FloatingShape {
  constructor() {
    // ... existing code ...
    this.speedX = 0;  // No horizontal movement
    this.speedY = 0;  // No vertical movement
    this.rotationSpeed = (Math.random() - 0.5) * 0.03;  // Keep rotation
  }
}
```

---

## Particle Behavior

### Example 1: Add Pulsing Effect to Particles

```javascript
class Particle {
  constructor() {
    // ... existing code ...
    this.originalSize = this.size;
    this.pulse = 0;
    this.pulseSpeed = (Math.random() - 0.5) * 0.1;
  }

  update() {
    // ... existing code ...
    this.pulse += this.pulseSpeed;
    this.size = this.originalSize + Math.sin(this.pulse) * 0.5;
  }
}
```

### Example 2: Increase Particle Count for Dense Effect

```javascript
// In createParticles() function
const particleCount = 200;  // Was 100

// Create more particles
for (let i = 0; i < particleCount * 3; i += 3) {
  // ... existing code ...
}
```

### Example 3: Vary Particle Starting Opacity

```javascript
class Particle {
  constructor() {
    // ... existing code ...
    // Use full range of opacity (0.1 to 0.9)
    this.opacity = Math.random() * (0.9 - 0.1) + 0.1;  // Was 0.6
  }
}
```

---

## Shape Properties

### Example 1: Only Circles, No Other Shapes

```javascript
class FloatingShape {
  constructor() {
    // ... existing code ...
    this.type = 'circle';  // Force circles only
  }

  draw() {
    // ... existing code (remove switch statement) ...
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### Example 2: Much Larger, More Visible Shapes

```javascript
class FloatingShape {
  constructor() {
    // ... existing code ...
    this.size = Math.random() * 80 + 60;  // Was 20-60
  }
}

// In init()
for (let i = 0; i < 12; i++) {  // More shapes too
  this.shapes.push(new FloatingShape());
}
```

### Example 3: Shapes with Glow Effect

```javascript
// In draw() method
ctx.shadowColor = this.color;
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// Then draw the shape
switch (this.type) {
  // ... existing code ...
}

ctx.shadowBlur = 0;  // Reset glow
```

---

## Performance Tuning

### Example 1: Ultra-Low Performance (Mobile Optimization)

```javascript
// Reduce everything
const particleCount = 30;  // Was 100

// Fewer shapes
for (let i = 0; i < 3; i++) {  // Was 8
  shapes.push(new FloatingShape());
}

// Less frequent redraw
const skipFrames = 2;  // Render every 2nd frame
if (time % skipFrames !== 0) continue;
```

### Example 2: High Performance (Desktop)

```javascript
const particleCount = 200;  // More particles

for (let i = 0; i < 15; i++) {  // More shapes
  shapes.push(new FloatingShape());
}

// Add more visual effects
// Grid density increased
const gridSize = 50;  // Was 100
```

### Example 3: Detect Device and Adapt

```javascript
function initializeBackground() {
  let particleCount = 50;

  // Detect device
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    particleCount = 25;  // Mobile
  } else if (window.devicePixelRatio > 1.5) {
    particleCount = 100;  // High-end device
  }

  // Use particleCount when creating particles
}
```

---

## Advanced Examples

### Example 1: Add Sound Reactivity (Audio Visualization)

```javascript
// Add audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

// Modify particle behavior based on audio
class Particle {
  update(frequencyData) {
    // ... existing code ...
    const frequency = frequencyData[Math.floor(Math.random() * frequencyData.length)];
    this.speedX *= (frequency / 128);  // Modulate speed by audio
  }
}
```

### Example 2: Mouse Interaction - Repel Particles

```javascript
// Track mouse position
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// In Particle update()
class Particle {
  update() {
    // ... existing code ...
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 100) {
      // Repel particles near cursor
      this.speedX += (dx / distance) * 0.5;
      this.speedY += (dy / distance) * 0.5;
    }
  }
}
```

### Example 3: Time-Based Color Change

```javascript
// Colors change throughout the day
function getTimeBasedColor() {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // Morning: Orange/Yellow
    return '#f97316';
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: Pink (current)
    return '#c084a8';
  } else if (hour >= 18 && hour < 21) {
    // Evening: Purple
    return '#a855f7';
  } else {
    // Night: Blue
    return '#3b82f6';
  }
}
```

### Example 4: Interactive Shape Clicking

```javascript
// Detect shape clicks
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  shapes.forEach(shape => {
    const distance = Math.sqrt(
      Math.pow(clickX - shape.x, 2) + Math.pow(clickY - shape.y, 2)
    );

    if (distance < shape.size) {
      // Explode or transform shape
      shape.size *= 0.5;  // Shrink
      shape.speedX *= 2;  // Speed up
    }
  });
});
```

### Example 5: Add Grid Lines with Perspective

```javascript
// 3D perspective grid
const gridSize = 50;
const perspective = 400;

for (let x = -canvas.width; x < canvas.width * 2; x += gridSize) {
  for (let y = -canvas.height; y < canvas.height * 2; y += gridSize) {
    // Apply perspective calculation
    const scale = perspective / (perspective + y);
    const screenX = x * scale;
    const screenY = y * scale;

    ctx.strokeStyle = `rgba(192, 132, 168, ${0.05 * scale})`;
    ctx.lineWidth = 1;
    // Draw perspective grid lines
  }
}
```

---

## Quick Copy-Paste Snippets

### Slow & Serene (Best for Professional)
```javascript
this.speedX = (Math.random() - 0.5) * 0.4;
this.speedY = (Math.random() - 0.5) * 0.4;
this.opacity = Math.random() * 0.3 + 0.4;  // More visible
this.color = '#c084a8';  // Stick to one color
```

### Fast & Energetic (Best for Marketing)
```javascript
this.speedX = (Math.random() - 0.5) * 1.5;
this.speedY = (Math.random() - 0.5) * 1.5;
this.opacity = Math.random() * 0.7 + 0.3;
```

### Minimal & Clean (Best for Minimal Design)
```javascript
const particleCount = 20;
for (let i = 0; i < 3; i++) { shapes.push(...) }  // Few shapes
this.opacity = Math.random() * 0.2 + 0.1;  // Very subtle
```

---

## Debugging

### Monitor Performance
```javascript
// Add to animate function
const now = performance.now();
console.log(`FPS: ${1000 / (now - lastTime)}`);
```

### Visualize Particle Movement
```javascript
particles.forEach(p => {
  // Draw velocity vectors
  ctx.strokeStyle = 'red';
  ctx.begintPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + p.vx * 10, p.y + p.vy * 10);
  ctx.stroke();
});
```

---

## Need Help?

- Check `ANIMATED_BACKGROUND_GUIDE.md` for setup
- Review `AnimatedBackground.js` source code
- Test in browser DevTools console
- Compare with original values if something breaks

Happy customizing! 🎨
