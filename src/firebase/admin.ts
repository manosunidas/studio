import { init, App, cert } from 'firebase-admin/app';
import 'server-only';

// This is a singleton to ensure we only initialize the app once.
let adminApp: App;

/**
 * Returns the Firebase Admin App instance.
 *
 * It initializes the app if it hasn't been initialized yet, using a service
 * account if the appropriate environment variables are set, or using
 * Application Default Credentials otherwise.
 */
export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  // Check if the service account environment variables are set.
  // These are typically set in a .env.local file for local development.
  const hasServiceAccount =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

  try {
    if (hasServiceAccount) {
      // Initialize with explicit service account credentials.
      adminApp = init({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key needs to be parsed from the environment variable.
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Initialize with Application Default Credentials.
      // This is the recommended approach for Cloud Functions, Cloud Run, etc.
      adminApp = init();
    }
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      // This can happen in development with hot-reloading.
      // If the app already exists, just get it.
      adminApp = init(undefined, 'default');
    } else {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      throw error; // Re-throw the error to fail fast.
    }
  }

  return adminApp;
}
