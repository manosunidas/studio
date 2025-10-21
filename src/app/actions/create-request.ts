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
    
    const materialDoc = await materialRef.get();
    if (!materialDoc.exists) {
        throw new Error('El artículo ya no existe.');
    }

    const newRequestData = {
      ...requestData,
      materialId,
      fechaSolicitud: FieldValue.serverTimestamp(),
      status: 'Pendiente' as const,
      solicitanteId: 'public_request',
    };

    // 1. Create the request document
    const newRequestRef = await requestsCollectionRef.add(newRequestData);

    // 2. Update the material's request count
    await materialRef.update({
        solicitudes: FieldValue.increment(1)
    });

    return {
      success: true,
      requestId: newRequestRef.id,
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
