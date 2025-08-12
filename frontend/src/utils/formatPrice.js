/**
 * Format a number as a price with currency symbol
 * @param {number} num - The number to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (num) => {
  return `$${num.toFixed(2)}`;
};