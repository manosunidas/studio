'use server';

import { getAdminApp } from '@/firebase/admin';
import { getFirestore, increment } from 'firebase-admin/firestore';

export async function incrementSolicitudes(materialId: string) {
  if (!materialId) {
    console.error("No materialId provided to incrementSolicitudes server action.");
    return { success: false, error: "No materialId provided." };
  }
  
  try {
    // Initialize admin app
    await getAdminApp();
    const db = getFirestore();
    const materialRef = db.collection('materials').doc(materialId);
    await materialRef.update({
      solicitudes: increment(1)
    });
    console.log(`Successfully incremented solicitues for material: ${materialId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error incrementing solicitues for material ${materialId}:`, error);
    // In a real app, you might want to return a more specific error
    return { success: false, error: 'Failed to update solicitues count.' };
  }
}
