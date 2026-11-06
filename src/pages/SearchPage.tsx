import React, { useState, useMemo } from 'react';
import { useStore } from '../services/store';
import { EquipmentFilter } from '../components/equipment/EquipmentFilter';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { EquipmentMap } from '../components/map/EquipmentMap';
import { FilterOptions, EquipmentCategory } from '../types';
import { calculateDistanceKm } from '../utils/geo';
import { LayoutGrid, MapPin, GitCompare, RotateCcw } from 'lucide-react';

interface SearchPageProps {
  initialCategory?: EquipmentCategory | 'All';
  initialViewMode?: 'list' | 'map';
  onSelectEquipment: (id: string) => void;
  onOpenCompare: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialCategory = 'All',
  initialViewMode = 'list',
  onSelectEquipment,
  onOpenCompare,
}) => {
  const { equipment, userLocation, compareList } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialViewMode);

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: initialCategory,
    maxDistanceKm: 50,
    minPrice: 0,
    maxPrice: 3000,
    minRating: 0,
    sortBy: 'distance',
  });

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All',
      maxDistanceKm: 50,
      minPrice: 0,
      maxPrice: 3000,
      minRating: 0,
      operatorIncluded: undefined,
      fuelIncluded: undefined,
      selectedDate: undefined,
      sortBy: 'distance',
    });
  };

  const filteredEquipment = useMemo(() => {
    return equipment
      .filter((item) => {
        if (filters.category !== 'All' && item.category !== filters.category) {
          return false;
        }

        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchBrand = item.brand.toLowerCase().includes(q);
          const matchVillage = item.location.village.toLowerCase().includes(q);
          const matchDistrict = item.location.district.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchBrand && !matchVillage && !matchDistrict) {
            return false;
          }
        }

        const dist = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          item.location.lat,
          item.location.lng
        );
        if (dist > filters.maxDistanceKm) {
          return false;
        }

        if (item.pricePerHour > filters.maxPrice) {
          return false;
        }

        if (filters.minRating > 0 && item.ratingAvg < filters.minRating) {
          return false;
        }

        if (filters.operatorIncluded && !item.operatorIncluded) {
          return false;
        }

        if (filters.fuelIncluded && !item.fuelIncluded) {
          return false;
        }

        if (filters.selectedDate && item.blockedDates.includes(filters.selectedDate)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
        const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
        if (filters.sortBy === 'distance') return distA - distB;
        if (filters.sortBy === 'price_asc') return a.pricePerHour - b.pricePerHour;
        if (filters.sortBy === 'price_desc') return b.pricePerHour - a.pricePerHour;
        if (filters.sortBy === 'rating') return b.ratingAvg - a.ratingAvg;
        return 0;
      });
  }, [equipment, filters, userLocation]);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Title & View Mode Toggle Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] tracking-tight">
            Machinery Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6E63] dark:text-[#95A69B]">
            {filteredEquipment.length} verified machines available around {userLocation.village || 'Mylavaram'}
          </p>
        </div>

        {/* List / Map Segmented Control */}
        <div className="flex items-center p-1 bg-[#EEF2EE] dark:bg-[#1A2620] rounded-lg text-xs font-medium self-start sm:self-auto border border-[#DCE4DC] dark:border-[#27372D]">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#25362C] text-[#1E3A2F] dark:text-[#E5ECE7] shadow-matte-sm font-semibold'
                : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'map'
                ? 'bg-white dark:bg-[#25362C] text-[#1E3A2F] dark:text-[#E5ECE7] shadow-matte-sm font-semibold'
                : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Field Map</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <EquipmentFilter
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        totalResults={filteredEquipment.length}
      />

      {/* Content */}
      {viewMode === 'map' ? (
        <EquipmentMap
          equipmentList={filteredEquipment}
          onSelectEquipment={onSelectEquipment}
          onOpenCompare={onOpenCompare}
        />
      ) : (
        <>
          {filteredEquipment.length === 0 ? (
            <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-12 text-center space-y-3 shadow-matte-sm">
              <div className="w-12 h-12 rounded-lg bg-[#F4F6F4] dark:bg-[#1C2520] flex items-center justify-center mx-auto text-[#5C6E63]">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                No machinery matches the selected filters
              </h3>
              <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] max-w-sm mx-auto">
                Try widening your distance limit, clearing price constraints, or selecting a different category.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-medium rounded-md shadow-matte-sm inline-flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment.map((item) => (
                <EquipmentCard
                  key={item.id}
                  equipment={item}
                  onViewDetails={onSelectEquipment}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Compare Floating Trigger */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-30 bg-[#1E3A2F] text-white px-4 py-2.5 rounded-lg shadow-matte-lg flex items-center gap-3 border border-[#2D5443]">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#D2924A]" />
            <span className="text-xs font-medium">{compareList.length} of 3 selected</span>
          </div>
          <button
            onClick={onOpenCompare}
            className="px-3 py-1 bg-[#B8762E] hover:bg-[#9E6424] text-white text-xs font-semibold rounded-md shadow-matte-sm transition-colors"
          >
            Compare Now
          </button>
        </div>
      )}
    </div>
  );
};
