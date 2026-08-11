# FaceUp X — AI Aesthetic Lab

AI-powered facial analysis and aesthetic optimization platform using MediaPipe 468 3D Face Landmarks, OpenRouter AI, and Firebase.

## Features

- **3D Face Scanning** — Real-time 468-landmark facial geometry analysis
- **AI Skin Analysis** — Dermal clarity, sebum balance, acne scoring
- **Hair & Scalp Assessment** — Norwood classification, density analysis
- **Jawline & Facial Symmetry** — Golden ratio φ alignment scoring
- **AI Hairstyle Generation** — GPT-Image-1 powered hairstyle visualization
- **Nutrition & Food Scanner** — AI-powered food photo calorie estimation
- **Personalized Advice** — Exercise routines, product recommendations
- **User Profiles** — Firebase Auth + Firestore profile persistence

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + Tailwind CSS + ES Modules |
| Backend | Node.js HTTP Server |
| AI/ML | MediaPipe Face Mesh + OpenRouter (GPT-4o, GPT-Image-1) |
| Auth | Firebase Authentication (Email + Google) |
| Database | Cloud Firestore |
| Storage | Firebase Storage |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Rkarn1125/FaceUp-X.git
cd FaceUp-X

# 2. Install dependencies
npm install

# 3. Create .env file with your OpenRouter API key
echo "OPENROUTER_API_KEY=your_key_here" > .env

# 4. Start the development server
npm start
```

Then open http://localhost:3000 in your browser.

## Environment Variables

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter API key for AI features |

## Project Structure

```
├── index.html          # Main application HTML
├── styles.css          # Application styles
├── server.mjs          # Node.js backend server
├── js/
│   ├── app.js          # Core application logic
│   ├── firebase.js     # Firebase Auth/Firestore/Storage
│   ├── camera.js       # Camera stream management
│   ├── metrics.js      # Facial metric calculations
│   ├── landmarks.js    # MediaPipe landmark processing
│   ├── tracker.js      # Face tracking engine
│   ├── ui.js           # UI utilities
│   └── ...
├── assets/             # Brand assets & images
├── firestore.rules     # Firestore security rules
├── storage.rules       # Storage security rules
└── firebase.json       # Firebase configuration
```

## License

MIT
