'use server'

import admin from 'firebase-admin';

// Check if the service account key is available in environment variables
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

/**
 * Initializes and returns the Firebase Admin App instance.
 * Ensures that initialization only happens once.
 */
export const getAdminApp = async () => {
    // If the app is already initialized, return it.
    if (admin.apps.length > 0) {
        return admin.app();
    }

    // Check if the service account key is available.
    if (!serviceAccount) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Cannot initialize Firebase Admin SDK.");
    }

    try {
        // Parse the service account key and initialize the app.
        const credential = admin.credential.cert(JSON.parse(serviceAccount));
        return admin.initializeApp({ credential });
    } catch (e: any) {
        // Provide a more specific error if parsing fails.
        console.error("Failed to parse Firebase service account key. Ensure it's a valid JSON string.", e);
        throw new Error("Could not initialize Firebase Admin SDK due to invalid credentials.");
    }
}
