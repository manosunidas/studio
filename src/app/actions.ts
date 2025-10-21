'use server';

import { getAdminApp } from '@/firebase/admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export async function incrementSolicitudes(materialId: string) {
  if (!materialId) {
    console.error("No materialId provided to incrementSolicitudes server action.");
    return { success: false, error: "No materialId provided." };
  }
  
  try {
    const adminApp = await getAdminApp();
    const db = getFirestore(adminApp);
    
    const materialRef = db.collection('materials').doc(materialId);
    
    // Instead of incrementing, we synchronize the count. This is more robust.
    const requestsCollectionRef = materialRef.collection('requests');
    const requestsSnapshot = await requestsCollectionRef.get();
    const currentRequestCount = requestsSnapshot.size;
    
    // Update the material document with the correct count
    await materialRef.update({
      solicitudes: currentRequestCount
    });

    console.log(`Successfully synchronized solicitues count for material: ${materialId} to ${currentRequestCount}`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error syncing solicitues for material ${materialId}:`, error);
    return { success: false, error: error.message || 'Failed to update solicitues count.' };
  }
}
