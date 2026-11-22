
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

let testEnv: RulesTestEnvironment;

const reviewData = {
  authorUid: 'user-a',
  name: 'Test User',
  rating: 5,
  comment: 'Great car and service',
  verified: false,
  helpfulCount: 0,
};

async function seedReview() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'reviews/review-1'),
      reviewData,
    );
  });
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
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('AutoSpot Hub Firestore Security Rules', () => {
  it('allows public users to read cars and reviews', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(db, 'cars/car-1')));
    await assertSucceeds(getDoc(doc(db, 'reviews/review-1')));
  });

  it('blocks unauthenticated users from creating reviews', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(
      setDoc(doc(db, 'reviews/review-1'), reviewData),
    );
  });

  it('allows a user to create their own unverified review', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertSucceeds(
      setDoc(doc(db, 'reviews/review-1'), reviewData),
    );
  });

  it('prevents a user from marking their review as verified', async () => {
    await seedReview();

    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(
      updateDoc(doc(db, 'reviews/review-1'), {
        verified: true,
      }),
    );
  });

  it('prevents one user from editing another user’s review', async () => {
    await seedReview();

    const db = testEnv.authenticatedContext('user-b').firestore();

    await assertFails(
      updateDoc(doc(db, 'reviews/review-1'), {
        comment: 'Changed by another user',
      }),
    );
  });

  it('allows an administrator to update a review', async () => {
    await seedReview();

    const db = testEnv
      .authenticatedContext('admin-user', { admin: true })
      .firestore();

    await assertSucceeds(
      updateDoc(doc(db, 'reviews/review-1'), {
        verified: true,
      }),
    );
  });

  it('blocks ordinary users from modifying car records', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();

    await assertFails(
      setDoc(doc(db, 'cars/car-1'), {
        name: 'Unauthorized car',
      }),
    );
  });

  it('allows an administrator to create car records', async () => {
    const db = testEnv
      .authenticatedContext('admin-user', { admin: true })
      .firestore();

    await assertSucceeds(
      setDoc(doc(db, 'cars/car-1'), {
        name: 'Administrator car',
      }),
    );
  });
});
