'use server';

/**
 * @fileOverview AI-powered donation suggestions flow.
 *
 * This file defines a Genkit flow that suggests donation items based on user profiles,
 * location, and community needs.
 *
 * - `suggestDonationItems`: A function that takes user profile, location, and community needs
 *   as input and returns a list of suggested donation items.
 * - `SuggestDonationItemsInput`: The input type for the `suggestDonationItems` function.
 * - `SuggestDonationItemsOutput`: The return type for the `suggestDonationItems` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestDonationItemsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile including their donation history and interests.'),
  location: z.string().describe('The user location.'),
  communityNeeds: z.string().describe('The identified needs of the local community.'),
  availableItems: z
    .string()
    .describe('List of available items for donation, with descriptions.'),
});

export type SuggestDonationItemsInput = z.infer<typeof SuggestDonationItemsInputSchema>;

// Define the output schema
const SuggestDonationItemsOutputSchema = z.object({
  suggestedItems: z
    .string()
    .describe('A list of suggested donation items based on user profile, location, and community needs.'),
});

export type SuggestDonationItemsOutput = z.infer<typeof SuggestDonationItemsOutputSchema>;

// Define the main function
export async function suggestDonationItems(input: SuggestDonationItemsInput): Promise<SuggestDonationItemsOutput> {
  return suggestDonationItemsFlow(input);
}

// Define the prompt
const suggestDonationItemsPrompt = ai.definePrompt({
  name: 'suggestDonationItemsPrompt',
  input: {schema: SuggestDonationItemsInputSchema},
  output: {schema: SuggestDonationItemsOutputSchema},
  prompt: `Based on the user profile: {{{userProfile}}}, their location: {{{location}}},
  the identified community needs: {{{communityNeeds}}}, and the following available items: {{{availableItems}}},
  suggest the most relevant donation items.  Explain why these items would be helpful to the user and community.
  Respond in Spanish.`, // Ensure the response is in Spanish
});

// Define the flow
const suggestDonationItemsFlow = ai.defineFlow(
  {
    name: 'suggestDonationItemsFlow',
    inputSchema: SuggestDonationItemsInputSchema,
    outputSchema: SuggestDonationItemsOutputSchema,
  },
  async input => {
    const {output} = await suggestDonationItemsPrompt(input);
    return output!;
  }
);
