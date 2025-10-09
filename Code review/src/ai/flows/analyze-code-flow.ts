
'use server';
/**
 * @fileOverview A code analysis AI agent.
 *
 * - analyzeCode - A function that handles the code analysis process.
 * - AnalyzeCodeInput - The input type for the analyzeCode function.
 * - AnalyzeCodeOutput - The return type for the analyzeCodeOutput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The source code to analyze.'),
  editorLanguage: z
    .string()
    .describe('The language mode the editor is currently set to.'),
  detectedLanguage: z
    .string()
    .describe(
      'The language the code is actually written in, as detected by the AI.'
    ),
  loc: z.number().describe('The calculated lines of code.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

const AnalyzeCodeInternalInputSchema = AnalyzeCodeInputSchema.extend({
    languageMismatch: z.boolean(),
});

const AnalyzeCodeOutputSchema = z.object({
  timeComplexity: z.string().describe("The estimated time complexity in Big O notation (e.g., 'O(n)'). If syntax errors are found, return 'N/A'."),
  spaceComplexity: z.string().describe("The estimated space complexity in Big O notation (e.g., 'O(1)'). If syntax errors are found, return 'N/A'."),
  analysis: z
    .string()
    .describe(
      'A concise, bulleted list of 3-5 unique and actionable findings on syntax errors, logical flaws, potential bugs, performance issues, and security vulnerabilities, formatted as an HTML string (e.g. "<ul><li>...</li></ul>").'
    ),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;

export async function analyzeCode(
  input: AnalyzeCodeInput
): Promise<AnalyzeCodeOutput> {
  return analyzeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCodePrompt',
  input: { schema: AnalyzeCodeInternalInputSchema },
  output: { schema: AnalyzeCodeOutputSchema },
  prompt: `You are an expert code reviewer. Your task is to analyze the provided code and return a structured JSON object.

The output MUST contain:
1.  'timeComplexity': A string with the estimated time complexity (e.g., "O(n)"). If you find any syntax errors, logical flaws, or potential runtime bugs (like typos leading to NameError), you MUST return "N/A".
2.  'spaceComplexity': A string with the estimated space complexity (e.g., "O(1)"). If you find any syntax errors, logical flaws, or potential runtime bugs, you MUST return "N/A".
3.  'analysis': An HTML string containing a concise, bulleted list of 3-5 unique and actionable findings. Prioritize syntax errors, logical flaws, and bugs first. If such issues are found, focus the analysis on them. Otherwise, comment on performance issues and security vulnerabilities. Do not comment on code style, clarity, readability, or documentation.

{{#if languageMismatch}}
Also, include a warning at the beginning of the 'analysis' HTML string: "<p><strong>Warning:</strong> The editor language is set to {{editorLanguage}}, but the code appears to be written in {{detectedLanguage}}. This may cause incorrect syntax highlighting and errors.</p>"
{{/if}}

The provided LOC (Lines of Code) is: {{loc}}.

Analyze the following {{detectedLanguage}} code:
\'\'\'{{detectedLanguage}}
{{{code}}}
\'\'\'
`,
});

const analyzeCodeFlow = ai.defineFlow(
  {
    name: 'analyzeCodeFlow',
    inputSchema: AnalyzeCodeInputSchema,
    outputSchema: AnalyzeCodeOutputSchema,
  },
  async (input) => {
    try {
      const languageMismatch = input.editorLanguage !== input.detectedLanguage;
      
      const internalInput = {
        ...input,
        languageMismatch,
      };

      const { output } = await prompt(internalInput);
      if (!output) {
        throw new Error('No analysis output received');
      }

      // Prepend language mismatch warning if necessary.
      const warningHtml = languageMismatch ? `<p><strong>Warning:</strong> The editor language is set to ${input.editorLanguage}, but the code appears to be written in ${input.detectedLanguage}. This may cause incorrect syntax highlighting and errors.</p>` : '';

      return {
        timeComplexity: output.timeComplexity,
        spaceComplexity: output.spaceComplexity,
        analysis: `${warningHtml}${output.analysis}`,
      };

    } catch (error) {
      console.error('Code analysis failed:', error);
      return {
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        analysis: '<ul><li>Error: Unable to analyze code at this time.</li></ul>'
      };
    }
  }
);
