export const currencyFormat = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const num = (x: any) => (isNaN(parseFloat(x)) ? 0 : parseFloat(x));

// Format number with commas for display (e.g., 1000 -> "1,000", 100.53 -> "100.53")
export const formatNumberWithCommas = (n: number | string) => {
  const numValue = typeof n === 'string' ? parseFloat(n.replace(/,/g, '')) : n;
  if (isNaN(numValue)) return '';
  
  // Preserve decimal places - use minimumFractionDigits: 0 to avoid forcing .00 on whole numbers
  // and maximumFractionDigits: 2 for financial precision
  return numValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Parse comma-formatted string back to number (e.g., "1,000" -> 1000)
export const parseCommaNumber = (str: string) => {
  const cleaned = str.replace(/,/g, '');
  return isNaN(parseFloat(cleaned)) ? 0 : parseFloat(cleaned);
};

export const uid = () => Math.random().toString(36).slice(2, 9);

import type { Currency } from '../types';

export function convertToUSD(amount: number, currency: Currency, gbpRate: number) {
  return currency === 'USD' ? amount : amount * gbpRate;
}
