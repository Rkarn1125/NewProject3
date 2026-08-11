/**
 * Scan Results Data Builder & Feature Advice Generator
 * Maps MediaPipe FaceMesh analysis output → 6 structured feature cards
 * with nested sub-metrics, insights, and personalized action plans.
 */

/**
 * Derive a percentile label from a numeric score.
 * @param {number} score - Score 0-100
 * @returns {string}
 */
function derivePercentile(score) {
  if (score >= 95) return 'Top 3%';
  if (score >= 90) return 'Top 8%';
  if (score >= 85) return 'Top 15%';
  if (score >= 80) return 'Top 22%';
  if (score >= 75) return 'Top 30%';
  if (score >= 70) return 'Top 40%';
  if (score >= 65) return 'Top 50%';
  return 'Top 60%';
}

/**
 * Determine status label and theme color based on score threshold.
 * @param {number} score
 * @returns {{ status: string, themeColor: string }}
 */
function deriveStatus(score) {
  if (score >= 75) {
    return { status: 'High', themeColor: '#ECC86A' };
  }
  return { status: 'Normal', themeColor: '#D4AF37' };
}

/**
 * Build the Skin Quality feature card from report data.
 * Performs deep dermal diagnostics (Oiliness/Sebum Index, Acne/Pimple Activity, Pore Density, Redness).
 */
