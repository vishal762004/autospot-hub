
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

// ============================================================
// LOGIN LOG MODEL
// ============================================================

export interface LoginLogRecord {
  id: string;
  uid: string;
  email: string;
  name: string;
  provider: string;
  timestamp: string;
  userAgent?: string;
}

// ============================================================
// FIREBASE INITIALIZATION
// ============================================================

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId &&
    firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined
);

export const googleProvider = new GoogleAuthProvider();

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

/**
 * Checks whether the signed-in user has a server-issued admin claim.
 */
export async function isCurrentUserAdmin(
  user: FirebaseUser | null = auth.currentUser
) {
  if (!user) return false;

  const tokenResult = await user.getIdTokenResult();

  return tokenResult.claims.admin === true;
}

// ============================================================
// GOOGLE LOGIN
// ============================================================

/**
 * Sign in with Google Popup.
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

// ============================================================
// USER PROFILE SYNCHRONIZATION
// ============================================================

/**
 * Sync or create user profile in Firestore document:
 * users/{uid}
 *
 * Existing protected fields are preserved rather than rewritten.
 * Optional fields are included only when they contain valid values.
 */
export async function syncUserProfileDoc(
  user: FirebaseUser,
  additionalData?: Partial<UserProfile>
) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  const timestamp = new Date().toISOString();

  // ----------------------------------------------------------
  // EXISTING USER PROFILE
  // ----------------------------------------------------------

  if (snap.exists()) {
    const existing = snap.data() as Partial<UserProfile>;

    // Build the profile returned to the application.
    const updated: UserProfile = {
      uid: user.uid,

      name:
        additionalData?.name ??
        existing.name ??
        user.displayName ??
        'Luxury Collector',

      email: user.email ?? existing.email ?? '',

      phone:
        additionalData?.phone ??
        existing.phone ??
        user.phoneNumber ??
        '',

      address:
        additionalData?.address ??
        existing.address ??
        '',

      city:
        additionalData?.city ??
        existing.city ??
        '',

      pincode:
        additionalData?.pincode ??
        existing.pincode ??
        '',

      avatarUrl:
        additionalData?.avatarUrl ??
        existing.avatarUrl ??
        user.photoURL ??
        '',

      carsViewedCount: existing.carsViewedCount ?? 0,

      // Preserve createdAt only when it already exists.
      ...(typeof existing.createdAt === 'string'
        ? { createdAt: existing.createdAt }
        : {}),

      // Preserve lastLoginAt only when it already exists.
      ...(typeof existing.lastLoginAt === 'string'
        ? { lastLoginAt: existing.lastLoginAt }
        : {}),

      // Preserve loginCount only when it already exists.
      ...(typeof existing.loginCount === 'number'
        ? { loginCount: existing.loginCount }
        : {}),

      updatedAt: timestamp,
    };

    // Only update customer-editable fields.
    // Existing protected fields remain unchanged.
    const profileUpdate: Partial<UserProfile> = {
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      city: updated.city,
      pincode: updated.pincode,
      avatarUrl: updated.avatarUrl,
      updatedAt: timestamp,
    };

    await setDoc(userRef, profileUpdate, { merge: true });

    return updated;
  }

  // ----------------------------------------------------------
  // NEW USER PROFILE
  // ----------------------------------------------------------

  const newProfile: UserProfile = {
    uid: user.uid,

    name:
      additionalData?.name ??
      user.displayName ??
      'Luxury Collector',

    email: user.email ?? '',

    phone:
      additionalData?.phone ??
      user.phoneNumber ??
      '',

    address: additionalData?.address ?? '',
    city: additionalData?.city ?? '',
    pincode: additionalData?.pincode ?? '',

    avatarUrl:
      additionalData?.avatarUrl ??
      user.photoURL ??
      '',

    carsViewedCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    loginCount: 0,
  };

  await setDoc(userRef, newProfile);

  return newProfile;
}

// ============================================================
// ADMIN: FETCH ALL USERS
// ============================================================

/**
 * Fetch all user profiles registered in Firestore.
 */
export async function fetchAllUsersForAdmin() {
  try {
    const snap = await getDocs(collection(db, 'users'));

    const list: UserProfile[] = [];

    snap.forEach((docSnap) => {
      list.push({
        uid: docSnap.id,
        ...(docSnap.data() as Omit<UserProfile, 'uid'>),
      });
    });

    return list;
  } catch (err) {
    console.error('Error fetching all users:', err);
    throw err;
  }
}

// ============================================================
// ADMIN: FETCH LOGIN LOGS
// ============================================================

/**
 * Fetch all user login logs from Firestore.
 */
