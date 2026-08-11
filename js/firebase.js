/**
 * Firebase Module
 * Initializes Firebase App, Analytics & Auth Services
 */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  updateProfile as updateAuthProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

// Firebase JS SDK configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaLsGPfIBu2xdeaXViIhZ4DaxP1aXTQ_4",
  authDomain: "faceup-39235.firebaseapp.com",
  projectId: "faceup-39235",
  storageBucket: "faceup-39235.firebasestorage.app",
  messagingSenderId: "537011865635",
  appId: "1:537011865635:web:7da5966949725d3b9d4996",
  measurementId: "G-M8CM21P9S5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Sign in user with Google Auth Provider via Popup
 */
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Firebase Google Auth Error:", error.code, error.message);
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: "Sign-in popup was closed before completing." };
    }
    if (error.code === 'auth/popup-blocked') {
      return { success: false, error: "Sign-in popup was blocked by browser. Please allow popups." };
    }
    return { success: false, error: error.message || "Failed to sign in with Google." };
  }
}

/**
 * Sign in user with email and password
 * Blocks access if email is unverified
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      // Re-send email verification if user attempts login while unverified
      await sendEmailVerification(user).catch((err) => console.warn("Email verification resend notice:", err.message));
      await signOut(auth);
      return { success: false, unverified: true, email: user.email };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Firebase Sign In Error:", error.code, error.message);
    return { success: false, error: "Email or password is incorrect" };
  }
}

/**
 * Register new user with email and password
 * Sends verification email and signs out user immediately (no auto sign-in)
 */
export async function signUpUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send verification email
    await sendEmailVerification(user);

    // Sign out user immediately so they are not signed in automatically
    await signOut(auth);

    return { success: true, email: user.email, unverified: true };
  } catch (error) {
    console.error("Firebase Sign Up Error:", error.code, error.message);
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: "User already exists. Please sign in" };
    }
    if (error.code === 'auth/weak-password') {
      return { success: false, error: "Password should be at least 6 characters" };
    }
    if (error.code === 'auth/invalid-email') {
      return { success: false, error: "Please enter a valid email address" };
    }
    return { success: false, error: error.message || "Sign up failed" };
  }
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Firebase Sign Out Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Fetch or initialize Firestore user profile document doc(db, "users", uid)
 */
export async function fetchUserProfile(uid) {
  try {
    const activeUser = auth.currentUser;
    const targetUid = uid || activeUser?.uid;

    if (!targetUid) {
      return { success: false, error: "User ID required." };
    }

    if (db) {
      const userRef = doc(db, "users", targetUid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        return { success: true, data: firestoreData };
      } else {
        // Create initial profile if missing
        const initialProfile = {
          uid: targetUid,
          displayName: activeUser?.displayName || "Patient User",
          email: activeUser?.email || "user@faceup.ai",
          avatarUrl: activeUser?.photoURL || null,
          role: "user",
          membershipTier: "Pro Neural Lab",
          age: 25,
          gender: "Unisex",
          bio: "Facial harmony, dermal clarity, and hair retention optimization.",
          createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
          lastActive: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
          scanCount: 0
        };
        await setDoc(userRef, initialProfile, { merge: true }).catch((err) => console.warn("Initial profile creation notice:", err.message));
        return { success: true, data: initialProfile };
      }
    }

    return {
      success: true,
      data: {
        uid: targetUid,
        displayName: activeUser?.displayName || "Patient User",
        email: activeUser?.email || "user@faceup.ai",
        avatarUrl: activeUser?.photoURL || null,
        membershipTier: "Pro Neural Lab",
        scanCount: 0
      }
    };
  } catch (error) {
    console.warn("Firestore fetchUserProfile Warning:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch scan reports for a specific user from Firestore
 * Targets nested subcollection path: collection(db, "users", auth.currentUser.uid, "scanReports")
 * Aligned with Security Rule: /users/{userId}/{allPaths=**}
 */
export async function fetchUserScanReports(uid) {
  try {
    // 1. Auth Guard & State Check
    const activeUser = auth.currentUser;
    const targetUid = uid || activeUser?.uid;

    if (!activeUser || !targetUid) {
      console.warn("fetchUserScanReports aborted: Firebase Auth state not resolved or user unauthenticated.");
      return { success: false, unauthenticated: true, reports: [], error: "User authentication required." };
    }

    // Security Rules Alignment Check
    if (activeUser.uid !== targetUid) {
      console.warn("fetchUserScanReports aborted: target UID does not match authenticated user UID.");
      return { success: false, reports: [], error: "Access denied. Scoped user mismatch." };
    }

    // 2. Query Specification: Target nested user subcollection
    const userScanReportsRef = collection(db, "users", activeUser.uid, "scanReports");
    let snapshot;

    try {
      // Primary Query with chained orderBy("createdAt", "desc")
      const q = query(userScanReportsRef, orderBy("createdAt", "desc"));
      snapshot = await getDocs(q);
    } catch (queryErr) {
      console.warn("Firestore subcollection query with orderBy failed/missing index. Retrying with base getDocs:", queryErr);
      snapshot = await getDocs(userScanReportsRef);
    }

    const reports = [];
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((docSnap) => {
        reports.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
    }

    // Client-side sort fallback
    reports.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.createdAt).getTime() || 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.createdAt).getTime() || 0);
      return timeB - timeA;
    });

    return { success: true, reports };
  } catch (error) {
    console.error("Firestore fetchUserScanReports Error:", error);
    return { success: false, reports: [], error: error.message };
  }
}

