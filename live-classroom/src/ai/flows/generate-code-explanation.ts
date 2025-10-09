'use server';

/**
 * @fileOverview Generates a plain English explanation of a given code snippet.
 *
 * - generateCodeExplanation - A function that takes code as input and returns an explanation.
 * - GenerateCodeExplanationInput - The input type for the generateCodeExplanation function.
 * - GenerateCodeExplanationOutput - The return type for the generateCodeExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to be explained.'),
});
export type GenerateCodeExplanationInput = z.infer<
  typeof GenerateCodeExplanationInputSchema
>;

const GenerateCodeExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A plain English explanation of the code snippet.'),
});
export type GenerateCodeExplanationOutput = z.infer<
  typeof GenerateCodeExplanationOutputSchema
>;

export async function generateCodeExplanation(
  input: GenerateCodeExplanationInput
): Promise<GenerateCodeExplanationOutput> {
  return generateCodeExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeExplanationPrompt',
  input: {schema: GenerateCodeExplanationInputSchema},
  output: {schema: GenerateCodeExplanationOutputSchema},
  prompt: `You are an expert software developer, skilled at explaining code to students.

  Please provide a clear and concise explanation of the following code snippet, in plain English, suitable for someone learning to code:

  \`\`\`
  {{{code}}}
  \`\`\``,
});

const generateCodeExplanationFlow = ai.defineFlow(
  {
    name: 'generateCodeExplanationFlow',
    inputSchema: GenerateCodeExplanationInputSchema,
    outputSchema: GenerateCodeExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);