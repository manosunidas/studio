'use server';
import 'dotenv/config';

import { z } from 'zod';
import { initializeAdminApp } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const CreateRequestInputSchema = z.object({
  materialId: z.string(),
  nombreCompleto: z.string(),
  direccion: z.string(),
  telefono: z.string(),
});
export type CreateRequestInput = z.infer<typeof CreateRequestInputSchema>;

const CreateRequestOutputSchema = z.object({
  success: z.boolean(),
  requestId: z.string().optional(),
  message: z.string(),
});
export type CreateRequestOutput = z.infer<typeof CreateRequestOutputSchema>;

export async function createRequest(input: CreateRequestInput): Promise<CreateRequestOutput> {
  try {
    const { firestore } = await initializeAdminApp();
    const { materialId, ...requestData } = input;
    
    const itemRef = firestore.collection('materials').doc(materialId);
    const requestsCollectionRef = itemRef.collection('requests');

    // 1. Create the new request document
    const newRequest = {
      ...requestData,
      materialId: materialId,
      fechaSolicitud: FieldValue.serverTimestamp(),
      status: 'Pendiente' as const,
      solicitanteId: 'public_request' // Since we are not using client auth
    };
    
    const requestDocRef = await requestsCollectionRef.add(newRequest);
    
    // 2. Increment the 'solicitudes' counter on the material
    await itemRef.update({
      solicitudes: FieldValue.increment(1)
    });

    return {
      success: true,
      requestId: requestDocRef.id,
      message: 'Solicitud creada con éxito.',
    };

  } catch (error: any) {
    console.error("Error creating request via server action:", error);
    return {
      success: false,
      message: error.message || 'Ocurrió un error inesperado en el servidor.',
    };
  }
}
