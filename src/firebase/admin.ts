import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: This file should not be used in the client-side of your application.

let app: App;

// This function initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent re-initialization.
export async function initializeAdminApp() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApps()[0];
  }

  return {
    app: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
