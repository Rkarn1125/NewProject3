/**
 * Camera Stream & Image Input Module
 * Handles getUserMedia webcam stream, device switching, and file upload fallbacks.
 */

export class CameraController {
  constructor(videoElement, onFrameCallback) {
    this.video = videoElement;
    this.onFrameCallback = onFrameCallback;
    this.stream = null;
    this.isStreaming = false;
    this.currentImage = null; // Stored HTMLImageElement if user uploaded photo
    this.facingMode = 'user'; // 'user' or 'environment'
  }

  /**
   * Request webcam access and attach to video element
   */
  async startWebcam() {
    this.stopWebcam();
    this.currentImage = null;

    try {
      const constraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          this.isStreaming = true;
          resolve({ success: true });
        };
      });
    } catch (err) {
      console.warn('Webcam permission error or device unavailable:', err);
      this.isStreaming = false;
      return {
        success: false,
        error: err.name === 'NotAllowedError' ? 'Camera permission denied.' : 'Camera not found or in use.'
      };
    }
  }

  /**
   * Stop active webcam stream
   */
  stopWebcam() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isStreaming = false;
    this.video.srcObject = null;
  }

  /**
   * Pause live video feed (for freeze frame during analysis)
   */
  pauseStream() {
    if (this.video && this.isStreaming) {
      this.video.pause();
    }
  }

  /**
   * Resume live video feed
   */
  resumeStream() {
    if (this.video && this.isStreaming) {
      this.video.play();
    }
  }

  /**
   * Toggle between front and back camera (for mobile)
   */
  async switchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    return await this.startWebcam();
  }

  /**
   * Load uploaded image file, normalize high resolution, and prepare for analysis
   * @param {File} file 
   */
  async loadUploadedImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid image file. Please upload a valid photo.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawImg = new Image();
        rawImg.onload = () => {
          this.stopWebcam();

          // Image Pre-Processing: Normalize high-res photos to max 1280px to prevent detection timeouts
          const MAX_DIM = 1280;
          let width = rawImg.width;
          let height = rawImg.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(rawImg, 0, 0, width, height);

          const normImg = new Image();
          normImg.onload = () => {
            this.currentImage = normImg;
            resolve(normImg);
          };
          normImg.onerror = () => {
            this.currentImage = rawImg;
            resolve(rawImg);
          };
          normImg.src = canvas.toDataURL('image/jpeg', 0.92);
        };
        rawImg.onerror = () => reject(new Error('Failed to load image.'));
        rawImg.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Capture a snapshot of the current face from active source (video or image).
   * Smartly crops and centers the face using 3D landmarks for a perfectly proportioned portrait.
   * @param {Array} landmarks Optional MediaPipe 468 landmark array
   */
  captureFaceSnapshot(landmarks = null) {
    const source = this.getActiveSource();
    if (!source) return null;

    try {
      let srcX = 0, srcY = 0, srcW = source.width, srcH = source.height;
      const targetW = 480;
      const targetH = 600;
      const targetAspect = targetW / targetH; // 0.8 aspect ratio

      if (landmarks && landmarks.length > 0) {
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        landmarks.forEach(pt => {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        });

        const faceX = minX * source.width;
        const faceY = minY * source.height;
        const faceW = (maxX - minX) * source.width;
        const faceH = (maxY - minY) * source.height;

        const centerX = faceX + faceW / 2;
        const centerY = faceY + faceH / 2;

        // Generous crop dimension ensuring top of head crown, forehead, ears, chin & neck are fully visible
        let cropH = Math.max(faceH * 1.85, faceW * 2.05);
        let cropW = cropH * targetAspect;

        if (cropW > source.width) {
          cropW = source.width;
          cropH = cropW / targetAspect;
        }
        if (cropH > source.height) {
          cropH = source.height;
          cropW = cropH * targetAspect;
        }

        // Center vertically around face center with balanced top margin for hair crown
        srcX = Math.max(0, Math.min(source.width - cropW, centerX - cropW / 2));
        srcY = Math.max(0, Math.min(source.height - cropH, centerY - cropH * 0.52));
        srcW = cropW;
        srcH = cropH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#07080B';
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw with zero distortion (src aspect ratio matches target aspect ratio!)
      ctx.drawImage(source.element, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (err) {
      console.warn('Failed to capture face snapshot:', err);
      return null;
    }
  }

  /**
   * Get current active source element for MediaPipe (either video or image)
   */
  getActiveSource() {
    if (this.currentImage) {
      return { element: this.currentImage, width: this.currentImage.width, height: this.currentImage.height, isImage: true };
    }
    if (this.isStreaming && this.video.videoWidth > 0) {
      return { element: this.video, width: this.video.videoWidth, height: this.video.videoHeight, isImage: false };
    }
    return null;
  }
}