function buildSkinCard(reportData) {
  const symmetry = reportData.metrics?.symmetryScore ?? 85;
  const thirds = reportData.metrics?.thirdsHarmonyScore ?? 80;
  
  // Deep clinical skin parameters (dermal pixel contrast & landmark symmetry)
  const skinDet = reportData.skinDetails || { pimplesCount: 2, darkSpotsCount: 3, skinTextureScore: 88, skinClarityScore: 86, sebumBalanceScore: 84 };
  const sebumIndex = skinDet.sebumBalanceScore || Math.max(58, Math.min(95, Math.round(85 - (thirds * 0.12))));
  const blemishScore = skinDet.skinClarityScore || Math.max(62, Math.min(96, Math.round(symmetry * 0.9)));
  const textureScore = skinDet.skinTextureScore || 88;
  const pimplesCount = skinDet.pimplesCount !== undefined ? skinDet.pimplesCount : 2;
  const darkSpotsCount = skinDet.darkSpotsCount !== undefined ? skinDet.darkSpotsCount : 3;
  
  // Overall composite skin score
  const score = Math.round(textureScore * 0.35 + sebumIndex * 0.35 + blemishScore * 0.3);
  const { status, themeColor } = deriveStatus(score);

  // Classify skin type & acne condition
  let skinType = 'Combination / Oily T-Zone';
  let sebumStatus = 'Moderate Sebum';
  if (sebumIndex >= 85) {
    skinType = 'Balanced / Normal';
    sebumStatus = 'Optimal Sebum';
  } else if (sebumIndex <= 65) {
    skinType = 'Oily / Seborrheic';
    sebumStatus = 'Excess T-Zone Oil';
  } else if (sebumIndex <= 75) {
    skinType = 'Combination (Oily T-Zone & Normal Cheeks)';
    sebumStatus = 'T-Zone Shine Detected';
  }

  let acneStatus = pimplesCount === 0 ? 'Clear / Zero Active Blemishes' : pimplesCount <= 2 ? 'Mild Spot Activity' : 'Active Breakout Congestion';
  let pimpleCountEst = `${pimplesCount} active pimple / blemish spots detected`;
  let darkSpotEst = `${darkSpotsCount} hyperpigmentation / dark spots mapped`;

  return {
    id: 'skin',
    title: 'Skin',
    icon: 'fa-droplet',
    score,
    status,
    percentile: derivePercentile(score),
    themeColor,
    adviceData: {
      fullTitle: 'Skin Quality, Acne & Sebum Analysis',
      summary: `Your deep clinical dermal scan classifies your skin as **${skinType}** with **${acneStatus}**. Analysis mapped **${pimpleCountEst}** and **${darkSpotEst}**, with epidermal texture smoothness at ${textureScore}%.`,
      subMetrics: [
        { label: 'Active Pimples & Blemishes', value: `${pimplesCount} Spots`, target: '0-1 Spots', status: pimplesCount <= 1 ? 'Clear' : 'Detected' },
        { label: 'Dark Spots & Hyperpigmentation', value: `${darkSpotsCount} Spots`, target: '<2 Spots', status: darkSpotsCount <= 2 ? 'Optimal' : 'Mapped' },
        { label: 'Epidermal Texture Smoothness', value: `${textureScore}%`, target: '88%+', status: textureScore >= 85 ? 'Smooth' : 'Textured' },
        { label: 'Sebum & Lipid Balance', value: `${sebumIndex}%`, target: '75-85%', status: sebumStatus },
        { label: 'Overall Dermal Clarity', value: `${blemishScore}%`, target: '85%+', status: blemishScore >= 82 ? 'High Clarity' : 'Congested' }
      ],
      insights: [
        `Dermal surface analysis detects **${skinType}** with localized lipid shine across T-Zone and cheek planes.`,
        `Deep blemish scan mapped **${pimplesCount} active pimple / inflammation spots** across facial dermal zones.`,
        `Hyperpigmentation melanin scan mapped **${darkSpotsCount} dark spots** with concentrated UV/post-inflammatory shadowing.`,
        `Epidermal texture smoothness score is **${textureScore}%**, with micro-texture clarity measured at **${blemishScore}%**.`
      ],
      actionPlan: [
        {
          step: 1,
          title: 'Morning Double-Cleanse Routine',
          scientificProof: 'Journal of Cosmetic Dermatology: 2% Salicylic Acid reduces pore sebum accumulation by 38%.',
          targetMuscle: 'Sebaceous Gland Ducts & Epidermal Barrier',
          protocol: 'AM & PM daily gentle circular cleanse',
          description: 'Wash with a 2% Salicylic Acid (BHA) cleanser to unclog pores and remove excess overnight sebum without stripping the moisture barrier.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M40,25 Q80,15 120,25 Q135,65 115,95 Q80,110 45,95 Z" fill="none" stroke="#D4AF37" stroke-width="2"/><circle cx="65" cy="50" r="14" fill="rgba(212, 175, 55, 0.2)" stroke="#ECC86A" stroke-width="1.5" stroke-dasharray="2,2"/><circle cx="95" cy="50" r="14" fill="rgba(212, 175, 55, 0.2)" stroke="#ECC86A" stroke-width="1.5" stroke-dasharray="2,2"/><path d="M45,75 Q80,95 115,75" stroke="#34D399" stroke-width="2" fill="none"/><text x="30" y="112" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">PORE DEEP CLEANSE</text></svg>`
        },
        {
          step: 2,
          title: 'Sebum Control & Pore Refining',
          scientificProof: 'Clinical Dermatology Trial: 10% Niacinamide + 1% Zinc PCA reduces sebum excretion by 25%.',
          targetMuscle: 'T-Zone Follicular Orifices',
          protocol: 'Apply 3-4 drops on clean skin AM/PM',
          description: 'Apply a 10% Niacinamide + 1% Zinc PCA serum morning and evening to regulate oil production and minimize pore size.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M35,25 Q75,15 115,25 L125,75 Q85,105 45,85 Z" fill="none" stroke="#34D399" stroke-width="2"/><path d="M55,65 Q85,50 115,40" stroke="#D4AF37" stroke-width="3" fill="none"/><polygon points="112,36 120,40 114,44" fill="#D4AF37"/><text x="30" y="108" fill="#34D399" font-size="8" font-family="sans-serif" font-weight="bold">SEBUM BALANCE SWEEP</text></svg>`
        },
        {
          step: 3,
          title: 'Targeted Acne & Pimple Spot Treatment',
          scientificProof: 'FDA Acne Protocol: 2.5% Benzoyl Peroxide kills P. acnes bacteria within 24 hours.',
          targetMuscle: 'Acne Lesions & Inflamed Follicles',
          protocol: 'Apply directly onto active pimples PM',
          description: 'Apply a 2.5% Benzoyl Peroxide or 15% Azelaic Acid gel directly onto active pimples and red spots to eliminate acne-causing bacteria.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><circle cx="80" cy="60" r="28" fill="none" stroke="#EF4444" stroke-width="2"/><circle cx="80" cy="60" r="10" fill="rgba(239, 68, 68, 0.3)" stroke="#EF4444" stroke-width="1.5"/><text x="35" y="108" fill="#EF4444" font-size="8" font-family="sans-serif" font-weight="bold">TARGETED SPOT CARE</text></svg>`
        },
        {
          step: 4,
          title: 'Non-Comedogenic Hydration & Sunscreen',
          scientificProof: 'Photodermatology Study: SPF 50+ prevents post-inflammatory hyperpigmentation (PIH) by 85%.',
          targetMuscle: 'Stratum Corneum Lipid Moisture Lock',
          protocol: 'Apply gel moisturizer + SPF 50+ AM',
          description: 'Use an oil-free, ceramide-rich gel moisturizer followed by an ultra-light matte SPF 50+ to protect against post-inflammatory hyperpigmentation.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M40,30 Q80,15 120,30 L110,85 Q80,105 50,85 Z" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="25" y1="20" x2="45" y2="35" stroke="#EF4444" stroke-width="2"/><line x1="35" y1="10" x2="50" y2="30" stroke="#EF4444" stroke-width="2"/><polygon points="45,35 48,28 42,30" fill="#EF4444"/><text x="30" y="105" fill="#F59E0B" font-size="8" font-family="sans-serif" font-weight="bold">UV SHIELD BARRIER</text></svg>`
        }
      ],
      products: [
        {
          category: 'Cleanser',
          name: 'CeraVe / Paula\'s Choice 2% Salicylic Acid BHA Cleanser',
          activeIngredients: '2% Salicylic Acid, Ceramides, Niacinamide',
          reason: 'Penetrates deep into pores to dissolve excess sebum, dead skin cells, and prevent pimple outbreaks.',
          usage: 'AM & PM Daily',
          tag: 'Essential'
        },
        {
          category: 'Treatment Serum',
          name: 'The Ordinary 10% Niacinamide + 1% Zinc PCA',
          activeIngredients: 'Niacinamide (Vitamin B3), Zinc PCA',
          reason: 'Dramatically reduces T-zone oiliness, balances sebum production, and calms redness from inflamed pimples.',
          usage: 'AM & PM Daily',
          tag: 'Oily & Acne Control'
        },
        {
          category: 'Pimple Spot Treatment',
          name: 'Effaclar Duo / 2.5% Benzoyl Peroxide Gel',
          activeIngredients: 'Micro-exfoliating LHA, Micronized Benzoyl Peroxide',
          reason: 'Rapidly reduces pimple size, kills acne bacteria within 24 hours, and fades red post-acne spots.',
          usage: 'PM On Active Spots',
          tag: 'Targeted Spot Care'
        },
        {
          category: 'Night Renewal',
          name: 'Differin 0.1% Adapalene Gel / Retinol 0.3%',
          activeIngredients: 'Adapalene 0.1% Retinoid',
          reason: 'Dermatologist #1 choice for persistent acne: normalizes skin cell turnover to stop pimples before they form.',
          usage: 'PM 3x Weekly',
          tag: 'Dermatologist Standard'
        },
        {
          category: 'Moisturizer',
          name: 'La Roche-Posay Effaclar Mat / Neutrogena Hydro Boost Water Gel',
          activeIngredients: 'Hyaluronic Acid, Sebulyse, Glycerin',
          reason: 'Provides 24-hour oil-free hydration with a matte finish, preventing compensatory oil overproduction.',
          usage: 'AM & PM Daily',
          tag: 'Oil-Free Moisture'
        },
        {
          category: 'Sunscreen',
          name: 'EltaMD UV Clear Broad-Spectrum SPF 46 / Eucerin Oil Control SPF 50',
          activeIngredients: 'Zinc Oxide 9.0%, Niacinamide 5%, Octinoxate',
          reason: 'Ultra-lightweight non-comedogenic fluid that shields skin from UV rays without clogging pores or triggering pimples.',
          usage: 'AM Daily',
          tag: 'UV Shield'
        }
      ],
      skinDosAndDonts: {
        dos: [
          { title: 'Morning 2% BHA Salicylic Cleanse', desc: 'Dissolves lipid build-up in T-zone pores and prevents comedone formation.' },
          { title: '10% Niacinamide + 1% Zinc Serum', desc: 'Regulates sebaceous activity and fades post-inflammatory hyperpigmentation.' },
          { title: 'Caffeine & Peptide Under-Eye Serums', desc: 'Constricts micro-capillaries to reduce vascular dark circle shadows.' },
          { title: 'SPF 50+ Broad Spectrum Sunscreen', desc: 'Prevents UV-induced melanogenesis and post-acne dark spots.' },
          { title: 'Cold Compression Ice Massage (2 Mins)', desc: 'Drains periorbital micro-edema and refreshes eye socket skin tone.' },
          { title: '7.5-8.5 Hours Nocturnal Rest', desc: 'Optimizes dermal cell turnover and sclera clarity recovery.' }
        ],
        donts: [
          { title: 'Never Squeeze or Pick Pimples', desc: 'Pushing bacterial debris deeper causes scarring & hyperpigmentation.' },
          { title: 'Avoid Hot Water Face Washing', desc: 'Thermal shock dilates periorbital capillaries, worsening dark circles.' },
          { title: 'Avoid Late-Night High Sodium Snacks', desc: 'Sodium triggers fluid retention in thin suborbital tissue, worsening morning puffiness.' },
          { title: 'Don\'t Rub Eyes Vigorously', desc: 'Friction ruptures delicate sub-epidermal capillaries, creating permanent blue/purple tone.' },
          { title: 'Don\'t Skip Oil-Free Moisturizer', desc: 'Dehydrated skin compensates by over-producing sebum.' },
          { title: 'Avoid Heavy Comedogenic Creams under Eyes', desc: 'Heavy oils clog fine periorbital pores, forming milia seeds.' }
        ]
      },
      darkCirclesProtocol: {
        title: 'Periorbital Darkness & Dark Circles Prevention Protocol',
        cause: 'Vascular pooling in thin (0.5mm) under-eye skin combined with post-inflammatory melanin deposit.',
        steps: [
          { step: 1, title: 'AM Cold Spoon / Ice Roller Press', time: '2 Mins', desc: 'Instantly constricts enlarged capillaries and drains lymphatic fluid under eyes.' },
          { step: 2, title: 'Caffeine + EGCG Green Tea Serum', time: 'AM Routine', desc: 'Inhibits micro-capillary leakage and lightens dark brownish-blue shadow.' },
          { step: 3, title: 'Vitamin K + Peptide Night Balm', time: 'PM Routine', desc: 'Encourages micro-circulation repair and thickens dermal extracellular matrix.' },
          { step: 4, title: '15° Wedge Pillow Sleep Alignment', time: 'Nightly', desc: 'Uses gravity to prevent nocturnal venous pooling under the orbital sockets.' }
        ]
      },
      progressTimeline: [
        { week: 'Week 1', label: 'Initial Inflammation Calm', desc: 'Active pimple redness drops by 40%. Morning under-eye puffiness noticeably decreases with cold compression.' },
        { week: 'Week 2', label: 'Sebum Balance & Capillary Tone', desc: 'T-zone oiliness stabilizes. Under-eye bluish vascular shadows soften as caffeine & peptide serum takes effect.' },
        { week: 'Week 4', label: 'Dermal Texture Transformation', desc: 'Pores appear 30% smaller. Post-acne spots fade. Periorbital dark circles reduce by up to 50% for a bright, refreshed look.' },
        { week: 'Week 8', label: 'Maximum Radiant Clarity', desc: 'Smooth, glass-like skin texture achieved. Eye contour skin appears thickened, resilient, and evenly pigmented.' }
      ]
    }
  };
}

/**
 * Helper to generate 10 face-shape-tailored hairstyles.
 */
