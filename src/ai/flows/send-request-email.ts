
'use server';

/**
 * @fileOverview A Genkit flow to send a real email notification for a new item request using Resend.
 *
 * This flow sends an email to the administrator when a user requests an item.
 *
 * - `sendRequestEmail`: The main function to trigger the email sending flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';

// Input schema for the flow
const SendRequestEmailInputSchema = z.object({
  requesterName: z.string().describe('The full name of the person requesting the item.'),
  requesterAddress: z.string().describe('The address or neighborhood of the requester.'),
  requesterPhone: z.string().describe('The contact phone number of the requester.'),
  eligibilityReason: z.string().describe('The reason why the requester believes they are eligible for the item.'),
  itemName: z.string().describe('The name of the requested item.'),
  itemId: z.string().describe('The ID of the requested item.'),
});

// Output schema for the flow
const SendRequestEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  message: z.string().describe('A message indicating the result.'),
});

// Type definitions inferred from schemas
export type SendRequestEmailInput = z.infer<typeof SendRequestEmailInputSchema>;
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
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('Resend API key is not configured. Please set RESEND_API_KEY environment variable.');
      // Return a failure but don't throw, so the client can handle it gracefully.
      return {
        success: false,
        message: 'El servidor no está configurado para enviar correos. Contacta al administrador.',
      };
    }

    const resend = new Resend(resendApiKey);
    const adminEmail = 'jhelenandreat@gmail.com';

    // Construct the email body as plain text
    const emailBodyText = `
Nueva Solicitud de Artículo en Manos Unidas Digital
=================================================

Has recibido una nueva solicitud para un artículo.

Detalles del Artículo:
- Nombre: ${input.itemName}
- ID: ${input.itemId}

Datos del Solicitante:
- Nombre: ${input.requesterName}
- Dirección: ${input.requesterAddress}
- Teléfono: ${input.requesterPhone}

Motivo de la Solicitud:
${input.eligibilityReason}

Próximos Pasos:
1. Contacta al solicitante para coordinar la entrega.
2. Una vez entregado, ingresa a tu panel de administrador y marca el artículo como "Asignado".
    `.trim();

    try {
      const { data, error } = await resend.emails.send({
        from: 'Manos Unidas Digital <onboarding@resend.dev>', // Required by Resend for free tier
        to: adminEmail,
        subject: `Nueva Solicitud de Artículo: ${input.itemName}`,
        text: emailBodyText, // Use the plain text version
      });

      if (error) {
        console.error("Error sending email via Resend:", error);
        return {
            success: false,
            message: 'Hubo un error al intentar enviar el correo de notificación.',
        };
      }

      return {
        success: true,
        message: `Email sent to ${adminEmail}`,
      };
    } catch (error) {
      console.error("Catastrophic error sending email via Resend:", error);
      // Return a structured error to the client
      return {
        success: false,
        message: 'Hubo un error catastrófico al intentar enviar el correo de notificación.',
      };
    }
  }
);
