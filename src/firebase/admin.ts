'use server'

import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

export const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    if (!serviceAccount) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
    }

    try {
        const credential = admin.credential.cert(JSON.parse(serviceAccount));
        return admin.initializeApp({ credential });
    } catch(e) {
        console.error("Failed to parse service account key. Make sure it's a valid JSON string.", e);
        throw new Error("Could not initialize Firebase Admin SDK. Check service account credentials.");
    }
}
