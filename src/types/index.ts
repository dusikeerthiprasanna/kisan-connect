export type UserRole = 'farmer' | 'owner';

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  village: string;
  district: string;
  photoUrl?: string;
  createdAt: string;
}

export type EquipmentCategory =
  | 'Tractor'
  | 'Harvester'
  | 'Cultivator'
  | 'Seed Drill'
  | 'Sprayer'
  | 'Drone Sprayer'
  | 'Water Tanker'
  | 'Rotavator'
  | 'Plough';

export interface LocationData {
  lat: number;
  lng: number;
  village: string;
  district: string;
  pincode?: string;
}

export interface EquipmentSpecs {
  hp?: number;
  capacity?: string;
  fuelType?: string;
  workingWidth?: string;
  modelYear?: number;
}

export interface Equipment {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerRating: number;
  ownerReviewCount: number;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  description: string;
  images: string[];
  pricePerHour: number;
  pricePerDay: number;
  location: LocationData;
  specs: EquipmentSpecs;
  operatorIncluded: boolean;
  fuelIncluded: boolean;
  isAvailable: boolean;
  blockedDates: string[]; // ISO YYYY-MM-DD
  ratingAvg: number;
  ratingCount: number;
  distanceKm?: number;
}

export type BookingStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCategory: EquipmentCategory;
  equipmentImage: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerVillage: string;
  ownerId: string;
  ownerName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  hoursOrDaysType: 'hours' | 'days';
  quantity: number; // number of hours or days
  pricePerUnit: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  createdAt: string;
  reviewed?: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  equipmentId: string;
  farmerId: string;
  farmerName: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'payment_success' | 'reminder';
  read: boolean;
  createdAt: string;
  bookingId?: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: EquipmentCategory | 'All';
  maxDistanceKm: number;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  operatorIncluded?: boolean;
  fuelIncluded?: boolean;
  selectedDate?: string;
  sortBy: 'distance' | 'price_asc' | 'price_desc' | 'rating';
}
