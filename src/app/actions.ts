'use server';

import { getAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function incrementSolicitudes(materialId: string) {
  if (!materialId) {
    console.error("No materialId provided to incrementSolicitudes server action.");
    return { success: false, error: "No materialId provided." };
  }
  
  try {
    const adminApp = await getAdminApp();
    const db = getFirestore(adminApp);
    
    const materialRef = db.collection('materials').doc(materialId);
    const requestsCollectionRef = materialRef.collection('requests');

    // Count the actual number of requests in the subcollection
    const requestsSnapshot = await requestsCollectionRef.get();
    const currentRequestCount = requestsSnapshot.size;
    
    // Update the material document with the correct count
    await materialRef.update({
      solicitudes: currentRequestCount
    });

    console.log(`Successfully synchronized solicitues count for material: ${materialId} to ${currentRequestCount}`);
    return { success: true };
  } catch (error) {
    console.error(`Error syncing solicitues for material ${materialId}:`, error);
    return { success: false, error: 'Failed to update solicitues count.' };
  }
}
