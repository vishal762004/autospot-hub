/**
 * @file taxCalculator.ts
 * @description Utility functions to compute estimated taxes, charges, and price breakdowns
 * for vehicle purchases according to the demo pricing model configured for Auto Spot Hub.
 */

import { CartItem, TaxBreakdown } from '../types';

/**
 * TAX RATE CONSTANTS
 * - GST (Goods and Services Tax): 28%
 * - Road Tax (RTO State Registration): 20%
 * - Comprehensive Insurance: 5%
 * - Registration Fees: 2%
 * - TCS (Tax Collected at Source): 1% in this demo model when base price exceeds ₹10 lakh
 * - FASTag: Fixed charge of ₹500
 * - Extended Warranty: 2%
 */
export const TAX_RATES = {
  GST: 0.28,
  ROAD_TAX: 0.20,
  INSURANCE: 0.05,
  REGISTRATION: 0.02,
  TCS: 0.01,
  FASTAG_FIXED: 500,
  EXTENDED_WARRANTY: 0.02,
};

/**
 * Calculates itemized charges and total amount for a given base price or cart items list.
 * 
 * @param items List of items currently in the cart
 * @returns Estimated TaxBreakdown object containing base price, charges, and grand total
 */
export function calculateTaxBreakdown(items: CartItem[]): TaxBreakdown {
  // Calculate total base price of all selected vehicles
  const basePrice = items.reduce((sum, item) => sum + item.car.price, 0);

  if (basePrice === 0) {
    return {
      basePrice: 0,
      gst: 0,
      roadTax: 0,
      insurance: 0,
      registration: 0,
      tcs: 0,
      fastTag: 0,
      extendedWarranty: 0,
      totalCharges: 0,
      grandTotal: 0,
    };
  }

  // Calculate each individual charge based on the base price
  const gst = Math.round(basePrice * TAX_RATES.GST);
  const roadTax = Math.round(basePrice * TAX_RATES.ROAD_TAX);
  const insurance = Math.round(basePrice * TAX_RATES.INSURANCE);
  const registration = Math.round(basePrice * TAX_RATES.REGISTRATION);
  const tcs = basePrice > 1_000_000 ? Math.round(basePrice * TAX_RATES.TCS) : 0;
  const fastTag = items.length > 0 ? TAX_RATES.FASTAG_FIXED * items.length : 0;
  const extendedWarranty = Math.round(basePrice * TAX_RATES.EXTENDED_WARRANTY);

  // Sum all additional taxes and charges
  const totalCharges = gst + roadTax + insurance + registration + tcs + fastTag + extendedWarranty;

  // Final grand total
  const grandTotal = basePrice + totalCharges;

  return {
    basePrice,
    gst,
    roadTax,
    insurance,
    registration,
    tcs,
    fastTag,
    extendedWarranty,
    totalCharges,
    grandTotal,
  };
}

/**
 * Formats a numeric price into Indian Rupee format with commas (e.g., ₹1,25,00,000)
 * 
 * @param amount Number to format
 * @returns Formatted string with ₹ currency symbol
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
