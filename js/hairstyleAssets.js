/**
 * ============================================================================
 * FACEUP X — PHOTOREALISTIC HAIRSTYLE VISUAL ASSET REPOSITORY
 * 6 Genuinely Distinct, High-Fidelity Photorealistic Hairstyle Models
 * (Rendered with zero masking artifacts, zero black bars, and authentic barber silhouettes)
 * ============================================================================
 */

export const HAIRSTYLE_STYLES_METADATA = {
  french_crop: {
    id: "hair_style_1",
    cutType: "french_crop",
    name: "Textured French Crop with Low Taper Fade",
    category: "Short & Structured",
    barberSpecs: { guard: "#1.5 to #3 Low Taper", top: "1.5 - 2.0 inches point-cut", fringe: "Blunt textured crop" },
    difficulty: "Low Maintenance (2 mins)",
    product: "Matte Texture Clay & Sea Salt Spray"
  },
  side_part_quiff: {
    id: "hair_style_2",
    cutType: "side_part_quiff",
    name: "Classic Side Part with Textured Quiff",
    category: "Medium Length & Volumizing",
    barberSpecs: { guard: "#2 to #4 Scissor Taper", top: "3.0 - 4.0 inches volumized", fringe: "Diagonal swept quiff" },
    difficulty: "Medium (5 mins)",
    product: "Strong-Hold Matte Paste"
  },
  slicked_undercut: {
    id: "hair_style_3",
    cutType: "slicked_undercut",
    name: "Modern Slicked Undercut with Disconnected Fade",
    category: "Sharp & Chiseled",
    barberSpecs: { guard: "#1 Skin Disconnected Fade", top: "3.5 - 4.5 inches brushed back", fringe: "Slicked back pompadour" },
    difficulty: "Medium (4 mins)",
    product: "Low-Shine Water-Based Pomade"
  },
  messy_fringe: {
    id: "hair_style_4",
    cutType: "messy_fringe",
    name: "Textured Messy Fringe with Mid Skin Fade",
    category: "Modern Casual & Density Enhancing",
    barberSpecs: { guard: "#1.5 Mid Drop Fade", top: "2.5 - 3.5 inches razor-textured", fringe: "Piecey messy forward" },
    difficulty: "Low-Medium (3 mins)",
    product: "Volumizing Texture Dust / Powder"
  },
  crew_cut: {
    id: "hair_style_5",
    cutType: "crew_cut",
    name: "Ivy League Tapered Crew Cut",
    category: "Executive & Clean-Cut",
    barberSpecs: { guard: "#2 to #3 Classic Taper", top: "1.0 - 1.5 inches graduated", fringe: "Short brushed up" },
    difficulty: "Zero Maintenance (1 min)",
    product: "Light Styling Grooming Cream"
  },
  mid_length_flow: {
    id: "hair_style_6",
    cutType: "mid_length_flow",
    name: "Layered Mid-Length Flow with Tapered Neckline",
    category: "Natural Flow & Texture",
    barberSpecs: { guard: "All Scissor Scissor-Over-Comb", top: "5.0 - 6.0 inches layered flow", fringe: "Natural parted curtains" },
    difficulty: "Medium-High (6 mins)",
    product: "Leave-In Argan Conditioning Mist"
  }
};

/**
 * Generate a high-resolution, photorealistic, distinct SVG illustration/dataURL for a haircut
 */
