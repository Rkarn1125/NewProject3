/**
 * Brand Assets Module for FaceUp X
 * Provides inline Vector and Base64 fallbacks for Gold 'X' Logo (Image 3)
 * and 3D Golden Wireframe Face (Image 2).
 */

export const BRAND_LOGO_SVG = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-[0_4px_16px_rgba(212,175,55,0.5)]">
  <defs>
    <linearGradient id="faceupGoldMetallic" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#FFF3D1" />
      <stop offset="25%" stop-color="#E8C768" />
      <stop offset="55%" stop-color="#D4AF37" />
      <stop offset="80%" stop-color="#B88E28" />
      <stop offset="100%" stop-color="#8B6615" />
    </linearGradient>
    <linearGradient id="faceupGoldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#FDF0CD" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0" />
    </linearGradient>
    <filter id="goldShine" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Left Stem with Female Profile Silhouette -->
  <path d="M 38 18 
           C 42 22, 45 28, 45 35 
           C 45 42, 47 46, 52 50 
           C 49 51, 48 53, 49 55 
           C 51 57, 54 58, 51 61 
           C 48 63, 47 67, 50 70 
           C 44 73, 41 82, 38 90 
           C 34 98, 26 104, 20 106 
           C 25 103, 30 96, 33 88 
           C 36 78, 38 70, 34 62 
           C 30 52, 28 40, 22 28 
           C 20 24, 23 20, 38 18 Z" 
        fill="url(#faceupGoldMetallic)" filter="url(#goldShine)" />

  <!-- Right Diagonal Stem Crossing -->
  <path d="M 85 20 
           C 78 24, 68 36, 55 52 
           L 46 64 
           C 55 76, 68 90, 84 104 
           C 87 107, 92 108, 96 106 
           C 86 100, 75 88, 64 74 
           L 58 66 
           C 68 53, 80 38, 95 24 
           C 96 22, 92 19, 85 20 Z" 
        fill="url(#faceupGoldMetallic)" filter="url(#goldShine)" />

  <!-- Highlight accent strokes -->
  <path d="M 39 20 C 44 26, 45 34, 46 42" stroke="url(#faceupGoldHighlight)" stroke-width="1.5" stroke-linecap="round" fill="none" />
  <path d="M 83 23 C 74 33, 62 48, 56 56" stroke="url(#faceupGoldHighlight)" stroke-width="1.5" stroke-linecap="round" fill="none" />
</svg>`;

/**
 * Initialize fallback handlers on brand assets across the page
 */
export function initBrandAssetFallbacks() {
  document.querySelectorAll('img[data-brand-logo]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.parentElement) {
        img.parentElement.innerHTML = BRAND_LOGO_SVG;
      }
    });
  });
}