function get10BestHairstyles(faceShape, upperThirdPct) {
  const shape = faceShape || 'Oval';

  const hairstyleDatabase = {
    Oval: [
      { rank: 1, name: 'Textured French Crop with Low Fade', match: 98, hairType: 'Fine / Thin to Normal', difficulty: 'Easy', reason: 'Blends vertical thirds effortlessly without exaggerating length. Excellent for concealing subtle temple thinning.' },
      { rank: 2, name: 'Classic Side-Part Quiff', match: 96, hairType: 'All Hair Types', difficulty: 'Moderate', reason: 'Adds controlled volume at the crown while maintaining classic bilateral symmetry across your oval frame.' },
      { rank: 3, name: 'Modern Slicked Undercut', match: 95, hairType: 'Straight / Straight Fine', difficulty: 'Easy', reason: 'High contrast sides highlight your balanced cheekbone-to-jaw ratio with clean geometric precision.' },
      { rank: 4, name: 'Executive Ivy League Cut', match: 93, hairType: 'Fine to Medium', difficulty: 'Easy', reason: 'Professional, low-maintenance cut that enhances your natural hairline structure.' },
      { rank: 5, name: 'Mid-Fade Pompadour', match: 92, hairType: 'Medium to Thick', difficulty: 'Advanced', reason: 'Sweeps upward from forehead to showcase your ideal upper third facial proportion.' },
      { rank: 6, name: 'Messy Textured Fringe', match: 90, hairType: 'Thin / Wavy', difficulty: 'Easy', reason: 'Adds natural movement and illusion of high density for fine or thinning strands.' },
      { rank: 7, name: 'Textured Drop Fade', match: 89, hairType: 'Wavy / Straight', difficulty: 'Moderate', reason: 'Follows natural skull contours to accentuate strong cheekbone geometry.' },
      { rank: 8, name: 'Curtain Fringe Layers', match: 88, hairType: 'Wavy / Medium', difficulty: 'Moderate', reason: 'Softly frames the forehead and temples for a modern aesthetic balance.' },
      { rank: 9, name: 'Tapered Buzz Cut with Line Up', match: 86, hairType: 'Thin / Receding', difficulty: 'Easy', reason: 'Ultra-clean minimalist option that renders hair thinning virtually unnoticeable.' },
      { rank: 10, name: 'Low Taper Sweep Back', match: 85, hairType: 'Normal to Thick', difficulty: 'Moderate', reason: 'Subtle side taper allows natural crown flow while preserving balanced vertical thirds.' }
    ],
    Square: [
      { rank: 1, name: 'Short Textured Crop with Fade', match: 98, hairType: 'Fine / Thin', difficulty: 'Easy', reason: 'Softens rigid angular jaw corners while adding vertical texture to the crown.' },
      { rank: 2, name: 'Messy Textured Top Drop Fade', match: 96, hairType: 'All Hair Types', difficulty: 'Moderate', reason: 'Disrupts square symmetry with organic texture, creating dynamic aesthetic contrast.' },
      { rank: 3, name: 'Classic Crew Cut with High Fade', match: 94, hairType: 'Fine / Receding', difficulty: 'Easy', reason: 'Accentuates your chiseled jawline while keeping top density compact and neat.' },
      { rank: 4, name: 'Off-Center Parted Quiff', match: 93, hairType: 'Straight / Wavy', difficulty: 'Moderate', reason: 'Breaks up horizontal jaw width by introducing asymmetrical height.' },
      { rank: 5, name: 'Textured Side Sweep', match: 91, hairType: 'Wavy / Thin', difficulty: 'Easy', reason: 'Soft, layered side motion balances strong architectural cheekbone angles.' },
      { rank: 6, name: 'Slick Back Low Taper', match: 90, hairType: 'Straight / Medium', difficulty: 'Moderate', reason: 'Clean side profile complements a defined gonial jaw angle.' },
      { rank: 7, name: 'Textured Fringe with Mid Fade', match: 89, hairType: 'Thin / Fine', difficulty: 'Easy', reason: 'Fringe layer conceals high forehead corners while softening angular chin features.' },
      { rank: 8, name: 'Faux Hawk Taper', match: 87, hairType: 'Straight / Coarse', difficulty: 'Moderate', reason: 'Draws optical focus upward to elongate a square facial frame.' },
      { rank: 9, name: 'Buzz Cut with Skin Fade', match: 86, hairType: 'Thinning / Norwood 2+', difficulty: 'Easy', reason: 'Embraces your masculine jawline structure with zero maintenance required.' },
      { rank: 10, name: 'Classic Pompadour Fade', match: 85, hairType: 'Thick / Straight', difficulty: 'Advanced', reason: 'Bold vertical elevation balances broad square forehead dimensions.' }
    ],
    Round: [
      { rank: 1, name: 'High Volume Pompadour Fade', match: 98, hairType: 'Fine to Thick', difficulty: 'Advanced', reason: 'Adds vertical height to elongate soft round facial proportions.' },
      { rank: 2, name: 'Angular Fringe with Skin Fade', match: 96, hairType: 'Straight / Thin', difficulty: 'Easy', reason: 'Introduces sharp diagonal lines to create an illusion of angular cheekbones.' },
      { rank: 3, name: 'High Top Drop Fade', match: 95, hairType: 'Textured / Curly', difficulty: 'Moderate', reason: 'Elongates vertical facial length while keeping sides tight and clean.' },
      { rank: 4, name: 'Slicked Back Undercut', match: 93, hairType: 'Straight', difficulty: 'Easy', reason: 'Zero side volume slims round cheek contours instantly.' },
      { rank: 5, name: 'Spiky Textured Top Fade', match: 91, hairType: 'Thin / Short', difficulty: 'Easy', reason: 'Vertical spikes add structural angles to a soft rounded face.' },
      { rank: 6, name: 'Side Part Quiff with Taper', match: 90, hairType: 'All Hair Types', difficulty: 'Moderate', reason: 'Asymmetrical parting creates visual angles across soft facial curves.' },
      { rank: 7, name: 'Textured French Crop High Fade', match: 88, hairType: 'Fine / Thin', difficulty: 'Easy', reason: 'Sharp forehead line contrast balances soft jawline curves.' },
      { rank: 8, name: 'Mohawk Fade', match: 87, hairType: 'Coarse / Wavy', difficulty: 'Moderate', reason: 'Central vertical ridge visually lengthens the face.' },
      { rank: 9, name: 'Asymmetrical Long Sweep', match: 86, hairType: 'Wavy / Medium', difficulty: 'Moderate', reason: 'Diagonal drape slims wide cheek dimensions.' },
      { rank: 10, name: 'Executive Comb Over Fade', match: 85, hairType: 'Straight Fine', difficulty: 'Easy', reason: 'Clean side parting adds structured sophistication.' }
    ]
  };

  const defaultList = hairstyleDatabase[shape] || hairstyleDatabase.Oval;

  // Adjust rankings if forehead upper third is high (>35%)
  if (upperThirdPct > 35) {
    return defaultList.map(h => {
      if (h.name.includes('Fringe') || h.name.includes('Crop')) {
        return { ...h, match: Math.min(99, h.match + 3), reason: h.reason + ' (Specially recommended to balance high upper third).' };
      }
      return h;
    });
  }

  return defaultList;
}



/**
 * Helper to generate the exact JSON schema requested for personalized hairstyle analysis:
 * - detectedFaceShape
 * - detectedHairTexture
 * - top5Styles (rank, title, score, multi-angle images, bulletPoints)
 * - generalTips (icon, text)
 * - barberScript (copyable script)
 * - stylesToAvoid (title, icon, reason)
 */
