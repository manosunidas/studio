import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: DO NOT ADD THE SERVICE ACCOUNT TO SOURCE CONTROL
// You should load it from a secure location, like environment variables
// or a secret manager.

let app: App;

export async function initializeAdminApp() {
  // This function can be called multiple times, but it will only initialize
  // the app once.
  if (!getApps().length) {
    // This is the recommended way to initialize the Admin SDK when deployed
    // in a Google Cloud environment (like Cloud Run, Cloud Functions, App Engine, etc.)
    // It will automatically use the runtime's service account credentials.
    app = initializeApp();
  } else {
    app = getApps()[0];
  }
  
  return {
    firestore: getFirestore(app),
  };
}
