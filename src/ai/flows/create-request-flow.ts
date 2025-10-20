
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
import { FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK idempotently at the module level.
if (admin.apps.length === 0) {
  try {
    // When deployed to App Hosting, the SDK is automatically initialized with the project's credentials.
    admin.initializeApp();
  } catch (e: any) {
    console.error("Critical: Firebase Admin SDK initialization failed.", e);
    // In a real-world scenario, you might want to throw this error
    // to prevent the application from running in a broken state.
  }
}

const firestore = admin.firestore();


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

    const materialRef = firestore.collection('materials').doc(validatedInput.materialId);
    const newRequestRef = materialRef.collection('requests').doc(); // Auto-generate ID

    await firestore.runTransaction(async (transaction) => {
        const materialDoc = await transaction.get(materialRef);
        if (!materialDoc.exists) {
            throw new Error('El artículo ya no existe.');
        }

        const newRequestData = {
            id: newRequestRef.id,
            materialId: validatedInput.materialId,
            nombreCompleto: validatedInput.nombreCompleto,
            direccion: validatedInput.direccion,
            telefono: validatedInput.telefono,
            fechaSolicitud: FieldValue.serverTimestamp(),
            status: 'Pendiente' as const,
        };

        transaction.create(newRequestRef, newRequestData);
        transaction.update(materialRef, { 
            solicitudes: FieldValue.increment(1)
        });
    });

    return {
      success: true,
      requestId: newRequestRef.id,
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
    // Return a generic message for other errors
    return {
      success: false,
      message: error.message || 'Ocurrió un error al procesar la solicitud.',
    };
  }
}
