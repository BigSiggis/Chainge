/**
 * Calculate the round-up amount for a given transaction.
 *
 * @param {number} amount - The transaction amount in SOL
 * @param {number} roundTo - The round-up increment (e.g., 0.1, 0.5, 1)
 * @returns {number} The spare change to sweep
 *
 * Example:
 *   calculateRoundUp(0.341, 0.1) → 0.059
 *   calculateRoundUp(0.341, 0.5) → 0.159
 *   calculateRoundUp(0.5, 0.5)   → 0 (exact match, no round-up)
 */
export function calculateRoundUp(amount, roundTo) {
  const remainder = amount % roundTo;

  // If it's an exact multiple, no round-up
  if (remainder < 0.000001) return 0;

  const roundUp = roundTo - remainder;

  // Avoid floating point weirdness
  return Math.round(roundUp * 1000) / 1000;
}

/**
 * Format SOL amount to consistent decimal places
 */
export function formatSOL(amount, decimals = 3) {
  return amount.toFixed(decimals);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports) {
  return lamports / 1_000_000_000;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol) {
  return Math.round(sol * 1_000_000_000);
}