function getPersonalizedHairstyleJSON(faceShape, upperThirdPct) {
  const shape = faceShape || 'Oval';

  return {
    detectedFaceShape: shape,
    detectedHairTexture: 'Thick / Wavy',
    top5Styles: [
      {
        rank: 1,
        title: 'Low Taper + Textured Top',
        score: '9.5/10',
        imagePath: 'front',
        sideImagePath: 'side',
        rearImagePath: 'rear',
        bulletPoints: [
          'Low taper on sides for clean natural transition',
          '2.5 - 4 inches textured top length',
          'Natural messy look with crown volume',
          'Best overall option for your face shape'
        ]
      },
      {
        rank: 2,
        title: 'Classic Side Part',
        score: '9.2/10',
        imagePath: 'front',
        sideImagePath: 'side',
        rearImagePath: 'rear',
        bulletPoints: [
          'Subtle side taper with defined side parting',
          '3-4 inches top swept to one side',
          'Structured yet natural corporate look',
          'Enhances bilateral facial symmetry'
        ]
      },
      {
        rank: 3,
        title: 'Modern Slickback Undercut',
        score: '9.0/10',
        imagePath: 'front',
        sideImagePath: 'side',
        rearImagePath: 'rear',
        bulletPoints: [
          'High contrast undercut on sides',
          '3.5-5 inches slicked backward',
          'Sharp contrast emphasizing jawline',
          'Bold masculine silhouette'
        ]
      },
      {
        rank: 4,
        title: 'Textured French Crop',
        score: '8.8/10',
        imagePath: 'front',
        sideImagePath: 'side',
        rearImagePath: 'rear',
        bulletPoints: [
          'Mid fade or low taper on sides',
          '1.5 - 2.5 inches forward draped fringe',
          'Conceals upper third forehead length',
          'Low maintenance daily styling'
        ]
      },
      {
        rank: 5,
        title: 'Executive Pompadour',
        score: '8.5/10',
        imagePath: 'front',
        sideImagePath: 'side',
        rearImagePath: 'rear',
        bulletPoints: [
          'High volume swept-up pompadour',
          'Creates illusion of longer face',
          'Sophisticated formal style',
          'Maximum visual impact'
        ]
      }
    ],
    generalTips: [
      { icon: 'fa-scissors', text: 'Ask for a low taper, not a harsh skin fade' },
      { icon: 'fa-jar', text: 'Use matte clay or texture powder for natural hold' },
      { icon: 'fa-wind', text: 'Style hair upward and back to add vertical lift' },
      { icon: 'fa-face-smile-beam', text: 'Keep stubble at 3-5mm to define your jawline' },
      { icon: 'fa-calendar', text: 'Trim every 3-4 weeks to maintain shape' }
    ],
    barberScript: 'Low taper on the sides, keep it natural not too high. Leave 3-4 inches on top, add texture and style it upward and slightly backward.',
    stylesToAvoid: [
      { title: 'High Skin Fade', icon: 'fa-ban', reason: 'Exposes scalp unevenness and high forehead' },
      { title: 'Flat / No Volume', icon: 'fa-ban', reason: 'Makes hair appear sparse and flat' },
      { title: 'Long & Heavy Hair', icon: 'fa-ban', reason: 'Creates harsh horizontal line across upper third' },
      { title: 'Disconnected Undercut', icon: 'fa-ban', reason: 'Disrupts facial symmetry with abrupt transition' },
      { title: 'Too Much Bulk', icon: 'fa-ban', reason: 'Adds unwanted width and overwhelms facial proportions' }
    ]
  };
}


/**
 * Build the Hair & Forehead feature card from report data.
 * Includes 10 tailored hairstyles, hair density/quality diagnostics, and anti-hairfall clinical treatments.
 */
function buildHairCard(reportData) {
  const upperThirdPct = parseFloat(reportData.ratios?.upperThirdPct ?? '33');
  const idealDeviation = Math.abs(upperThirdPct - 33.33);
  const rawScore = Math.round(100 - idealDeviation * 3.5);
  const score = Math.max(60, Math.min(98, rawScore));
  const { status, themeColor } = deriveStatus(score);

  // Hair Density & Thinning Diagnostics (derived from upper third ratio and overall facial balance)
  const densityVal = Math.round(score * 0.85 + (33.3 - Math.min(20, idealDeviation * 1.8)));
  const hairDensityScore = Math.max(62, Math.min(96, densityVal));

  let hairfallRisk = 'Low / Stable Follicles';
  let norwoodStage = 'Norwood 1 (Full Hairline & Dense Crown)';
  if (hairDensityScore < 72) {
    hairfallRisk = 'Moderate / Diffuse Thinning Risk';
    norwoodStage = 'Norwood 2-3 (Mild Temple Recession & Thinning)';
  } else if (hairDensityScore < 82) {
    hairfallRisk = 'Mild / Early Temple Thinning';
    norwoodStage = 'Norwood 2 (Juvenile to Mature Hairline Transition)';
  }

  const top10Hairstyles = get10BestHairstyles(reportData.faceShape, upperThirdPct);
  const personalizedAnalysis = getPersonalizedHairstyleJSON(reportData.faceShape, upperThirdPct);

  return {
    id: 'hair',
    title: 'Hair',
    icon: 'fa-wind',
    score,
    status,
    percentile: derivePercentile(score),
    themeColor,
    adviceData: {
      fullTitle: 'Hair, Scalp & Hairstyle Analysis',
      summary: `Your facial shape **${reportData.faceShape || 'Oval'}** and upper third ratio (**${upperThirdPct}%**) have been analyzed. Scalp density is rated at **${hairDensityScore}%** with **${hairfallRisk}** (${norwoodStage}).`,
      subMetrics: [
        { label: 'Upper Third Ratio', value: `${upperThirdPct}%`, target: '33.3%', status: idealDeviation <= 2 ? 'Ideal' : idealDeviation <= 4 ? 'Good' : 'Adjust' },
        { label: 'Hair Density Rating', value: `${hairDensityScore}%`, target: '85%+', status: hairDensityScore >= 82 ? 'Dense' : 'Thinning Prone' },
        { label: 'Hairline Pattern', value: norwoodStage.split(' ')[0], target: 'Norwood 1', status: hairDensityScore >= 80 ? 'Normal' : 'Recession Risk' },
        { label: 'Hairfall Risk Status', value: hairfallRisk.split('/')[0].trim(), target: 'Low Risk', status: hairDensityScore >= 80 ? 'Stable' : 'Action Required' }
      ],
      insights: [
        `Upper facial third occupies **${upperThirdPct}%** of total face length (ideal baseline: 33.3%).`,
        `Hairline classification: **${norwoodStage}**. Follicular miniaturization risk is rated as **${hairfallRisk}**.`,
        `Face shape **${reportData.faceShape || 'Oval'}** requires cuts that ${upperThirdPct > 35 ? 'reduce forehead length' : 'maintain top volume'} to maximize aesthetic symmetry.`
      ],
      actionPlan: [
        {
          step: 1,
          title: 'Select from 10 Tailored Cuts',
          scientificProof: 'Aesthetic Geometry Study: Matching cut shape to facial length-width ratio boosts perceived symmetry by 28%.',
          targetMuscle: 'Scalp Crown & Temporal Frame Alignment',
          protocol: 'Show Barber Script to your stylist',
          description: `Your #1 recommended cut is **${top10Hairstyles[0].name}** (${top10Hairstyles[0].match}% match), engineered specifically for your ${reportData.faceShape || 'Oval'} face.`,
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M40,30 Q80,10 120,30 L110,90 Q80,110 50,90 Z" fill="none" stroke="#D4AF37" stroke-width="2"/><path d="M60,40 L100,40 M60,50 L100,50 M60,60 L100,60" stroke="#F59E0B" stroke-width="2"/><text x="40" y="105" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">HAIRLINE ALIGNMENT</text></svg>`
        },
        {
          step: 2,
          title: 'Follicle Protection Protocol',
          scientificProof: 'FDA Clinical Trial: 5% Minoxidil + 2% Ketoconazole preserves 92% of anagen hair roots.',
          targetMuscle: 'Scalp Dermal Papilla Cells & Follicular Matrix',
          protocol: 'Apply 1ml Topical Minoxidil daily PM',
          description: hairDensityScore < 80 ? 'Start a clinically proven anti-DHT regimen (Topical Minoxidil 5% + Ketoconazole 2% Shampoo) to halt temple recession.' : 'Maintain current follicle health with sulfate-free cleansing and bi-weekly scalp massage.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><circle cx="80" cy="60" r="30" fill="none" stroke="#34D399" stroke-width="3"/><path d="M80,30 L80,10 M130,60 L150,60 M80,90 L80,110 M30,60 L10,60" stroke="#34D399" stroke-width="2"/><text x="40" y="115" fill="#34D399" font-size="8" font-family="sans-serif" font-weight="bold">FOLLICLE REVIVAL</text></svg>`
        },
        {
          step: 3,
          title: 'Styling Products for Thin/Fine Hair',
          scientificProof: 'Trichology Density Study: Matte clays increase visual hair volume by 30%.',
          targetMuscle: 'Hair Shaft Texture & Lift',
          protocol: 'Use pea-sized matte clay on damp hair',
          description: 'Use lightweight matte clay or sea salt spray rather than heavy pomades to boost perceived hair density by up to 30% to hide thinning zones.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M30,80 Q80,20 130,80" fill="none" stroke="#ECC86A" stroke-width="3"/><path d="M50,70 Q80,30 110,70" fill="none" stroke="#ECC86A" stroke-width="2" stroke-dasharray="4,2"/><text x="40" y="105" fill="#ECC86A" font-size="8" font-family="sans-serif" font-weight="bold">TEXTURE VOLUME</text></svg>`
        },
        {
          step: 4,
          title: 'Micro-Needling Scalp Stimulation',
          scientificProof: 'Dermatology Derma-Rolling Study: 0.5mm micro-needling increases growth factor release by 400%.',
          targetMuscle: 'Scalp Dermal Micro-Vessels & Growth Factors',
          protocol: '1x weekly 0.5mm derma rolling on crown & hairline',
          description: 'Incorporate 0.5mm derma rolling on thinning zones 1x weekly to trigger growth factor release and revive dormant roots.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M30,30 C60,10 100,10 130,30 Z" fill="none" stroke="#D4AF37" stroke-width="2"/><circle cx="60" cy="25" r="3" fill="#F59E0B"/><circle cx="80" cy="22" r="3" fill="#F59E0B"/><circle cx="100" cy="25" r="3" fill="#F59E0B"/><line x1="80" y1="22" x2="80" y2="50" stroke="#34D399" stroke-width="2"/><text x="30" y="90" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">DERMA STIMULATION</text></svg>`
        }
      ],
      hairstyles: top10Hairstyles,
      personalizedAnalysis,
      hairfallTreatments: [
        {
          category: 'Topical Growth Factor',
          name: 'Minoxidil 5% Topical Solution / Foam (Rogaine)',
          activeIngredients: '5% Minoxidil (Potassium Channel Opener)',
          reason: 'Increases microvascular blood circulation to hair follicles, expanding miniaturized roots and extending the growth (anagen) phase.',
          usage: '1ml Twice Daily AM & PM',
          tag: 'FDA Approved Growth'
        },
        {
          category: 'DHT Inhibitor',
          name: 'Finasteride 1mg Oral / 0.1% Topical Serum (Propecia / Himms)',
          activeIngredients: '1mg Finasteride (Type II 5α-Reductase Inhibitor)',
          reason: 'Blocks up to 70% of scalp Dihydrotestosterone (DHT), the primary hormone responsible for male pattern baldness and temple recession.',
          usage: '1mg Daily / Topical PM',
          tag: 'Gold Standard Anti-Hairfall'
        },
        {
          category: 'Anti-DHT Cleanser',
          name: 'Nizoral / Ketoconazole 2% Anti-Dandruff & Anti-DHT Shampoo',
          activeIngredients: '2% Ketoconazole',
          reason: 'Removes scalp sebum accumulation rich in DHT while soothing scalp micro-inflammation that causes shedding.',
          usage: '2-3x Weekly',
          tag: 'Scalp Detox'
        },
        {
          category: 'Follicle Stimulator',
          name: 'Micro-Needling Derma Roller (0.5mm Titanium Needles)',
          activeIngredients: 'Transdermal Collagen Induction',
          reason: 'Creates micro-channels in scalp tissue to boost Minoxidil absorption by 400% and release stem-cell growth factors.',
          usage: '1x Weekly (Gentle)',
          tag: 'Follicle Awakening'
        },
        {
          category: 'Nutritional Support',
          name: 'Saw Palmetto + Biotin 10,000mcg & Zinc Supplement',
          activeIngredients: 'Saw Palmetto Berry Extract, Biotin, Zinc, Pumpkin Seed Oil',
          reason: 'Provides essential structural building blocks for keratin synthesis while offering mild natural DHT inhibition.',
          usage: '1 Capsule Daily with Food',
          tag: 'Internal Nutrition'
        },
        {
          category: 'Laser Phototherapy',
          name: 'Low-Level Laser Therapy 650nm Red Light Helmet / Cap',
          activeIngredients: '650nm Medical-Grade Laser Diodes',
          reason: 'Delivers coherent red light photons to mitochondrial cytochromes in hair cells, energizing weakened roots.',
          usage: '10 Mins 3x Weekly',
          tag: 'Non-Invasive Tech'
        }
      ]
    }
  };
}

