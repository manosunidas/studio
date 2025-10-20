'use server';
/**
 * @fileOverview A server action for creating a request for a material.
 *
 * - createRequest - A function that handles creating a request and updating the material's request count.
 * - CreateRequestInput - The input type for the createRequest function.
 * - CreateRequestOutput - The return type for the createRequest function.
 */

import { z } from 'zod';
import { getFirestore, doc, collection, runTransaction, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized on the server
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

const CreateRequestInputSchema = z.object({
  materialId: z.string().describe('The ID of the material being requested.'),
  nombreCompleto: z.string().describe('The full name of the requester.'),
  direccion: z.string().describe('The address of the requester.'),
  telefono: z.string().describe('The phone number of the requester.'),
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
    // Validate input against the Zod schema
    const validatedInput = CreateRequestInputSchema.parse(input);

    const materialRef = doc(firestore, 'materials', validatedInput.materialId);
    const requestsCollectionRef = collection(firestore, 'materials', validatedInput.materialId, 'requests');

    const newRequestData = {
      materialId: validatedInput.materialId,
      nombreCompleto: validatedInput.nombreCompleto,
      direccion: validatedInput.direccion,
      telefono: validatedInput.telefono,
      fechaSolicitud: serverTimestamp(),
      status: 'Pendiente' as const,
    };

    let newRequestId: string | undefined;

    await runTransaction(firestore, async (transaction) => {
      const materialDoc = await transaction.get(materialRef);
      if (!materialDoc.exists()) {
        throw new Error('El artículo ya no existe.');
      }
      const currentSolicitudes = materialDoc.data().solicitudes || 0;

      // Add new request
      const newRequestRef = doc(requestsCollectionRef);
      newRequestId = newRequestRef.id;
      transaction.set(newRequestRef, newRequestData);

      // Update request count on material
      transaction.update(materialRef, { solicitudes: currentSolicitudes + 1 });
    });

    if (!newRequestId) {
        throw new Error('No se pudo crear el ID de la solicitud.');
    }

    return {
      success: true,
      requestId: newRequestId,
      message: '¡Solicitud enviada con éxito!',
    };
  } catch (error: any) {
    console.error('Error in createRequest action:', error);
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
        return {
            success: false,
            message: 'Datos de entrada inválidos: ' + error.errors.map(e => e.message).join(', ')
        }
    }
    return {
      success: false,
      message: error.message || 'Ocurrió un error al procesar la solicitud.',
    };
  }
}
