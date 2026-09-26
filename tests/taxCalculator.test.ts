import { describe, expect, it } from 'vitest';
import { calculateTaxBreakdown } from '../src/utils/taxCalculator';
import type { CartItem } from '../src/types';

const item: CartItem = {
  car: {
    id: 1,
    make: 'Test',
    model: 'Vehicle',
    price: 2_000_000,
    image: '',
    category: 'Luxury Sedan',
    specs: {
      engine: '2.0L',
      power: '200 bhp',
      transmission: 'Automatic',
      mileage: '12 kmpl',
      dimensions: '1 x 1 x 1',
      fuelType: 'Petrol',
    },
    features: [],
    reviews: [],
  },
  addedAt: new Date().toISOString(),
};

describe('calculateTaxBreakdown', () => {
  it('returns zero for an empty cart', () => {
    expect(calculateTaxBreakdown([]).grandTotal).toBe(0);
  });

  it('calculates the demo pricing model consistently', () => {
    const result = calculateTaxBreakdown([item]);
    expect(result.basePrice).toBe(2_000_000);
    expect(result.gst).toBe(560_000);
    expect(result.tcs).toBe(20_000);
    expect(result.grandTotal).toBe(
      result.basePrice + result.totalCharges,
    );
  });
});
