'use server';
/**
 * @fileOverview A flow for creating a request for a material.
 *
 * - createRequest - A function that handles creating a request and updating the material's request count.
 * - CreateRequestInput - The input type for the createRequest function.
 * - CreateRequestOutput - The return type for the createRequest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getFirestore, doc, collection, runTransaction, serverTimestamp} from 'firebase/firestore';
import {initializeApp, getApps, getApp} from 'firebase/app';
import {firebaseConfig} from '@/firebase/config';

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
  return createRequestFlow(input);
}

const createRequestFlow = ai.defineFlow(
  {
    name: 'createRequestFlow',
    inputSchema: CreateRequestInputSchema,
    outputSchema: CreateRequestOutputSchema,
  },
  async (input: CreateRequestInput) => {
    try {
      const materialRef = doc(firestore, 'materials', input.materialId);
      const requestsCollectionRef = collection(firestore, 'materials', input.materialId, 'requests');

      const newRequestData = {
        materialId: input.materialId,
        nombreCompleto: input.nombreCompleto,
        direccion: input.direccion,
        telefono: input.telefono,
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

      return {
        success: true,
        requestId: newRequestId,
        message: '¡Solicitud enviada con éxito!',
      };
    } catch (error: any) {
      console.error('Error in createRequestFlow:', error);
      return {
        success: false,
        message: error.message || 'Ocurrió un error al procesar la solicitud.',
      };
    }
  }
);
