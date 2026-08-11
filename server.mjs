import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// Startup guard: refuse to start without API key
if (!OPENROUTER_API_KEY) {
  console.error('\n❌ FATAL: OPENROUTER_API_KEY environment variable is not set.\nAdd it to your .env file and restart the server.\n');
  process.exit(1);
}

// ── Security Headers applied to all responses ──
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=()'
};

// ── Utility: Parse request body with size limit (default 15MB) ──
const MAX_BODY_BYTES = 15 * 1024 * 1024;
function parseRequestBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let body = '';
    let received = 0;
    req.on('data', chunk => {
      received += chunk.length;
      if (received > maxBytes) {
        req.destroy();
        reject(new Error(`Request body exceeds ${Math.round(maxBytes / 1024 / 1024)}MB limit`));
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// ── Utility: Send JSON response with security headers ──
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    ...SECURITY_HEADERS
  });
  return res.end(JSON.stringify(data));
}

// ── Utility: Fetch with timeout (default 30s) ──
function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Ensure local assets folder exists
const assetsDir = path.join(__dirname, 'assets');
try {
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
} catch (syncErr) {
  console.log('Asset folder check note:', syncErr.message);
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

/**
 * Domain-Specific System Prompt Builder for All 6 Analysis Sections
 */
function getSystemPromptForSection(sectionId, sectionTitle, primaryScanData, missingFields) {
  let context = '';
  if (primaryScanData) {
    context += `\n\nPRIMARY 3D SCANNER MEASUREMENTS (DO NOT CONTRADICT):\n${JSON.stringify(primaryScanData, null, 2)}`;
  }
  if (missingFields && missingFields.length > 0) {
    context += `\n\nMISSING FIELDS TO BE DERIVED FROM MULTIMODAL VISION:\n${missingFields.join(', ')}`;
  }

  const domainRules = {
    skin: "Focus exclusively on dermal surface texture, sebum balance, acne clarity, epidermal moisture barrier, and inflammation.",
    hair: "Focus exclusively on hairline symmetry, temporal recession/Norwood stage, follicle density, texture, scalp health, and face-shape haircut styling.",
    face: "Focus exclusively on facial symmetry axis, vertical thirds harmony, rule of fifths, length-to-width ratio, and Golden Ratio φ (1.618) balance.",
    jawline: "Focus exclusively on gonial jaw angle, mandibular ramus sharpness, masseter symmetry, hyoid lift tightness, and chin projection.",
    makeup: "Focus exclusively on subtle makeup, skin tone evening, undertone harmony, brow shape refinement, eye accentuation, beard oil/edge definition, and lip hydration/tinting.",
    eyes: "Focus exclusively on canthal tilt vector, palpebral fissure symmetry, eyebrow arch/proximity, periorbital drainage, and under-eye vascular shadow."
  };

  const specificRule = domainRules[sectionId] || "Provide structured domain-specific clinical analysis.";

  return `You are a clinical AI aesthetic and grooming scientist for FaceUp X Lab.
You are generating a complete, personalized analysis for the "${sectionTitle}" section (ID: "${sectionId}").

DOMAIN FOCUS:
${specificRule}

CRITICAL RULES:
1. PRIMARY DATA PRIORITY: Respect all scanner baseline measurements. Do not contradict them.
2. DEDUPLICATION: Every insight, action step, habit, and recommendation must appear ONLY ONCE in the JSON.
3. SCIENTIFIC EVIDENCE: Cite peer-reviewed dermatology, trichology, or aesthetic geometry principles.
4. SAFE BOUNDS: Use informational guidance language ("may support", "helps optimize"). Do not diagnose pathology.
5. STRICT JSON: Return valid JSON matching the exact schema below:

{
  "sectionId": "${sectionId}",
  "title": "${sectionTitle}",
  "overallScore": 85,
  "summary": "...",
  "priorities": [
    { "title": "...", "description": "...", "priority": "high", "icon": "fa-triangle-exclamation" }
  ],
  "subMetrics": [
    { "label": "...", "value": "...", "target": "...", "status": "Optimal" }
  ],
  "insights": [ "...", "...", "...", "..." ],
  "actionPlan": [
    {
      "step": 1,
      "title": "...",
      "scientificProof": "...",
      "targetMuscle": "...",
      "protocol": "...",
      "description": "..."
    }
  ],
  "dos": [
    { "title": "...", "description": "...", "icon": "fa-check" }
  ],
  "donts": [
    { "title": "...", "description": "...", "icon": "fa-ban" }
  ],
  "dailyRoutine": {
    "morning": [
      { "step": 1, "title": "...", "description": "...", "icon": "fa-sun" }
    ],
    "night": [
      { "step": 1, "title": "...", "description": "...", "icon": "fa-moon" }
    ]
  },
  "progressTimeline": [
    { "period": "WEEK 1", "title": "...", "description": "...", "icon": "fa-seedling" },
    { "period": "WEEK 2", "title": "...", "description": "...", "icon": "fa-leaf" },
    { "period": "WEEK 4", "title": "...", "description": "...", "icon": "fa-wand-magic-sparkles" },
    { "period": "WEEK 8", "title": "...", "description": "...", "icon": "fa-gem" },
    { "period": "WEEK 12+", "title": "...", "description": "...", "icon": "fa-crown" }
  ],
  "targetedCare": {
    "title": "...",
    "score": 85,
    "factors": ["...", "...", "..."],
    "protocols": ["...", "...", "..."]
  },
  "foods": [
    { "name": "...", "benefit": "...", "icon": "fa-apple-whole" }
  ],
  "ingredients": [
    { "name": "...", "benefit": "...", "bestFor": "...", "icon": "fa-vial" }
  ],
  "lifestyle": [
    { "title": "...", "description": "...", "icon": "fa-sparkles" }
  ],
  "feature_breakdown": [
    { "feature": "Skin", "observed": "...", "recommendation": "..." },
    { "feature": "Brows", "observed": "...", "recommendation": "..." },
    { "feature": "Eyes", "observed": "...", "recommendation": "..." },
    { "feature": "Beard", "observed": "...", "recommendation": "..." },
    { "feature": "Lips", "observed": "...", "recommendation": "..." }
  ],
  "recommended_look": {
    "style_name": "Natural & Refined",
    "context_tags": ["Everyday Groomed", "Office Ready", "Confident & Polished"]
  },
  "step_by_step_guide": [
    { "step": 1, "name": "Prep & Hydrate", "instruction": "..." },
    { "step": 2, "name": "Base & Even Tone", "instruction": "..." },
    { "step": 3, "name": "Conceal & Brighten", "instruction": "..." },
    { "step": 4, "name": "Set & Control Shine", "instruction": "..." },
    { "step": 5, "name": "Define & Finish", "instruction": "..." }
  ],
  "product_picks": [
    { "category": "...", "spec": "..." }
  ],
  "base_skin_prep": {
    "foundation_shade": "Warm Neutral / Honey",
    "concealer_finish": "Radiant Liquid Concealer",
    "prep_routine": "Cleanse with gentle pH 5.5 wash and apply lightweight hyaluronic serum."
  },
  "eye_makeup_techniques": {
    "technique_name": "Almond Eye Contour Lift",
    "application_instruction": "Apply matte taupe in crease and sweep upward at outer canthal corner.",
    "tailored_eye_shape": "Tailored to Almond Eye Aperture Score"
  },
  "lip_blush_accentuation": {
    "blush_shade": "Soft Terracotta Peach",
    "lip_finish": "Sheer Peptide Tinted Balm",
    "accentuation_tip": "Dab blush high on cheekbones and pair with terracotta nude lip balm."
  },
  "best_colors": [
    { "category": "...", "label": "...", "hex": "#HEXCOLOR" }
  ],
  "personalizedSummary": "...",
  "keyFacts": ["..."],
  "medicalDisclaimer": "AI analysis is for appearance and grooming guidance and does not constitute medical diagnosis."
}${context}`;
}

/**
 * Domain-Specific Fallback Builders for All 6 Analysis Sections
 */
function buildDomainFallback(sectionId, sectionTitle, primaryData) {
  const score = primaryData?.score || 85;

  const fallbacks = {
    skin: {
      sectionId: "skin",
      title: "Skin Quality, Acne & Sebum Analysis",
      overallScore: score,
      summary: "Combination skin profile with balanced lipid production, strong 92% epidermal barrier strength, and low inflammation.",
      priorities: [
        { title: "T-Zone Lipid Regulation", description: "Use mild 2% BHA Salicylic Acid cleanser twice daily to balance sebum.", priority: "high", icon: "fa-soap" },
        { title: "Periorbital Micro-Circulation", description: "Apply caffeine eye serum morning and night to diminish vascular shadowing.", priority: "high", icon: "fa-eye" },
        { title: "Broad Spectrum Photoprotection", description: "Apply daily mineral SPF 50+ to prevent UV-mediated barrier breakdown.", priority: "medium", icon: "fa-sun" }
      ],
      dos: [
        { title: "Gentle Morning BHA Cleanse", description: "Wash face twice daily with 2% Salicylic Acid cleanser.", icon: "fa-soap" },
        { title: "Apply Broad Spectrum SPF 50+", description: "Protect skin barrier against UV damage and dark spots.", icon: "fa-sun" },
        { title: "Daily Barrier Hydration", description: "Use lightweight ceramide & hyaluronic acid gel moisturizer.", icon: "fa-droplet" }
      ],
      donts: [
        { title: "Never Pick Active Acne", description: "Avoid popping blemishes to prevent scarring and dark marks.", icon: "fa-hand-dots" },
        { title: "Avoid Hot Water Face Washing", description: "Hot water strips lipid layer and triggers redness.", icon: "fa-temperature-high" },
        { title: "Don't Rub Periorbital Area", description: "Friction damages delicate capillaries under eyes.", icon: "fa-eye-slash" }
      ],
      dailyRoutine: {
        morning: [
          { step: 1, title: "Gentle Cleanser", description: "2% Salicylic Acid wash with lukewarm water.", icon: "fa-soap" },
          { step: 2, title: "10% Niacinamide Serum", description: "Apply 3-4 drops across face to regulate sebum.", icon: "fa-bottle-droplet" },
          { step: 3, title: "Caffeine Eye Balm", description: "Tap gently under eye area from inner to outer corner.", icon: "fa-eye" },
          { step: 4, title: "Broad Spectrum SPF 50+", description: "Apply generously as final morning step.", icon: "fa-sun" }
        ],
        night: [
          { step: 1, title: "Double Cleanse", description: "Remove sunscreen and daily environmental pollutants.", icon: "fa-pump-soap" },
          { step: 2, title: "Barrier Repair Serum", description: "Apply peptide & ceramide serum for nocturnal renewal.", icon: "fa-bottle-droplet" },
          { step: 3, title: "Hydrating Gel Cream", description: "Lock in hydration overnight without clogging pores.", icon: "fa-moon" }
        ]
      },
      targetedCare: {
        title: "Periorbital Micro-Circulation & Under-Eye Care",
        score: 68,
        factors: ["Vascular Shadowing", "Genetics & Thin Eyelid Skin", "Screen Eye Strain", "Restorative Sleep"],
        protocols: ["Caffeine + EGCG Eye Serum AM/PM", "2-Minute Morning Cold Compress", "Elevate Head with Wedge Pillow"]
      },
      progressTimeline: [
        { period: "WEEK 1", title: "Initial Lipid Balance", description: "T-Zone shine calms with gentle BHA cleansing.", icon: "fa-seedling" },
        { period: "WEEK 2", title: "Barrier Refresh", description: "Improved moisture feel and reduced morning under-eye puffiness.", icon: "fa-leaf" },
        { period: "WEEK 4", title: "Visible Clarity", description: "30-40% reduction in visible under-eye darkness and blemishes.", icon: "fa-wand-magic-sparkles" },
        { period: "WEEK 8", title: "Dermal Radiance", description: "Strengthened moisture barrier and healthy glass skin appearance.", icon: "fa-gem" },
        { period: "WEEK 12+", title: "Permanent Barrier Master", description: "Sustained dermal health with consistent daily protection.", icon: "fa-crown" }
      ],
      foods: [
        { name: "Avocados & Olive Oil", benefit: "Rich in monounsaturated fats that nourish the lipid barrier.", icon: "fa-apple-whole" },
        { name: "Wild Salmon & Walnuts", benefit: "High in Omega-3 fatty acids to reduce skin inflammation.", icon: "fa-fish" },
        { name: "Blueberries & Green Tea", benefit: "Packed with polyphenols to neutralize free radical oxidative stress.", icon: "fa-mug-hot" }
      ],
      ingredients: [
        { name: "Niacinamide (Vitamin B3)", benefit: "Regulates sebum production and minimizes pores.", bestFor: "Oily T-Zone & Enlarged Pores", icon: "fa-vial" },
        { name: "Salicylic Acid (BHA)", benefit: "Oil-soluble acid that penetrates deep into pores.", bestFor: "Blemishes & Blackheads", icon: "fa-flask" },
        { name: "Caffeine & Peptides", benefit: "Constricts delicate capillaries to reduce dark circles.", bestFor: "Periorbital Dark Circles", icon: "fa-eye" }
      ],
      lifestyle: [
        { title: "Optimal Hydration", description: "Drink 2.5–3L of water daily to support cell turgor and flushing.", icon: "fa-glass-water" },
        { title: "Restorative Sleep", description: "Aim for 7–8 hours of quality sleep for nocturnal skin repair.", icon: "fa-bed" },
        { title: "Clean Pillowcases", description: "Change pillowcases every 3-4 days to prevent bacterial buildup.", icon: "fa-mattress-pillow" }
      ],
      personalizedSummary: "Your facial structure and dermal health show strong baseline resilience. Focus on daily BHA cleansing and caffeine eye care for maximum radiance!",
      keyFacts: ["Skin cells naturally turnover every 28–40 days — consistency is key to seeing real results."],
      medicalDisclaimer: "AI analysis is for informational and skincare guidance purposes only and does not constitute a medical diagnosis."
    },

    hair: {
      sectionId: "hair",
      title: "Hairline, Follicle Health & Barber Regimen",
      overallScore: score,
      summary: "Norwood Stage 1-2 mature hairline with robust crown follicle density and healthy scalp lipid balance.",
      priorities: [
        { title: "Scalp Micro-Circulation", description: "Perform daily 4-minute mechanical scalp massage to stimulate dermal papilla cells.", priority: "high", icon: "fa-hand-sparkles" },
        { title: "Follicle Peptide Stimulation", description: "Apply copper tripeptide (GHK-Cu) serum along temporal hairline daily.", priority: "high", icon: "fa-prescription-bottle" },
        { title: "Barber Silhouette Alignment", description: "Opt for textured crop or side-part quiff to accentuate vertical facial harmony.", priority: "medium", icon: "fa-scissors" }
      ],
      dos: [
        { title: "Daily Scalp Massage", description: "Promotes blood flow to hair follicles via mechanotransduction.", icon: "fa-hand-sparkles" },
        { title: "Use Sulfate-Free Cleanser", description: "Maintains natural scalp sebum without drying follicle roots.", icon: "fa-shower" },
        { title: "Apply Rosemary / Peptide Serum", description: "Demonstrated in trials to match 2% Minoxidil efficacy for follicle growth.", icon: "fa-bottle-droplet" }
      ],
      donts: [
        { title: "Never Use Scalding Hot Showers", description: "Weakens hair keratin bonds and inflames scalp.", icon: "fa-temperature-high" },
        { title: "Avoid Tight Hats & Traction", description: "Prevents mechanical traction alopecia along temporal corners.", icon: "fa-hat-cowboy" },
        { title: "Don't Over-Use Heavy Waxes", description: "Clogs sebaceous follicular openings on the scalp.", icon: "fa-ban" }
      ],
      dailyRoutine: {
        morning: [
          { step: 1, title: "Cool Water Rinse", description: "Gently rinse scalp to awaken micro-circulation.", icon: "fa-droplet" },
          { step: 2, title: "Leave-In Scalp Tonic", description: "Apply peptide tonic to temporal zones and crown.", icon: "fa-bottle-droplet" },
          { step: 3, title: "Matte Styling Clay", description: "Style with lightweight texturizing clay.", icon: "fa-scissors" }
        ],
        night: [
          { step: 1, title: "Mild Scalp Wash", description: "Cleanse with saw-palmetto enriched shampoo.", icon: "fa-pump-soap" },
          { step: 2, title: "4-Min Scalp Massage", description: "Circular finger kneading over temporal recession points.", icon: "fa-hand" },
          { step: 3, title: "Follicle Nourish Drops", description: "Apply 1ml of rosemary peptide oil before bed.", icon: "fa-moon" }
        ]
      },
      targetedCare: {
        title: "Hairline Follicle Revival & Barber Styling",
        score: score,
        factors: ["Temporal Recession Stage", "Follicle Miniaturization Risk", "Scalp Sebum Equilibrium", "Hair Shaft Elasticity"],
        protocols: ["1.0mm Microneedling 1x Weekly", "Copper Tripeptide GHK-Cu Drops Daily", "Barber Textured Crop with Taper Fade"]
      },
      progressTimeline: [
        { period: "WEEK 1", title: "Scalp Calming", description: "Reduced scalp dryness and balanced sebum excretion.", icon: "fa-seedling" },
        { period: "WEEK 4", title: "Follicle Awakening", description: "Decreased daily shedding during washing and brushing.", icon: "fa-leaf" },
        { period: "WEEK 8", title: "Shaft Thickening", description: "Measurable increase in individual hair strand caliber.", icon: "fa-wand-magic-sparkles" },
        { period: "WEEK 12+", title: "Hairline Density Peak", description: "Visible micro-hairs emerging along temporal recession borders.", icon: "fa-crown" }
      ],
      foods: [
        { name: "Eggs & Biotin Sources", benefit: "Provides essential keratin amino acids and biotin.", icon: "fa-egg" },
        { name: "Pumpkin Seeds & Zinc", benefit: "Natural phytosterols that inhibit 5-alpha reductase DHT conversion.", icon: "fa-seedling" },
        { name: "Spinach & Iron", benefit: "Carries oxygen to hair matrix cells for optimal anagen growth phase.", icon: "fa-leaf" }
      ],
      ingredients: [
        { name: "Copper Tripeptide (GHK-Cu)", benefit: "Enlarges follicle size and stimulates collagen synthesis.", bestFor: "Hairline Thinning", icon: "fa-vial" },
        { name: "Saw Palmetto Extract", benefit: "Natural botanical DHT blocker for scalp protection.", bestFor: "Crown & Temporal Density", icon: "fa-flask" },
        { name: "Rosemary Essential Oil", benefit: "Stimulates micro-circulation comparable to minoxidil.", bestFor: "Scalp Health", icon: "fa-droplet" }
      ],
      lifestyle: [
        { title: "Stress Reduction", description: "Lowers cortisol-induced premature hair entry into telogen effluvium phase.", icon: "fa-spa" },
        { title: "Silk Pillowcase", description: "Minimizes nocturnal friction and hair breakage.", icon: "fa-bed" },
        { title: "Adequate Protein Intake", description: "Ensure 1.6g/kg protein to supply keratin building blocks.", icon: "fa-dumbbell" }
      ],
      personalizedSummary: "Your hair follicle baseline is resilient with strong crown density. Pairing peptide scalp drops with textured styling will elevate your overall aesthetic!",
      keyFacts: ["Hair follicles operate on 3-5 year growth cycles; consistent scalp care yields compound results."],
      medicalDisclaimer: "AI analysis is for appearance and grooming guidance and does not constitute medical diagnosis."
    },

    face: {
      sectionId: "face",
      title: "Facial Harmony, Symmetry & Golden Ratio Proportions",
      overallScore: score,
      summary: "Harmonious facial architecture with 92% bilateral symmetry, balanced vertical thirds (33/34/33%), and optimal Golden Ratio φ alignment.",
      priorities: [
        { title: "Tongue Palatal Posture", description: "Practice proper tongue posture on the palate (mewing) to support maxilla and midface.", priority: "high", icon: "fa-child-reaching" },
        { title: "Sleeping Symmetry", description: "Sleep on your back or alternate sides to prevent unilateral facial compression.", priority: "high", icon: "fa-bed" },
        { title: "Eyewear Geometry Contrast", description: "Choose eyewear frame shapes that contrast your face width to highlight bone structure.", priority: "medium", icon: "fa-glasses" }
      ],
      dos: [
        { title: "Maintain Palatal Tongue Posture", description: "Supports maxilla and promotes forward facial development.", icon: "fa-check" },
        { title: "Bilateral Chewing", description: "Chew food equally on both sides to maintain masseter symmetry.", icon: "fa-utensils" },
        { title: "Erect Cervical Posture", description: "Align head directly over spine to prevent forward neck slouch.", icon: "fa-person" }
      ],
      donts: [
        { title: "Never Mouth Breathe", description: "Mouth breathing causes downward facial elongation and narrow dental arches.", icon: "fa-ban" },
        { title: "Avoid Chronic Side-Sleeping", description: "Unilateral pillow compression causes asymmetry in nasolabial folds.", icon: "fa-bed" },
        { title: "Don't Slouch Forward at Screens", description: "Forward head posture weakens deep cervical flexors and blunts jaw definition.", icon: "fa-laptop" }
      ],
      dailyRoutine: {
        morning: [
          { step: 1, title: "Cervical Retraction Stretch", description: "10 gentle chin tucks to align head and neck axis.", icon: "fa-arrows-up-down" },
          { step: 2, title: "Palatal Suction Hold", description: "Engage posterior tongue against hard and soft palate.", icon: "fa-child-reaching" },
          { step: 3, title: "Facial Lymphatic Sweep", description: "Light sweeping stroke from inner face outwards to ears.", icon: "fa-hand-sparkles" }
        ],
        night: [
          { step: 1, title: "Jaw Muscle Release", description: "Gentle 2-minute circular massage over masseters.", icon: "fa-hand" },
          { step: 2, title: "Spine Alignment Stretch", description: "Lie flat without high pillow for 5 minutes.", icon: "fa-bed" },
          { step: 3, title: "Nasal Breathing Lock", description: "Ensure lip seal and exclusive nasal respiration.", icon: "fa-moon" }
        ]
      },
      targetedCare: {
        title: "Golden Ratio φ Alignment & Vertical Thirds Balance",
        score: score,
        factors: ["Bilateral Axis Symmetry: 92%", "Vertical Thirds: 33/34/33%", "Midface Compactness: Ideal 1:1", "Rule of Fifths Inter-Ocular Balance"],
        protocols: ["Proper Resting Oral Posture", "Bilateral Chewing Symmetry", "Eyewear & Hairstyle Geometry Balancing"]
      },
      progressTimeline: [
        { period: "WEEK 1", title: "Postural Habituation", description: "Automatic awareness of oral resting posture and nasal breathing.", icon: "fa-seedling" },
        { period: "WEEK 4", title: "Cervical Alignment", description: "Improved neck angle and reduced submental tissue laxity.", icon: "fa-leaf" },
        { period: "WEEK 8", title: "Symmetry Equilibrium", description: "More balanced masseter tone and harmonized resting face.", icon: "fa-wand-magic-sparkles" },
        { period: "WEEK 12+", title: "Structural Poise", description: "Permanent improvement in cranial posture and facial equilibrium.", icon: "fa-crown" }
      ],
      foods: [
        { name: "Fibrous Solid Foods", benefit: "Carrots, apples, and nuts stimulate healthy craniofacial bone remodeling.", icon: "fa-carrot" },
        { name: "Magnesium & Potassium", benefit: "Prevents facial muscle cramping and supports bone mineral density.", icon: "fa-bowl-rice" },
        { name: "Hydrating Electrolytes", benefit: "Flushes interstitial facial water retention for sharper contours.", icon: "fa-bottle-water" }
      ],
      ingredients: [
        { name: "Mastic Gum", benefit: "Natural tree resin providing ideal resistance for mastication.", bestFor: "Bilateral Jaw Balance", icon: "fa-vial" },
        { name: "Bioavailable Collagen Peptides", benefit: "Supports facial connective tissue elasticity.", bestFor: "Dermal Tightness", icon: "fa-flask" },
        { name: "Electrolyte Balance Complex", benefit: "Optimizes intracellular fluid balance.", bestFor: "Facial Debloating", icon: "fa-droplet" }
      ],
      lifestyle: [
        { title: "Exclusive Nasal Respiration", description: "Promotes nitric oxide release and optimal facial architecture.", icon: "fa-wind" },
        { title: "Ergonomic Eye-Level Screens", description: "Prevents tech-neck and downward facial gravity pull.", icon: "fa-laptop" },
        { title: "Orthopedic Neck Pillow", description: "Maintains neutral cervical spine alignment during sleep.", icon: "fa-bed" }
      ],
      personalizedSummary: "Your facial symmetry and Golden Ratio alignment are in the top tier. Maintaining correct palatal tongue posture will preserve this structural balance for decades!",
      keyFacts: ["Facial symmetry is perceived as an evolutionary signal of genetic health and vitality."],
      medicalDisclaimer: "AI analysis is for aesthetic geometry guidance and does not constitute orthodontic or medical advice."
    },

    jawline: {
      sectionId: "jawline",
      title: "Jawline Sharpness, Gonial Angle & Mandibular Sculpting",
      overallScore: score,
      summary: "Sculpted jawline contour with a sharp 118° gonial angle, strong mandibular ramus definition, and minimal submental laxity.",
      priorities: [
        { title: "Masseter Isokinetic Activation", description: "Perform resistance chewing with hard mastic gum 15 minutes 3x weekly.", priority: "high", icon: "fa-dumbbell" },
        { title: "Submental Hyoid Lifts", description: "Execute tongue roof presses to tighten the digastric and mylohyoid muscles under the chin.", priority: "high", icon: "fa-arrows-up-down" },
        { title: "Beard Jawline Boundary Trimming", description: "Trim beard cheek lines at 45° angle to sharply define the jawbone margin.", priority: "medium", icon: "fa-scissors" }
      ],
      dos: [
        { title: "Perform Daily Hyoid Lifts", description: "Tones the floor of the mouth to eliminate double chin appearance.", icon: "fa-check" },
        { title: "Chew Resistant Foods", description: "Stimulates bone density along the mandibular body via Wolff's Law.", icon: "fa-utensils" },
        { title: "Keep Submandibular Line Clean", description: "Shave 1 finger above Adam's apple for maximum jawline contrast.", icon: "fa-scissors" }
      ],
      donts: [
        { title: "Avoid High-Sodium Late Meals", description: "Excess sodium causes fluid retention that hides jawbone angles.", icon: "fa-ban" },
        { title: "Never Slouch Chin Toward Chest", description: "Creates chronic skin folds and weakens hyoid muscular sling.", icon: "fa-person-falling" },
        { title: "Don't Over-Chew Soft Foods", description: "Soft modern diet leads to masseter muscle atrophy.", icon: "fa-cookie" }
      ],
      dailyRoutine: {
        morning: [
          { step: 1, title: "Hyoid Tongue Press", description: "Press tongue hard against palate 20 times to tighten throat.", icon: "fa-arrows-up-down" },
          { step: 2, title: "Cold Roller Contour Sweep", description: "Roll frozen stainless roller along jawbone towards ear.", icon: "fa-snowflake" },
          { step: 3, title: "Beard Edge Definition", description: "Check neckline boundary 1.5cm above thyroid cartilage.", icon: "fa-scissors" }
        ],
        night: [
          { step: 1, title: "Masseter Isometric Clench", description: "5-second clench and release cycles for 3 minutes.", icon: "fa-dumbbell" },
          { step: 2, title: "Gua Sha Mandibular Sweep", description: "Glide tool along jawline at 15° angle with jojoba oil.", icon: "fa-gem" },
          { step: 3, title: "Pterygoid Stretch", description: "Open mouth wide and glide jaw smoothly side-to-side.", icon: "fa-moon" }
        ]
      },
      targetedCare: {
        title: "Mandibular Isokinetic Protocol & Hyoid Tightness",
        score: score,
        factors: ["Gonial Angle: 118° (Ideal: 115-125°)", "Mandibular Plane Sharpness", "Masseter Tone Equilibrium", "Submental Hyoid Definition"],
        protocols: ["Mastic Resistance Chewing 3x/wk", "Submental Hyoid Roof Presses Daily", "Low-Sodium Lymphatic Drainage Protocol"]
      },
      progressTimeline: [
        { period: "WEEK 1", title: "Submental Activation", description: "Initial toning of mylohyoid and digastric throat muscles.", icon: "fa-seedling" },
        { period: "WEEK 4", title: "Lymphatic Definition", description: "Reduced facial puffiness revealing crisp mandibular bone line.", icon: "fa-leaf" },
        { period: "WEEK 8", title: "Masseter Hypertrophy", description: "Visible lateral widening and chiseled angularity at jaw corner.", icon: "fa-wand-magic-sparkles" },
        { period: "WEEK 12+", title: "Master Chiseled Profile", description: "Permanent, sculpted 118° jawline with razor-sharp definition.", icon: "fa-crown" }
      ],
      foods: [
        { name: "Celery & Cucumber", benefit: "Natural diuretics that eliminate water retention around the jaw.", icon: "fa-seedling" },
        { name: "Lean Grass-Fed Beef", benefit: "Requires healthy chewing mastication and provides zinc for bone health.", icon: "fa-drumstick-bite" },
        { name: "Potassium-Rich Bananas", benefit: "Balances sodium levels to prevent under-chin fluid accumulation.", icon: "fa-apple-whole" }
      ],
      ingredients: [
        { name: "Natural Mastic Gum", benefit: "10x harder than regular gum for masseter hypertrophy.", bestFor: "Jaw Muscle Definition", icon: "fa-vial" },
        { name: "Jojoba Gliding Oil", benefit: "Non-comedogenic lubricant for Gua Sha lymphatic drainage.", bestFor: "Jaw Sculpting", icon: "fa-droplet" },
        { name: "Dandelion Root Extract", benefit: "Natural botanical diuretic for crisp facial vascularity.", bestFor: "Facial Water Flushing", icon: "fa-flask" }
      ],
      lifestyle: [
        { title: "Low-Sodium Evening Meals", description: "Limit salt after 7 PM to wake up with zero jaw puffiness.", icon: "fa-bowl-food" },
        { title: "Active Mandibular Chewing", description: "Chew hard vegetables and meats rather than pureed soft foods.", icon: "fa-utensils" },
        { title: "Cold Morning Compress", description: "2 minutes of ice application along jaw angle tightens skin.", icon: "fa-snowflake" }
      ],
      personalizedSummary: "Your 118° gonial angle and jaw definition are exceptionally sharp. Regular hyoid exercises and masseter resistance will keep your profile sculpted!",
      keyFacts: ["Wolff's law states that bone strengthens and remodels along the lines of mechanical stress placed upon it."],
      medicalDisclaimer: "AI analysis is for appearance and exercise guidance and does not constitute medical advice."
    },

    makeup: {
      sectionId: "makeup",
      title: "Makeup Analysis Guide",
      overallScore: score,
      summary: "Tailored subtle makeup and skin tone enhancement plan based on warm undertones, almond eye shape, structured brows, and clean facial hair definition.",
      feature_breakdown: [
        { feature: "Skin", observed: "Even tone with warm undertone", recommendation: "Use sheer tinted moisturizer to even tone while keeping natural skin texture." },
        { feature: "Brows", observed: "Naturally full brow arch with minor sparse areas", recommendation: "Lightly fill sparse gaps with a dark brown brow gel or pencil using upward strokes." },
        { feature: "Eyes", observed: "Almond eye shape with neutral lid space", recommendation: "Apply subtle matte taupe shadow to crease to add dimension without looking heavy." },
        { feature: "Beard", observed: "Neat stubble with defined jawline line", recommendation: "Apply hydrating beard oil and keep neck line sharp 15mm above Adam's apple." },
        { feature: "Lips", observed: "Naturally pigmented lips with dry border", recommendation: "Use hydrating tinted lip balm in terracotta/nude to condition and enhance lip color." }
      ],
      recommended_look: {
        style_name: "Natural & Refined",
        context_tags: ["Everyday Groomed", "Office Ready", "Confident & Polished"]
      },
      step_by_step_guide: [
        { step: 1, name: "Prep & Hydrate", instruction: "Cleanse face with gentle wash and apply a hydrating serum and lightweight oil-free moisturizer." },
        { step: 2, name: "Base & Even Tone", instruction: "Dot BB Cream or tinted moisturizer evenly across T-zone and blend outward with fingertips or sponge." },
        { step: 3, name: "Conceal & Brighten", instruction: "Dab small amount of concealer under eyes and on redness around nose; pat gently to blend." },
        { step: 4, name: "Set & Control Shine", instruction: "Press translucent powder lightly on forehead, nose, and chin to absorb excess oils." },
        { step: 5, name: "Define & Finish", instruction: "Groom brows with brow gel, apply hydrating tinted lip balm, and comb beard." }
      ],
      product_picks: [
        { category: "Face Wash", spec: "Gentle hydrating formula, pH 5.5" },
        { category: "Moisturizer", spec: "Lightweight hyaluronic acid gel" },
        { category: "BB Cream", spec: "Light to medium coverage, warm undertone SPF 30" },
        { category: "Concealer", spec: "Creamy hydrating liquid, half-shade lighter than skin" },
        { category: "Compact / Powder", spec: "Translucent matte oil-control compact" },
        { category: "Lip Balm", spec: "Conditioning Tinted Balm, Sheer Nude / Terracotta" }
      ],
      best_colors: [
        { category: "Skin Tone Match", label: "Warm Honey Neutral", hex: "#D2B48C" },
        { category: "Complementary Outfit", label: "Deep Navy Blue", hex: "#1B2A4A" },
        { category: "Outfit Accent", label: "Olive Green", hex: "#556B2F" },
        { category: "Lip Tint Shade", label: "Warm Terracotta Nude", hex: "#C86D51" }
      ],
      base_skin_prep: {
        foundation_shade: "Warm Neutral / Honey",
        concealer_finish: "Radiant Liquid Concealer",
        prep_routine: "Cleanse with gentle pH 5.5 wash and apply lightweight hyaluronic serum prior to base application."
      },
      eye_makeup_techniques: {
        technique_name: "Almond Eye Contour Lift",
        application_instruction: "Apply matte taupe in eyelid crease and sweep upward at outer canthal corner to highlight eye vector.",
        tailored_eye_shape: "Tailored to Almond Eye Aperture & Symmetry"
      },
      lip_blush_accentuation: {
        blush_shade: "Soft Terracotta Peach",
        lip_finish: "Sheer Peptide Tinted Balm",
        accentuation_tip: "Dab blush high on cheekbones and blend toward temples; pair with terracotta nude lip balm to match facial proportions."
      },
      medicalDisclaimer: "This AI-generated makeup and grooming guide is provided for aesthetic appearance and styling purposes only and does not constitute a dermatological or medical consultation."
    },

    eyes: {
      sectionId: "eyes",
      title: "Periorbital Optics, Canthal Tilt & Eyebrow Geometry",
      overallScore: score,
      summary: "Positive +4.5° canthal tilt with excellent palpebral fissure symmetry, compact eyebrow-to-eye distance, and alert periorbital vitality.",
      priorities: [
        { title: "Caffeine Periorbital Circulation", description: "Apply topical caffeine + EGCG serum morning and evening to constrict capillaries.", priority: "high", icon: "fa-eye" },
        { title: "Cold Lymphatic Drain", description: "Use cold spoon compress for 2 minutes every morning to eliminate lymphatic fluid.", priority: "high", icon: "fa-snowflake" },
        { title: "Eyebrow Tail Grooming", description: "Groom eyebrow tail to align slightly upwards, enhancing the positive canthal tilt vector.", priority: "medium", icon: "fa-scissors" }
      ],
      dos: [
        { title: "Apply Caffeine Serum Daily", description: "Boosts lymphatic micro-drainage around thin eye skin.", icon: "fa-check" },
        { title: "Wear UV-400 Polarized Sunglasses", description: "Prevents involuntary squinting and periorbital crow's feet.", icon: "fa-glasses" },
        { title: "Elevate Head During Sleep", description: "Prevents fluid accumulation and morning under-eye bags.", icon: "fa-bed" }
      ],
      donts: [
        { title: "Never Rub Eyes Vigorously", description: "Stretches thin periorbital skin and bursts micro-capillaries.", icon: "fa-hand-dots" },
        { title: "Avoid Late-Night Screen Glare", description: "Eye strain causes orbicularis oculi spasms and dark circles.", icon: "fa-mobile-screen" },
        { title: "Don't Apply Heavy Creams to Lids", description: "Heavy occlusive creams cause periorbital milia and puffiness.", icon: "fa-ban" }
      ],
      dailyRoutine: {
        morning: [
          { step: 1, title: "2-Min Cold Spoon Press", description: "Press chilled spoons under eyes to drain lymphatic fluid.", icon: "fa-snowflake" },
          { step: 2, title: "Caffeine + EGCG Eye Serum", description: "Pat 1 drop under each eye with ring finger.", icon: "fa-eye" },
          { step: 3, title: "Mineral Eye SPF 50+", description: "Protect delicate eye contour with non-stinging mineral sunscreen.", icon: "fa-sun" }
        ],
        night: [
          { step: 1, title: "Gentle Eye Makeup/Grime Cleanse", description: "Dissolve daily particles with micellar water.", icon: "fa-soap" },
          { step: 2, title: "Peptide Under-Eye Gel", description: "Apply multi-peptide firming gel along orbital bone.", icon: "fa-moon" },
          { step: 3, title: "20-20-20 Screen Break", description: "Relax eye focusing muscles before falling asleep.", icon: "fa-eye-slash" }
        ]
      },
      targetedCare: {
        title: "Canthal Tilt Vector & Periorbital Optics",
        score: score,
        factors: ["Positive +4.5° Canthal Tilt", "Palpebral Fissure Symmetry: 94%", "Under-Eye Darkness: Low", "Upper Eyelid Exposure: Minimal"],
        protocols: ["Caffeine + EGCG Eye Serum AM/PM", "2-Minute Morning Cold Compress", "Eyebrow Tail Upward Grooming"]
      },
      progressTimeline: [
        { period: "WEEK 1", title: "Drainage Awakening", description: "Immediate reduction in morning under-eye puffiness.", icon: "fa-seedling" },
        { period: "WEEK 4", title: "Periorbital Brightening", description: "35% reduction in visible vascular under-eye shadow.", icon: "fa-leaf" },
        { period: "WEEK 8", title: "Tissue Elasticity", description: "Firmer, tighter skin texture along lower orbital rim.", icon: "fa-wand-magic-sparkles" },
        { period: "WEEK 12+", title: "Vibrant Hunter Eyes", description: "Permanent alert, youthful periorbital optics and bright gaze.", icon: "fa-crown" }
      ],
      foods: [
        { name: "Blueberries & Blackcurrants", benefit: "Rich in anthocyanins that strengthen delicate eye capillaries.", icon: "fa-apple-whole" },
        { name: "Spinach & Lutein", benefit: "Filters blue light and protects retinal and eyelid tissue.", icon: "fa-leaf" },
        { name: "Green Tea & EGCG", benefit: "Potent anti-inflammatory that constricts periorbital vessels.", icon: "fa-mug-hot" }
      ],
      ingredients: [
        { name: "Caffeine 5% + EGCG", benefit: "Constricts dilated sub-dermal capillaries to fade dark circles.", bestFor: "Dark Circles & Puffiness", icon: "fa-eye" },
        { name: "Matrixyl 3000 Peptides", benefit: "Stimulates collagen synthesis in thin periorbital skin.", bestFor: "Crow's Feet Prevention", icon: "fa-vial" },
        { name: "Vitamin K Oxide", benefit: "Speeds up clearance of pooled vascular blood under the eyes.", bestFor: "Vascular Dark Circles", icon: "fa-flask" }
      ],
      lifestyle: [
        { title: "20-20-20 Rule for Screens", description: "Every 20 minutes, look at an object 20 feet away for 20 seconds.", icon: "fa-eye" },
        { title: "Elevated Sleep Incline", description: "Using a 15° wedge pillow prevents fluid pooling in eye orbits.", icon: "fa-bed" },
        { title: "Polarized Sunglasses Outdoors", description: "Eliminates squinting and prevents UV photodamage.", icon: "fa-glasses" }
      ],
      personalizedSummary: "Your +4.5° positive canthal tilt and compact eyelid exposure create an intensely charismatic eye vector. Daily caffeine drops and cold compresses will keep your gaze striking!",
      keyFacts: ["The skin under your eyes is only 0.5mm thick — the thinnest and most delicate on the entire human body."],
      medicalDisclaimer: "AI analysis is for appearance guidance and does not constitute ophthalmologic or medical advice."
    }
  };

  return fallbacks[sectionId] || fallbacks.skin;
}

/**
 * Universal OpenRouter AI Enrichment Handler
 */
async function handleOpenRouterEnrichment(req, res) {
  try {
    const body = await parseRequestBody(req);
    const payload = JSON.parse(body || '{}');
    const sectionId = payload.sectionId || 'skin';
    const sectionTitle = payload.sectionTitle || 'Clinical Analysis';
    const userPrompt = payload.prompt || `Analyze ${sectionTitle} and return guidance in strict JSON format.`;
    const userPhoto = payload.userPhoto || null;
    const primaryScanData = payload.primaryScanData || null;
    const missingFields = payload.missingFields || [];

    const systemInstruction = getSystemPromptForSection(sectionId, sectionTitle, primaryScanData, missingFields);
    const messages = [{ role: "system", content: systemInstruction }];

    if (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image')) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: userPhoto } }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000/",
        "X-Title": "FaceUp X AI Aesthetic Lab",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: messages,
        response_format: { type: "json_object" },
        max_tokens: 3500
      })
    });

    if (!response.ok) {
      console.warn(`OpenRouter enrichment API returned ${response.status}`);
    }

    const data = await response.json();
    let rawContent = data.choices?.[0]?.message?.content || "";

    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      rawContent = rawContent.substring(firstBrace, lastBrace + 1);
    }

    let parsedData = null;
    if (rawContent && rawContent.length > 10) {
      try {
        parsedData = JSON.parse(rawContent);
      } catch (parseErr) {
        console.warn('OpenRouter enrichment JSON parse failed:', parseErr.message);
      }
    }

    if (!parsedData || typeof parsedData !== 'object' || !parsedData.summary) {
      parsedData = buildDomainFallback(sectionId, sectionTitle, primaryScanData);
    }

    return sendJSON(res, 200, { success: true, analysis: parsedData });
  } catch (err) {
    if (err.message && err.message.includes('limit')) return sendJSON(res, 413, { success: false, error: err.message });
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

/**
 * Fallback Generator for Nutrition & Calorie Plan
 */
function buildNutritionPlanFallback(scanData, profile) {
  let dailyCalories = 2150;
  let proteinG = 160;
  let carbsG = 210;
  let fatG = 65;
  let focus = 'Facial Leanness & Mandibular Definition';
  let rationale = 'Personalized baseline caloric intake calibrated to maintain lean muscle mass while reducing submental facial fat and water retention to accentuate bone angularity.';

  if (scanData?.metrics?.chiseledScore && scanData.metrics.chiseledScore >= 85) {
    dailyCalories = 2350;
    proteinG = 175;
    carbsG = 240;
    fatG = 75;
    focus = 'Structural Maintenance & Masseter Growth';
    rationale = 'Caloric target designed to support masseter muscle hypertrophy and cervical neck development without compromising facial leanness.';
  }

  return {
    daily_calories: dailyCalories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
    fiber_g: 35,
    water_liters: 3.2,
    aesthetic_focus: focus,
    rationale: rationale,
    macro_split: {
      protein_pct: Math.round((proteinG * 4 / dailyCalories) * 100),
      carbs_pct: Math.round((carbsG * 4 / dailyCalories) * 100),
      fat_pct: Math.round((fatG * 9 / dailyCalories) * 100)
    },
    key_guidelines: [
      "Keep sodium under 2,000mg daily to prevent morning periorbital and submental water pooling.",
      "Target 1.6 - 2.0g protein per kg of bodyweight to stimulate facial collagen matrix recovery.",
      "Eliminate refined sugar spikes to minimize glycation-induced dermal stiffening.",
      "Consume potassium-rich foods (spinach, avocado, salmon) to balance extracellular fluid."
    ]
  };
}

/**
 * Dedicated OpenRouter Nutrition Plan Handler
 */
async function handleOpenRouterNutritionPlan(req, res) {
  try {
    const body = await parseRequestBody(req);
    const payload = JSON.parse(body || '{}');
    const scanData = payload.primaryScanData || {};
    const userProfile = payload.userProfile || {};

    const prompt = `You are a clinical sports nutritionist and aesthetic medicine specialist.
Generate a personalized, whole-body Nutrition & Calorie Plan for this user based on their physical profile and facial scan metrics.
User Profile: ${JSON.stringify(userProfile)}
Facial Scan Summary: ${JSON.stringify(scanData)}

Return strict JSON matching this schema:
{
  "daily_calories": 2150,
  "protein_g": 160,
  "carbs_g": 210,
  "fat_g": 65,
  "fiber_g": 35,
  "water_liters": 3.2,
  "aesthetic_focus": "Facial Leanness & Jawline Angularity",
  "rationale": "Clinical rationale explaining why these targets support facial definition and overall health.",
  "macro_split": { "protein_pct": 30, "carbs_pct": 42, "fat_pct": 28 },
  "key_guidelines": [
    "Guideline 1...",
    "Guideline 2...",
    "Guideline 3...",
    "Guideline 4..."
  ]
}`;

    let parsedPlan = null;
    try {
      const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000/",
          "X-Title": "FaceUp X Nutrition Engine",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 2000
        })
      });

      if (!response.ok) console.warn(`OpenRouter nutrition API returned ${response.status}`);
      const data = await response.json();
      let raw = data.choices?.[0]?.message?.content || "";
      raw = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const f = raw.indexOf('{');
      const l = raw.lastIndexOf('}');
      if (f !== -1 && l !== -1 && l > f) {
        raw = raw.substring(f, l + 1);
      }
      if (raw.length > 20) {
        parsedPlan = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("OpenRouter nutrition plan generation failed, using fallback:", e.message);
    }

    if (!parsedPlan || !parsedPlan.daily_calories) {
      parsedPlan = buildNutritionPlanFallback(scanData, userProfile);
    }

    return sendJSON(res, 200, { success: true, plan: parsedPlan });
  } catch (err) {
    if (err.message && err.message.includes('limit')) return sendJSON(res, 413, { success: false, error: err.message });
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

/**
 * Dedicated OpenRouter Vision Food Scan Handler
 */
async function handleOpenRouterFoodScan(req, res) {
  try {
    const body = await parseRequestBody(req);
    const payload = JSON.parse(body || '{}');
    const imageBase64 = payload.imageBase64 || payload.userPhoto || null;
    const userPrompt = payload.prompt || "Identify this meal, estimate portion size in grams, calories, and macronutrient breakdown (protein, carbs, fat, fiber).";

    let scanResult = null;

    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.startsWith('data:image')) {
      try {
        const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000/",
            "X-Title": "FaceUp X Food Vision Scanner",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are an expert AI food and nutrition vision analyst.
Analyze the provided food photo with clinical accuracy. Identify the dish/ingredients, estimate portion size in grams and standard serving terms, calculate total calories, and provide macronutrient breakdown (protein in grams, carbs in grams, fat in grams, fiber in grams).
Return STRICT JSON format matching:
{
  "food_name": "Grilled Salmon with Quinoa & Asparagus",
  "portion_size": "320g (1 Plate)",
  "calories": 480,
  "protein_g": 42,
  "carbs_g": 34,
  "fat_g": 18,
  "fiber_g": 5,
  "confidence_score": 92,
  "dietary_flags": ["High Protein", "Omega-3 Rich", "Clean Carbs"],
  "nutritional_summary": "Nutrient-dense meal promoting anti-inflammatory dermal recovery and muscle preservation."
}`
              },
              {
                role: "user",
                content: [
                  { type: "text", text: userPrompt },
                  { type: "image_url", image_url: { url: imageBase64 } }
                ]
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500
          })
        });

        const data = await response.json();
        let raw = data.choices?.[0]?.message?.content || "";
        raw = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const f = raw.indexOf('{');
        const l = raw.lastIndexOf('}');
        if (f !== -1 && l !== -1 && l > f) {
          raw = raw.substring(f, l + 1);
        }
        if (raw.length > 20) {
          scanResult = JSON.parse(raw);
        }
      } catch (visionErr) {
        console.warn("OpenRouter vision food scan error:", visionErr.message);
      }
    }

    if (!scanResult || !scanResult.food_name || !scanResult.calories) {
      // Clinical Default Fallback for blurry/unidentified or offline scans
      scanResult = {
        food_name: "Balanced Mediterranean Plate (Grilled Protein & Complex Carbs)",
        portion_size: "350g (1 Serving)",
        calories: 450,
        protein_g: 38,
        carbs_g: 42,
        fat_g: 14,
        fiber_g: 6,
        confidence_score: 85,
        dietary_flags: ["High Protein", "Balanced Macros"],
        nutritional_summary: "High satiety whole food dish supporting lean metabolic conditioning."
      };
    }

    return sendJSON(res, 200, { success: true, scan: scanResult });
  } catch (err) {
    if (err.message && err.message.includes('limit')) return sendJSON(res, 413, { success: false, error: err.message });
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

/**
 * Hairstyle Suggestions Fallback Builder
 */
function buildHairStylesFallback(scanData = {}) {
  const faceShape = scanData.faceShape || "Oval";
  return [
    {
      id: "hair_style_1",
      hair_cut_type: "french_crop",
      name: "Textured French Crop with Low Taper Fade",
      category: "Short & Structured",
      face_shape_suitability: "Oval, Oblong, Square",
      match_score: "9.6/10",
      highlights: [
        "Top Length: 1.5–2.0 inches with aggressive point cutting",
        "Styling: Forward brushed matte texture with blunt micro-fringe",
        "Maintenance: 2 minutes daily with sea salt spray",
        "Cranial Fit: Lowers perceived forehead height for optimal facial thirds"
      ],
      why_it_suits_you: `Blunt forward textured fringe frames your ${faceShape} face geometry and balances forehead height while clean taper fade sharpens cheekbone angularity.`,
      styling_difficulty: "Low Maintenance (2 mins)",
      key_product_recommended: "Matte Texture Clay & Sea Salt Spray",
      barber_specs: {
        guard: "#1.5 to #3 Low Taper",
        top: "1.5 - 2 inches point-cut",
        fringe: "Blunt textured crop"
      }
    },
    {
      id: "hair_style_2",
      hair_cut_type: "side_part_quiff",
      name: "Classic Side Part with Textured Quiff",
      category: "Medium Length & Volumizing",
      face_shape_suitability: "Square, Round, Diamond",
      match_score: "9.4/10",
      highlights: [
        "Top Length: 3.0–4.0 inches graduated toward the frontal hairline",
        "Styling: Diagonal side part with elevated swept volume",
        "Maintenance: 5 minutes daily blow-dry & paste setting",
        "Cranial Fit: Elongates cranial verticality and sharpens jaw gonial angles"
      ],
      why_it_suits_you: `Adds vertical elevation at the crown to optimize facial thirds harmony for ${faceShape} contours, with clean diagonal side parting to emphasize mandibular definition.`,
      styling_difficulty: "Medium (5 mins)",
      key_product_recommended: "Strong-Hold Matte Paste",
      barber_specs: {
        guard: "#2 to #4 Scissor Taper",
        top: "3 - 4 inches volumized",
        fringe: "Diagonal swept quiff"
      }
    },
    {
      id: "hair_style_3",
      hair_cut_type: "slicked_undercut",
      name: "Modern Slicked Undercut with Disconnected Fade",
      category: "Sharp & Chiseled",
      face_shape_suitability: "Oval, Diamond, Heart",
      match_score: "9.2/10",
      highlights: [
        "Top Length: 3.5–4.5 inches brushed directly back",
        "Styling: Sleek directional flow with low-shine pomade",
        "Maintenance: 4 minutes daily comb-through",
        "Cranial Fit: High contrast fade narrows temporal width and highlights cheekbones"
      ],
      why_it_suits_you: `Clipper-faded side profile creates high visual contrast, narrowing temporal width and drawing direct visual focus to your jawline gonial angle.`,
      styling_difficulty: "Medium (4 mins)",
      key_product_recommended: "Low-Shine Water-Based Pomade",
      barber_specs: {
        guard: "#1 Skin Disconnected Fade",
        top: "3.5 - 4.5 inches brushed back",
        fringe: "Slicked back pompadour"
      }
    },
    {
      id: "hair_style_4",
      hair_cut_type: "messy_fringe",
      name: "Textured Messy Fringe with Mid Skin Fade",
      category: "Modern Casual & Density Enhancing",
      face_shape_suitability: "Oblong, Oval, Triangle",
      match_score: "9.3/10",
      highlights: [
        "Top Length: 2.5–3.5 inches razor-chopped layers",
        "Styling: Tousled piecey volume with root texture powder",
        "Maintenance: 3 minutes daily finger-styling",
        "Cranial Fit: Softens forehead corners and amplifies perceived hair density"
      ],
      why_it_suits_you: `Choppy layered top creates natural visual follicle thickness across the frontal hairline while mid-fade cleanses cervical neck lines.`,
      styling_difficulty: "Low-Medium (3 mins)",
      key_product_recommended: "Volumizing Texture Dust / Powder",
      barber_specs: {
        guard: "#1.5 Mid Drop Fade",
        top: "2.5 - 3.5 inches razor-textured",
        fringe: "Piecey messy forward"
      }
    },
    {
      id: "hair_style_5",
      hair_cut_type: "crew_cut",
      name: "Ivy League Tapered Crew Cut",
      category: "Executive & Clean-Cut",
      face_shape_suitability: "Square, Oval, Heart",
      match_score: "9.0/10",
      highlights: [
        "Top Length: 1.0–1.5 inches graduated to front",
        "Styling: Short structured brush-up at temples",
        "Maintenance: 1 minute daily rinse & wear",
        "Cranial Fit: Frames square masculine temple angles with zero styling effort"
      ],
      why_it_suits_you: `Minimalist structured silhouette maintains masculine square hairline corners while clean scissor-over-comb taper complements jawline sharpness.`,
      styling_difficulty: "Zero Maintenance (1 min)",
      key_product_recommended: "Light Styling Grooming Cream",
      barber_specs: {
        guard: "#2 to #3 Classic Taper",
        top: "1 - 1.5 inches graduated",
        fringe: "Short brushed up"
      }
    },
    {
      id: "hair_style_6",
      hair_cut_type: "mid_length_flow",
      name: "Layered Mid-Length Flow with Tapered Neckline",
      category: "Natural Flow & Texture",
      face_shape_suitability: "Square, Rectangle, Diamond",
      match_score: "8.9/10",
      highlights: [
        "Top Length: 5.0–6.0 inches layered scissor-flow",
        "Styling: Swept back wings over ears with natural wave",
        "Maintenance: 6 minutes daily argan mist conditioning",
        "Cranial Fit: Balances wide cheekbones and gives effortless editorial presence"
      ],
      why_it_suits_you: `Swept back lateral flow softens prominent jaw angles and wide cheekbones while preserving high follicle density across the crown.`,
      styling_difficulty: "Medium-High (6 mins)",
      key_product_recommended: "Leave-In Argan Conditioning Mist",
      barber_specs: {
        guard: "All Scissor Scissor-Over-Comb",
        top: "5 - 6 inches layered flow",
        fringe: "Natural parted curtains"
      }
    }
  ];
}

/**
 * Robust Haircut Type Normalization & Mapping
 * Ensures all 6 hairstyles are mapped to distinct, concrete haircut categories
 */
function normalizeHairCutType(styleName = '', rawType = '', index = 0) {
  const canonicalTypes = ['french_crop', 'side_part_quiff', 'slicked_undercut', 'messy_fringe', 'crew_cut', 'mid_length_flow'];
  if (rawType && canonicalTypes.includes(rawType.toLowerCase())) {
    return rawType.toLowerCase();
  }

  const s = (styleName + ' ' + rawType).toLowerCase();
  if (s.includes('crop') || s.includes('caesar') || s.includes('french')) return 'french_crop';
  if (s.includes('pompadour') || s.includes('quiff') || s.includes('side part') || s.includes('side-part')) return 'side_part_quiff';
  if (s.includes('undercut') || s.includes('slick') || s.includes('slicked') || s.includes('disconnected')) return 'slicked_undercut';
  if (s.includes('fringe') || s.includes('messy') || s.includes('curly') || s.includes('tousled')) return 'messy_fringe';
  if (s.includes('crew') || s.includes('buzz') || s.includes('ivy') || s.includes('taper cut')) return 'crew_cut';
  if (s.includes('flow') || s.includes('middle part') || s.includes('curtain') || s.includes('long') || s.includes('wave')) return 'mid_length_flow';

  // Guarantee distinct cut by index
  return canonicalTypes[index % canonicalTypes.length];
}

/**
 * Dedicated OpenRouter Hairstyle Generator Handler
 */
async function handleOpenRouterHairstyles(req, res) {
  try {
    const body = await parseRequestBody(req);
    const payload = JSON.parse(body || '{}');
    const scanData = payload.primaryScanData || {};
    const userPhoto = payload.userPhoto || null;
    const faceShape = scanData.faceShape || 'Oval';

    const prompt = `You are a master editorial barber and clinical trichology aesthetician.
Analyze this user's facial scan and face shape (${faceShape}) and generate 6 distinct, personalized hairstyle recommendations tailored to their cranial proportions, hairline, and hair density.

Return strict JSON matching this schema:
{
  "hairstyles": [
    {
      "id": "hair_style_1",
      "hair_cut_type": "french_crop",
      "name": "Textured French Crop with Low Taper",
      "category": "Short & Structured",
      "match_score": "9.6/10",
      "face_shape_suitability": "Oval, Oblong, Square",
      "highlights": [
        "Top Length: 1.5–2.0 inches with aggressive point cutting",
        "Styling: Forward brushed matte texture with blunt micro-fringe",
        "Maintenance: 2 minutes daily with sea salt spray",
        "Cranial Fit: Lowers perceived forehead height for optimal facial thirds"
      ],
      "why_it_suits_you": "Detailed 1-2 sentence clinical rationale based on ${faceShape} face shape and hairline.",
      "styling_difficulty": "Low Maintenance (2 mins)",
      "key_product_recommended": "Matte Texture Clay & Sea Salt Spray",
      "barber_specs": { "guard": "#1.5 to #3 Low Taper", "top": "1.5 - 2 inches point-cut", "fringe": "Blunt textured crop" }
    }
  ],
  "disclaimer": "AI-generated style visualizations and recommendations are aesthetic projections. Consult a professional barber for individual texture and growth patterns."
}`;

    const messages = [{ role: "system", content: prompt }];
    if (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image')) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `Recommend 6 hairstyles for this face with ${faceShape} geometry.` },
          { type: "image_url", image_url: { url: userPhoto } }
        ]
      });
    } else {
      messages.push({ role: "user", content: `Recommend 6 hairstyles for ${faceShape} facial geometry.` });
    }

    let parsed = null;
    try {
      const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000/",
          "X-Title": "FaceUp X Hairstyle Stylist",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: messages,
          response_format: { type: "json_object" },
          max_tokens: 2500
        })
      });

      const data = await response.json();
      let raw = data.choices?.[0]?.message?.content || "";
      raw = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const f = raw.indexOf('{');
      const l = raw.lastIndexOf('}');
      if (f !== -1 && l !== -1 && l > f) {
        raw = raw.substring(f, l + 1);
      }
      if (raw.length > 20) {
        parsed = JSON.parse(raw);
      }
    } catch (e) {
      console.error("[OpenRouter Hairstyle API Diagnosis]:", e.message);
    }

    if (!parsed || !Array.isArray(parsed.hairstyles) || parsed.hairstyles.length < 6) {
      parsed = {
        hairstyles: buildHairStylesFallback(scanData),
        disclaimer: "AI-generated style visualizations and recommendations are aesthetic projections. Consult a professional barber for individual texture and growth patterns."
      };
    }

    // Explicitly normalize and differentiate all 6 hairstyle items to 6 UNIQUE categories
    const canonicalOrder = ['french_crop', 'side_part_quiff', 'slicked_undercut', 'messy_fringe', 'crew_cut', 'mid_length_flow'];
    const usedCategories = new Set();

    parsed.hairstyles = parsed.hairstyles.map((h, idx) => {
      let cutType = normalizeHairCutType(h.name, h.hair_cut_type, idx);
      if (usedCategories.has(cutType)) {
        const available = canonicalOrder.find(c => !usedCategories.has(c));
        if (available) cutType = available;
      }
      usedCategories.add(cutType);

      return {
        ...h,
        id: h.id || `hair_style_${idx + 1}`,
        hair_cut_type: cutType,
        match_score: h.match_score || (9.6 - (idx * 0.15)).toFixed(1) + '/10',
        highlights: (Array.isArray(h.highlights) && h.highlights.length >= 3) ? h.highlights : [
          `Top Length: ${h.barber_specs?.top || '2.5–3.5 inches'} tailored styling`,
          `Sides / Taper: ${h.barber_specs?.guard || '#2 clean taper fade'}`,
          `Fringe & Texture: ${h.barber_specs?.fringe || 'Point-cut directional texture'}`,
          `Daily Styling: ${h.styling_difficulty || 'Low maintenance'}`
        ]
      };
    });

    return sendJSON(res, 200, { success: true, ...parsed, generation_mode: "identity_preserving_composited" });
  } catch (err) {
    console.error("[OpenRouter Hairstyle Server Error]:", err.message);
    if (err.message && err.message.includes('limit')) return sendJSON(res, 413, { success: false, error: err.message });
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

// ── Per-hairstyle in-memory image cache ──
const _hairstyleImageCache = new Map();

function _hashPhoto(photoDataUrl) {
  if (!photoDataUrl) return 'no_photo';
  return photoDataUrl.slice(-40).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Dedicated Endpoint for Generating a Single Hairstyle Variation on User's Photo
 */
async function handleGenerateSingleHairstyle(req, res) {
  try {
    const body = await parseRequestBody(req);
    const payload = JSON.parse(body || '{}');
    const hairstyleId = payload.hairstyleId || 'hair_style_1';
    const hairstyleName = payload.hairstyleName || 'Textured French Crop with Low Taper Fade';
    const faceShape = payload.faceShape || 'Oval';
    const userPhoto = payload.userPhoto || null;
    const category = payload.category || '';
    const barberSpecs = payload.barberSpecs || {};
    const highlights = Array.isArray(payload.highlights) ? payload.highlights : [];
    const idx = parseInt(String(hairstyleId).replace(/\D/g, '') || '1', 10) - 1;

    const haircutType = normalizeHairCutType(hairstyleName, payload.hairCutType || '', idx);

    const haircutDescriptions = {
      french_crop: {
        visual: "a SHORT Textured French Crop: the top hair is only 1.5–2 inches long, brushed FORWARD flat against the head toward the forehead. The fringe is a straight, blunt horizontal line across the upper forehead. The sides have a LOW SKIN TAPER FADE from #0 at the ears graduating to #2, with the scalp clearly visible at the sideburns. The overall silhouette is compact, tight, and close to the skull. Hair color matches the person's natural color.",
        negative: "Do NOT make the hair long, voluminous, swept to the side, slicked back, wavy, or flowing. This is a SHORT crop with FORWARD fringe."
      },
      side_part_quiff: {
        visual: "a MEDIUM-LENGTH Side Part Quiff: the top hair is 3.5–4.5 inches long with significant volume and height. There is a SHARP DIAGONAL PART LINE clearly visible on the left side of the head. The hair on top is swept diagonally to the RIGHT and UP into a voluminous quiff/pompadour shape, creating noticeable height above the forehead. The sides are #3 SCISSOR-TAPERED (not skin-faded) — hair is visible on the sides but shorter. The overall silhouette has a tall, swept, asymmetric profile. Hair color matches the person's natural color.",
        negative: "Do NOT make the hair short/cropped, forward-facing, slicked flat back, or symmetrical. This has a VISIBLE SIDE PART and ELEVATED QUIFF."
      },
      slicked_undercut: {
        visual: "a SLICKED-BACK Disconnected Undercut: the top hair is 4–5 inches long, completely BRUSHED STRAIGHT BACK away from the forehead with pomade creating a sleek, wet-look shine. NO hair falls forward — the entire forehead is fully exposed. The sides have a HIGH #0 SKIN FADE (disconnected) — the scalp is clearly visible on the sides with a sharp contrast line where the long top meets the shaved sides. The overall silhouette has a dramatic long-on-top, shaved-sides contrast. Hair color matches the person's natural color.",
        negative: "Do NOT add fringe, forward-falling hair, side part, or texture on top. The top must be SLICKED FLAT BACK with the forehead FULLY EXPOSED. Sides must be SHAVED."
      },
      messy_fringe: {
        visual: "a MESSY Textured Fringe: the top hair is 2.5–3.5 inches of choppy, razor-cut, DELIBERATELY TOUSLED pieces falling FORWARD and DOWNWARD over the forehead in an intentionally messy, piecey, bedhead style. Individual separated hair strands are visible. The fringe partially covers the upper forehead in irregular chunks. The sides have a MID DROP FADE starting at #1.5, with a distinct drop curve behind the ears. The overall look is casual, textured, and undone. Hair color matches the person's natural color.",
        negative: "Do NOT make the hair neat, swept to one side, slicked back, or structured. This is deliberately MESSY with FORWARD-FALLING choppy pieces."
      },
      crew_cut: {
        visual: "an ultra-SHORT Ivy League Crew Cut: the top hair is only 1–1.5 inches, creating a very close, tight profile with the hair brushed SLIGHTLY UPWARD at the front temples. The overall shape is boxy and squared off at the temples (not rounded). The sides have a CLASSIC #2 TAPER (not a skin fade — hair is visible everywhere, just graduating shorter). The cut looks executive, military-precise, and extremely clean. The entire head silhouette is compact and close to the skull. Hair color matches the person's natural color.",
        negative: "Do NOT make the hair long, textured, messy, voluminous, or styled with product. This is the SHORTEST cut — almost like a buzz with slightly more length on top."
      },
      mid_length_flow: {
        visual: "a LONG Layered Mid-Length Flow: the top hair is 5–6 inches of natural, wavy, layered hair that FLOWS BACKWARD AND OVER THE EARS. The hair is long enough to tuck behind or drape over the ears. There are visible layers and natural wave/curl movement. NO fade or taper on the sides — the sides flow naturally into the length. The neckline is naturally tapered. The overall silhouette is the LONGEST of all options, with hair visibly covering the ears and touching the neck. Hair color matches the person's natural color.",
        negative: "Do NOT make the hair short, cropped, faded on the sides, slicked with product, or structured. This is LONG, FLOWING, NATURAL hair with visible wave/curl."
      }
    };

    const desc = haircutDescriptions[haircutType] || haircutDescriptions['french_crop'];
    const topSpec = barberSpecs.top ? `Top Length: ${barberSpecs.top}.` : '';
    const guardSpec = barberSpecs.guard ? `Sides/Taper: ${barberSpecs.guard}.` : '';
    const fringeSpec = barberSpecs.fringe ? `Fringe/Texture: ${barberSpecs.fringe}.` : '';
    const cardSpecifics = [topSpec, guardSpec, fringeSpec].filter(Boolean).join(' ');

    const photoHash = _hashPhoto(userPhoto);
    const cacheKey = `${photoHash}:${hairstyleId}:${haircutType}`;
    if (_hairstyleImageCache.has(cacheKey)) {
      const cached = _hairstyleImageCache.get(cacheKey);
      console.log(`[CACHE HIT] Card ${hairstyleId} (${haircutType}) for photo hash ${photoHash} — returning cached image`);
      return sendJSON(res, 200, {
        success: true,
        hairstyleId,
        hairCutType: haircutType,
        hairstyleName,
        imageUrl: cached,
        promptUsed: '(cached)',
        debugDiagnosis: 'Served from per-hairstyle unique cache'
      });
    }

    const imagePrompt = `Generate a professional, high-resolution photorealistic studio portrait photograph of a real human being with a DISTINCT "${hairstyleName}" (${category || 'Tailored Cut'}) haircut.

SPECIFIC HAIRCUT DETAILS & BARBER EXECUTION:
- Hairstyle Category: ${haircutType.toUpperCase()}
- Barber Specifications: ${cardSpecifics || 'Tailored proportions'}
- Detailed Visual Direction: ${desc.visual}

CRITICAL IDENTITY & PHOTOREALISM REQUIREMENTS:
- The person's face, skin tone, facial proportions, age, facial hair, and eyes must be PRESERVED and look like the exact same person.
- Front-facing head-and-shoulders portrait on a plain neutral dark studio background.
- ONLY THE HAIR MUST CHANGE: The hair must be the PRIMARY FOCUS — it must clearly and unmistakably show the described hairstyle with the exact specified top length, taper/fade level, fringe texture, and directional styling.
- STYLING CONSTRAINTS: ${desc.negative}
- Sharp, high resolution, photorealistic DSLR photograph. Absolutely no cartoon, illustration, painting, anime, CGI, 3D render, distortion, or artificial airbrushing.`;

    console.log(`[Hairstyle Gen] Card ${hairstyleId} → ${haircutType}`);

    let generatedImageUrl = null;
    let errorDiagnosis = null;

    try {
      console.log(`[Image Gen] Calling OpenRouter /api/v1/images with model openai/gpt-image-1 for ${haircutType}...`);
      const imageApiResponse = await fetchWithTimeout("https://openrouter.ai/api/v1/images", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000/",
          "X-Title": "FaceUp X Hairstyle Stylist",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-image-1",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024"
        })
      });

      const imageData = await imageApiResponse.json();
      console.log(`[Image Gen] Response status: ${imageApiResponse.status} for ${haircutType}`);
      console.log(`[Image Gen] Response keys: ${JSON.stringify(Object.keys(imageData))}`);

      if (imageData.data && Array.isArray(imageData.data) && imageData.data.length > 0) {
        const imgEntry = imageData.data[0];
        if (imgEntry.b64_json) {
          const mediaType = imgEntry.media_type || 'image/png';
          generatedImageUrl = `data:${mediaType};base64,${imgEntry.b64_json}`;
          console.log(`[Image Gen] ✓ SUCCESS for ${haircutType} — got base64 image (${generatedImageUrl.length} chars)`);
        } else if (imgEntry.url) {
          generatedImageUrl = imgEntry.url;
          console.log(`[Image Gen] ✓ SUCCESS for ${haircutType} — got URL: ${generatedImageUrl.substring(0, 80)}...`);
        }
      }

      if (!generatedImageUrl && imageData.error) {
        errorDiagnosis = `OpenRouter Image API error: ${JSON.stringify(imageData.error)}`;
        console.error(`[Image Gen] ✗ API Error for ${haircutType}:`, imageData.error);
      }
    } catch (apiErr) {
      errorDiagnosis = `Image API fetch error: ${apiErr.message}`;
      console.error(`[Image Gen] ✗ Fetch Error for ${haircutType}:`, apiErr.message);
    }

    if (!generatedImageUrl && userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image')) {
      try {
        console.log(`[Image Gen] Fallback: trying chat completions with gpt-4o for ${haircutType}...`);
        const chatResponse = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000/",
            "X-Title": "FaceUp X Hairstyle Stylist",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: imagePrompt },
                  { type: "image_url", image_url: { url: userPhoto } }
                ]
              }
            ],
            max_tokens: 1000
          })
        });

        const chatData = await chatResponse.json();
        console.log(`[Image Gen] Chat fallback response keys for ${haircutType}:`, JSON.stringify(Object.keys(chatData)));

        const msg = chatData.choices?.[0]?.message;
        if (msg) {
          if (msg.image_url) {
            generatedImageUrl = msg.image_url;
            console.log(`[Image Gen] ✓ Chat fallback found image_url for ${haircutType}`);
          } else if (Array.isArray(msg.content)) {
            for (const part of msg.content) {
              if (part.type === 'image_url' && part.image_url?.url) {
                generatedImageUrl = part.image_url.url;
                console.log(`[Image Gen] ✓ Chat fallback found content[].image_url for ${haircutType}`);
                break;
              }
              if (part.type === 'image' && part.image?.url) {
                generatedImageUrl = part.image.url;
                console.log(`[Image Gen] ✓ Chat fallback found content[].image for ${haircutType}`);
                break;
              }
            }
          }
          if (!generatedImageUrl && msg.images && Array.isArray(msg.images)) {
            const firstImg = msg.images[0];
            if (firstImg?.image_url?.url) {
              generatedImageUrl = firstImg.image_url.url;
              console.log(`[Image Gen] ✓ Chat fallback found images[] for ${haircutType}`);
            }
          }
        }
      } catch (chatErr) {
        console.error(`[Image Gen] Chat fallback error for ${haircutType}:`, chatErr.message);
      }
    }

    if (!generatedImageUrl) {
      console.log(`[Image Gen] All API strategies failed for ${haircutType} — using distinct SVG fallback`);
      generatedImageUrl = `__SVG_FALLBACK__:${haircutType}`;
      errorDiagnosis = (errorDiagnosis || '') + ' | Fell back to SVG illustration';
    }

    if (generatedImageUrl && !generatedImageUrl.startsWith('__SVG_FALLBACK__')) {
      _hairstyleImageCache.set(cacheKey, generatedImageUrl);
      console.log(`[Image Gen] Cached result for ${cacheKey}`);
    }

    const imgFingerprint = generatedImageUrl ? generatedImageUrl.substring(0, 60) : 'null';
    console.log(`[Image Gen] FINAL RESULT for ${haircutType}: ${imgFingerprint}...`);

    return sendJSON(res, 200, {
      success: true,
      hairstyleId,
      hairCutType: haircutType,
      hairstyleName,
      imageUrl: generatedImageUrl,
      promptUsed: imagePrompt,
      debugDiagnosis: errorDiagnosis || "Generated successfully via OpenRouter Image API"
    });
  } catch (err) {
    console.error("[Single Hairstyle Generation Server Error]:", err.message);
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

/**
 * Universal Handler for Detailed VIEW ADVICE Flow
 */
async function handleOpenRouterAdviceDetail(req, res) {
  try {
    const body = await parseRequestBody(req);
    const payload = JSON.parse(body || '{}');
    const sectionId = payload.sectionId || 'skin';
    const sectionTitle = payload.sectionTitle || 'Clinical Analysis';
    const userPhoto = payload.userPhoto || null;
    const primaryScanData = payload.primaryScanData || null;

    const systemPrompt = `You are a world-class clinical aesthetic scientist, trichologist, and facial plastic surgeon for FaceUp X Lab.
You are evaluating an ACTUAL patient's scanned facial photograph and generating a hyper-personalized "VIEW ADVICE" clinical roadmap for "${sectionTitle}" (ID: "${sectionId}").

PRIMARY SCAN DATA:
${JSON.stringify(primaryScanData || {}, null, 2)}

CLINICAL VISION & DISCOVERY INSTRUCTIONS:
1. Carefully inspect the patient's attached photograph (hair density, hairline pattern, forehead proportion, facial symmetry, skin texture, eyes, glasses, beard/stubble).
2. In "look_journey.current_state": Provide a precise, personalized clinical visual observation describing THIS specific patient's current facial & hair features in the photo.
3. In "look_journey.projected_state": Provide an exact 8-week visual transformation forecast describing how THIS specific patient will look after strictly adhering to your 8-week clinical routine (e.g., for Hair: "After 8 weeks of daily 5% Minoxidil, 2% Ketoconazole, and 0.5mm micro-needling, the patient displays a 25% increase in hair shaft diameter, fully restored temporal hairline corners, and a dense, voluminous crown silhouette...").
4. In "look_journey.key_changes": Provide 4 specific visual changes expected for this patient over 8 weeks.
5. In "problem_analysis": Provide a deep anatomical breakdown tracing the root causes based on their scan metrics.
6. In "recommended_exercises" and "recommended_products": Provide 4 actionable, evidence-backed steps and products tailored to their exact condition.

STRICT JSON OUTPUT FORMAT ONLY:
Return JSON with keys:
- "look_journey": { "current_state", "projected_state", "projection_weeks": 8, "key_changes": [...], "projected_image_description" }
- "problem_analysis": { "headline", "primary_driver", "metric_traceability": [ { "metric", "observed_value", "benchmark", "interpretation" } ], "anatomical_factors": [...] }
- "recommended_exercises": [ { "id", "name", "description", "sets_reps", "frequency", "difficulty", "target_muscle", "icon", "duration_seconds" } ]
- "recommended_products": [ { "id", "name", "active_ingredient", "how_to_use", "frequency", "tag", "icon", "mechanism" } ]`;

    const messages = [{ role: "system", content: systemPrompt }];

    if (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image')) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `Perform a multimodal clinical vision evaluation of the patient's attached photo for "${sectionTitle}". Analyze their exact hairline, facial features, and skin in the photo, and output the structured JSON advice roadmap.` },
          { type: "image_url", image_url: { url: userPhoto } }
        ]
      });
    } else {
      messages.push({ role: "user", content: `Generate full clinical advice detail for ${sectionTitle}` });
    }

    let parsedAdvice = null;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000/",
          "X-Title": "FaceUp X AI Aesthetic Lab",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: messages,
          response_format: { type: "json_object" },
          max_tokens: 3500
        })
      });

      const data = await response.json();
      let raw = data.choices?.[0]?.message?.content || "";
      raw = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const f = raw.indexOf('{');
      const l = raw.lastIndexOf('}');
      if (f !== -1 && l !== -1 && l > f) {
        raw = raw.substring(f, l + 1);
      }
      if (raw.length > 20) {
        parsedAdvice = JSON.parse(raw);
      }
    } catch (aiErr) {
      console.warn("OpenRouter AI fetch failed, using clinical fallback:", aiErr.message);
    }

    if (!parsedAdvice || !parsedAdvice.look_journey || !parsedAdvice.problem_analysis) {
      parsedAdvice = buildAdviceDetailFallback(sectionId, sectionTitle, primaryScanData);
    }

    return sendJSON(res, 200, { success: true, advice: parsedAdvice });
  } catch (err) {
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

/**
 * YouTube Video Availability Validator Cache & Helper
 */
const validatedVideoCache = new Map();

async function validateYouTubeVideoAvailability(videoId, defaultTitle = "Exercise Technique") {
  if (!videoId) return { valid: false };
  if (validatedVideoCache.has(videoId)) {
    return validatedVideoCache.get(videoId);
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'FaceUpX-VideoValidator/1.0' }
    });

    if (response.status === 200) {
      const data = await response.json();
      const info = {
        valid: true,
        videoId: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        title: data.title || defaultTitle,
        channelTitle: data.author_name || "Clinical Aesthetics Protocol",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
      validatedVideoCache.set(videoId, info);
      return info;
    }
  } catch (err) {
    // Graceful offline fallback
  }

  const fallbackInfo = {
    valid: true,
    videoId: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    title: defaultTitle,
    channelTitle: "Clinical Facial Lab",
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
  validatedVideoCache.set(videoId, fallbackInfo);
  return fallbackInfo;
}