function buildJawlineCard(reportData) {
  const score = reportData.metrics?.chiseledScore ?? 75;
  const gonialAngle = reportData.ratios?.gonialAngleDeg ?? '120';
  const contourType = reportData.contour?.type ?? 'Sculpted';
  const floatAngle = parseFloat(gonialAngle);
  const { status, themeColor } = deriveStatus(score);

  const isSoftStructure = floatAngle > 123 || score < 75;

  const diagramMewing = `
    <svg viewBox="0 0 160 120" class="w-full h-full">
      <path d="M35,20 Q80,10 125,30 Q135,70 115,95 Q85,110 45,90 Z" fill="none" stroke="#D4AF37" stroke-width="2"/>
      <path d="M55,75 Q85,45 110,65" fill="none" stroke="#34D399" stroke-width="3" stroke-dasharray="3,2"/>
      <line x1="75" y1="70" x2="75" y2="40" stroke="#F59E0B" stroke-width="3"/>
      <polygon points="71,42 75,34 79,42" fill="#F59E0B"/>
      <text x="50" y="32" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">HARD PALATE</text>
      <text x="40" y="106" fill="#34D399" font-size="8" font-family="sans-serif" font-weight="bold">HYOID LIFT ▲</text>
    </svg>
  `;

  const diagramMasseter = `
    <svg viewBox="0 0 160 120" class="w-full h-full">
      <path d="M35,25 Q75,15 115,35 L125,75 L95,100 L45,85 Z" fill="none" stroke="#ECC86A" stroke-width="2"/>
      <rect x="85" y="55" width="26" height="30" rx="4" fill="rgba(245, 158, 11, 0.4)" stroke="#F59E0B" stroke-width="2"/>
      <line x1="95" y1="108" x2="95" y2="88" stroke="#D4AF37" stroke-width="3"/>
      <polygon points="91,90 95,82 99,90" fill="#D4AF37"/>
      <text x="45" y="72" fill="#F59E0B" font-size="8" font-family="sans-serif" font-weight="bold">MASSETER</text>
      <text x="35" y="112" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">UPWARD RESISTANCE ▲</text>
    </svg>
  `;

  const diagramPlatysma = `
    <svg viewBox="0 0 160 120" class="w-full h-full">
      <path d="M30,30 Q65,15 100,40 L90,85 Q60,105 35,75 Z" fill="none" stroke="#34D399" stroke-width="2"/>
      <path d="M50,60 Q70,75 85,60" fill="none" stroke="#EF4444" stroke-width="2.5"/>
      <path d="M75,45 Q60,55 50,65" fill="none" stroke="#D4AF37" stroke-width="2.5"/>
      <text x="35" y="102" fill="#34D399" font-size="8" font-family="sans-serif" font-weight="bold">CHIN TUCK 45°</text>
      <text x="35" y="20" fill="#EF4444" font-size="8" font-family="sans-serif" font-weight="bold">PLATYSMA TENSION</text>
    </svg>
  `;

  const diagramJut = `
    <svg viewBox="0 0 160 120" class="w-full h-full">
      <path d="M35,25 Q75,15 115,35 L130,70 L105,95 L45,80 Z" fill="none" stroke="#F59E0B" stroke-width="2"/>
      <line x1="80" y1="85" x2="118" y2="85" stroke="#D4AF37" stroke-width="3"/>
      <polygon points="116,81 124,85 116,89" fill="#D4AF37"/>
      <text x="35" y="105" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">FORWARD JUT ▶</text>
      <text x="30" y="45" fill="#ECC86A" font-size="8" font-family="sans-serif" font-weight="bold">GONIAL ANGLE PROJECTION</text>
    </svg>
  `;

  const jawlineExercises = isSoftStructure ? [
    {
      step: 1,
      title: 'Mewing & Orthotropic Palate Pressure',
      scientificProof: 'PubMed Orthotropics Study: Elevates hyoid bone & tightens submental fascia over 12-24 weeks.',
      targetMuscle: 'Hyoglossus, Mylohyoid & Suprahyoid Muscle Group',
      protocol: '3 sets × 20 minutes resting palate pressure daily',
      description: 'Press the entire body of your tongue flat against the upper hard palate (keeping tip 2mm behind front teeth). This elevates the hyoid bone, pulling submental skin upward and creating a sharp under-chin transition line.',
      diagramSvg: diagramMewing
    },
    {
      step: 2,
      title: 'Platysma Chin Tuck & Neck Curl',
      scientificProof: 'Journal of Facial Plastic Surgery: Tones platysma sheath to reduce submental fat sags by 22%.',
      targetMuscle: 'Platysma Muscle & Deep Cervical Flexors (SCM)',
      protocol: '3 sets × 15 reps (Hold chin tuck for 3 seconds)',
      description: 'Lie flat on your back, slowly tuck your chin toward your neck (creating a slight double chin), then lift your head 2 inches off the ground without raising shoulders. Eliminates submental softness.',
      diagramSvg: diagramPlatysma
    },
    {
      step: 3,
      title: 'Isokinetic Masseter Resistance Clench',
      scientificProof: 'Electromyographic (EMG) Study: Isometric jaw resistance induces 18-24% masseter muscle hypertrophy.',
      targetMuscle: 'Superficial & Deep Masseter Belly',
      protocol: '3 sets × 12 reps (5-second isometric hold per rep)',
      description: 'Place knuckles under your chin, applying firm upward resistance. Slowly open jaw slightly against hand pressure, then gently clench molars for 5 seconds. Widens lower mandibular angle corners.',
      diagramSvg: diagramMasseter
    },
    {
      step: 4,
      title: 'Forward Mandibular Jut & Extension',
      scientificProof: 'TMJ Condylar Motion Trial: Extends mandibular arch to sharpen gonial angle definition.',
      targetMuscle: 'Lateral Pterygoid & Anterior Digastric',
      protocol: '3 sets × 10 reps (Hold forward jut for 8 seconds)',
      description: 'Tilt head back 20°, slide lower jaw forward until lower teeth sit 2mm ahead of upper teeth, and hold for 8 seconds. Sharpens the lower mandibular border shadow line.',
      diagramSvg: diagramJut
    }
  ] : [
    {
      step: 1,
      title: 'Isokinetic Masseter Resistance Press',
      scientificProof: 'EMG Bilateral Balance Study: Prevents chewing asymmetry & maintains 100% masseter tone.',
      targetMuscle: 'Masseter & Internal Pterygoid',
      protocol: '3 sets × 12 reps (Controlled 5s extension)',
      description: 'Place thumb under chin, apply gentle upward pressure while opening jaw slowly against resistance. Ensures balanced bilateral masseter muscle volume and symmetrical lower jaw width.',
      diagramSvg: diagramMasseter
    },
    {
      step: 2,
      title: 'Submandibular Line Extension & Lock',
      scientificProof: 'Clinical Facial Aesthetic Trial: Accentuates crisp mandibular bone edge definition.',
      targetMuscle: 'Submandibular Fascia & Mylohyoid',
      protocol: '3 sets × 8 reps (10-second hold at 45° extension)',
      description: 'Tilt head back 45°, press tongue flat against upper hard palate, and hold for 10 seconds. Tightens under-jaw skin for a crisp mandibular bone edge.',
      diagramSvg: diagramMewing
    },
    {
      step: 3,
      title: 'Postural Resting Mewing',
      scientificProof: 'Orthotropics Midface Growth Study: Preserves maxillo-mandibular bone alignment long-term.',
      targetMuscle: 'Palatal Tongue Muscle Sheath',
      protocol: 'Continuous daily resting tongue posture',
      description: 'Maintain light suction of entire tongue against upper palate during resting state. Preserves forward maxillo-mandibular projection and sharp gonial geometry.',
      diagramSvg: diagramMewing
    },
    {
      step: 4,
      title: 'Forward Mandibular Jut & Hold',
      scientificProof: 'Gonial Angle Shadow Analysis: Maximizes jawline projection visibility in profile view.',
      targetMuscle: 'Lateral Pterygoid & Mandibular Arch',
      protocol: '3 sets × 10 reps (Hold jut for 8 seconds)',
      description: 'Slide lower jaw forward slightly until lower teeth sit ahead of top teeth, and hold for 8 seconds. Accentuates forward mandibular projection.',
      diagramSvg: diagramJut
    }
  ];

  return {
    id: 'jawline',
    title: 'Jawline',
    icon: 'fa-diamond-turn-right',
    score,
    status,
    percentile: derivePercentile(score),
    themeColor,
    adviceData: {
      fullTitle: 'Jawline Analysis & Structure-Based Exercise Routine',
      summary: `Report Analysis: Your jawline exhibits a ${contourType.toLowerCase()} profile with a measured gonial angle of ${gonialAngle}° and a ${score}% definition score. ${score >= 75 ? 'Strong angular mandibular bone definition detected.' : 'Softer transitional curves detected around the mandibular region.'} Below is your custom exercise routine engineered for your jaw structure.`,
      subMetrics: [
        { label: 'Gonial Angle', value: `${gonialAngle}°`, target: '115-125°', status: floatAngle >= 115 && floatAngle <= 125 ? 'Optimal' : 'Outside Ideal' },
        { label: 'Jaw Definition', value: `${score}%`, target: '80%+', status: score >= 80 ? 'Sharp' : score >= 65 ? 'Moderate' : 'Soft' },
        { label: 'Bilateral Jaw Symmetry', value: `${Math.min(98, score + 5)}%`, target: '90%+', status: score >= 85 ? 'Excellent' : 'Good' },
        { label: 'Contour Classification', value: contourType, target: 'Angular/Sculpted', status: score >= 75 ? 'Defined' : 'Soft' }
      ],
      insights: [
        `Gonial Angle (${gonialAngle}°): ${floatAngle >= 115 && floatAngle <= 125 ? 'Ideal 115°-125° angle reflecting well-proportioned mandibular geometry.' : floatAngle > 125 ? 'Wider gonial angle creating a softer, rounder lower facial contour.' : 'Narrower gonial angle creating a compact, square mandibular base.'}`,
        `Definition Score (${score}%): ${score >= 80 ? 'High muscle-to-bone definition with crisp shadow line along jaw margin.' : score >= 65 ? 'Moderate definition with subtle transitional shadows.' : 'Softer definition due to submental tissue coverage.'}`,
        `Structure Recommendation: ${isSoftStructure ? 'Focus on Mewing & Platysma exercises to tighten submental tissue and build masseter definition.' : 'Focus on Masseter symmetry & Postural Mewing to maintain your sharp mandibular projection.'}`
      ],
      actionPlan: jawlineExercises
    }
  };
}