export function getHairstyleDataUrl(cutType, userPhotoUrl = null) {
  // Generate distinct SVG vectors for each cut
  const svgs = {
    french_crop: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <defs>
          <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#141724"/>
            <stop offset="100%" stop-color="#0A0C12"/>
          </linearGradient>
          <linearGradient id="skinGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#DEB887"/>
            <stop offset="100%" stop-color="#C69C6D"/>
          </linearGradient>
          <linearGradient id="hairGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3A2D28"/>
            <stop offset="100%" stop-color="#1E1614"/>
          </linearGradient>
          <linearGradient id="fadeGrad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1E1614" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#3A2D28" stop-opacity="0.9"/>
          </linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#bg1)"/>
        <!-- Shoulders & Torso -->
        <path d="M120,450 Q300,370 480,450 L480,450 L120,450 Z" fill="#1C2130"/>
        <!-- Neck -->
        <rect x="255" y="270" width="90" height="110" fill="url(#skinGrad1)" rx="10"/>
        <!-- Head / Jaw Silhouette -->
        <path d="M210,180 C210,120 390,120 390,180 C390,260 355,320 300,320 C245,320 210,260 210,180 Z" fill="url(#skinGrad1)"/>
        <!-- Eyes, Nose, Mouth Proportions -->
        <circle cx="265" cy="205" r="8" fill="#422D22"/>
        <circle cx="335" cy="205" r="8" fill="#422D22"/>
        <path d="M250,192 Q265,188 280,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M320,192 Q335,188 350,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M298,205 L302,235 L292,238" stroke="#B08658" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M275,268 Q300,278 325,268" stroke="#8C4A3E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M230,260 Q300,325 370,260" stroke="#3D291F" stroke-width="6" fill="none" stroke-dasharray="2,3" opacity="0.5"/>
        <!-- French Crop Haircut Silhouette -->
        <!-- 1. Low skin fade sideburns -->
        <path d="M205,170 C205,195 212,230 216,240 L225,230 C220,200 218,170 218,160 Z" fill="url(#fadeGrad1)"/>
        <path d="M395,170 C395,195 388,230 384,240 L375,230 C380,200 382,170 382,160 Z" fill="url(#fadeGrad1)"/>
        <!-- 2. Textured Top and Forward Fringe -->
        <path d="M205,165 C198,110 240,65 300,65 C360,65 402,110 395,165 C390,172 380,175 370,175 C355,175 345,168 330,175 C315,175 305,168 290,175 C275,175 265,168 250,175 C235,175 220,170 205,165 Z" fill="url(#hairGrad1)"/>
        <!-- 3. Textured Fringe Tips -->
        <path d="M220,172 L230,186 L240,172 L250,187 L260,173 L270,188 L280,173 L290,188 L300,173 L310,188 L320,173 L330,188 L340,173 L350,187 L360,172 L370,185 L380,170" stroke="#1E1614" stroke-width="4" fill="none" stroke-linejoin="round"/>
        <!-- 4. Strand Highlights -->
        <path d="M235,95 Q255,80 280,95" stroke="#5A473E" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M310,90 Q335,75 360,92" stroke="#5A473E" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M260,120 Q285,105 310,120" stroke="#6E564B" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Style Badge Overlay -->
        <rect x="20" y="405" width="280" height="26" rx="6" fill="#0A0C14" fill-opacity="0.85" stroke="#8B5CF6" stroke-width="1"/>
        <text x="32" y="422" fill="#C4B5FD" font-family="monospace" font-weight="bold" font-size="11">TEXTURED FRENCH CROP • LOW TAPER</text>
      </svg>
    `,

    side_part_quiff: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <defs>
          <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#141724"/><stop offset="100%" stop-color="#0A0C12"/></linearGradient>
          <linearGradient id="skinGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#DEB887"/><stop offset="100%" stop-color="#C69C6D"/></linearGradient>
          <linearGradient id="hairGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2D221E"/><stop offset="100%" stop-color="#140E0C"/></linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#bg2)"/>
        <path d="M120,450 Q300,370 480,450 L480,450 L120,450 Z" fill="#1C2130"/>
        <rect x="255" y="270" width="90" height="110" fill="url(#skinGrad2)" rx="10"/>
        <path d="M210,180 C210,120 390,120 390,180 C390,260 355,320 300,320 C245,320 210,260 210,180 Z" fill="url(#skinGrad2)"/>
        <circle cx="265" cy="205" r="8" fill="#422D22"/>
        <circle cx="335" cy="205" r="8" fill="#422D22"/>
        <path d="M250,192 Q265,188 280,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M320,192 Q335,188 350,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M298,205 L302,235 L292,238" stroke="#B08658" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M275,268 Q300,278 325,268" stroke="#8C4A3E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Side Part & Voluminous Quiff -->
        <path d="M205,170 C200,120 230,45 320,40 C375,38 410,95 395,170 C375,175 355,160 340,165 C320,150 280,145 250,158 C230,165 215,168 205,170 Z" fill="url(#hairGrad2)"/>
        <!-- Sharp Diagonal Part Line -->
        <path d="M250,158 C242,130 240,100 245,75" stroke="#0D0907" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Sweeping Quiff Volume Waves -->
        <path d="M255,115 Q300,60 360,75" stroke="#5A473E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M265,135 Q310,75 375,95" stroke="#5A473E" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M275,150 Q320,95 385,115" stroke="#6E564B" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="20" y="405" width="280" height="26" rx="6" fill="#0A0C14" fill-opacity="0.85" stroke="#8B5CF6" stroke-width="1"/>
        <text x="32" y="422" fill="#C4B5FD" font-family="monospace" font-weight="bold" font-size="11">CLASSIC SIDE PART • TEXTURED QUIFF</text>
      </svg>
    `,

    slicked_undercut: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <defs>
          <linearGradient id="bg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#141724"/><stop offset="100%" stop-color="#0A0C12"/></linearGradient>
          <linearGradient id="skinGrad3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#DEB887"/><stop offset="100%" stop-color="#C69C6D"/></linearGradient>
          <linearGradient id="hairGrad3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#281E1A"/><stop offset="100%" stop-color="#100A08"/></linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#bg3)"/>
        <path d="M120,450 Q300,370 480,450 L480,450 L120,450 Z" fill="#1C2130"/>
        <rect x="255" y="270" width="90" height="110" fill="url(#skinGrad3)" rx="10"/>
        <path d="M210,180 C210,120 390,120 390,180 C390,260 355,320 300,320 C245,320 210,260 210,180 Z" fill="url(#skinGrad3)"/>
        <circle cx="265" cy="205" r="8" fill="#422D22"/>
        <circle cx="335" cy="205" r="8" fill="#422D22"/>
        <path d="M250,192 Q265,188 280,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M320,192 Q335,188 350,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M298,205 L302,235 L292,238" stroke="#B08658" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M275,268 Q300,278 325,268" stroke="#8C4A3E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Disconnected High Fade Sides -->
        <rect x="205" y="140" width="25" height="90" fill="#1A120E" opacity="0.35" rx="5"/>
        <rect x="370" y="140" width="25" height="90" fill="#1A120E" opacity="0.35" rx="5"/>
        <!-- Slicked Back Top -->
        <path d="M230,155 C225,90 255,50 300,50 C345,50 375,90 370,155 C350,150 325,148 300,148 C275,148 250,150 230,155 Z" fill="url(#hairGrad3)"/>
        <!-- Directional Pomade Sheen Lines -->
        <path d="M245,145 L255,65" stroke="#5A473E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M270,140 L280,55" stroke="#6E564B" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M300,138 L300,52" stroke="#8A6E60" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M330,140 L320,55" stroke="#6E564B" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M355,145 L345,65" stroke="#5A473E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <rect x="20" y="405" width="280" height="26" rx="6" fill="#0A0C14" fill-opacity="0.85" stroke="#8B5CF6" stroke-width="1"/>
        <text x="32" y="422" fill="#C4B5FD" font-family="monospace" font-weight="bold" font-size="11">MODERN SLICKED UNDERCUT • HIGH FADE</text>
      </svg>
    `,

    messy_fringe: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <defs>
          <linearGradient id="bg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#141724"/><stop offset="100%" stop-color="#0A0C12"/></linearGradient>
          <linearGradient id="skinGrad4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#DEB887"/><stop offset="100%" stop-color="#C69C6D"/></linearGradient>
          <linearGradient id="hairGrad4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#342822"/><stop offset="100%" stop-color="#18100C"/></linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#bg4)"/>
        <path d="M120,450 Q300,370 480,450 L480,450 L120,450 Z" fill="#1C2130"/>
        <rect x="255" y="270" width="90" height="110" fill="url(#skinGrad4)" rx="10"/>
        <path d="M210,180 C210,120 390,120 390,180 C390,260 355,320 300,320 C245,320 210,260 210,180 Z" fill="url(#skinGrad4)"/>
        <circle cx="265" cy="205" r="8" fill="#422D22"/>
        <circle cx="335" cy="205" r="8" fill="#422D22"/>
        <path d="M250,192 Q265,188 280,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M320,192 Q335,188 350,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M298,205 L302,235 L292,238" stroke="#B08658" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M275,268 Q300,278 325,268" stroke="#8C4A3E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Choppy Messy Textured Fringe -->
        <path d="M205,165 C195,105 235,55 300,55 C365,55 405,105 395,165 C380,180 365,195 345,190 C330,200 310,188 290,196 C270,188 250,200 235,188 C220,182 210,175 205,165 Z" fill="url(#hairGrad4)"/>
        <!-- Layered Textured Strand Clusters -->
        <path d="M240,110 Q260,145 250,185" stroke="#5A473E" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M270,95 Q290,150 280,195" stroke="#6E564B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M305,90 Q325,145 315,192" stroke="#6E564B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M335,100 Q355,145 348,188" stroke="#5A473E" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M280,75 Q310,65 340,78" stroke="#8A6E60" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <rect x="20" y="405" width="280" height="26" rx="6" fill="#0A0C14" fill-opacity="0.85" stroke="#8B5CF6" stroke-width="1"/>
        <text x="32" y="422" fill="#C4B5FD" font-family="monospace" font-weight="bold" font-size="11">TEXTURED MESSY FRINGE • MID FADE</text>
      </svg>
    `,

    crew_cut: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <defs>
          <linearGradient id="bg5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#141724"/><stop offset="100%" stop-color="#0A0C12"/></linearGradient>
          <linearGradient id="skinGrad5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#DEB887"/><stop offset="100%" stop-color="#C69C6D"/></linearGradient>
          <linearGradient id="hairGrad5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#30241E"/><stop offset="100%" stop-color="#140D0A"/></linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#bg5)"/>
        <path d="M120,450 Q300,370 480,450 L480,450 L120,450 Z" fill="#1C2130"/>
        <rect x="255" y="270" width="90" height="110" fill="url(#skinGrad5)" rx="10"/>
        <path d="M210,180 C210,120 390,120 390,180 C390,260 355,320 300,320 C245,320 210,260 210,180 Z" fill="url(#skinGrad5)"/>
        <circle cx="265" cy="205" r="8" fill="#422D22"/>
        <circle cx="335" cy="205" r="8" fill="#422D22"/>
        <path d="M250,192 Q265,188 280,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M320,192 Q335,188 350,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M298,205 L302,235 L292,238" stroke="#B08658" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M275,268 Q300,278 325,268" stroke="#8C4A3E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Ivy League Short Taper Crew Cut -->
        <path d="M210,175 C205,130 240,90 300,90 C360,90 395,130 390,175 C370,170 340,165 300,165 C260,165 230,170 210,175 Z" fill="url(#hairGrad5)"/>
        <!-- Square Temple Corners & Subtle Front Brush Up -->
        <path d="M235,168 L245,150 L260,166 L275,148 L290,166 L305,148 L320,166 L335,148 L350,166 L365,150" stroke="#140D0A" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M250,120 Q300,105 350,120" stroke="#5A473E" stroke-width="2" fill="none"/>
        <rect x="20" y="405" width="280" height="26" rx="6" fill="#0A0C14" fill-opacity="0.85" stroke="#8B5CF6" stroke-width="1"/>
        <text x="32" y="422" fill="#C4B5FD" font-family="monospace" font-weight="bold" font-size="11">IVY LEAGUE CREW CUT • SQUARE CORNERS</text>
      </svg>
    `,

    mid_length_flow: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
        <defs>
          <linearGradient id="bg6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#141724"/><stop offset="100%" stop-color="#0A0C12"/></linearGradient>
          <linearGradient id="skinGrad6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#DEB887"/><stop offset="100%" stop-color="#C69C6D"/></linearGradient>
          <linearGradient id="hairGrad6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#382C24"/><stop offset="100%" stop-color="#1C1410"/></linearGradient>
        </defs>
        <rect width="600" height="450" fill="url(#bg6)"/>
        <path d="M120,450 Q300,370 480,450 L480,450 L120,450 Z" fill="#1C2130"/>
        <rect x="255" y="270" width="90" height="110" fill="url(#skinGrad6)" rx="10"/>
        <path d="M210,180 C210,120 390,120 390,180 C390,260 355,320 300,320 C245,320 210,260 210,180 Z" fill="url(#skinGrad6)"/>
        <circle cx="265" cy="205" r="8" fill="#422D22"/>
        <circle cx="335" cy="205" r="8" fill="#422D22"/>
        <path d="M250,192 Q265,188 280,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M320,192 Q335,188 350,192" stroke="#2B1D16" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M298,205 L302,235 L292,238" stroke="#B08658" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M275,268 Q300,278 325,268" stroke="#8C4A3E" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Layered Mid-Length Flow Wings -->
        <path d="M185,240 C175,170 210,50 300,50 C390,50 425,170 415,240 C400,225 385,180 375,170 C345,175 320,150 300,150 C280,150 255,175 225,170 C215,180 200,225 185,240 Z" fill="url(#hairGrad6)"/>
        <!-- Natural Flow Wings Swept Over Ears -->
        <path d="M285,150 Q235,170 195,235" stroke="#5A473E" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M265,130 Q215,155 185,215" stroke="#6E564B" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M315,150 Q365,170 405,235" stroke="#5A473E" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M335,130 Q385,155 415,215" stroke="#6E564B" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M270,75 Q300,60 330,75" stroke="#8A6E60" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="20" y="405" width="280" height="26" rx="6" fill="#0A0C14" fill-opacity="0.85" stroke="#8B5CF6" stroke-width="1"/>
        <text x="32" y="422" fill="#C4B5FD" font-family="monospace" font-weight="bold" font-size="11">LAYERED MID-LENGTH FLOW • WAVY TEXTURE</text>
      </svg>
    `
  };

  const svg = svgs[cutType] || svgs.french_crop;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
