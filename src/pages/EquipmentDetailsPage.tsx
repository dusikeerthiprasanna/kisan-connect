import React, { useState } from 'react';
import { useStore } from '../services/store';
import { useTranslation } from 'react-i18next';
import { calculateDistanceKm } from '../utils/geo';
import { formatDateIndian } from '../utils/date';
import { BookingModal } from '../components/booking/BookingModal';
import { BookingCalendar } from '../components/booking/BookingCalendar';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  UserCheck,
  Fuel,
  CalendarCheck,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface EquipmentDetailsPageProps {
  equipmentId: string;
  onBack: () => void;
  onBookingComplete: (bookingId: string) => void;
}

export const EquipmentDetailsPage: React.FC<EquipmentDetailsPageProps> = ({
  equipmentId,
  onBack,
  onBookingComplete,
}) => {
  const { equipment, reviews, userLocation, savedEquipmentIds, toggleBookmark } = useStore();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Calendar state directly on page for quick date check
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');

  const item = equipment.find((eq) => eq.id === equipmentId);

  if (!item) {
    return (
      <div className="py-20 text-center space-y-4 max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-[#19261E] dark:text-[#E5ECE7]">Machinery Not Found</h2>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[#1E3A2F] text-white rounded-md text-xs font-semibold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const distance = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    item.location.lat,
    item.location.lng
  );

  const itemReviews = reviews.filter((r) => r.equipmentId === item.id);
  const isBookmarked = savedEquipmentIds.includes(item.id);

  // Star breakdown
  const ratingCounts = {
    5: itemReviews.filter((r) => r.rating === 5).length + 3,
    4: itemReviews.filter((r) => r.rating === 4).length + 1,
    3: itemReviews.filter((r) => r.rating === 3).length,
    2: 0,
    1: 0,
  };

  return (
    <div className="space-y-6 pb-28 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] dark:hover:text-[#E5ECE7] rounded-md transition-colors flex items-center gap-1.5 font-medium text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(item.id)}
            className="p-2 bg-white dark:bg-[#171F1A] border border-[#E2E6E2] dark:border-[#233027] rounded-md text-[#5C6E63] hover:text-rose-500 shadow-matte-sm transition-colors"
            aria-label="Save machinery"
          >
            <Heart
              className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500 text-rose-500' : 'stroke-[1.8]'}`}
            />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: item.name,
                  text: `Rent ${item.name} on KISAN CONNECT for Rs ${item.pricePerHour}/hr`,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="p-2 bg-white dark:bg-[#171F1A] border border-[#E2E6E2] dark:border-[#233027] rounded-md text-[#5C6E63] hover:text-[#19261E] shadow-matte-sm transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Responsive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Gallery, Details, Specs, Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden bg-[#F2F5F2] dark:bg-[#1C2620] border border-[#E2E6E2] dark:border-[#233027] shadow-matte-sm">
            <img
              src={item.images[activePhotoIdx] || item.images[0]}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Category Badge Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-white/90 dark:bg-[#171F1A]/90 backdrop-blur-xs px-3 py-1 rounded-md text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] border border-[#E2E6E2]/80 dark:border-[#233027] shadow-matte-sm">
                {item.category}
              </span>

              <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white" />
                <span>{distance} km away</span>
              </span>
            </div>

            {/* Carousel navigation buttons */}
            {item.images.length > 1 && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-md text-white text-xs">
                <button
                  onClick={() => setActivePhotoIdx((p) => (p > 0 ? p - 1 : item.images.length - 1))}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 font-mono text-[11px]">
                  {activePhotoIdx + 1}/{item.images.length}
                </span>
                <button
                  onClick={() => setActivePhotoIdx((p) => (p < item.images.length - 1 ? p + 1 : 0))}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Machine Info & Owner Card */}
          <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-5 sm:p-6 shadow-matte-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] tracking-tight leading-snug">
                  {item.name}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-[#5C6E63] dark:text-[#95A69B] mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {item.location.village}, {item.location.district} · {distance} km from your farm
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-baseline sm:justify-end">
                  <span className="text-2xl font-bold text-[#1E3A2F] dark:text-[#A8BEB1] tracking-tight">
                    Rs {item.pricePerHour}
                  </span>
                  <span className="text-xs text-[#5C6E63] dark:text-[#95A69B] ml-1">/hr</span>
                </div>
                <span className="text-xs text-[#5C6E63] dark:text-[#95A69B] block">
                  Rs {item.pricePerDay} /day (8 hrs shift)
                </span>
              </div>
            </div>

            {/* Verified Owner Row */}
            <div className="pt-4 border-t border-[#E2E6E2] dark:border-[#233027] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1E3A2F] text-white flex items-center justify-center font-semibold text-sm shadow-matte-sm">
                  {item.ownerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                    <span>{item.ownerName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#245835] dark:text-[#88C49E]" strokeWidth={2} />
                    <span className="text-[10px] text-[#245835] dark:text-[#88C49E] font-medium bg-[#EEF5F0] dark:bg-[#1A2E22] px-1.5 py-0.5 rounded">
                      Verified Owner
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#5C6E63] dark:text-[#95A69B] mt-0.5">
                    <Star className="w-3 h-3 fill-[#B8762E] text-[#B8762E]" />
                    <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                      {item.ownerRating}
                    </span>
                    <span>({item.ownerReviewCount} completed jobs)</span>
                  </div>
                </div>
              </div>

              {/* Owner Quick Connect */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${item.ownerPhone}`}
                  className="px-3.5 py-2 bg-[#F4F6F4] dark:bg-[#1C2520] hover:bg-[#EAEAEA] text-[#19261E] dark:text-[#E5ECE7] rounded-md text-xs font-medium border border-[#DCE2DC] dark:border-[#27352D] transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#5C6E63]" strokeWidth={1.8} />
                  <span>Call Owner</span>
                </a>
                <a
                  href={`https://wa.me/${item.ownerPhone.replace(/\D/g, '')}?text=Hi%20${item.ownerName},%20interested%20in%20renting%20${encodeURIComponent(item.name)}%20via%20KISAN%20CONNECT`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#F4F6F4] dark:bg-[#1C2520] hover:bg-[#EAEAEA] text-[#19261E] dark:text-[#E5ECE7] rounded-md text-xs font-medium border border-[#DCE2DC] dark:border-[#27352D] transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#5C6E63]" strokeWidth={1.8} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-5 sm:p-6 shadow-matte-sm space-y-4">
            <h3 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
              Technical Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2]/80 dark:border-[#233027]">
                <span className="text-[#5C6E63] dark:text-[#95A69B] block text-[10px]">Power Rating</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7] mt-0.5 block">
                  {item.specs.hp ? `${item.specs.hp} HP Engine` : 'Standard Torque'}
                </span>
              </div>

              <div className="p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2]/80 dark:border-[#233027]">
                <span className="text-[#5C6E63] dark:text-[#95A69B] block text-[10px]">Fuel Terms</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7] mt-0.5 block">
                  {item.fuelIncluded ? 'Diesel Included' : 'Fuel Extra'}
                </span>
              </div>

              <div className="p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2]/80 dark:border-[#233027]">
                <span className="text-[#5C6E63] dark:text-[#95A69B] block text-[10px]">Operator</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7] mt-0.5 block">
                  {item.operatorIncluded ? 'Expert Operator' : 'Self Drive'}
                </span>
              </div>

              <div className="p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2]/80 dark:border-[#233027]">
                <span className="text-[#5C6E63] dark:text-[#95A69B] block text-[10px]">Model & Year</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7] mt-0.5 block">
                  {item.brand} ({item.specs.modelYear || 2024})
                </span>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] mb-1">
                Description & Operational Scope
              </h4>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-5 sm:p-6 shadow-matte-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
                Farmer Reviews ({item.ratingCount})
              </h3>
              <div className="flex items-center gap-1 font-semibold text-xs text-[#19261E] dark:text-[#E5ECE7]">
                <Star className="w-3.5 h-3.5 fill-[#B8762E] text-[#B8762E]" />
                <span>{item.ratingAvg} / 5.0</span>
              </div>
            </div>

            {/* Star Rating Bars */}
            <div className="space-y-1.5 text-xs text-[#5C6E63] dark:text-[#95A69B] max-w-sm">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = (ratingCounts as any)[stars] || 0;
                const pct = Math.min(100, Math.round((count / (item.ratingCount + 4)) * 100));
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-6 font-mono text-[11px]">{stars} ★</span>
                    <div className="flex-1 h-1.5 bg-[#EEF2EE] dark:bg-[#202E26] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#B8762E] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 font-mono text-[10px] text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Recent Review Quote */}
            {itemReviews.length > 0 && (
              <div className="p-3.5 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2]/80 dark:border-[#233027] space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                  <span>{itemReviews[0].farmerName}</span>
                  <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B] font-normal">
                    {formatDateIndian(itemReviews[0].createdAt)}
                  </span>
                </div>
                <p className="text-[#5C6E63] dark:text-[#95A69B] italic">
                  "{itemReviews[0].comment}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Sticky Booking Card & Calendar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-5 shadow-matte-sm space-y-4 lg:sticky lg:top-24">
            <div>
              <h3 className="text-base font-bold text-[#19261E] dark:text-[#E5ECE7] tracking-tight">
                Reserve Equipment
              </h3>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
                20% advance token required upon owner approval
              </p>
            </div>

            {/* Rates breakdown */}
            <div className="p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2]/80 dark:border-[#233027] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5C6E63] dark:text-[#95A69B]">Hourly Rate</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">Rs {item.pricePerHour} /hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C6E63] dark:text-[#95A69B]">Full Day (8 hrs)</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">Rs {item.pricePerDay} /day</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#E2E6E2] dark:border-[#233027]">
                <span className="text-[#5C6E63] dark:text-[#95A69B]">Operator</span>
                <span className="font-medium text-[#19261E] dark:text-[#E5ECE7]">
                  {item.operatorIncluded ? 'Included at no extra fee' : 'Self drive'}
                </span>
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] block">
                Select Dates & Check Overlaps
              </label>
              <BookingCalendar
                blockedDates={item.blockedDates}
                startDate={selectedStart}
                endDate={selectedEnd}
                onSelectRange={(s, e) => {
                  setSelectedStart(s);
                  setSelectedEnd(e);
                }}
              />
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full py-3 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-lg shadow-matte-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue to Reservation</span>
            </button>

            <div className="space-y-1 text-[11px] text-[#5C6E63] dark:text-[#95A69B]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#245835]" />
                <span>Zero charge if owner declines request</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#245835]" />
                <span>Direct farmer-owner coordination</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (hidden on desktop) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#171F1A]/95 backdrop-blur-md border-t border-[#E2E6E2] dark:border-[#233027] p-3.5 shadow-matte-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B] uppercase font-semibold block">
              Estimated Rate
            </span>
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-[#1E3A2F] dark:text-[#A8BEB1]">
                Rs {item.pricePerHour}
              </span>
              <span className="text-xs text-[#5C6E63] dark:text-[#95A69B] ml-1">/hr</span>
              <span className="text-xs text-[#5C6E63] dark:text-[#95A69B] mx-1.5">·</span>
              <span className="text-xs font-medium text-[#19261E] dark:text-[#E5ECE7]">
                Rs {item.pricePerDay}/d
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-5 py-2.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-md shadow-matte-sm transition-colors"
          >
            Request Booking
          </button>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      <BookingModal
        equipment={item}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingComplete={onBookingComplete}
      />
    </div>
  );
};
