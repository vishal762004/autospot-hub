/**
 * @file types.ts
 * @description Central TypeScript interfaces and data models for Auto Spot Hub.
 * Includes data types for Cars, Cart Items, Tax Calculations, Orders, Test Drives,
 * Reviews, and User Profiles.
 */

// Represents detailed technical specifications of a car
export interface CarSpecs {
  engine: string;       // e.g. "3.0L TwinPower Turbo V6"
  power: string;        // e.g. "340 bhp @ 5500 rpm"
  transmission: string; // e.g. "8-Speed Automatic"
  mileage: string;      // e.g. "12.5 kmpl"
  dimensions: string;   // e.g. "4922 x 2004 x 1745 mm"
  topSpeed?: string;    // e.g. "250 km/h"
  acceleration?: string; // e.g. "0-100 km/h in 4.8s"
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
}

// Represents a customer review for a car or dealership
export interface Review {
  id: string | number;
  name: string;
  rating: number;       // 1 to 5 stars
  comment: string;
  date: string;         // ISO string or formatted date
  verified?: boolean;   // True only when purchase eligibility is verified by trusted backend logic
  carId?: number;       // Associated car ID (optional)
  helpfulCount?: number;// Number of people who found this helpful
}

// Main Car model representing each vehicle in the showroom
export interface Car {
  id: number;
  make: string;         // Brand name (e.g. "Mercedes-Benz", "BMW", "Porsche")
  model: string;        // Model name (e.g. "S-Class", "7 Series", "911 Carrera")
  price: number;        // Base price in Indian Rupees (₹)
  image: string;        // Primary local asset path
  sourceImage?: string;  // Real source image URL used before local caching is prepared
  gallery?: string[];    // Optional true alternate vehicle images (front/side/rear/interior, etc.)
  category: 'Luxury Sedan' | 'Supercar' | 'SUV' | 'Electric' | 'Sports';
  specs: CarSpecs;
  features: string[];   // List of key features (e.g. "Panoramic Sunroof", "Bose Audio")
  reviews: Review[];    // List of reviews for this specific car
  featured?: boolean;   // Highlighted on hero banner
  inStock?: boolean;    // Stock status
}

// Item inside the user's shopping cart
export interface CartItem {
  car: Car;
  addedAt: string;
  selectedColor?: string;
}

// Tax and Additional Charges calculation model for vehicles in India
export interface TaxBreakdown {
  basePrice: number;        // Subtotal of vehicle base prices
  gst: number;              // Goods and Services Tax (28%)
  roadTax: number;          // Road Tax / RTO charges (20%)
  insurance: number;        // Comprehensive vehicle insurance (5%)
  registration: number;     // RTO Registration fees (2%)
  tcs: number;              // Tax Collected at Source for luxury cars > ₹10 Lakhs (1%)
  fastTag: number;          // Mandatory FASTag registration charge (Fixed ₹500)
  extendedWarranty: number; // 2-year extended warranty coverage (2%)
  totalCharges: number;     // Sum of all additional taxes & fees
  grandTotal: number;       // Base Price + Total Charges
}

// Delivery and Billing Address form data
export interface AddressDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Represents a completed purchase order stored in history
export interface DocumentVerification {
  identityProof: boolean;
  addressProof: boolean;
  panOrForm60: boolean;
  customerConsent: boolean;
}

export interface Order {
  id: string;              // Order ID (e.g. "ASH-849201")
  userId?: string;         // Firebase Auth User UID
  trackingNumber: string;  // Shipment tracking number (e.g. "ASH-TRK-918230")
  date: string;            // Date of purchase
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  items: CartItem[];
  address: AddressDetails;
  taxBreakdown: TaxBreakdown;
  paymentMethod: 'Credit/Debit Card' | 'Net Banking' | 'UPI';
  documentVerification: DocumentVerification; // Customer checklist status; no document files are stored in Firestore
  estimatedDeliveryDate: string; // Calculated 14 days from order date
}

// Represents a booked test drive appointment
export interface TestDriveAppointment {
  id: string;
  userId?: string;         // Firebase Auth User UID
  carId: number;
  carName: string;
  carImage: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  bookedAt: string;
}

// User Profile model stored in local state/storage
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  avatarUrl: string;
  carsViewedCount: number;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  loginCount?: number;
}

// Brand item details
export interface Brand {
  id: string;
  name: string;
  description: string;
  country: string;
}

// Main Navigation Active Tab options
export type ActiveTab = 'home' | 'cars' | 'brands' | 'about' | 'reviews' | 'profile' | 'contact' | 'checkout' | 'admin';
