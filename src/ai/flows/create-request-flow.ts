'use server';
/**
 * @fileOverview A server action for creating a request for a material.
 *
 * - createRequest - A function that handles creating a request and updating the material's request count.
 * - CreateRequestInput - The input type for the createRequest function.
 * - CreateRequestOutput - The return type for the createRequest function.
 */

import { z } from 'zod';
import * as admin from 'firebase-admin';

// Helper function to initialize Firebase Admin SDK
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Firebase App Hosting provides GOOGLE_CLOUD_PROJECT, which is used by default.
  // The service account is also automatically discovered.
  admin.initializeApp();

  return admin.app();
}

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
    const adminApp = initializeAdminApp();
    const firestore = admin.firestore();

    // Validate input against the Zod schema
    const validatedInput = CreateRequestInputSchema.parse(input);

    const materialRef = firestore.collection('materials').doc(validatedInput.materialId);
    const requestsCollectionRef = materialRef.collection('requests');

    let newRequestId: string | undefined;

    await firestore.runTransaction(async (transaction) => {
      const materialDoc = await transaction.get(materialRef);
      if (!materialDoc.exists) {
        throw new Error('El artículo ya no existe.');
      }
      
      const newRequestRef = requestsCollectionRef.doc();
      newRequestId = newRequestRef.id;
      
      const newRequestData = {
        materialId: validatedInput.materialId,
        nombreCompleto: validatedInput.nombreCompleto,
        direccion: validatedInput.direccion,
        telefono: validatedInput.telefono,
        fechaSolicitud: admin.firestore.FieldValue.serverTimestamp(),
        status: 'Pendiente' as const,
        id: newRequestId, // Store the ID within the document
      };

      transaction.set(newRequestRef, newRequestData);
      
      // Use FieldValue to atomically increment the counter
      transaction.update(materialRef, { 
          solicitudes: admin.firestore.FieldValue.increment(1) 
      });
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
    console.error('Error in createRequest server action:', error);
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
