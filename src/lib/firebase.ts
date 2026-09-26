/**
 * @file firebase.ts
 * @description Firebase initialization and Authentication/Firestore helpers for Auto Spot Hub.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Order, TestDriveAppointment } from '../types';

export interface LoginLogRecord {
  id: string;
  uid: string;
  email: string;
  name: string;
  provider: string;
  timestamp: string;
  userAgent?: string;
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if present
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined
);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

/**
 * Returns whether the signed-in user has the server-issued admin custom claim.
 * The claim is intentionally read from Firebase Auth rather than trusting a
 * client-side role field that a user could edit.
 */
export async function isCurrentUserAdmin(user: FirebaseUser | null = auth.currentUser) {
  if (!user) return false;
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.admin === true;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Sync or create user profile in Firestore document users/{uid}
 */
export async function syncUserProfileDoc(user: FirebaseUser, additionalData?: Partial<UserProfile>) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  const timestamp = new Date().toISOString();

  if (snap.exists()) {
    const existing = snap.data() as Partial<UserProfile>;
    const updated: UserProfile = {
      uid: user.uid,
      name: additionalData?.name ?? existing.name ?? user.displayName ?? 'Luxury Collector',
      email: user.email ?? existing.email ?? '',
      phone: additionalData?.phone ?? existing.phone ?? user.phoneNumber ?? '',
      address: additionalData?.address ?? existing.address ?? '',
      city: additionalData?.city ?? existing.city ?? '',
      pincode: additionalData?.pincode ?? existing.pincode ?? '',
      avatarUrl: additionalData?.avatarUrl ?? existing.avatarUrl ?? user.photoURL ?? '',
      carsViewedCount: existing.carsViewedCount ?? 0,
      createdAt: existing.createdAt ?? timestamp,
      lastLoginAt: existing.lastLoginAt,
      loginCount: existing.loginCount ?? 0,
      updatedAt: timestamp,
    };
    await setDoc(userRef, updated, { merge: true });
    return updated;
  }

  const newProfile: UserProfile = {
    uid: user.uid,
    name: additionalData?.name ?? user.displayName ?? 'Luxury Collector',
    email: user.email ?? '',
    phone: additionalData?.phone ?? user.phoneNumber ?? '',
    address: additionalData?.address ?? '',
    city: additionalData?.city ?? '',
    pincode: additionalData?.pincode ?? '',
    avatarUrl: additionalData?.avatarUrl ?? user.photoURL ?? '',
    carsViewedCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    loginCount: 0,
  };
  await setDoc(userRef, newProfile);
  return newProfile;
}

/**
 * OWNER / ADMIN HELPERS: Fetch all user profiles registered in Firestore
 */
export async function fetchAllUsersForAdmin() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach((docSnap) => {
      list.push({ uid: docSnap.id, ...(docSnap.data() as Omit<UserProfile, 'uid'>) });
    });
    return list;
  } catch (err) {
    console.error('Error fetching all users:', err);
    throw err;
  }
}

/**
 * OWNER / ADMIN HELPERS: Fetch all user login logs from Firestore
 */
export async function fetchAllLoginLogsForAdmin() {
  try {
    const snap = await getDocs(collection(db, 'loginLogs'));
    const list: LoginLogRecord[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as LoginLogRecord);
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.error('Error fetching login logs:', err);
    throw err;
  }
}

/**
 * OWNER / ADMIN HELPERS: Fetch all orders across all users from Firestore
 */
export async function fetchAllOrdersForAdmin(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const list: Order[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Order);
    });
    return list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  } catch (err) {
    console.error('Error fetching all orders for admin:', err);
    throw err;
  }
}

/**
 * OWNER / ADMIN HELPERS: Fetch all test drive appointments from Firestore
 */
export async function fetchAllTestDrivesForAdmin(): Promise<TestDriveAppointment[]> {
  try {
    const snap = await getDocs(collection(db, 'testDrives'));
    const list: TestDriveAppointment[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as TestDriveAppointment);
    });
    return list;
  } catch (err) {
    console.error('Error fetching all test drives:', err);
    throw err;
  }
}

/**
 * OWNER / ADMIN HELPERS: Update order status in Firestore
 */
export async function updateOrderStatusInFirestore(orderId: string, newStatus: Order['status']) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
  } catch (err) {
    console.error('Error updating order status:', err);
    throw err;
  }
}

/**
 * OWNER / ADMIN HELPERS: Update test drive status in Firestore
 */
export async function updateTestDriveStatusInFirestore(testDriveId: string, newStatus: string) {
  try {
    const tdRef = doc(db, 'testDrives', testDriveId);
    await updateDoc(tdRef, { status: newStatus });
  } catch (err) {
    console.error('Error updating test drive status:', err);
    throw err;
  }
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfileDoc(uid: string, data: Partial<UserProfile>) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error updating user profile in Firestore:', err);
    throw err;
  }
}

/**
 * Fetch orders for user from Firestore
 */
export async function fetchUserOrders(uid: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    const list: Order[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Order);
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

/**
 * Save new order to Firestore
 */
export async function saveOrderToFirestore(order: Order) {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, { ...order, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('Error saving order to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch test drive appointments for user from Firestore
 */
export async function fetchUserTestDrives(uid: string): Promise<TestDriveAppointment[]> {
  try {
    const q = query(collection(db, 'testDrives'), where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    const list: TestDriveAppointment[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as TestDriveAppointment);
    });
    return list;
  } catch (err) {
    console.error('Error fetching test drives:', err);
    return [];
  }
}

/**
 * Save new test drive to Firestore
 */
export async function saveTestDriveToFirestore(testDrive: TestDriveAppointment) {
  try {
    const docRef = doc(db, 'testDrives', testDrive.id);
    await setDoc(docRef, { ...testDrive, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('Error saving test drive to Firestore:', err);
    throw err;
  }
}

/**
 * Logout
 */
export async function logoutUser() {
  await signOut(auth);
}
