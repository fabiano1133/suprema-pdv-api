/**
 * GTIN-13 generator (DDD).
 * Format: 13 numeric digits (12 base + 1 check digit).
 */
import { randomInt } from 'crypto';

export function generateGtin13(): string {
  // Use internal-use prefix range (200-299) commonly used for in-store codes.
  const prefix = '200';
  const random9 = randomDigits(9);
  const base12 = `${prefix}${random9}`; // 12 digits
  const checkDigit = computeEan13CheckDigit(base12);
  return `${base12}${checkDigit}`;
}

/**
 * Generates N random digits (0-9).
 */
function randomDigits(len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += String(randomInt(0, 10));
  }
  return out;
}

/**
 * Computes EAN-13 check digit.
 */
function computeEan13CheckDigit(digits12: string): number {
  if (digits12.length !== 12) {
    throw new Error('EAN-13 base must be 12 digits');
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(digits12[i], 10);
    sum += (i % 2 === 0 ? 1 : 3) * d;
  }
  return (10 - (sum % 10)) % 10;
}