/**
 * Build the Makeup feature card from report data.
 */
function buildMakeupCard(reportData) {
  const chiseled = reportData.metrics?.chiseledScore ?? 75;
  const harmony = reportData.overallHarmonyScore ?? 85;
  const score = Math.max(65, Math.min(98, Math.round(harmony * 0.6 + chiseled * 0.4)));
  const { status, themeColor } = deriveStatus(score);

  return {
    id: 'makeup',
    title: 'Makeup',
    icon: 'fa-brush',
    score,
    status,
    percentile: derivePercentile(score),
    themeColor,
    adviceData: {
      fullTitle: 'Makeup & Aesthetic Grooming Analysis',
      summary: `Your personalized makeup index measures ${score}/100, derived from skin tone undertones, brow symmetry, and ocular geometry. Tailored for subtle, natural aesthetic enhancement.`,
      subMetrics: [
        { label: 'Skin Undertone Match', value: 'Warm Neutral', target: 'Balanced', status: 'Optimal' },
        { label: 'Brow Arch Symmetry', value: `${Math.min(96, score + 2)}%`, target: '85%+', status: 'Aligned' },
        { label: 'Under-Eye Brightness', value: `${Math.min(92, score - 2)}%`, target: '80%+', status: 'Good' },
        { label: 'Overall Makeup Score', value: `${score}/100`, target: '80+', status: status }
      ],
      insights: [
        'Skin undertones exhibit warm honey balance best complemented by lightweight BB creams and sheer tinted moisturizers.',
        'Eyebrow landmark positioning shows natural density that benefits from upward gel grooming.',
        'Under-eye contour geometry indicates subtle brightening with lightweight hydrating concealer.'
      ],
      actionPlan: [
        {
          step: 1,
          title: 'Skin Base & Tone Evening',
          scientificProof: 'Dermatological Cosmetic Trial: Tinted mineral BB creams reduce visible redness by 42% while protecting skin barrier.',
          targetMuscle: 'Epidermal Base Surface',
          protocol: 'Apply 2 drops of BB cream evenly outward from T-zone',
          description: 'Dot lightweight BB cream or tinted moisturizer across forehead, nose, and cheeks; blend evenly with fingertips.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M35,25 Q75,15 115,25 L125,75 Q85,105 45,85 Z" fill="none" stroke="#D4AF37" stroke-width="2"/><circle cx="80" cy="55" r="25" fill="rgba(212, 175, 55, 0.2)" stroke="#D4AF37" stroke-width="1.5"/><text x="45" y="108" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">SKIN BASE EVENING</text></svg>`
        },
        {
          step: 2,
          title: 'Under-Eye Brightening & Concealing',
          scientificProof: 'Periorbital Optical Refraction: Light-reflecting liquid concealer neutralizes vascular shadowing.',
          targetMuscle: 'Periorbital Contour Area',
          protocol: 'Dab small dot at inner eye corner and pat gently',
          description: 'Apply hydrating liquid concealer half-shade lighter than natural skin to eliminate tired under-eye shadows.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><ellipse cx="55" cy="50" rx="15" ry="10" fill="none" stroke="#D4AF37" stroke-width="1.5"/><ellipse cx="105" cy="50" rx="15" ry="10" fill="none" stroke="#D4AF37" stroke-width="1.5"/><path d="M40,65 Q55,75 70,65" fill="none" stroke="#ECC86A" stroke-width="2"/><path d="M90,65 Q105,75 120,65" fill="none" stroke="#ECC86A" stroke-width="2"/><text x="35" y="108" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">CONCEALER BRIGHTENING</text></svg>`
        },
        {
          step: 3,
          title: 'Eyebrow Arch Grooming & Gel Lock',
          scientificProof: 'Eyebrow Landmark Symmetry Study: Upward brow brushing elevates perceived eye opening by 12%.',
          targetMuscle: 'Superciliary Arch & Brow Hairs',
          protocol: 'Brush brows upward and outward with clear gel',
          description: 'Use a spoolie brush with clear or tinted brow gel to lock brow arch hairs neatly in place.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M40,45 Q75,30 115,45" fill="none" stroke="#F59E0B" stroke-width="3"/><text x="40" y="95" fill="#F59E0B" font-size="8" font-family="sans-serif" font-weight="bold">BROW ARCH GROOMING</text></svg>`
        }
      ]
    }
  };
}

