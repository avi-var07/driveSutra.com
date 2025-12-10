/**
 * Format a number with commas for thousands
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US');
};

/**
 * Format a number to a specific number of decimal places
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number
 */
export const formatDecimal = (num, decimals = 2) => {
  if (num === null || num === undefined) return '0.00';
  return num.toFixed(decimals);
};

/**
 * Format a large number with K, M, B suffixes
 * @param {number} num - The number to format
 * @returns {string} Formatted number with suffix
 */
export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Format distance with appropriate unit
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance
 */
export const formatDistance = (km) => {
  if (km === null || km === undefined) return '0 km';
  if (km >= 1000) {
    return `${formatDecimal(km / 1000, 1)}K km`;
  }
  return `${formatDecimal(km, 1)} km`;
};

/**
 * Format CO2 emissions with appropriate unit
 * @param {number} kg - CO2 in kilograms
 * @returns {string} Formatted CO2
 */
export const formatCO2 = (kg) => {
  if (kg === null || kg === undefined) return '0 kg';
  if (kg >= 1000) {
    return `${formatDecimal(kg / 1000, 2)} tons`;
  }
  return `${formatDecimal(kg, 2)} kg`;
};
