/**
 * Calculates the Lines of Code (LOC) of a given code string.
 * This implementation ignores blank lines and comments.
 * It handles both single-line (//) and multi-line comments.
 * @param code The code string to analyze.
 * @returns The calculated number of lines of code.
 */
export function calculateLOC(code: string): number {
  if (!code) {
    return 0;
  }

  // Regular expression to match both single-line and multi-line comments.
  const commentsRegex = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)/gm;
  
  // Remove all comments from the code.
  const codeWithoutComments = code.replace(commentsRegex, '');

  // Split the remaining code into lines and filter out empty or whitespace-only lines.
  const lines = codeWithoutComments.split('\n').filter(line => line.trim() !== '');

  return lines.length;
}
