// cargue forzado
'use server';

/**
 * @fileOverview A Genkit flow to send a real email notification for a new item request using Resend.
 *
 * This flow is triggered when a user submits a request for a donation item.
 * It constructs and sends a formatted email to all registered administrators.
 * It handles the presence and absence of the `RESEND_API_KEY` to avoid crashes in development
 * or misconfigured environments.
 *
 * - `sendRequestEmail`: The main function to trigger the email sending flow.
 * - `SendRequestEmailInput`: The Zod schema for the input data.
 * - `SendRequestEmailOutput`: The Zod schema for the output data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';
import { ADMIN_EMAILS } from '@/lib/admins';

// Input schema for the flow, defining the data required to send a request email.
const SendRequestEmailInputSchema = z.object({
  requesterName: z.string().describe('The full name of the person requesting the item.'),
  requesterAddress: z.string().describe('The address or neighborhood of the requester.'),
  requesterPhone: z.string().describe('The contact phone number of the requester.'),
  eligibilityReason: z.string().describe('The reason why the requester believes they are eligible for the item.'),
  itemName: z.string().describe('The name of the requested item.'),
  itemId: z.string().describe('The ID of the requested item.'),
});

// Output schema for the flow, defining the structure of the response.
const SendRequestEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was sent successfully.'),
  message: z.string().describe('A message indicating the result.'),
});

// Type definitions inferred from Zod schemas for strong typing.
export type SendRequestEmailInput = z.infer<typeof SendRequestEmailInputSchema>;
export type SendRequestEmailOutput = z.infer<typeof SendRequestEmailOutputSchema>;


/**
 * The main exported function that clients (React components) will call to initiate the email flow.
 * @param input The request details from the user form.
 * @returns A promise that resolves with the success status and a message.
 */
export async function sendRequestEmail(input: SendRequestEmailInput): Promise<SendRequestEmailOutput> {
  return sendRequestEmailFlow(input);
}

/**
 * The Genkit flow definition. This function orchestrates the logic of sending the email.
 */
const sendRequestEmailFlow = ai.defineFlow(
  {
    name: 'sendRequestEmailFlow',
    inputSchema: SendRequestEmailInputSchema,
    outputSchema: SendRequestEmailOutputSchema,
  },
  async (input) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    // Gracefully handle cases where the Resend API key is not configured in environment variables.
    if (!resendApiKey) {
      console.error('Resend API key is not configured. Please set RESEND_API_KEY environment variable.');
      // Return a failure but don't throw, so the client can handle it gracefully.
      return {
        success: false,
        message: 'El servidor no está configurado para enviar correos. Contacta al administrador.',
      };
    }

    const resend = new Resend(resendApiKey);

    // Construct the email body as plain text for maximum compatibility.
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
      // Attempt to send the email using the Resend SDK.
      // The email is sent to all administrators defined in the ADMIN_EMAILS array.
      const { data, error } = await resend.emails.send({
        from: 'Manos Unidas Digital <onboarding@resend.dev>', // Required by Resend's free tier
        to: ADMIN_EMAILS, // Send to all admin emails
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

      console.log(`Email sent successfully to: ${ADMIN_EMAILS.join(', ')}`, data);
      return {
        success: true,
        message: `Email sent to ${ADMIN_EMAILS.join(', ')}`,
      };
    } catch (error) {
      console.error("Catastrophic error sending email via Resend:", error);
      // Return a structured error to the client in case of a critical failure.
      return {
        success: false,
        message: 'Hubo un error catastrófico al intentar enviar el correo de notificación.',
      };
    }
  }
);
