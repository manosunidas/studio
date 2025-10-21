'use server';

import { initializeAdminApp } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const CreateRequestInputSchema = z.object({
  materialId: z.string(),
  nombreCompleto: z.string().min(1, 'El nombre es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  telefono: z.string().min(1, 'El teléfono es obligatorio'),
});

export type CreateRequestInput = z.infer<typeof CreateRequestInputSchema>;

export async function createRequest(input: CreateRequestInput) {
  const validation = CreateRequestInputSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Datos de entrada no válidos.' };
  }

  try {
    const { firestore } = await initializeAdminApp();
    const { materialId, ...requestData } = validation.data;

    const materialRef = firestore.collection('materials').doc(materialId);
    const requestsCollectionRef = materialRef.collection('requests');

    const newRequest = {
      ...requestData,
      materialId,
      fechaSolicitud: FieldValue.serverTimestamp(),
      status: 'Pendiente' as const,
      solicitanteId: 'public_request',
    };

    const transactionResult = await firestore.runTransaction(async (transaction) => {
      const materialDoc = await transaction.get(materialRef);
      if (!materialDoc.exists) {
        throw new Error('El artículo ya no existe.');
      }
      
      const newRequestRef = requestsCollectionRef.doc();
      transaction.set(newRequestRef, newRequest);
      
      transaction.update(materialRef, {
        solicitudes: FieldValue.increment(1)
      });
      
      return newRequestRef.id;
    });

    return {
      success: true,
      requestId: transactionResult,
      message: 'Solicitud creada con éxito.',
    };
  } catch (error: any) {
    console.error('Error al crear la solicitud via Server Action:', error);
    return {
      success: false,
      message: error.message || 'Ocurrió un error inesperado en el servidor.',
    };
  }
}