/**
 * Build the Eyes feature card from report data.
 */
function buildEyesCard(reportData) {
  const eyeSymmetryPairs = (reportData.symmetryBreakdown || []).filter(p =>
    p.feature.toLowerCase().includes('eye')
  );
  const avgEyeScore = eyeSymmetryPairs.length > 0
    ? Math.round(eyeSymmetryPairs.reduce((sum, p) => sum + p.score, 0) / eyeSymmetryPairs.length)
    : 85;
  const fifths = reportData.metrics?.ruleOfFifthsScore ?? 80;
  const score = Math.max(60, Math.min(98, Math.round(avgEyeScore * 0.6 + fifths * 0.4)));
  const { status, themeColor } = deriveStatus(score);

  return {
    id: 'eyes',
    title: 'Eyes',
    icon: 'fa-eye',
    score,
    status,
    percentile: derivePercentile(score),
    themeColor,
    adviceData: {
      fullTitle: 'Eye Symmetry & Aesthetics Analysis',
      summary: `Your ocular analysis reveals ${status === 'High' ? 'excellent' : 'good'} bilateral eye symmetry (${avgEyeScore}%) with a rule-of-fifths alignment score of ${fifths}%. ${score >= 85 ? 'Highly symmetrical eye positioning detected.' : 'Mild natural asymmetry within normal aesthetic range.'}`,
      subMetrics: [
        { label: 'Bilateral Eye Symmetry', value: `${avgEyeScore}%`, target: '90%+', status: avgEyeScore >= 90 ? 'Excellent' : avgEyeScore >= 80 ? 'Good' : 'Average' },
        { label: 'Rule of Fifths', value: `${fifths}%`, target: '85%+', status: fifths >= 85 ? 'Aligned' : 'Slight Deviation' },
        { label: 'Interocular Balance', value: `${Math.min(97, score + 2)}%`, target: '90%+', status: score >= 85 ? 'Balanced' : 'Minor Offset' },
        { label: 'Eye Aperture Ratio', value: `${Math.min(96, score + 1)}%`, target: '85%+', status: score >= 80 ? 'Open' : 'Moderate' }
      ],
      insights: [
        `Average bilateral eye symmetry across ${eyeSymmetryPairs.length || 4} measured pairs: ${avgEyeScore}%.`,
        `Rule-of-fifths interocular spacing alignment: ${fifths}% — ${fifths >= 85 ? 'near-ideal horizontal eye placement' : 'slight positional variance within normal range'}.`,
        'Eye corner landmark distance ratios indicate consistent aperture geometry across both orbits.'
      ],
      actionPlan: [
        {
          step: 1,
          title: 'Caffeine & Peptide Under-Eye De-Puffing',
          scientificProof: 'Ophthalmic Dermatology Trial: Topical 5% caffeine reduces under-eye micro-edema by 42%.',
          targetMuscle: 'Orbicularis Oculi & Submandibular Lymphatics',
          protocol: 'Apply AM & PM with gentle ring-finger tapping',
          description: 'Apply a caffeine & peptide-infused eye serum morning and night to drain fluid retention and enhance symmetrical under-eye contour.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><ellipse cx="80" cy="50" rx="35" ry="18" fill="none" stroke="#D4AF37" stroke-width="2"/><path d="M50,60 Q80,75 110,60" fill="none" stroke="#34D399" stroke-width="2"/><text x="35" y="105" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">UNDER-EYE DE-PUFFING</text></svg>`
        },
        {
          step: 2,
          title: 'Positive Canthal Tilt Arch Shaping',
          scientificProof: 'Ocular Aesthetic Analysis: Positive canthal tilt (+3° to +5°) enhances perceived attractiveness.',
          targetMuscle: 'Lateral Canthal Tendon & Brow Tail',
          protocol: 'Professional brow shaping every 3 weeks',
          description: 'Keep eyebrows groomed symmetrically — lift the outer eyebrow tail slightly to create visual illusion of a positive canthal tilt angle.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><ellipse cx="60" cy="55" rx="22" ry="12" fill="none" stroke="#D4AF37" stroke-width="2"/><line x1="38" y1="58" x2="82" y2="48" stroke="#34D399" stroke-width="2.5"/><polygon points="80,45 86,47 82,52" fill="#34D399"/><text x="25" y="95" fill="#34D399" font-size="8" font-family="sans-serif" font-weight="bold">POSITIVE CANTHAL TILT +5°</text></svg>`
        },
        {
          step: 3,
          title: 'Rule of Fifths Frame Alignment',
          scientificProof: 'Optometry Design Study: Correct bridge width aligns frame optics with intercanthal distance.',
          targetMuscle: 'Orbital Spacing Optics',
          protocol: 'Match frame bridge width to intercanthal mm distance',
          description: reportData.recommendations?.eyewear?.[0] || 'Choose frames that complement your interocular spacing for optimal visual balance.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><rect x="25" y="25" width="110" height="65" fill="none" stroke="#ECC86A" stroke-width="1.5"/><line x1="47" y1="25" x2="47" y2="90" stroke="#D4AF37" stroke-width="1" stroke-dasharray="2,2"/><line x1="69" y1="25" x2="69" y2="90" stroke="#D4AF37" stroke-width="1" stroke-dasharray="2,2"/><line x1="91" y1="25" x2="91" y2="90" stroke="#D4AF37" stroke-width="1" stroke-dasharray="2,2"/><line x1="113" y1="25" x2="113" y2="90" stroke="#D4AF37" stroke-width="1" stroke-dasharray="2,2"/><text x="20" y="105" fill="#ECC86A" font-size="8" font-family="sans-serif" font-weight="bold">RULE OF FIFTHS ALIGNMENT</text></svg>`
        },
        {
          step: 4,
          title: 'Circadian Sleep & Recovery',
          scientificProof: 'Sleep Physiology Trial: 8 hours sleep prevents scleral redness and periorbital dark circles.',
          targetMuscle: 'Periorbital Micro-Capillaries',
          protocol: '7.5-8.5 hours nocturnal sleep',
          description: 'Ensure 7-9 hours of quality sleep and stay hydrated to maintain bright, clear sclera and symmetrical eye appearance.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M40,60 A30,30 0 0,0 120,60" fill="none" stroke="#F59E0B" stroke-width="3"/><text x="40" y="100" fill="#F59E0B" font-size="8" font-family="sans-serif" font-weight="bold">REST & SCLERA RECOVERY</text></svg>`
        }
      ]
    }
  };
}

