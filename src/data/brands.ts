/**
 * @file brands.ts
 * @description Brand list derived from the actual vehicle makes in the catalogue.
 * Keeping this list aligned with cars.ts prevents a brand card from pointing to an
 * empty collection.
 */

import { Brand } from '../types';

export const LUXURY_BRANDS: Brand[] = [
  {
    id: 'aston-martin',
    name: 'Aston Martin',
    description: 'British grand touring and performance cars with a strong luxury focus.',
    country: 'United Kingdom',
  },
  {
    id: 'audi',
    name: 'Audi',
    description: 'German performance and luxury vehicles combining design and technology.',
    country: 'Germany',
  },
  {
    id: 'bmw',
    name: 'BMW',
    description: 'German luxury vehicles with a performance-focused driving character.',
    country: 'Germany',
  },
  {
    id: 'bentley',
    name: 'Bentley',
    description: 'British luxury grand tourers combining craftsmanship with strong performance.',
    country: 'United Kingdom',
  },
  {
    id: 'bugatti',
    name: 'Bugatti',
    description: 'French-origin hypercars known for extreme performance and engineering.',
    country: 'France',
  },
  {
    id: 'ferrari',
    name: 'Ferrari',
    description: 'Italian performance cars with a long motorsport and road-car heritage.',
    country: 'Italy',
  },
  {
    id: 'koenigsegg',
    name: 'Koenigsegg',
    description: 'Swedish hypercars focused on lightweight engineering and high performance.',
    country: 'Sweden',
  },
  {
    id: 'lamborghini',
    name: 'Lamborghini',
    description: 'Italian supercars and SUVs defined by dramatic design and performance.',
    country: 'Italy',
  },
  {
    id: 'land-rover',
    name: 'Land Rover',
    description: 'British luxury SUVs built around capability, comfort, and premium design.',
    country: 'United Kingdom',
  },
  {
    id: 'mahindra',
    name: 'Mahindra',
    description: 'Indian automotive brand represented in the Auto Spot Hub catalogue.',
    country: 'India',
  },
  {
    id: 'mclaren',
    name: 'McLaren',
    description: 'British performance cars shaped by lightweight engineering and motorsport.',
    country: 'United Kingdom',
  },
  {
    id: 'mercedes-benz',
    name: 'Mercedes-Benz',
    description: 'German luxury cars and performance models spanning sedan, SUV, and GT lines.',
    country: 'Germany',
  },
  {
    id: 'mercedes-maybach',
    name: 'Mercedes-Maybach',
    description: 'Ultra-luxury Mercedes vehicles focused on rear-seat comfort and refinement.',
    country: 'Germany',
  },
  {
    id: 'pagani',
    name: 'Pagani',
    description: 'Italian ultra-low-volume hypercars combining sculptural design with advanced materials.',
    country: 'Italy',
  },
  {
    id: 'porsche',
    name: 'Porsche',
    description: 'German sports and performance vehicles with a strong engineering tradition.',
    country: 'Germany',
  },
  {
    id: 'rolls-royce',
    name: 'Rolls-Royce',
    description: 'British ultra-luxury automobiles centered on craftsmanship and bespoke comfort.',
    country: 'United Kingdom',
  },
  {
    id: 'toyota',
    name: 'Toyota',
    description: 'Global automotive brand represented by performance and premium-focused catalogue entries.',
    country: 'Japan',
  },
];
