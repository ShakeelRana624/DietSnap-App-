import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail, 
  verifyBeforeUpdateEmail, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, MealLog, WeightLog } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const setAuthPersistence = async (remember: boolean) => {
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  } catch (error) {
    console.error("Persistence setting failed:", error);
  }
};

export interface FirebaseUser extends UserProfile {
  id: string;
}

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    return result.user;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Reset failed:", error);
    throw error;
  }
};

export const updateEmailAddress = async (newEmail: string) => {
  if (!auth.currentUser) throw new Error("No user logged in");
  try {
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
  } catch (error) {
    console.error("Email update failed:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('dietsnap_profile');
  return signOut(auth);
};

// User Profile helpers
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, 'get', `users/${uid}`);
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, profile, { merge: true });
  } catch (error) {
    return handleFirestoreError(error, 'create', `users/${profile.uid}`);
  }
};

export const updateStreak = async (profile: UserProfile) => {
  const today = new Date();
  const lastLoginDate = profile.lastGoalUpdate ? new Date(profile.lastGoalUpdate) : null;
  
  if (!lastLoginDate) return;

  const diffTime = Math.abs(today.getTime() - lastLoginDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = profile.streak || 0;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  if (newStreak !== profile.streak) {
    await saveUserProfile({ ...profile, streak: newStreak, lastGoalUpdate: today.toISOString() });
    return newStreak;
  }
  return profile.streak;
};

// Meal Log helpers
export const logMeal = async (meal: MealLog): Promise<void> => {
  try {
    const userMealsRef = collection(db, 'users', meal.uid, 'meals');
    await addDoc(userMealsRef, meal);
  } catch (error) {
    return handleFirestoreError(error, 'create', `users/${meal.uid}/meals`);
  }
};

export const logWeight = async (weightLog: WeightLog): Promise<void> => {
  try {
    const userWeightsRef = collection(db, 'users', weightLog.uid, 'weights');
    await addDoc(userWeightsRef, weightLog);
  } catch (error) {
    return handleFirestoreError(error, 'create', `users/${weightLog.uid}/weights`);
  }
};

export const subscribeToWeights = (uid: string, callback: (weights: WeightLog[]) => void) => {
  const q = query(collection(db, 'users', uid, 'weights'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const weights = snapshot.docs.map(doc => doc.data() as WeightLog);
    callback(weights);
  });
};

export const subscribeToMeals = (uid: string, callback: (meals: MealLog[]) => void) => {
  const q = query(
    collection(db, 'users', uid, 'meals'),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const meals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealLog));
    callback(meals);
  });
};

// Handle Firestore errors according to integration guidelines
interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

export const handleFirestoreError = (error: any, operation: string, path: string | null) => {
  const authInfo = auth.currentUser ? {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email || '',
    emailVerified: auth.currentUser.emailVerified,
    isAnonymous: auth.currentUser.isAnonymous,
    providerInfo: auth.currentUser.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName || '',
      email: p.email || ''
    }))
  } : {
    userId: 'anonymous',
    email: '',
    emailVerified: false,
    isAnonymous: true,
    providerInfo: []
  };

  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown error',
    operationType: operation as any,
    path: path,
    authInfo: authInfo
  };

  throw new Error(JSON.stringify(errorInfo));
};
