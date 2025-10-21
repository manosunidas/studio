import { init, App, cert, getApp as getAdminAppInstance, getApps } from 'firebase-admin/app';
import 'server-only';

// This is a singleton to ensure we only initialize the app once per server instance.
let adminApp: App;

/**
 * Returns the Firebase Admin App instance.
 *
 * It initializes the app if it hasn't been initialized yet. In a serverless environment,
 * this function may be called multiple times, so it checks for an existing instance.
 * It prioritizes Application Default Credentials (ADC) which is standard for Google Cloud environments.
 * For local development, it falls back to using service account environment variables.
 */
export function getAdminApp(): App {
  // If an app is already initialized, return it to prevent re-initialization.
  if (getApps().length > 0) {
    return getAdminAppInstance();
  }

  // Check if service account environment variables are set for local development.
  const hasServiceAccount =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

  try {
    if (hasServiceAccount) {
      // Initialize with explicit service account credentials (local dev).
      console.log('Initializing Firebase Admin with service account...');
      adminApp = init({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key needs to be parsed correctly from the environment variable.
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Initialize with Application Default Credentials (production environment).
      console.log('Initializing Firebase Admin with Application Default Credentials...');
      adminApp = init();
    }
  } catch (error: any) {
    // This can happen in development with hot-reloading.
    // If the app already exists, just get it.
    if (error.code === 'app/duplicate-app') {
      adminApp = getAdminAppInstance();
    } else {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      // Re-throwing the error is important to see it in server logs.
      throw error;
    }
  }

  return adminApp;
}
