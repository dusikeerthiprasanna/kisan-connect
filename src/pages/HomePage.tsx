import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../services/store';
import { EquipmentCategory } from '../types';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { formatDateIndian } from '../utils/date';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  CalendarCheck,
  ShieldCheck,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  onNavigateToExplore: (category?: EquipmentCategory | 'All') => void;
  onNavigateToMap: () => void;
  onSelectEquipment: (id: string) => void;
  onOpenAssistant: () => void;
  onOpenFilter?: () => void;
}

const CATEGORY_CHIPS: (EquipmentCategory | 'All')[] = [
  'All',
  'Tractor',
  'Sprayer',
  'Seed Drill',
  'Harvester',
  'Drone Sprayer',
  'Cultivator',
  'Rotavator',
  'Water Tanker',
  'Plough',
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToExplore,
  onNavigateToMap,
  onSelectEquipment,
}) => {
  const { t } = useTranslation();
  const { equipment, userLocation, bookings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'All'>('All');
  const [quickSearch, setQuickSearch] = useState('');

  // Check for upcoming booking
  const upcomingBooking = bookings.find(
    (b) => b.status === 'Confirmed' || b.status === 'Approved'
  );

  // Filter nearby equipment based on active chip & quickSearch
  const nearbyEquipment = equipment
    .filter((eq) => {
      if (selectedCategory !== 'All' && eq.category !== selectedCategory) return false;
      if (quickSearch.trim()) {
        const q = quickSearch.toLowerCase();
        return (
          eq.name.toLowerCase().includes(q) ||
          eq.category.toLowerCase().includes(q) ||
          eq.brand.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .slice(0, 8);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToExplore(selectedCategory);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Professional Matte Hero Section */}
      <section className="bg-[#1E3A2F] dark:bg-[#16251E] text-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-[#2B4E3E] dark:border-[#223329] shadow-matte-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-5">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-xs font-medium text-[#D2E2D6] border border-white/15">
            <MapPin className="w-3.5 h-3.5 text-[#E5ECE7]" strokeWidth={1.8} />
            <span>Serving mandals in {userLocation.village || 'Mylavaram'}, Andhra Pradesh</span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Farm Equipment Rental Network
            </h1>
            <p className="text-sm sm:text-base text-[#C2D4C7] max-w-2xl leading-relaxed">
              Connect directly with verified equipment owners across Krishna, Guntur & NTR districts. Reserve tractors, combine harvesters, and precision sprayers with live availability.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
          >
            <div className="flex-1 relative flex items-center bg-white dark:bg-[#1D2721] rounded-lg border border-[#E2E6E2] dark:border-[#2E3D34] shadow-matte-sm">
              <Search className="w-4 h-4 text-[#5C6E63] dark:text-[#95A69B] ml-3 shrink-0" strokeWidth={1.8} />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Search tractor (e.g. 50 HP, John Deere), sprayer, harvester..."
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-transparent text-[#19261E] dark:text-[#E5ECE7] placeholder:text-[#87998E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#B8762E] hover:bg-[#9E6424] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-matte-sm transition-colors shrink-0 flex items-center justify-center gap-2"
            >
              <span>Search Machinery</span>
            </button>
          </form>

          {/* Trust Highlights Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#A8BEB1]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
              <span>100% Verified Machinery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
              <span>Live Calendar Availability</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={1.8} />
              <span>Transparent Rates (hr / day)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Upcoming Booking Notification Card if active */}
      {upcomingBooking && (
        <div className="bg-[#FAF5ED] dark:bg-[#1F1B14] rounded-xl border border-[#E8DDCC] dark:border-[#382F22] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-matte-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EADCC6] dark:bg-[#332A1C] flex items-center justify-center text-[#785623] dark:text-[#DDB278] shrink-0">
              <CalendarCheck className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#785623] dark:text-[#DDB278]">
                  Upcoming Reservation ({upcomingBooking.status})
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                {upcomingBooking.equipmentName}
              </h3>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
                Scheduled for {formatDateIndian(upcomingBooking.startDate)} · {upcomingBooking.quantity} {upcomingBooking.hoursOrDaysType}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectEquipment(upcomingBooking.equipmentId)}
            className="px-3.5 py-1.5 bg-white dark:bg-[#2A2319] hover:bg-[#F2ECE1] text-[#785623] dark:text-[#DDB278] text-xs font-semibold rounded-md border border-[#E0D0B8] dark:border-[#473B2A] transition-colors shrink-0 self-start sm:self-auto"
          >
            View Details
          </button>
        </div>
      )}

      {/* 3. Category Filter Chips (Responsive) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
            Machinery Categories
          </h2>
          <button
            onClick={() => onNavigateToExplore('All')}
            className="text-xs font-medium text-[#1E3A2F] dark:text-[#A8BEB1] hover:underline flex items-center gap-1"
          >
            <span>Browse all categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORY_CHIPS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors border ${
                  isActive
                    ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                    : 'bg-white dark:bg-[#171F1A] text-[#5C6E63] dark:text-[#95A69B] border-[#E2E6E2] dark:border-[#233027] hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922]'
                }`}
              >
                {cat === 'All' ? 'All Machinery' : cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Responsive 4-Column Category Highlight Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { cat: 'Tractor' as EquipmentCategory, label: 'Tractors', desc: '45 - 55 HP, rotavator compatible' },
          { cat: 'Harvester' as EquipmentCategory, label: 'Combine Harvesters', desc: 'Paddy & grain cutting with straw walker' },
          { cat: 'Drone Sprayer' as EquipmentCategory, label: 'Agricultural Drones', desc: '10L - 16L precision spraying' },
          { cat: 'Rotavator' as EquipmentCategory, label: 'Rotavators & Tillers', desc: 'Primary & secondary tillage' },
        ].map((item) => (
          <button
            key={item.cat}
            onClick={() => onNavigateToExplore(item.cat)}
            className="bg-white dark:bg-[#171F1A] p-4 rounded-xl border border-[#E2E6E2] dark:border-[#233027] shadow-matte-sm hover:shadow-matte transition-all text-left flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <CategoryIcon category={item.cat} size="md" />
              <ChevronRight className="w-4 h-4 text-[#87998E] group-hover:text-[#1E3A2F] dark:group-hover:text-[#A8BEB1] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] group-hover:text-[#1E3A2F] dark:group-hover:text-[#A8BEB1] transition-colors">
                {item.label}
              </h3>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] line-clamp-1 mt-0.5">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </section>

      {/* 5. Responsive Nearby Machinery Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#19261E] dark:text-[#E5ECE7] tracking-tight">
              Machinery Available Near You
            </h2>
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
              Verified equipment within 30 km of {userLocation.village || 'Mylavaram'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToMap}
              className="text-xs font-medium text-[#1E3A2F] dark:text-[#A8BEB1] hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View Map</span>
            </button>
            <span className="text-[#DCE2DC]">·</span>
            <button
              onClick={() => onNavigateToExplore(selectedCategory)}
              className="text-xs font-semibold text-[#1E3A2F] dark:text-[#A8BEB1] hover:underline flex items-center gap-0.5"
            >
              <span>See all listings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {nearbyEquipment.length === 0 ? (
          <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-10 text-center space-y-3">
            <CategoryIcon category="Tractor" size="lg" className="mx-auto" />
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
              No machinery found matching this category.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 bg-[#1E3A2F] text-white text-xs font-medium rounded-md"
            >
              Show all machinery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {nearbyEquipment.map((eq) => (
              <EquipmentCard
                key={eq.id}
                equipment={eq}
                onViewDetails={onSelectEquipment}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
