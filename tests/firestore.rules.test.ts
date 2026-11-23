// @vitest-environment node

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

let testEnv: RulesTestEnvironment | undefined;

const reviewData = {
  authorUid: 'user-a',
  name: 'Test User',
  rating: 5,
  comment: 'Great car and service',
  verified: false,
  helpfulCount: 0,
};

const newUserProfile = {
  uid: 'user-a',
  name: 'Test User',
  email: 'user-a@example.com',
  phone: '9876543210',
  address: '12 Test Street',
  city: 'Delhi',
  pincode: '110001',
  avatarUrl: '',
  carsViewedCount: 0,
  createdAt: '2026-11-23T00:00:00.000Z',
  updatedAt: '2026-11-23T00:00:00.000Z',
  loginCount: 0,
};

const legacyUserProfile = {
  uid: 'user-a',
  name: 'Legacy User',
  email: 'legacy@example.com',
  phone: '9876543210',
  address: 'Old Address',
  city: 'Delhi',
  pincode: '110001',
  avatarUrl: '',
  carsViewedCount: 3,
  updatedAt: '2025-01-01T00:00:00.000Z',
  // Deliberately omit createdAt, loginCount and lastLoginAt.
};

const orderData = {
  id: 'order-1',
  userId: 'user-a',
  trackingNumber: 'ASH-TRK-12345678',
  date: '23 November 2026',
  status: 'Confirmed',
  items: [{ id: 'car-1', name: 'Test Car', price: 100 }],
  address: {
    fullName: 'Test User',
    phone: '9876543210',
    email: 'user-a@example.com',
    address: '12 Test Street',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  },
  taxBreakdown: {
    basePrice: 100,
    totalCharges: 10,
    grandTotal: 110,
  },
  paymentMethod: 'Credit/Debit Card',
  documentVerification: {
    identityProof: true,
    addressProof: true,
    panOrForm60: true,
    customerConsent: true,
  },
  estimatedDeliveryDate: '7 December 2026',
};

const testDriveData = {
  id: 'TD-test-1',
  userId: 'user-a',
  carId: 1,
  carName: 'Test Car',
  carImage: 'https://example.com/car.jpg',
  fullName: 'Test User',
  phone: '9876543210',
  email: 'user-a@example.com',
  address: '12 Test Street',
  preferredDate: '2026-12-01',
  preferredTime: '10:00 AM',
  status: 'Scheduled',
  bookedAt: '2026-11-23T00:00:00.000Z',
};

async function seedDocument(path: string, data: Record<string, unknown>) {
  if (!testEnv) throw new Error('Firestore test environment was not initialized.');

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

async function seedReview() {
  await seedDocument('reviews/review-1', reviewData);
}

async function seedUser(data: Record<string, unknown> = newUserProfile) {
  await seedDocument('users/user-a', data);
}

async function seedOrder() {
  await seedDocument('orders/order-1', orderData);
}

async function seedTestDrive() {
  await seedDocument('testDrives/TD-test-1', testDriveData);
}

beforeAll(async () => {
  const rules = readFileSync(
    resolve(process.cwd(), 'firestore.rules'),
    'utf8',
  );

  testEnv = await initializeTestEnvironment({
    projectId: 'demo-autospot-hub',
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules,
    },
  });
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (!testEnv) throw new Error('Firestore test environment was not initialized.');
  await testEnv.clearFirestore();
});

