/**
 * Format a token amount with the appropriate number of decimal places
 * @param amount The raw token amount 
 * @param decimals The number of decimals the token uses
 * @returns Formatted string representation of the token amount
 */
export function formatTokenAmount(amount: number, decimals: number): string {
  return (amount / (10 ** decimals)).toFixed(decimals > 6 ? 6 : decimals);
}

/**
 * Format a date string to a localized date and time
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Truncate a string (like an account ID) for display purposes
 * @param str String to truncate
 * @param startChars Number of characters to show at start
 * @param endChars Number of characters to show at end
 * @returns Truncated string with ellipsis
 */
export function truncateMiddle(str: string, startChars: number = 6, endChars: number = 4): string {
  if (str.length <= startChars + endChars) {
    return str;
  }
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
}

/**
 * Format a currency amount with appropriate symbol
 * @param amount The amount to format
 * @param currency The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
} 