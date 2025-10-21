'use server'

import admin from 'firebase-admin';

/**
 * Initializes and returns the Firebase Admin App instance.
 * Ensures that initialization only happens once.
 */
export async function getAdminApp() {
    // If the app is already initialized, return it.
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        // Initialize the app without explicit credentials.
        // It will automatically use the service account from the environment.
        return admin.initializeApp();
    } catch (e: any) {
        console.error("Failed to initialize Firebase Admin SDK automatically.", e);
        throw new Error("Could not initialize Firebase Admin SDK. Check server environment configuration.");
    }
}
