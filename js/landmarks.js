/**
 * MediaPipe Face Mesh (468 3D Landmarks) Key Index Mapping
 * Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
 */

export const LANDMARK_INDICES = {
  // Central axis (Vertical alignment)
  hairline: 10,
  glabella: 168,
  noseBridge: 6,
  noseTip: 1,
  subnasale: 2,
  upperLipCenter: 0,
  lowerLipCenter: 17,
  chin: 152,

  // Forehead width
  foreheadLeft: 54,
  foreheadRight: 284,

  // Temples
  templeLeft: 127,
  templeRight: 356,

  // Cheekbones (Zygomatic Arch - widest part of cheek)
  cheekLeft: 234,
  cheekRight: 454,

  // Jaw corners (Gonion - widest part of jaw)
  jawLeft: 132,
  jawRight: 361,

  // Eyes
  leftEye: {
    outer: 33,
    inner: 133,
    top: 159,
    bottom: 145,
    center: 468 // fallback or calculated midpoint
  },
  rightEye: {
    outer: 263,
    inner: 362,
    top: 386,
    bottom: 374,
    center: 473
  },

  // Eyebrows
  leftEyebrow: {
    inner: 55,
    peak: 70,
    outer: 46
  },
  rightEyebrow: {
    inner: 285,
    peak: 300,
    outer: 276
  },

  // Nose
  noseLeftWing: 129,
  noseRightWing: 358,

  // Mouth
  mouthLeft: 61,
  mouthRight: 291,
  upperLipTop: 0,
  lowerLipBottom: 17,

  // Symmetrical Pairs for Symmetry Analysis (Left vs Right relative to central axis)
  symmetricPairs: [
    { name: 'Cheekbones', left: 234, right: 454 },
    { name: 'Jaw Corners', left: 132, right: 361 },
    { name: 'Eye Outer Corners', left: 33, right: 263 },
    { name: 'Eye Inner Corners', left: 133, right: 362 },
    { name: 'Eyebrow Peaks', left: 70, right: 300 },
    { name: 'Eyebrow Outer Ends', left: 46, right: 276 },
    { name: 'Nose Wings', left: 129, right: 358 },
    { name: 'Mouth Corners', left: 61, right: 291 },
    { name: 'Temples', left: 127, right: 356 },
    { name: 'Mid Jaw Points', left: 172, right: 397 }
  ],

  // Full Face Contour (for drawing subtle HUD target polygon)
  faceContour: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
    400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
    54, 103, 67, 109
  ],

  // Lips contour
  lipsContour: [
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146
  ],

  // Eyes contours
  leftEyeContour: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  rightEyeContour: [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466]
};
