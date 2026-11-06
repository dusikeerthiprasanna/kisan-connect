// Utility functions for dates and availability verification

export function formatDateIndian(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeAmPm(timeStr?: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

// Generate an array of dates in YYYY-MM-DD format between start and end (inclusive)
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);

  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

// Checks if any dates in requested range intersect with booked/blocked dates
export function hasDateOverlap(
  reqStart: string,
  reqEnd: string,
  blockedDates: string[]
): boolean {
  const requestedDates = getDatesInRange(reqStart, reqEnd);
  return requestedDates.some((date) => blockedDates.includes(date));
}

// Today formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Add days to date
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  d.setDate(d.getDate() + days - 1);
  return d.toISOString().split('T')[0];
}
