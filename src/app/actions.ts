'use server';

import { getAdminApp } from '@/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function incrementSolicitudes(materialId: string) {
  if (!materialId) {
    const errorMsg = "No materialId provided to incrementSolicitudes server action.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  try {
    const adminApp = await getAdminApp();
    const db = getFirestore(adminApp);
    
    const materialRef = db.collection('materials').doc(materialId);
    
    // This is a synchronization action, not just an increment.
    // It makes the count resilient to any inconsistencies.
    const requestsCollectionRef = materialRef.collection('requests');
    const requestsSnapshot = await requestsCollectionRef.get();
    const currentRequestCount = requestsSnapshot.size;
    
    // Update the material document with the correct count
    await materialRef.update({
      solicitudes: currentRequestCount
    });

    console.log(`Successfully synchronized solicitues count for material: ${materialId} to ${currentRequestCount}`);
    return { success: true, count: currentRequestCount };
  } catch (error: any) {
    console.error(`Error syncing solicitues for material ${materialId}:`, error);
    // Return the specific error message to the client for better debugging
    return { success: false, error: error.message || 'Failed to update solicitues count.' };
  }
}
