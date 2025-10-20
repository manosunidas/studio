
'use server';
/**
 * @fileOverview A server action for creating a request for a material.
 *
 * THIS FLOW IS DEPRECATED AND SHOULD NOT BE USED.
 * The logic has been moved to the client-side with appropriate security rules.
 */

import { z } from 'zod';

const CreateRequestInputSchema = z.object({
  materialId: z.string(),
  nombreCompleto: z.string(),
  direccion: z.string(),
  telefono: z.string(),
});
export type CreateRequestInput = z.infer<typeof CreateRequestInputSchema>;

const CreateRequestOutputSchema = z.object({
  success: z.boolean(),
  requestId: z.string().optional(),
  message: z.string(),
});
export type CreateRequestOutput = z.infer<typeof CreateRequestOutputSchema>;


export async function createRequest(input: CreateRequestInput): Promise<CreateRequestOutput> {
    console.error("createRequest server action is deprecated and should not be called.");
    return {
      success: false,
      message: 'This server action is deprecated and should not be used.',
    };
}