export async function fetchAllLoginLogsForAdmin() {
  try {
    const snap = await getDocs(collection(db, 'loginLogs'));

    const list: LoginLogRecord[] = [];

    snap.forEach((docSnap) => {
      list.push(docSnap.data() as LoginLogRecord);
    });

    return list.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );
  } catch (err) {
    console.error('Error fetching login logs:', err);
    throw err;
  }
}

// ============================================================
// ADMIN: FETCH ALL ORDERS
// ============================================================

/**
 * Fetch all orders across all users from Firestore.
 */
export async function fetchAllOrdersForAdmin(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));

    const list: Order[] = [];

    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Order);
    });

    return list.sort(
      (a, b) =>
        new Date(b.date || 0).getTime() -
        new Date(a.date || 0).getTime()
    );
  } catch (err) {
    console.error('Error fetching all orders for admin:', err);
    throw err;
  }
}

// ============================================================
// ADMIN: FETCH ALL TEST DRIVES
// ============================================================

/**
 * Fetch all test drive appointments from Firestore.
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

// ============================================================
// ADMIN: UPDATE ORDER STATUS
// ============================================================

/**
 * Update order status in Firestore.
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: Order['status']
) {
  try {
    const orderRef = doc(db, 'orders', orderId);

    await updateDoc(orderRef, {
      status: newStatus,
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    throw err;
  }
}

// ============================================================
// ADMIN: UPDATE TEST DRIVE STATUS
// ============================================================

/**
 * Update test drive status in Firestore.
 */
export async function updateTestDriveStatusInFirestore(
  testDriveId: string,
  newStatus: string
) {
  try {
    const tdRef = doc(db, 'testDrives', testDriveId);

    await updateDoc(tdRef, {
      status: newStatus,
    });
  } catch (err) {
    console.error('Error updating test drive status:', err);
    throw err;
  }
}

// ============================================================
// USER: FETCH PROFILE
// ============================================================

/**
 * Fetch user profile from Firestore.
 */
export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
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

// ============================================================
// USER: UPDATE PROFILE
// ============================================================

/**
 * Update user profile in Firestore.
 *
 * Only customer-editable fields are allowed.
 * Protected account fields cannot be changed through this function.
 */
export async function updateUserProfileDoc(
  uid: string,
  data: Partial<UserProfile>
) {
  try {
    const userRef = doc(db, 'users', uid);

    // Explicit allow-list of customer-editable fields.
    // Protected fields such as UID, counters and timestamps
    // are deliberately excluded.
    const profileUpdate: Partial<UserProfile> = {
      ...(typeof data.name === 'string' ? { name: data.name } : {}),
      ...(typeof data.email === 'string' ? { email: data.email } : {}),
      ...(typeof data.phone === 'string' ? { phone: data.phone } : {}),
      ...(typeof data.address === 'string' ? { address: data.address } : {}),
      ...(typeof data.city === 'string' ? { city: data.city } : {}),
      ...(typeof data.pincode === 'string' ? { pincode: data.pincode } : {}),
      ...(typeof data.avatarUrl === 'string'
        ? { avatarUrl: data.avatarUrl }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, profileUpdate, { merge: true });
  } catch (err) {
    console.error('Error updating user profile in Firestore:', err);
    throw err;
  }
}

// ============================================================
// USER: FETCH ORDERS
// ============================================================

/**
 * Fetch orders for a specific user from Firestore.
 */
export async function fetchUserOrders(uid: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', uid)
    );

    const querySnapshot = await getDocs(q);

    const list: Order[] = [];

    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Order);
    });

    return list.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

// ============================================================
// USER: SAVE ORDER
// ============================================================

/**
 * Save a new order to Firestore.
 */
export async function saveOrderToFirestore(order: Order) {
  try {
    const orderRef = doc(db, 'orders', order.id);

    await setDoc(orderRef, {
      ...order,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving order to Firestore:', err);
    throw err;
  }
}

// ============================================================
// USER: FETCH TEST DRIVES
// ============================================================

/**
 * Fetch test drive appointments for a specific user.
 */
export async function fetchUserTestDrives(
  uid: string
): Promise<TestDriveAppointment[]> {
  try {
    const q = query(
      collection(db, 'testDrives'),
      where('userId', '==', uid)
    );

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

// ============================================================
// USER: SAVE TEST DRIVE
// ============================================================

/**
 * Save a new test drive appointment to Firestore.
 */
export async function saveTestDriveToFirestore(
  testDrive: TestDriveAppointment
) {
  try {
    const docRef = doc(db, 'testDrives', testDrive.id);

    await setDoc(docRef, {
      ...testDrive,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving test drive to Firestore:', err);
    throw err;
  }
}

// ============================================================
// LOGOUT
// ============================================================

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  await signOut(auth);
}
