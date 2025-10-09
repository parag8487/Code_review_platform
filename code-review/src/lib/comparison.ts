'use server';

export type Metrics = {
  time: string;
  space: string;
  loc: number;
};

// A lower rank is better.
const complexityRank: { [key: string]: number } = {
  'o(1)': 0,
  'o(log n)': 1,
  'o(n)': 2,
  'o(n log n)': 3,
  'o(n^2)': 4,
  'o(n^3)': 5,
  'o(2^n)': 6,
  'o(n!)': 7,
};

/**
 * Compares new code metrics against saved metrics based on a prioritized algorithm.
 * Priority: Time Complexity > Space Complexity > Lines of Code.
 * @param newMetrics The metrics of the newly analyzed code.
 * @param savedMetrics The baseline metrics stored for the review.
 * @returns An object with the result and a reason for failure if applicable.
 */
export async function isNewCodeAcceptable(
  newMetrics: Metrics,
  savedMetrics: Metrics
): Promise<{ result: boolean; reason?: string }> {
  // Handle cases where metrics might be N/A or unranked by converting to lowercase first.
  const newTimeRank = complexityRank[newMetrics.time.toLowerCase()] ?? Infinity;
  const savedTimeRank = complexityRank[savedMetrics.time.toLowerCase()] ?? Infinity;
  const newSpaceRank = complexityRank[newMetrics.space.toLowerCase()] ?? Infinity;
  const savedSpaceRank = complexityRank[savedMetrics.space.toLowerCase()] ?? Infinity;

  // --- Priority 1: Time Complexity ---
  if (newTimeRank > savedTimeRank) {
    return { result: false, reason: `Time Complexity is worse (new: ${newMetrics.time}, saved: ${savedMetrics.time})` };
  }
  if (newTimeRank < savedTimeRank) {
    return { result: true };
  }

  // --- If Time Complexity is the same, proceed to Priority 2 ---
  if (newTimeRank === savedTimeRank) {
    // --- Priority 2: Space Complexity ---
    if (newSpaceRank > savedSpaceRank) {
      return { result: false, reason: `Space Complexity is worse (new: ${newMetrics.space}, saved: ${savedMetrics.space})` };
    }
    if (newSpaceRank < savedSpaceRank) {
      return { result: true };
    }

    // --- If Space Complexity is also the same, proceed to Priority 3 ---
    if (newSpaceRank === savedSpaceRank) {
      // --- Priority 3: Lines of Code (LOC) ---
      if (newMetrics.loc > savedMetrics.loc) {
        return { result: false, reason: `Lines of Code increased (new: ${newMetrics.loc}, saved: ${savedMetrics.loc})` };
      }
    }
  }

  // New code is either strictly better on one metric or equal on all applicable metrics.
  // In the case of equal metrics, we still allow saving (return true)
  return { result: true };
}