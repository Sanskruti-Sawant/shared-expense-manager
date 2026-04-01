/**
 * Animated Background GIF Generator
 * This utility captures the animated background canvas and exports it as an animated GIF
 * 
 * Usage:
 * 1. Import and call captureAndExportGif() from your component
 * 2. Alternatively use the HTML tool (AnimatedBackgroundGifGenerator.html) in a browser
 */

export class AnimatedBackgroundGifGenerator {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = {
      width: options.width || 1920,
      height: options.height || 1080,
      duration: options.duration || 4000, // Total animation duration in ms
      frameRate: options.frameRate || 30, // Frames per second
      quality: options.quality || 10, // Image quality 1-30
      ...options
    };
    this.frames = [];
  }

  /**
   * Capture frames from canvas animation
   * @param {Function} animationCallback - Function that draws one frame
   * @returns {Promise<Uint8ClampedArray[]>}
   */
  async captureFrames(animationCallback) {
    const frameCount = Math.ceil(
      (this.options.duration / 1000) * this.options.frameRate
    );
    const frameDelay = 1000 / this.options.frameRate;

    console.log(
      `Capturing ${frameCount} frames at ${this.options.frameRate} FPS...`
    );

    for (let i = 0; i < frameCount; i++) {
      // Call animation callback
      animationCallback(i / frameCount);

      // Get image data
      const imageData = this.canvas.getContext('2d').getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      this.frames.push({
        data: imageData,
        delay: Math.round(frameDelay)
      });

      // Progress callback
      const progress = ((i + 1) / frameCount) * 100;
      console.log(`Frame ${i + 1}/${frameCount} (${progress.toFixed(1)}%)`);

      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return this.frames;
  }

  /**
   * Export frames as GIF
   * Requires gif.js library
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Blob>}
   */
  async exportAsGif(onProgress) {
    if (!window.GIF) {
      throw new Error(
        'gif.js library not found. Please include it in your HTML: <script src="https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js"></script>'
      );
    }

    return new Promise((resolve, reject) => {
      const gif = new window.GIF({
        workers: 4,
        quality: this.options.quality,
        width: this.options.width,
        height: this.options.height,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
      });

      // Add frames
      this.frames.forEach((frame, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(frame.data, 0, 0);

        gif.addFrame(canvas, { delay: frame.delay });

        if (onProgress) {
          onProgress((index + 1) / this.frames.length);
        }
      });

      gif.on('finished', function (blob) {
        resolve(blob);
      });

      gif.on('error', function (error) {
        reject(error);
      });

      gif.render();
    });
  }

  /**
   * Download GIF to user's computer
   * @param {Blob} gifBlob
   * @param {String} filename
   */
  downloadGif(gifBlob, filename = 'animated-background.gif') {
    const url = URL.createObjectURL(gifBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get GIF as data URL
   * @param {Blob} gifBlob
   * @returns {String}
   */
  getBlobAsDataUrl(gifBlob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(gifBlob);
    });
  }

  /**
   * Simplified method: Capture and export in one call
   * @param {Function} animationCallback
   * @param {Function} onProgress
   * @returns {Promise<Blob>}
   */
  async captureAndExport(animationCallback, onProgress) {
    await this.captureFrames(animationCallback);
    return this.exportAsGif(onProgress);
  }
}

/**
 * Helper function to capture currently playing background animation
 * @param {HTMLCanvasElement} canvasElement
 * @param {Object} options
 * @returns {Promise<Blob>}
 */
export async function captureBackgroundAsGif(canvasElement, options = {}) {
  const ctx = canvasElement.getContext('2d');
  const generator = new AnimatedBackgroundGifGenerator(canvasElement, options);

  // Simulate the animation by replaying what would be drawn
  // This is a placeholder - you'll need to modify based on your actual animation code
  const animationCallback = (progress) => {
    // This would need to be implemented with your actual animation logic
    ctx.fillStyle = '#0a0015';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  };

  return generator.captureAndExport(animationCallback);
}

export default AnimatedBackgroundGifGenerator;