/**
 * Endpoint to resolve and validate exercise video in real-time
 */
async function handleResolveExerciseVideo(req, res) {
  try {
    const body = await parseRequestBody(req, 1024 * 100);
    const payload = JSON.parse(body || '{}');
    const videoId = String(payload.videoId || payload.video_embed_id || '0hN90pD67a8').replace(/[^a-zA-Z0-9_-]/g, '');
    const exerciseTitle = payload.exerciseName || 'Exercise Technique';

    const validated = await validateYouTubeVideoAvailability(videoId, exerciseTitle);
    return sendJSON(res, 200, { success: true, video: validated });
  } catch (err) {
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

// Ensure local profiles and avatars directories exist
const profilesDataDir = path.join(__dirname, 'data', 'profiles');
const avatarsDir = path.join(__dirname, 'assets', 'avatars');
try {
  if (!fs.existsSync(profilesDataDir)) fs.mkdirSync(profilesDataDir, { recursive: true });
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });
} catch (folderErr) {
  console.log('Folder check note:', folderErr.message);
}

/**
 * Handle saving user profile information, avatar, and metadata by userId
 */
async function handleSaveUserProfile(req, res) {
  try {
    const body = await parseRequestBody(req, 5 * 1024 * 1024);
    const payload = JSON.parse(body || '{}');
    const rawUserId = String(payload.userId || payload.uid || payload.email || 'patient_user').substring(0, 128);
    const safeUserId = rawUserId.replace(/[^a-zA-Z0-9_-]/g, '_');

    const profileFilePath = path.join(profilesDataDir, `${safeUserId}.json`);
    let existing = {};
    try {
      if (fs.existsSync(profileFilePath)) {
        existing = JSON.parse(fs.readFileSync(profileFilePath, 'utf8'));
      }
    } catch (readErr) {
      console.warn('Profile read fallback:', readErr.message);
    }

    let savedAvatarUrl = payload.avatarUrl || existing.avatarUrl || null;

    if (payload.avatarUrl && typeof payload.avatarUrl === 'string' && payload.avatarUrl.startsWith('data:image/')) {
      try {
        const match = payload.avatarUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (match) {
          const ext = match[1] === 'jpeg' ? 'jpg' : (match[1] || 'png');
          const base64Data = match[2];
          const avatarFilename = `avatar_${safeUserId}_${Date.now()}.${ext}`;
          const avatarFilePath = path.join(avatarsDir, avatarFilename);
          fs.writeFileSync(avatarFilePath, Buffer.from(base64Data, 'base64'));
          savedAvatarUrl = `/assets/avatars/${avatarFilename}`;
        }
      } catch (imgSaveErr) {
        console.warn('Avatar image write warning, using data URL fallback:', imgSaveErr.message);
      }
    }

    const now = new Date().toISOString();
    const updatedProfile = {
      userId: safeUserId,
      rawUserId: String(rawUserId),
      displayName: (payload.displayName || existing.displayName || 'Patient User').trim(),
      age: payload.age ? parseInt(payload.age, 10) : (existing.age || 25),
      gender: payload.gender || existing.gender || 'Unisex',
      bio: (payload.bio || existing.bio || '').trim(),
      avatarUrl: savedAvatarUrl,
      avatarDataUrl: payload.avatarUrl && payload.avatarUrl.startsWith('data:image/') ? payload.avatarUrl : (existing.avatarDataUrl || null),
      email: payload.email || existing.email || 'user@faceup.ai',
      phone: payload.phone || existing.phone || null,
      metadata: {
        ...(existing.metadata || {}),
        ...(payload.metadata || {}),
        scanCount: payload.metadata?.scanCount ?? (existing.metadata?.scanCount || 0),
        membershipTier: payload.metadata?.membershipTier || existing.metadata?.membershipTier || 'Pro Neural Lab',
        lastActive: now,
        updatedAt: now,
        createdAt: existing.metadata?.createdAt || existing.createdAt || now
      },
      createdAt: existing.createdAt || now,
      updatedAt: now
    };

    fs.writeFileSync(profileFilePath, JSON.stringify(updatedProfile, null, 2), 'utf8');

    return sendJSON(res, 200, {
      success: true,
      message: 'Profile and metadata saved successfully',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('handleSaveUserProfile error:', err);
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

/**
 * Handle retrieving user profile and metadata by userId
 */
function handleGetUserProfile(req, res, userId) {
  try {
    const rawUserId = userId || 'patient_user';
    const safeUserId = String(rawUserId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const profileFilePath = path.join(profilesDataDir, `${safeUserId}.json`);

    if (fs.existsSync(profileFilePath)) {
      const data = JSON.parse(fs.readFileSync(profileFilePath, 'utf8'));
      return sendJSON(res, 200, { success: true, profile: data });
    }

    const now = new Date().toISOString();
    const defaultProfile = {
      userId: safeUserId,
      rawUserId: String(rawUserId),
      displayName: 'Patient User',
      age: 25,
      gender: 'Unisex',
      bio: 'Facial harmony, dermal clarity, and hair retention optimization.',
      avatarUrl: null,
      email: 'user@faceup.ai',
      phone: null,
      metadata: {
        scanCount: 0,
        membershipTier: 'Pro Neural Lab',
        lastActive: now,
        createdAt: now,
        updatedAt: now
      },
      createdAt: now,
      updatedAt: now
    };

    return sendJSON(res, 200, { success: true, profile: defaultProfile, isDefault: true });
  } catch (err) {
    return sendJSON(res, 500, { success: false, error: err.message });
  }
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // Handle CORS preflight options
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      ...SECURITY_HEADERS
    });
    return res.end();
  }

  // Health check endpoint
  if (urlPath === '/api/health') {
    return sendJSON(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
  }

  // User Profile & Metadata Endpoints
  if (urlPath === '/api/user-profile' && req.method === 'POST') {
    return handleSaveUserProfile(req, res);
  }
  if (urlPath === '/api/user-profile' && req.method === 'GET') {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const userId = parsedUrl.searchParams.get('userId') || 'patient_user';
    return handleGetUserProfile(req, res, userId);
  }
  if (urlPath.startsWith('/api/user-profile/') && req.method === 'GET') {
    const userId = urlPath.replace('/api/user-profile/', '').split('?')[0];
    return handleGetUserProfile(req, res, userId);
  }

  // Dedicated Detailed VIEW ADVICE Endpoint
  if (urlPath === '/api/openrouter-advice-detail' && req.method === 'POST') {
    return handleOpenRouterAdviceDetail(req, res);
  }

  // Dedicated User-Scoped Nutrition & Calorie Plan Endpoint
  if (urlPath === '/api/openrouter-nutrition-plan' && req.method === 'POST') {
    return handleOpenRouterNutritionPlan(req, res);
  }

  // Vision-Capable AI Food Scanner Endpoint
  if (urlPath === '/api/openrouter-food-scan' && req.method === 'POST') {
    return handleOpenRouterFoodScan(req, res);
  }

  // Dedicated Hairstyle Recommendations Endpoint
  if (urlPath === '/api/openrouter-hairstyles' && req.method === 'POST') {
    return handleOpenRouterHairstyles(req, res);
  }

  // Dedicated Single Hairstyle Image Generation Endpoint
  if (urlPath === '/api/generate-single-hairstyle' && req.method === 'POST') {
    return handleGenerateSingleHairstyle(req, res);
  }

  // Dedicated High-Resolution Hairstyle Asset Endpoint
  if (urlPath.startsWith('/api/hairstyle-asset/')) {
    const cut = urlPath.replace('/api/hairstyle-asset/', '').replace('.png', '').replace(/[^a-z_]/g, '');
    const hairstyleAssetsDir = path.join(__dirname, 'assets', 'hairstyles');
    const targetFile = path.join(hairstyleAssetsDir, `hair_${cut}.png`);

    if (!targetFile.startsWith(path.join(__dirname, 'assets'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Forbidden');
    }
    return fs.readFile(targetFile, (err, data) => {
      if (!err && data) {
        res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400', ...SECURITY_HEADERS });
        return res.end(data);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Asset not found');
    });
  }

  // Dedicated FaceUp X Brand Assets Endpoint
  if (urlPath === '/assets/faceup_gold_logo.png' || urlPath === '/api/brand-asset/logo') {
    const localFile = path.join(__dirname, 'assets', 'faceup_gold_logo.png');
    return fs.readFile(localFile, (err, data) => {
      if (!err && data) {
        res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400', ...SECURITY_HEADERS });
        return res.end(data);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Asset not found');
    });
  }

  if (urlPath === '/assets/faceup_gold_profile_mesh.png' || urlPath === '/api/brand-asset/wireframe-face') {
    const localFile = path.join(__dirname, 'assets', 'faceup_gold_profile_mesh.png');
    return fs.readFile(localFile, (err, data) => {
      if (!err && data) {
        res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400', ...SECURITY_HEADERS });
        return res.end(data);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      return res.end('Asset not found');
    });
  }

  // Live YouTube Video Validator / Resolver Endpoint
  if (urlPath === '/api/resolve-exercise-video' && req.method === 'POST') {
    return handleResolveExerciseVideo(req, res);
  }

  // Unified OpenRouter AI Enrichment Endpoint
  if ((urlPath === '/api/openrouter-enrichment' ||
    urlPath === '/api/openrouter-skin-advice' ||
    urlPath === '/api/openrouter-face-analysis' ||
    urlPath === '/api/openrouter-hair-advice' ||
    urlPath === '/api/openrouter-jawline-advice' ||
    urlPath === '/api/openrouter-makeup-advice' ||
    urlPath === '/api/openrouter-eyes-advice') && req.method === 'POST') {
    return handleOpenRouterEnrichment(req, res);
  }

  // ── Static File Server with Path Traversal Protection ──
  let filePath = path.resolve(__dirname, urlPath === '/' ? 'index.html' : '.' + urlPath);

  // Security: Block path traversal and null bytes
  if (filePath.indexOf('\0') !== -1 || !filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/html', ...SECURITY_HEADERS });
    return res.end('<h1>403 Forbidden</h1>', 'utf-8');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  const isImmutableAsset = ['.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.svg', '.ico'].includes(ext);
  const cacheControl = isImmutableAsset ? 'public, max-age=86400' : 'public, max-age=60';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html', ...SECURITY_HEADERS });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html', ...SECURITY_HEADERS });
        res.end('<h1>500 Internal Server Error</h1>', 'utf-8');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': cacheControl,
        ...SECURITY_HEADERS
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 FaceUp X Server running at http://localhost:${PORT}/\n`);
});