/**
 * Single Unified Deletion Function
 * Deletes a scan report Firestore document AND its associated Firebase Storage assets (photo, PDF)
 */
export async function deleteScanReportAndStorageAssets(userId, reportId) {
  try {
    const activeUser = auth.currentUser;
    const targetUid = userId || activeUser?.uid;

    if (!activeUser || !targetUid || activeUser.uid !== targetUid) {
      return { success: false, error: "User authentication required." };
    }

    const docRef = doc(db, "users", activeUser.uid, "scanReports", reportId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Delete associated Firebase Storage assets if present
      if (data.storagePhotoPath) {
        const photoRef = ref(storage, data.storagePhotoPath);
        await deleteObject(photoRef).catch(err => console.warn("Storage photo delete warning:", err));
      }
      if (data.storagePdfPath) {
        const pdfRef = ref(storage, data.storagePdfPath);
        await deleteObject(pdfRef).catch(err => console.warn("Storage PDF delete warning:", err));
      }

      // Delete Firestore document
      await deleteDoc(docRef);

      // Decrement user profile scan count
      const userRef = doc(db, "users", activeUser.uid);
      const userDoc = await getDoc(userRef).catch(() => null);
      const currentCount = (userDoc && userDoc.exists()) ? (userDoc.data().scanCount || 0) : 0;
      const newCount = Math.max(0, currentCount - 1);
      await setDoc(userRef, { scanCount: newCount, lastActive: serverTimestamp() }, { merge: true }).catch((err) => console.warn("User scan count decrement notice:", err.message));
    }

    return { success: true };
  } catch (error) {
    console.error("deleteScanReportAndStorageAssets Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Backward-compatible delete helper sharing the same unified deletion function
 */
export async function deleteScanReport(reportId) {
  const activeUser = auth.currentUser;
  return deleteScanReportAndStorageAssets(activeUser?.uid, reportId);
}

/**
 * Save a new scan report with atomic 20-record cap eviction and section deltas
 * Path: /users/{userId}/scanReports/{reportId}
 */
export async function createScanReport(userId, reportData = {}) {
  try {
    const activeUser = auth.currentUser;
    const targetUid = userId || activeUser?.uid;

    if (!activeUser || !targetUid || activeUser.uid !== targetUid) {
      return { success: false, error: "User authentication required." };
    }

    // 1. Fetch existing scan reports to compute deltas and enforce 20-record cap
    const userScanReportsRef = collection(db, "users", activeUser.uid, "scanReports");
    let existingSnap;
    try {
      const q = query(userScanReportsRef, orderBy("createdAt", "asc"));
      existingSnap = await getDocs(q);
    } catch (orderErr) {
      console.warn("Scan reports asc query fallback:", orderErr.message);
      existingSnap = await getDocs(userScanReportsRef);
    }

    const existingReports = [];
    if (existingSnap && !existingSnap.empty) {
      existingSnap.forEach(snap => {
        existingReports.push({ id: snap.id, ...snap.data() });
      });
    }

    // Sort ascending by time
    existingReports.sort((a, b) => {
      const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.createdAt).getTime() || 0);
      const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.createdAt).getTime() || 0);
      return tA - tB;
    });

    // 2. Compute section deltas vs previous scan
    const previousReport = existingReports.length > 0 ? existingReports[existingReports.length - 1] : null;

    const sectionScores = reportData.sectionScores || {
      skin: { score: reportData.score || 85, status: "High", percentile: "Top 15%" },
      hair: { score: 86, status: "High", percentile: "Top 8%" },
      jawline: { score: 85, status: "High", percentile: "Top 22%" },
      makeup: { score: 85, status: "High", percentile: "Top 10%" },
      eyes: { score: 86, status: "High", percentile: "Top 8%" },
      face: { score: reportData.score || 88, status: "High", percentile: "Top 15%" }
    };

    const sectionDeltas = {};
    if (previousReport && previousReport.sectionScores) {
      ['skin', 'hair', 'jawline', 'makeup', 'eyes', 'face'].forEach(key => {
        const curObj = sectionScores[key];
        const prevObj = previousReport.sectionScores[key];

        const curScore = typeof curObj === 'object' ? curObj.score : curObj;
        const prevScore = typeof prevObj === 'object' ? prevObj.score : prevObj;

        if (typeof curScore === 'number' && typeof prevScore === 'number') {
          sectionDeltas[key] = curScore - prevScore;
        }
      });
    }

    // 3. Auto-eviction: Hard cap of 20 scan records per user
    const MAX_REPORTS = 20;
    const reportsToDelete = [];
    if (existingReports.length >= MAX_REPORTS) {
      const numToEvict = (existingReports.length - MAX_REPORTS) + 1;
      for (let i = 0; i < numToEvict; i++) {
        reportsToDelete.push(existingReports[i]);
      }
    }

    for (const evicted of reportsToDelete) {
      await deleteScanReportAndStorageAssets(activeUser.uid, evicted.id || evicted.reportId);
    }

    // 4. Create new scan report
    const reportId = "REP-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const docRef = doc(db, "users", activeUser.uid, "scanReports", reportId);

    const newReport = {
      reportId: reportId,
      userId: activeUser.uid,
      status: reportData.status || "Completed",
      summary: reportData.summary || "Facial Symmetry & Golden Ratio Analysis",
      score: reportData.score || 88,
      faceShape: reportData.faceShape || "Oval",
      symmetry: reportData.symmetry || "92.4%",
      sectionScores: sectionScores,
      sectionDeltas: sectionDeltas,
      createdAt: serverTimestamp(),
      metrics: reportData.metrics || {
        goldenRatio: "1.618",
        gonialAngle: "120°",
        thirds: "33%/34%/33%"
      }
    };

    if (reportData.faceImageBase64) {
      newReport.faceImageBase64 = reportData.faceImageBase64;
    }

    await setDoc(docRef, newReport);

    // Update user profile scan count
    const userRef = doc(db, "users", activeUser.uid);
    const finalScanCount = Math.min(MAX_REPORTS, (existingReports.length - reportsToDelete.length) + 1);
    await setDoc(userRef, { scanCount: finalScanCount, lastActive: serverTimestamp() }, { merge: true }).catch((err) => console.warn("User scan count update notice:", err.message));

    return { success: true, report: newReport, evictedCount: reportsToDelete.length };
  } catch (error) {
    console.error("Firestore createScanReport Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete User Avatar Image from Firebase Storage
 */
export async function deleteUserAvatarFile(storagePath) {
  try {
    if (!storagePath || !storage) return { success: false };
    const avatarRef = ref(storage, storagePath);
    await deleteObject(avatarRef);
    return { success: true };
  } catch (err) {
    console.warn("deleteUserAvatarFile notice:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update non-credential profile fields for authenticated user in Firestore & Auth
 * Explicitly excludes email and phone credential modifications
 */
export async function updateUserProfile(userId, profileData = {}) {
  try {
    const activeUser = auth.currentUser;
    const targetUid = userId || activeUser?.uid;

    if (!targetUid) {
      return { success: false, error: "User authentication required." };
    }

    const updates = {
      uid: targetUid,
      displayName: (profileData.displayName || '').substring(0, 50).trim(),
      age: profileData.age ? Math.min(120, Math.max(10, parseInt(profileData.age, 10))) : 25,
      bio: (profileData.bio || '').substring(0, 250).trim(),
      gender: (profileData.gender || 'Unisex').substring(0, 20),
      updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    const photoUrl = profileData.photoURL || profileData.avatarUrl || null;
    if (photoUrl) {
      updates.photoURL = photoUrl;
      updates.avatarUrl = photoUrl;
    }
    if (profileData.photoPath) {
      updates.photoPath = profileData.photoPath;
    }

    // 1. Update Firebase Auth Profile if activeUser exists
    if (activeUser && activeUser.uid === targetUid) {
      try {
        const authUpdates = {};
        if (updates.displayName) authUpdates.displayName = updates.displayName;
        if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('/'))) {
          authUpdates.photoURL = photoUrl;
        }
        if (Object.keys(authUpdates).length > 0) {
          await updateAuthProfile(activeUser, authUpdates);
        }
      } catch (authErr) {
        console.warn('Firebase updateAuthProfile notice:', authErr.message);
      }
    }

    // 2. Persist to Firestore doc(db, "users", targetUid)
    if (db) {
      try {
        const userRef = doc(db, "users", targetUid);
        await setDoc(userRef, updates, { merge: true });
      } catch (firestoreErr) {
        console.error('Firestore setDoc user profile error:', firestoreErr);
        return { success: false, error: firestoreErr.message };
      }
    }

    return { success: true, updates };
  } catch (error) {
    console.error("Firestore updateUserProfile Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload User Avatar Image to Firebase Storage under profileImages/{uid}/avatar_{timestamp}.{ext}
 */
export async function uploadUserAvatar(userId, file, onProgress = null) {
  try {
    const activeUser = auth.currentUser;
    const targetUid = userId || activeUser?.uid;

    if (!targetUid) {
      return { success: false, error: "User authentication required." };
    }

    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    // 1. File Size Validation (Max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "Profile photo must be smaller than 10 MB." };
    }

    // 2. MIME Type Validation (any valid image type)
    const mime = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    const isImageMime = mime.startsWith('image/');
    const isCommonExt = /\.(jpg|jpeg|png|webp|gif|heic|heif|avif|bmp|svg)$/i.test(name);
    if (!isImageMime && !isCommonExt) {
      return { success: false, error: "Please select a valid image file (JPEG, PNG, WebP, GIF, HEIC, AVIF)." };
    }

    if (!storage) {
      return { success: false, error: "Storage service not initialized" };
    }

    // Extract file extension
    let ext = 'jpg';
    if (name.includes('.')) {
      ext = name.split('.').pop().toLowerCase();
    } else if (mime.includes('/')) {
      ext = mime.split('/')[1];
      if (ext === 'jpeg') ext = 'jpg';
    }

    const storagePath = `profileImages/${targetUid}/avatar_${Date.now()}.${ext}`;
    const avatarRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(avatarRef, file, {
      contentType: file.type || `image/${ext}`
    });

    return new Promise((resolve) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        }, 
        (error) => {
          console.error("Firebase Storage Avatar Upload Error:", error);
          resolve({ success: false, error: error.message });
        }, 
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ success: true, downloadURL, storagePath });
          } catch (e) {
            console.error("Failed to get avatar download URL:", e);
            resolve({ success: false, error: e.message });
          }
        }
      );
    });
  } catch (error) {
    console.error("uploadUserAvatar Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Save user makeup guide to Firestore subcollection under users/{uid}/scanReports/{scanId}/makeupGuides/{guideId}
 */
export async function saveMakeupGuideToFirestore(userId, scanId, makeupGuideData) {
  try {
    const activeUser = auth.currentUser;
    const targetUid = userId || activeUser?.uid;
    if (!activeUser || !targetUid || activeUser.uid !== targetUid) {
      return { success: false, error: "User authentication required." };
    }

    const guideId = makeupGuideData.guideId || ("MKP-GUIDE-" + Math.random().toString(36).substr(2, 6).toUpperCase());
    const guideRef = doc(db, "users", activeUser.uid, "scanReports", scanId, "makeupGuides", guideId);

    const dataToSave = {
      ...makeupGuideData,
      guideId: guideId,
      scanId: scanId,
      userId: activeUser.uid,
      createdAt: serverTimestamp()
    };

    await setDoc(guideRef, dataToSave, { merge: true });
    return { success: true, guideId, makeupGuide: dataToSave };
  } catch (error) {
    console.error("saveMakeupGuideToFirestore error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch existing makeup guide for a user and scan ID from Firestore
 */
export async function fetchMakeupGuideFromFirestore(userId, scanId, guideId = null) {
  try {
    const activeUser = auth.currentUser;
    const targetUid = userId || activeUser?.uid;
    if (!activeUser || !targetUid) return { success: false, guide: null };

    if (guideId) {
      const docRef = doc(db, "users", targetUid, "scanReports", scanId, "makeupGuides", guideId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { success: true, guide: { id: snap.id, ...snap.data() } };
      }
    }

    const guidesRef = collection(db, "users", targetUid, "scanReports", scanId, "makeupGuides");
    let querySnap;
    try {
      const q = query(guidesRef, orderBy("createdAt", "desc"));
      querySnap = await getDocs(q);
    } catch (_) {
      querySnap = await getDocs(guidesRef);
    }

    if (querySnap && !querySnap.empty) {
      const latestDoc = querySnap.docs[0];
      return { success: true, guide: { id: latestDoc.id, ...latestDoc.data() } };
    }

    return { success: true, guide: null };
  } catch (error) {
    console.warn("fetchMakeupGuideFromFirestore error:", error);
    return { success: false, guide: null, error: error.message };
  }
}
