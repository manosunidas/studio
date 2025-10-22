// cargue forzado
'use server'

import admin from 'firebase-admin';

/**
 * Initializes and returns the Firebase Admin App instance.
 * This is the recommended pattern for server-side environments to prevent re-initialization.
 */
export async function getAdminApp() {
    // If the default app is already initialized, return it.
    if (admin.apps.length > 0 && admin.apps[0]) {
        return admin.apps[0];
    }

    try {
        // Initialize the app without explicit credentials.
        // In Cloud Workstations and other Google Cloud environments,
        // the SDK automatically uses the service account from the environment.
        return admin.initializeApp();
    } catch (e: any) {
        console.error("Failed to initialize Firebase Admin SDK automatically.", e);
        throw new Error("Could not initialize Firebase Admin SDK. Check server environment configuration.");
    }
}
