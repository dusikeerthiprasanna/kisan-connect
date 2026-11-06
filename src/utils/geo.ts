// Haversine formula for distance between 2 coordinates on Earth in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Default benchmark locations in Andhra Pradesh
export const AP_REFERENCE_HUBS = [
  { name: 'Vijayawada', lat: 16.5062, lng: 80.648, district: 'NTR' },
  { name: 'Guntur', lat: 16.3067, lng: 80.4365, district: 'Guntur' },
  { name: 'Mylavaram', lat: 16.7628, lng: 80.6385, district: 'NTR' },
  { name: 'Eluru', lat: 16.7107, lng: 81.0952, district: 'Eluru' },
  { name: 'Mangalagiri', lat: 16.43, lng: 80.56, district: 'Guntur' },
  { name: 'Tenali', lat: 16.243, lng: 80.64, district: 'Guntur' },
  { name: 'Nuzvid', lat: 16.7865, lng: 80.8466, district: 'Eluru' },
];

export const DEFAULT_USER_LOCATION = {
  lat: 16.5062,
  lng: 80.648,
  village: 'Vijayawada Rural',
  district: 'NTR',
};

// Get current user location via Geolocation API
export function getCurrentPositionAsync(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
