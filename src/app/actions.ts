'use server';

import { getAdminApp } from '@/firebase/admin';
import { getFirestore, increment } from 'firebase-admin/firestore';

export async function incrementSolicitudes(materialId: string) {
  if (!materialId) {
    console.error("No materialId provided to incrementSolicitudes server action.");
    return { success: false, error: "No materialId provided." };
  }
  
  try {
    // Ensure the admin app is initialized before proceeding
    const adminApp = await getAdminApp();
    const db = getFirestore(adminApp);
    
    const materialRef = db.collection('materials').doc(materialId);
    
    // Perform the atomic increment operation
    await materialRef.update({
      solicitudes: increment(1)
    });

    console.log(`Successfully incremented solicitues for material: ${materialId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error incrementing solicitues for material ${materialId}:`, error);
    // Return a specific error message for debugging on the client-side
    return { success: false, error: 'Failed to update solicitues count.' };
  }
}
