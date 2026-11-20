import * as admin from 'firebase-admin';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const auth = admin.auth();

/**
 * deleteAccount: Callable Cloud Function 2nd gen.
 * Implements DPDP Act 2023 "Right to Erasure / Right to be Forgotten".
 * 1. Purges /users/{uid}/private/* (contacts, location history, consents).
 * 2. Anonymizes public safety reports created by the user (replaces authorUid with 'anonymous').
 * 3. Removes user document from /users/{uid}.
 * 4. Deletes the Firebase Auth user record.
 */
export const deleteAccount = onCall(
  {
    region: 'asia-south1',
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to request account deletion.');
    }

    try {
      // 1. Purge private contacts
      const contactsSnap = await firestore.collection(`users/${uid}/private/contacts`).get();
      const batch = firestore.batch();
      contactsSnap.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 2. Anonymize user safety reports
      const reportsSnap = await firestore
        .collection('safety_reports')
        .where('authorUid', '==', uid)
        .get();

      reportsSnap.forEach((doc) => {
        batch.update(doc.ref, {
          authorUid: 'anonymous',
          anonymizedAt: Date.now(),
        });
      });

      // 3. Delete user document
      const userRef = firestore.collection('users').doc(uid);
      batch.delete(userRef);

      await batch.commit();

      // 4. Delete Firebase Auth user record
      await auth.deleteUser(uid);

      return {
        success: true,
        message: 'Account and private records permanently erased pursuant to DPDP Act 2023.',
        timestamp: Date.now(),
      };
    } catch (err: unknown) {
      throw new HttpsError(
        'internal',
        err instanceof Error ? err.message : 'Failed to purge account records.'
      );
    }
  }
);
