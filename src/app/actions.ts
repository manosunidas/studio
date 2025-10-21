'use server';

import { getAdminApp } from '@/firebase/admin';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function createRequestAction(
  itemId: string,
  formData: { nombreCompleto: string; direccion: string; telefono: string },
  solicitanteId: string
) {
  try {
    const adminApp = getAdminApp();
    const firestore = getFirestore(adminApp);

    const itemRef = firestore.collection('materials').doc(itemId);
    const requestsCollectionRef = itemRef.collection('requests');

    // 1. Add the new request document
    const newRequestData = {
      ...formData,
      materialId: itemId,
      fechaSolicitud: FieldValue.serverTimestamp(),
      status: 'Pendiente' as const,
      solicitanteId: solicitanteId,
    };
    await requestsCollectionRef.add(newRequestData);

    // 2. Increment the request count on the material
    await itemRef.update({
      solicitudes: FieldValue.increment(1),
    });
    
    // Revalidate the item page to show updated data
    revalidatePath(`/items/${itemId}`);

    return { success: true, message: '¡Solicitud enviada con éxito!' };
  } catch (error) {
    console.error('Error in createRequestAction:', error);
    // Return a serializable error object
    return { success: false, message: 'Ocurrió un error en el servidor. Por favor, inténtalo de nuevo.' };
  }
}