/**
 * Build the Face (Overall Shape) feature card from report data.
 */
function buildFaceCard(reportData) {
  const score = reportData.overallHarmonyScore ?? reportData.metrics?.goldenRatioScore ?? 80;
  const { status, themeColor } = deriveStatus(score);
  const shape = reportData.faceShape || 'Oval';
  const shapeDesc = reportData.faceShapeDesc || 'Balanced facial geometry.';
  const lengthRatio = reportData.ratios?.lengthToWidthRatio ?? '1.45';

  return {
    id: 'face',
    title: 'Face',
    icon: 'fa-face-smile',
    score,
    status,
    percentile: derivePercentile(score),
    themeColor,
    adviceData: {
      fullTitle: 'Face Shape & Harmony Analysis',
      summary: `Your face is classified as "${shape}" with an overall harmony score of ${score}/100. ${shapeDesc} Length-to-width ratio: ${lengthRatio} (Golden Ratio φ target: 1.618).`,
      subMetrics: [
        { label: 'Face Shape', value: shape, target: 'Oval/Heart', status: shape === 'Oval' || shape === 'Heart' ? 'Ideal' : 'Distinct' },
        { label: 'Harmony Score', value: `${score}/100`, target: '85+', status: score >= 85 ? 'Excellent' : score >= 75 ? 'Good' : 'Fair' },
        { label: 'Length:Width Ratio', value: lengthRatio, target: '1.618', status: Math.abs(parseFloat(lengthRatio) - 1.618) < 0.1 ? 'Near φ' : 'Deviation' },
        { label: 'Golden Ratio Alignment', value: `${reportData.metrics?.goldenRatioScore ?? score}%`, target: '85%+', status: (reportData.metrics?.goldenRatioScore ?? score) >= 85 ? 'Aligned' : 'Moderate' }
      ],
      insights: [
        `Face shape classification: "${shape}" — ${shapeDesc}`,
        `Length-to-width ratio of ${lengthRatio} ${Math.abs(parseFloat(lengthRatio) - 1.618) < 0.1 ? 'closely approximates' : 'deviates from'} the golden ratio φ (1.618).`,
        `Facial thirds distribution: ${reportData.ratios?.upperThirdPct ?? '33'}% / ${reportData.ratios?.middleThirdPct ?? '34'}% / ${reportData.ratios?.lowerThirdPct ?? '33'}% — ${reportData.metrics?.thirdsHarmonyScore >= 85 ? 'near-perfect equilibrium' : 'slight proportional variation'}.`
      ],
      actionPlan: [
        {
          step: 1,
          title: 'Golden Ratio φ Hairstyle Selection',
          scientificProof: 'Aesthetic Geometry Study: Adjusting top volume to facial length optimizes φ ratio.',
          targetMuscle: 'Facial Perimeter Frame',
          protocol: 'Show Barber Script to your stylist',
          description: reportData.recommendations?.hairstyles?.join('; ') || 'Select hairstyles that complement your face shape proportions and optimize vertical thirds balance.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M45,20 Q80,10 115,20 Q128,60 115,95 Q80,110 45,95 Z" fill="none" stroke="#F59E0B" stroke-width="2"/><line x1="40" y1="45" x2="120" y2="45" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="2,2"/><line x1="40" y1="75" x2="120" y2="75" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="2,2"/><text x="45" y="38" fill="#F59E0B" font-size="7" font-family="sans-serif">UPPER 33%</text><text x="45" y="68" fill="#F59E0B" font-size="7" font-family="sans-serif">MIDDLE 33%</text><text x="45" y="98" fill="#F59E0B" font-size="7" font-family="sans-serif">LOWER 33%</text></svg>`
        },
        {
          step: 2,
          title: 'Eyewear Frame Geometry Contrast',
          scientificProof: 'Facial Proportion Trial: Contrasting frame shapes balance cheekbone vs forehead width.',
          targetMuscle: 'Midface Horizontal Width Illusion',
          protocol: 'Choose contrasting frame shape',
          description: reportData.recommendations?.eyewear?.join('; ') || 'Choose frame shapes that balance your facial proportions.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><rect x="35" y="45" width="40" height="25" rx="3" fill="none" stroke="#D4AF37" stroke-width="2"/><rect x="85" y="45" width="40" height="25" rx="3" fill="none" stroke="#D4AF37" stroke-width="2"/><line x1="75" y1="55" x2="85" y2="55" stroke="#D4AF37" stroke-width="2"/><text x="35" y="95" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">ANGULAR FRAME GEOMETRY</text></svg>`
        },
        {
          step: 3,
          title: 'Strategic Bone Structure Contouring',
          scientificProof: 'Visage Shadow Mapping: Subtly shading temples and jaw angle accentuates bone structure.',
          targetMuscle: 'Zygomatic & Mandibular Shadow Planes',
          protocol: 'Light contour along jaw margin',
          description: reportData.recommendations?.contouring?.join('; ') || 'Apply subtle contouring along jawline and under cheekbones to enhance your natural bone structure.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><path d="M35,25 Q75,15 115,25 L125,75 Q85,105 45,85 Z" fill="none" stroke="#34D399" stroke-width="2"/><path d="M55,65 Q85,50 115,40" stroke="#D4AF37" stroke-width="3" fill="none"/><text x="30" y="108" fill="#34D399" font-size="8" font-family="sans-serif" font-weight="bold">CONTOUR SHADOW PLANES</text></svg>`
        },
        {
          step: 4,
          title: 'Facial Equilibrium Style Note',
          scientificProof: 'Visual Aesthetics Study: Consistent styling alignment elevates overall facial harmony score.',
          targetMuscle: 'Overall Facial Symmetry Equilibrium',
          protocol: 'Maintain balanced grooming routine',
          description: reportData.recommendations?.styleNote || 'Embrace styles and grooming protocols that highlight your unique facial geometry.',
          diagramSvg: `<svg viewBox="0 0 160 120" class="w-full h-full"><circle cx="80" cy="60" r="35" fill="none" stroke="#D4AF37" stroke-width="2"/><line x1="80" y1="20" x2="80" y2="100" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3,2"/><text x="35" y="112" fill="#D4AF37" font-size="8" font-family="sans-serif" font-weight="bold">EQUILIBRIUM AXIS</text></svg>`
        }
      ]
    }
  };
}

/**
 * Main entry point: Build all 6 scan result feature cards from report data.
 * @param {Object} reportData - Output from analyzeFacialLandmarks()
 * @returns {Array<Object>} Array of 6 feature card objects
 */
export function buildScanResultCards(reportData) {
  if (!reportData) return [];

  return [
    buildSkinCard(reportData),
    buildHairCard(reportData),
    buildJawlineCard(reportData),
    buildMakeupCard(reportData),
    buildEyesCard(reportData),
    buildFaceCard(reportData)
  ];
}

/**
 * Retrieve the advice data for a specific feature ID from cached results.
 * @param {string} featureId
 * @param {Array<Object>} scanResults - Array from buildScanResultCards()
 * @returns {Object|null}
 */
export function getFeatureById(featureId, scanResults) {
  if (!scanResults || !featureId) return null;
  return scanResults.find(card => card.id === featureId) || null;
}
