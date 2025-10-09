
'use server';
/**
 * @fileOverview A language detection AI agent.
 *
 * - detectLanguage - A function that handles language detection.
 * - DetectLanguageInput - The input type for the detectLanguage function.
 * - DetectLanguageOutput - The return type for the detectLanguage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DetectLanguageInputSchema = z.object({
  code: z.string().describe('The source code to analyze for language detection.'),
});
export type DetectLanguageInput = z.infer<typeof DetectLanguageInputSchema>;

const DetectLanguageOutputSchema = z.object({
  language: z.string().describe('The detected programming language (e.g., "javascript", "python", "cpp"). Use the lowercase value, not the label.'),
});
export type DetectLanguageOutput = z.infer<typeof DetectLanguageOutputSchema>;

export async function detectLanguage(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
  return detectLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectLanguagePrompt',
  input: { schema: DetectLanguageInputSchema },
  output: { schema: DetectLanguageOutputSchema },
  prompt: `Analyze the following code and identify the programming language. Respond with only the lowercase language identifier (e.g., "javascript", "python", "java", "cpp", "typescript", "jsx", "tsx").

Code:
\'\'\'
{{{code}}}
\'\'\'
`,
});

const detectLanguageFlow = ai.defineFlow(
  {
    name: 'detectLanguageFlow',
    inputSchema: DetectLanguageInputSchema,
    outputSchema: DetectLanguageOutputSchema,
  },
  async (input) => {
    try {
      // Basic input validation
      if (!input.code.trim()) {
        return { language: 'plaintext' };
      }

      const { output } = await prompt(input);
      
      if (!output || !output.language) {
        console.warn('Language detection failed, falling back to plaintext');
        return { language: 'plaintext' };
      }

      return output;
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: 'plaintext' };
    }
  }
);
