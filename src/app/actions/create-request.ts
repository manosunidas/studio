'use server';

import { z } from 'zod';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin';

// Define the schema for input validation using Zod
const CreateRequestSchema = z.object({
  materialId: z.string(),
  nombreCompleto: z.string().min(3, 'El nombre es obligatorio'),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  telefono: z.string().min(7, 'El teléfono es obligatorio'),
});

export async function createRequest(prevState: any, formData: FormData) {
  // Initialize the Firebase Admin SDK
  const { firestore } = await initializeAdminApp();

  const validatedFields = CreateRequestSchema.safeParse({
    materialId: formData.get('materialId'),
    nombreCompleto: formData.get('nombreCompleto'),
    direccion: formData.get('direccion'),
    telefono: formData.get('telefono'),
  });

  // If form validation fails, return errors
  if (!validatedFields.success) {
    return {
      message: 'Error de validación.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { materialId, ...requestData } = validatedFields.data;

  try {
    const materialRef = firestore.collection('materials').doc(materialId);
    const requestsRef = materialRef.collection('requests');

    // Use a transaction to ensure atomicity
    await firestore.runTransaction(async (transaction) => {
      // 1. Create the new request document
      const newRequestRef = requestsRef.doc();
      transaction.set(newRequestRef, {
        ...requestData,
        materialId: materialId,
        fechaSolicitud: Timestamp.now(),
        status: 'Pendiente',
        solicitanteId: 'public_request', // Identifier for public, non-auth requests
      });

      // 2. Increment the 'solicitudes' counter on the material
      transaction.update(materialRef, {
        solicitudes: getFirestore().FieldValue.increment(1),
      });
    });

    return {
      success: true,
      message: '¡Solicitud enviada con éxito!',
    };
  } catch (error) {
    console.error('Error al crear la solicitud:', error);
    return {
      message: 'Error del servidor: No se pudo registrar la solicitud. Por favor, inténtelo de nuevo más tarde.',
    };
  }
}
