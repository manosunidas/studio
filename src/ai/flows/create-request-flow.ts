
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

// Initialize Firebase Admin SDK idempotently.
if (admin.apps.length === 0) {
  try {
    const serviceAccount = {
      "type": "service_account",
      "project_id": "studio-1933739816-d9066",
      "private_key_id": "81af6e82e8cbd0bec75dd3378f129203b74754a6",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxZEOqBSJYol5a\nEfiSgUs4Q2Uj0BZjONn0XljeFGohvyZRRFkCS+Md5XzKnib3i5ah881JdsK+gEzd\na1MLL+/7rWYbFc4w9+zEodmtRDPV+pX094XN+yViYxm4RwH4ZbEViP8Qp+hfOJCN\nnDS7oe61XdVOZyk5rBkg+kCYGuMw9r6+8ZE491TwxiO7+lInuK1TFkKbPpWW9RMi\nqliE9XNISrUmbODCfgdkjXO5wRT0aINeImo6wVk20aZhSt+/3ij+h6YpUaWKa3hk\nAb7+RoF6X0+VgwnTh/GbJo6QbDajXORJNyPXt1wgohHM6pgD6GogcPsz3A+IgsFi\n403kArNXAgMBAAECggEALbxdGbvjJBkQ3IYfoZ5GR4ZQ0E/5RbHFuBSPMwruZi8D\ncRZ/IHFyaCXf69mk0FQkDTNvrU46XaV0q+3c5liAtlH5rmgL1mJFoFjeZ6ba+oN2\nIEelLvteoyRL4FAmeOW3J4c/xAqWhd5unqQ0kF/qzMYZlfJRFbaCcBc1ikH8a4X0\nVss3IjlqNkwgtVMc3b5oSpar9IohKi5fJY/+HEEoRXWIDMCvXlFsed3VmpsSnmP5\nyiYexlYAUlMcA3XvC09gwTJrC8RLKL5RRYpf+3TxshBFnFxEKt8gxVeKg2/26Wz6\nR/wwK2gNRQmCoSIfikH3IexIdhKzTY9JAacM8hZDmQKBgQDn29SyNpeV3KlBXAqo\n6Va0N9ZfNKKZYRhtdTZHNjbnKHf42hvIy1ch6phkaeLBIfOCIzpBF1i3ZirDGSTe\nM9997VPp79G/NqPyL7Ur3HYbbX9waYkYeVXtv2PnjJ27d2681m+UTEY3UciX7N3A\nRQkBCJEmFvunJBZdTDXK1VsH0wKBgQDD3J6yqCDs4hxS2JkxkjT5puS0ILAcFSTC\nV/Dxp3o5qlFm80u2m4Yuhz1Z97JfQPjIO0l5ah67iS4Od7UBTP38R+xq6I9S/Kf3\nG93UuL7h2It1G52TnQUwl1H+nbbmx9ERwNQSok0HlMPv28QrkXVpL5QqGjUnltIS\nxrJhogWX7QKBgQCyoOe2QV7541427616wwK8p8Qt50RaPLbwJXyi0n7sCn6bp5X+\nVcKUa8PqoLVFLF4J5hAMc+syqLDLTITd+EL4Jq8erVgAJB2dCepfl2Ma8HpdZcFs\nrJZqK6jRjME829/h9qdSLo1uM0EC40dYyRcNx8bj/JL3C1N7n6pV0ZhnZwKBgHmM\nTZQz0JMRU2B6eL+Rq3yO/PloG8KhwHk3GBjvxWNJ9lB8hi0h4Si41vMhS7nfWUTx\nvgwyNjZN0J473cGb5TcN74L9JgzrLNWmnojnydXgi9M2OxkjZdgc4E6x05LuyClL\nUJDr1f/xa5NMADbFg2aulzV1pC0YZPAwDP2YDf6VAoGBAMoveVM8YBqOP7TJGy9B\nFjUHVuGGyPTgN6iB4gSYbVPhFzuqGBp0trEYszIIK7L3REcdS9UmKIOL9Tzp3iVP\np8vCK5Kh5orUIi4dXCoukNXjkUK/V3v80QV0NHbXZnEaLdxgbNCE7YMvBo5pdH/a\nKTnRzF894+iMV+hiX5AF/Uaj\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
      "client_email": "firebase-adminsdk-fbsvc@studio-1933739816-d9066.iam.gserviceaccount.com",
      "client_id": "105904052465753163718",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studio-1933739816-d9066.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    } as admin.ServiceAccount;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e: any) {
    console.error("Firebase Admin SDK initialization failed.", e);
  }
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
    // Get firestore instance inside the function to ensure initialization is complete.
    const firestore = admin.firestore();

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

    