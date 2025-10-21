'use server';

/**
 * @fileOverview A Genkit flow to "send" an email notification for a new item request.
 *
 * This flow simulates sending an email to the administrator when a user requests an item.
 * In a real-world scenario, this would integrate with an email service like SendGrid or Nodemailer.
 *
 * - `sendRequestEmail`: The main function to trigger the email sending flow.
 * - `SendRequestEmailInput`: The input type for the flow.
 * - `SendRequestEmailOutput`: The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the flow
export const SendRequestEmailInputSchema = z.object({
  requesterName: z.string().describe('The full name of the person requesting the item.'),
  requesterAddress: z.string().describe('The address or neighborhood of the requester.'),
  requesterPhone: z.string().describe('The contact phone number of the requester.'),
  itemName: z.string().describe('The name of the requested item.'),
  itemId: z.string().describe('The ID of the requested item.'),
});

export type SendRequestEmailInput = z.infer<typeof SendRequestEmailInputSchema>;

// Output schema for the flow
export const SendRequestEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was "sent" successfully.'),
  message: z.string().describe('A message indicating the result.'),
});

export type SendRequestEmailOutput = z.infer<typeof SendRequestEmailOutputSchema>;

// The main exported function that clients will call.
export async function sendRequestEmail(input: SendRequestEmailInput): Promise<SendRequestEmailOutput> {
  return sendRequestEmailFlow(input);
}

// The Genkit flow definition
const sendRequestEmailFlow = ai.defineFlow(
  {
    name: 'sendRequestEmailFlow',
    inputSchema: SendRequestEmailInputSchema,
    outputSchema: SendRequestEmailOutputSchema,
  },
  async (input) => {
    const adminEmail = 'jhelenandreat@gmail.com';

    // Construct the email body
    const emailBody = `
      =================================
      Nueva Solicitud de Artículo
      =================================
      Has recibido una nueva solicitud para un artículo publicado en Manos Unidas Digital.

      Detalles del Artículo:
      - Nombre: ${input.itemName}
      - ID: ${input.itemId}

      Datos del Solicitante:
      - Nombre: ${input.requesterName}
      - Dirección: ${input.requesterAddress}
      - Teléfono: ${input.requesterPhone}

      Próximos Pasos:
      1. Contacta al solicitante para coordinar la entrega.
      2. Una vez entregado, ingresa a tu panel de administrador y marca el artículo como "Asignado".
      =================================
    `;

    // ** SIMULATION **
    // In a real application, you would use a service like Nodemailer, SendGrid, or Resend
    // to send an actual email. For this simulation, we will just log the details to the console
    // as if an email were sent.
    console.log(`\n--- SIMULANDO ENVÍO DE CORREO ---`);
    console.log(`Para: ${adminEmail}`);
    console.log(`Asunto: Nueva Solicitud de Artículo: ${input.itemName}`);
    console.log(`Cuerpo: ${emailBody}`);
    console.log(`--- FIN DE SIMULACIÓN ---\n`);

    // You could also use another Genkit model to generate a more "human" email body
    // but for this purpose, a template is sufficient.

    return {
      success: true,
      message: `Simulated email sent to ${adminEmail}`,
    };
  }
);