describe('AutoSpot Hub Firestore Security Rules', () => {
  describe('Public cars and reviews', () => {
    it('allows public users to read cars and reviews', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.unauthenticatedContext().firestore();

      await assertSucceeds(getDoc(doc(db, 'cars/car-1')));
      await assertSucceeds(getDoc(doc(db, 'reviews/review-1')));
    });

    it('blocks ordinary users from modifying car records', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertFails(
        setDoc(doc(db, 'cars/car-1'), { name: 'Unauthorized car' }),
      );
    });

    it('allows an administrator to create car records', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();

      await assertSucceeds(
        setDoc(doc(db, 'cars/car-1'), { name: 'Administrator car' }),
      );
    });
  });

  describe('User profiles', () => {
    it('allows an authenticated user to create their own valid initial profile', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertSucceeds(
        setDoc(doc(db, 'users/user-a'), newUserProfile),
      );
    });

    it('prevents a user from creating another user profile', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-b').firestore();

      await assertFails(
        setDoc(doc(db, 'users/user-a'), newUserProfile),
      );
    });

    it('allows owners to read their own profile but blocks other users', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedUser();
      const ownerDb = testEnv.authenticatedContext('user-a').firestore();
      const otherUserDb = testEnv.authenticatedContext('user-b').firestore();

      await assertSucceeds(getDoc(doc(ownerDb, 'users/user-a')));
      await assertFails(getDoc(doc(otherUserDb, 'users/user-a')));
    });

    it('prevents users from creating profiles with non-zero protected counters', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertFails(
        setDoc(doc(db, 'users/user-a'), {
          ...newUserProfile,
          loginCount: 50,
        }),
      );

      await assertFails(
        setDoc(doc(db, 'users/user-a'), {
          ...newUserProfile,
          carsViewedCount: 500,
        }),
      );
    });

    it('allows an owner to update editable fields on a legacy profile missing optional fields', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedUser(legacyUserProfile);
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertSucceeds(
        updateDoc(doc(db, 'users/user-a'), {
          name: 'Updated Legacy User',
          address: 'New Address',
          updatedAt: '2026-11-23T01:00:00.000Z',
        }),
      );
    });

    it('allows an owner to update their editable profile fields', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedUser();
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertSucceeds(
        updateDoc(doc(db, 'users/user-a'), {
          name: 'Updated User',
          email: 'updated@example.com',
          phone: '9999999999',
          address: 'New Address',
          city: 'Gurugram',
          pincode: '122001',
          avatarUrl: 'https://example.com/avatar.jpg',
          updatedAt: '2026-11-23T01:00:00.000Z',
        }),
      );
    });

    it('prevents owners from changing their UID or protected account fields', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedUser();
      const db = testEnv.authenticatedContext('user-a').firestore();
      const userRef = doc(db, 'users/user-a');

      await assertFails(updateDoc(userRef, { uid: 'user-b' }));
      await assertFails(updateDoc(userRef, { createdAt: 'forged-date' }));
      await assertFails(updateDoc(userRef, { loginCount: 999 }));
      await assertFails(updateDoc(userRef, { lastLoginAt: 'forged-date' }));
      await assertFails(updateDoc(userRef, { carsViewedCount: 999 }));
    });

    it('prevents one user from editing another user profile', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedUser();
      const db = testEnv.authenticatedContext('user-b').firestore();

      await assertFails(
        updateDoc(doc(db, 'users/user-a'), { name: 'Changed by another user' }),
      );
    });

    it('allows administrators to update protected profile fields', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedUser();
      const db = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();

      await assertSucceeds(
        updateDoc(doc(db, 'users/user-a'), { loginCount: 1 }),
      );
    });
  });

  describe('Orders', () => {
    it('allows a user to create a valid order for themselves', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertSucceeds(
        setDoc(doc(db, 'orders/order-1'), orderData),
      );
    });

    it('prevents a user from creating an order for another user', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-b').firestore();

      await assertFails(
        setDoc(doc(db, 'orders/order-1'), orderData),
      );
    });

    it('rejects an order with an incorrect grand total', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertFails(
        setDoc(doc(db, 'orders/order-1'), {
          ...orderData,
          taxBreakdown: {
            basePrice: 100,
            totalCharges: 10,
            grandTotal: 999,
          },
        }),
      );
    });

    it('allows only administrators to update existing orders', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedOrder();
      const ownerDb = testEnv.authenticatedContext('user-a').firestore();
      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();

      await assertFails(
        updateDoc(doc(ownerDb, 'orders/order-1'), { status: 'Delivered' }),
      );
      await assertSucceeds(
        updateDoc(doc(adminDb, 'orders/order-1'), { status: 'Delivered' }),
      );
    });

    it('prevents users from reading another user order', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedOrder();
      const db = testEnv.authenticatedContext('user-b').firestore();

      await assertFails(getDoc(doc(db, 'orders/order-1')));
    });
  });

  describe('Test drives', () => {
    it('allows a user to create their own scheduled test drive', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertSucceeds(
        setDoc(doc(db, 'testDrives/TD-test-1'), testDriveData),
      );
    });

    it('prevents a user from creating a test drive for another user', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-b').firestore();

      await assertFails(
        setDoc(doc(db, 'testDrives/TD-test-1'), testDriveData),
      );
    });

    it('allows owners to read their own test drive but blocks other users', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedTestDrive();
      const ownerDb = testEnv.authenticatedContext('user-a').firestore();
      const otherUserDb = testEnv.authenticatedContext('user-b').firestore();

      await assertSucceeds(getDoc(doc(ownerDb, 'testDrives/TD-test-1')));
      await assertFails(getDoc(doc(otherUserDb, 'testDrives/TD-test-1')));
    });

    it('prevents owners from changing an existing test drive status', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedTestDrive();
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertFails(
        updateDoc(doc(db, 'testDrives/TD-test-1'), { status: 'Completed' }),
      );
    });
  });

  describe('Reviews', () => {
    it('blocks unauthenticated users from creating reviews', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.unauthenticatedContext().firestore();

      await assertFails(
        setDoc(doc(db, 'reviews/review-1'), reviewData),
      );
    });

    it('allows a user to create their own unverified review', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertSucceeds(
        setDoc(doc(db, 'reviews/review-1'), reviewData),
      );
    });

    it('prevents a user from marking their review as verified', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedReview();
      const db = testEnv.authenticatedContext('user-a').firestore();

      await assertFails(
        updateDoc(doc(db, 'reviews/review-1'), { verified: true }),
      );
    });

    it('prevents one user from editing another user review', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedReview();
      const db = testEnv.authenticatedContext('user-b').firestore();

      await assertFails(
        updateDoc(doc(db, 'reviews/review-1'), {
          comment: 'Changed by another user',
        }),
      );
    });

    it('allows an administrator to update a review', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedReview();
      const db = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();

      await assertSucceeds(
        updateDoc(doc(db, 'reviews/review-1'), { verified: true }),
      );
    });
  });

  describe('Audit logs', () => {
    it('blocks ordinary users from creating login and activity logs', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      const db = testEnv.authenticatedContext('user-a').firestore();
      const logData = { id: 'log-1', uid: 'user-a', timestamp: '2026-11-23T00:00:00.000Z' };

      await assertFails(setDoc(doc(db, 'loginLogs/log-1'), logData));
      await assertFails(setDoc(doc(db, 'activityLogs/log-1'), logData));
    });

    it('allows administrators to read audit logs but blocks ordinary users', async () => {
      if (!testEnv) throw new Error('Test environment unavailable.');
      await seedDocument('loginLogs/log-1', {
        id: 'log-1',
        uid: 'user-a',
        timestamp: '2026-11-23T00:00:00.000Z',
      });
      const userDb = testEnv.authenticatedContext('user-a').firestore();
      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();

      await assertFails(getDoc(doc(userDb, 'loginLogs/log-1')));
      await assertSucceeds(getDoc(doc(adminDb, 'loginLogs/log-1')));
    });
  });
});
