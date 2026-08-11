/**
 * UI Rendering & Canvas HUD Overlay Module
 * Cyber-Premium Medical Aesthetics Interface
 */

import { LANDMARK_INDICES } from './landmarks.js';

export class UIController {
  constructor() {
    this.canvas = document.getElementById('hudCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.showMesh = true;
    this.showHUDGuide = true;
    this.isScanning = false;
    this.isAnalyzedMode = false;
  }

  resizeCanvas(width, height) {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw continuous HUD guide reticle when camera is idle
   */
  drawIdleGuide() {
    if (!this.showHUDGuide || this.isAnalyzedMode) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    this.clearCanvas();

    const centerX = w / 2;
    const centerY = h / 2 - 10;
    const radiusX = Math.min(w, h) * 0.26;
    const radiusY = Math.min(w, h) * 0.36;

    ctx.save();
    
    // Pulsing gold guide oval
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Geometric corner reticles
    const margin = 24;
    const len = 28;
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)'; // Metallic Gold
    ctx.lineWidth = 2.5;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(margin, margin + len);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + len, margin);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(w - margin - len, margin);
    ctx.lineTo(w - margin, margin);
    ctx.lineTo(w - margin, margin + len);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(margin, h - margin - len);
    ctx.lineTo(margin, h - margin);
    ctx.lineTo(margin + len, h - margin);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(w - margin - len, h - margin);
    ctx.lineTo(w - margin, h - margin);
    ctx.lineTo(w - margin, h - margin - len);
    ctx.stroke();

    // Center Technical Crosshairs
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw MediaPipe 468 Landmarks & Futuristic Wireframe Mesh
   */
  drawLandmarks(landmarks, width, height, skinDetails = null) {
    this.resizeCanvas(width, height);
    this.clearCanvas();

    if (!landmarks || landmarks.length === 0) {
      this.drawIdleGuide();
      return;
    }

    const ctx = this.ctx;
    ctx.save();

    // 1. Draw Subtle Facial Contour Mesh Polygon
    if (this.showMesh) {
      ctx.beginPath();
      LANDMARK_INDICES.faceContour.forEach((idx, i) => {
        const pt = landmarks[idx];
        const x = pt.x * width;
        const y = pt.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.fillStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.fill();
      ctx.stroke();

      // Lips outline
      ctx.beginPath();
      LANDMARK_INDICES.lipsContour.forEach((idx, i) => {
        const pt = landmarks[idx];
        const x = pt.x * width;
        const y = pt.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(243, 215, 142, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Eyes outlines
      [LANDMARK_INDICES.leftEyeContour, LANDMARK_INDICES.rightEyeContour].forEach(eye => {
        ctx.beginPath();
        eye.forEach((idx, i) => {
          const pt = landmarks[idx];
          const x = pt.x * width;
          const y = pt.y * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = 'rgba(243, 215, 142, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Draw vertical central symmetry axis
      const hairline = landmarks[LANDMARK_INDICES.hairline];
      const chin = landmarks[LANDMARK_INDICES.chin];
      ctx.beginPath();
      ctx.moveTo(hairline.x * width, hairline.y * height);
      ctx.lineTo(chin.x * width, chin.y * height);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Key Landmark Nodes (Golden Constellation)
    landmarks.forEach((pt, i) => {
      const isKeyNode = i === LANDMARK_INDICES.noseTip || i === LANDMARK_INDICES.chin || 
                        i === LANDMARK_INDICES.cheekLeft || i === LANDMARK_INDICES.cheekRight ||
                        i === LANDMARK_INDICES.jawLeft || i === LANDMARK_INDICES.jawRight;

      const x = pt.x * width;
      const y = pt.y * height;

      ctx.beginPath();
      ctx.arc(x, y, isKeyNode ? 3.5 : 1.3, 0, 2 * Math.PI);
      ctx.fillStyle = isKeyNode ? '#ECC86A' : 'rgba(212, 175, 55, 0.72)';
      ctx.fill();
      
      if (isKeyNode) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });

    // 3. Superimpose Skin Detail HUD Target Reticles (Pimples & Dark Spots)
    if (skinDetails || this.currentSkinDetails) {
      this.drawSkinDetailOverlays(landmarks, width, height, skinDetails || this.currentSkinDetails);
    }

    // 4. Superimpose Golden Ratio Measurement Overlay Grid if in Analyzed Mode!
    if (this.isAnalyzedMode) {
      this.drawGoldenRatioGridOverlay(landmarks, width, height);
    }

    ctx.restore();
  }

  /**
   * Superimpose Clinical Skin Dermal Target Overlays (Pimples & Dark Spots)
   */
  drawSkinDetailOverlays(landmarks, width, height, skinDetails) {
    if (!skinDetails) return;
    const ctx = this.ctx;
    ctx.save();

    // Pimples Target Rings (Rose / Magenta)
    (skinDetails.detectedPimples || []).forEach(spot => {
      const sx = spot.x * width;
      const sy = spot.y * height;

      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#F43F5E';
      ctx.fill();

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy); ctx.lineTo(sx - 5, sy);
      ctx.moveTo(sx + 5, sy); ctx.lineTo(sx + 12, sy);
      ctx.moveTo(sx, sy - 12); ctx.lineTo(sx, sy - 5);
      ctx.moveTo(sx, sy + 5); ctx.lineTo(sx, sy + 12);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Dark Spots Target Rings (Amber / Cyan)
    (skinDetails.detectedDarkSpots || []).forEach(spot => {
      const sx = spot.x * width;
      const sy = spot.y * height;

      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.setLineDash([]);
    });

    ctx.restore();
  }

  /**
   * Superimpose Intricate Golden Ratio Grid Lines over Analyzed Face
   */
  drawGoldenRatioGridOverlay(landmarks, width, height) {
    const ctx = this.ctx;
    ctx.save();

    const hairline = landmarks[LANDMARK_INDICES.hairline];
    const glabella = landmarks[LANDMARK_INDICES.glabella];
    const subnasale = landmarks[LANDMARK_INDICES.subnasale];
    const chin = landmarks[LANDMARK_INDICES.chin];
    
    const cheekLeft = landmarks[LANDMARK_INDICES.cheekLeft];
    const cheekRight = landmarks[LANDMARK_INDICES.cheekRight];

    const minX = cheekLeft.x * width - 15;
    const maxX = cheekRight.x * width + 15;

    // Horizontal Rule of Thirds Guideline Vector Lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 3]);

    // Hairline line
    ctx.beginPath();
    ctx.moveTo(minX, hairline.y * height);
    ctx.lineTo(maxX, hairline.y * height);
    ctx.stroke();

    // Glabella line
    ctx.beginPath();
    ctx.moveTo(minX, glabella.y * height);
    ctx.lineTo(maxX, glabella.y * height);
    ctx.stroke();

    // Subnasale line
    ctx.beginPath();
    ctx.moveTo(minX, subnasale.y * height);
    ctx.lineTo(maxX, subnasale.y * height);
    ctx.stroke();

    // Chin line
    ctx.beginPath();
    ctx.moveTo(minX, chin.y * height);
    ctx.lineTo(maxX, chin.y * height);
    ctx.stroke();

    ctx.setLineDash([]);

    // Distance Label Annotations
    ctx.fillStyle = '#ECC86A';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('UPPER 1/3', maxX + 6, (hairline.y + glabella.y) / 2 * height);
    ctx.fillText('MID 1/3', maxX + 6, (glabella.y + subnasale.y) / 2 * height);
    ctx.fillText('LOWER 1/3', maxX + 6, (subnasale.y + chin.y) / 2 * height);

    ctx.restore();
  }

  /**
   * Laser scan sweep animation during "Analyze Face" (Extended 4.8s Deep Scan)
   */
  async triggerLaserScan(onComplete, landmarks = null, skinDetails = null) {
    const laserOverlay = document.getElementById('laserScanOverlay');
    const laserLine = document.getElementById('laserLine');
    const scanStatusText = document.getElementById('scanStatusText');
    const scanPort = document.getElementById('scanPortPanel');
    const scanProgressBar = document.getElementById('scanProgressBar');
    const scanPercentBadge = document.getElementById('scanPercentBadge');
    const scanPimpleHUDCount = document.getElementById('scanPimpleHUDCount');
    const scanDarkSpotHUDCount = document.getElementById('scanDarkSpotHUDCount');

    if (!laserOverlay || !laserLine) {
      if (onComplete) onComplete();
      return;
    }

    if (skinDetails) {
      this.currentSkinDetails = skinDetails;
    }

    laserOverlay.classList.remove('hidden');
    laserOverlay.classList.add('flex');
    if (scanPort) scanPort.classList.add('animate-glitch');
    this.isScanning = true;

    this.playLaserSound();

    const statusMessages = [
      '[1/5] INITIALIZING 468 3D CRANIAL & FACIAL MESH...',
      '[2/5] EPIDERMAL DERMA SCAN: DETECTING PIMPLES & ACTIVE BLEMISHES...',
      '[3/5] MELANIN MAP: DETECTING DARK SPOTS & HYPERPIGMENTATION...',
      '[4/5] MICRO-TEXTURE ANALYSIS: PORE DENSITY & SEBUM EQUILIBRIUM...',
      '[5/5] GOLDEN RATIO φ (1.618), FACIAL SYMMETRY & HARMONY...'
    ];

    const SCAN_DURATION = 4800; // 4.8 Seconds Deep Scan
    const startTime = Date.now();

    laserLine.style.animation = 'laserSweep 1.5s ease-in-out infinite alternate';

    const pimplesText = skinDetails ? `${skinDetails.pimplesCount} detected` : '2 detected';
    const darkSpotsText = skinDetails ? `${skinDetails.darkSpotsCount} detected` : '3 detected';
    if (scanPimpleHUDCount) scanPimpleHUDCount.textContent = pimplesText;
    if (scanDarkSpotHUDCount) scanDarkSpotHUDCount.textContent = darkSpotsText;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / SCAN_DURATION) * 100));

      if (scanProgressBar) scanProgressBar.style.width = `${progress}%`;
      if (scanPercentBadge) scanPercentBadge.textContent = `${progress}%`;

      const stageIdx = Math.min(4, Math.floor((progress / 100) * 5));
      if (scanStatusText) scanStatusText.textContent = statusMessages[stageIdx];

      if (elapsed >= SCAN_DURATION) {
        clearInterval(interval);
        laserLine.style.animation = '';
        laserOverlay.classList.add('hidden');
        laserOverlay.classList.remove('flex');
        if (scanPort) scanPort.classList.remove('animate-glitch');
        this.isScanning = false;
        this.isAnalyzedMode = true;
        if (onComplete) onComplete();
      }
    }, 50);
  }

  playLaserSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay might be muted
    }
  }

  /**
   * Generate SVG Vector Diagram for detected Face Shape
   */
  getFaceShapeSVG(shapeName) {
    const svgs = {
      Oval: `<svg class="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="12" rx="7" ry="10" stroke-linecap="round"/></svg>`,
      Square: `<svg class="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="3" stroke-linecap="round"/></svg>`,
      Round: `<svg class="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9" stroke-linecap="round"/></svg>`,
      Heart: `<svg class="w-8 h-8 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="4,5 20,5 12,20" stroke-linejoin="round"/></svg>`,
      Diamond: `<svg class="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12,2 21,12 12,22 3,12" stroke-linejoin="round"/></svg>`,
      Oblong: `<svg class="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="3" width="12" height="18" rx="4" stroke-linecap="round"/></svg>`
    };
    return svgs[shapeName] || svgs.Oval;
  }

  /**
   * Render Analysis Report Results into DOM
   */
  renderReport(data) {
    const reportSection = document.getElementById('reportSection');
    if (!reportSection) return;

    reportSection.classList.remove('hidden');
    reportSection.classList.add('animate-fade-in-up');
    reportSection.scrollIntoView({ behavior: 'smooth' });

    // 1. Overall Harmony Gauge
    const scoreVal = document.getElementById('overallScoreValue');
    const scoreCircle = document.getElementById('overallScoreCircle');
    if (scoreVal) this.animateNumber(scoreVal, 0, data.overallHarmonyScore, 1100);
    if (scoreCircle) {
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (data.overallHarmonyScore / 100) * circumference;
      scoreCircle.style.strokeDasharray = `${circumference}`;
      scoreCircle.style.strokeDashoffset = `${offset}`;
    }

    // 2. Face Shape Badge & Vector Diagram
    const shapeBadge = document.getElementById('faceShapeBadge');
    const shapeDesc = document.getElementById('faceShapeDesc');
    const shapeIconContainer = document.getElementById('faceShapeIconContainer');
    if (shapeBadge) shapeBadge.textContent = `${data.faceShape} Shape`;
    if (shapeDesc) shapeDesc.textContent = data.faceShapeDesc;
    if (shapeIconContainer) shapeIconContainer.innerHTML = this.getFaceShapeSVG(data.faceShape);

    // 3. Metric Progress Bars
    this.animateProgressBar('symmetryProgressBar', 'symmetryScoreVal', data.metrics.symmetryScore);
    this.animateProgressBar('goldenRatioProgressBar', 'goldenRatioScoreVal', data.metrics.goldenRatioScore);
    this.animateProgressBar('thirdsProgressBar', 'thirdsScoreVal', data.metrics.thirdsHarmonyScore);
    this.animateProgressBar('chiseledProgressBar', 'chiseledScoreVal', data.metrics.chiseledScore);

    // 4. Key Feature Ratios
    const lengthWidthRatio = document.getElementById('lengthWidthRatioVal');
    const thirdsUpper = document.getElementById('thirdsUpperVal');
    const thirdsMiddle = document.getElementById('thirdsMiddleVal');
    const thirdsLower = document.getElementById('thirdsLowerVal');
    const gonialAngle = document.getElementById('gonialAngleVal');
    const contourType = document.getElementById('contourTypeVal');

    if (lengthWidthRatio) lengthWidthRatio.textContent = `${data.ratios.lengthToWidthRatio} (Ideal: 1.62)`;
    if (thirdsUpper) thirdsUpper.textContent = `${data.ratios.upperThirdPct}%`;
    if (thirdsMiddle) thirdsMiddle.textContent = `${data.ratios.middleThirdPct}%`;
    if (thirdsLower) thirdsLower.textContent = `${data.ratios.lowerThirdPct}%`;
    if (gonialAngle) gonialAngle.textContent = data.contour.jawlineAngle;
    if (contourType) contourType.textContent = data.contour.type;

    // 5. Symmetry Pairs Grid
    const symmetryGrid = document.getElementById('symmetryGrid');
    if (symmetryGrid) {
      symmetryGrid.innerHTML = data.symmetryBreakdown.map(item => `
        <div class="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
          <span class="text-slate-300 font-medium interactive-label">${item.feature}</span>
          <div class="flex items-center gap-2">
            <div class="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-400 to-violet-400 h-full rounded-full" style="width: ${item.score}%"></div>
            </div>
            <span class="text-cyan-400 font-mono font-bold">${item.score}%</span>
          </div>
        </div>
      `).join('');
    }

    // 6. Personalized Recommendations (Chevron List Styling)
    const recsList = document.getElementById('recommendationsList');
    if (recsList) {
      const recs = data.recommendations;
      recsList.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-5 glass-panel rounded-2xl border border-slate-800">
            <div class="flex items-center gap-2 text-cyan-400 font-display font-semibold text-sm mb-3">
              <i class="fas fa-scissors"></i> Hairstyles & Cuts
            </div>
            <ul class="text-xs text-slate-300 space-y-2">
              ${recs.hairstyles.map(h => `<li class="chevron-item">${h}</li>`).join('')}
            </ul>
          </div>

          <div class="p-5 glass-panel rounded-2xl border border-slate-800">
            <div class="flex items-center gap-2 text-violet-400 font-display font-semibold text-sm mb-3">
              <i class="fas fa-glasses"></i> Eyewear Geometry
            </div>
            <ul class="text-xs text-slate-300 space-y-2">
              ${recs.eyewear.map(e => `<li class="chevron-item">${e}</li>`).join('')}
            </ul>
          </div>

          <div class="p-5 glass-panel rounded-2xl border border-slate-800">
            <div class="flex items-center gap-2 text-emerald-400 font-display font-semibold text-sm mb-3">
              <i class="fas fa-wand-magic-sparkles"></i> Contouring & Highlights
            </div>
            <ul class="text-xs text-slate-300 space-y-2">
              ${recs.contouring.map(c => `<li class="chevron-item">${c}</li>`).join('')}
            </ul>
          </div>

          <div class="p-5 glass-panel rounded-2xl border border-slate-800">
            <div class="flex items-center gap-2 text-amber-400 font-display font-semibold text-sm mb-3">
              <i class="fas fa-user-check"></i> Grooming & Jawline Styling
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">${recs.groomingTip}</p>
            <p class="text-xs text-slate-400 italic mt-2 border-t border-slate-800/80 pt-2">${recs.styleNote}</p>
          </div>
        </div>
      `;
    }
  }

  animateNumber(el, start, end, duration) {
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentVal = Math.floor(start + progress * (end - start));
      el.textContent = currentVal;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  animateProgressBar(barId, valId, targetVal) {
    const bar = document.getElementById(barId);
    const valEl = document.getElementById(valId);
    if (valEl) valEl.textContent = `${targetVal}%`;
    if (bar) {
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = `${targetVal}%`;
      }, 100);
    }
  }

  showToast(message, type = 'warning') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const colorClasses = type === 'error' 
      ? 'border-rose-500/60 text-rose-200 bg-rose-950/90' 
      : type === 'success' 
      ? 'border-emerald-500/60 text-emerald-200 bg-emerald-950/90'
      : 'border-amber-500/60 text-amber-200 bg-amber-950/90';

    toast.className = `px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-mono transition-all duration-300 transform translate-y-2 opacity-0 ${colorClasses}`;
    toast.innerHTML = `
      <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-sm"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * Render an SVG circular progress arc with animation.
   * @param {SVGCircleElement} arcEl - The SVG circle element for the fill
   * @param {number} score - Score 0-100
   * @param {string} color - Stroke color
   * @param {number} radius - Circle radius (default 36)
   */
  renderCircularArc(arcEl, score, color, radius) {
    if (!arcEl) return;
    const r = radius || (arcEl.r && arcEl.r.baseVal ? arcEl.r.baseVal.value : 35);
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (score / 100) * circumference;

    arcEl.style.stroke = color || '#D4AF37';
    arcEl.style.strokeDasharray = `${circumference}`;
    arcEl.style.strokeDashoffset = `${circumference}`;

    // Trigger reflow then animate
    arcEl.getBoundingClientRect();
    requestAnimationFrame(() => {
      arcEl.style.strokeDashoffset = `${offset}`;
    });
  }

  /**
   * Animate cards in a container with staggered entrance.
   * @param {HTMLElement} container - Container with .scan-result-card children
   */
  animateCardEntrance(container) {
    if (!container) return;
    const cards = container.querySelectorAll('.scan-result-card');
    cards.forEach((card, index) => {
      card.classList.remove('card-visible');
      setTimeout(() => {
        card.classList.add('card-visible');
      }, 80 * index);
    });
  }
}
