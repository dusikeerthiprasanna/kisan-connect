import React, { useState } from 'react';
import { FilterOptions, EquipmentCategory } from '../../types';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

interface EquipmentFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const CATEGORIES: (EquipmentCategory | 'All')[] = [
  'All',
  'Tractor',
  'Sprayer',
  'Harvester',
  'Drone Sprayer',
  'Seed Drill',
  'Rotavator',
  'Cultivator',
  'Water Tanker',
  'Plough',
];

const DISTANCES = [5, 10, 25, 50];

export const EquipmentFilter: React.FC<EquipmentFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategorySelect = (cat: EquipmentCategory | 'All') => {
    onFilterChange({ ...filters, category: cat });
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, sortBy: e.target.value as any });
  };

  return (
    <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-4 shadow-matte-sm space-y-3.5 transition-colors">
      {/* Search Input, Sort & Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6E63] dark:text-[#95A69B]" strokeWidth={1.8} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchInput}
            placeholder="Search tractor, harvester, drone, village..."
            className="w-full pl-9 pr-8 py-2 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs sm:text-sm text-[#19261E] dark:text-[#E5ECE7] placeholder:text-[#87998E] focus:outline-none"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5C6E63] hover:text-[#19261E] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sort selector dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full sm:w-auto px-3 py-2 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] cursor-pointer"
            >
              <option value="distance">Sort: Nearest</option>
              <option value="price_asc">Price: Lowest</option>
              <option value="price_desc">Price: Highest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              isExpanded
                ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                : 'bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7] border-[#DCE2DC] dark:border-[#27352D]'
            }`}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Category Chips Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors border ${
                isActive
                  ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                  : 'bg-[#F7F9F7] dark:bg-[#151D18] text-[#5C6E63] dark:text-[#95A69B] hover:text-[#19261E] border-[#DCE2DC] dark:border-[#27352D]'
              }`}
            >
              {cat === 'All' ? 'All Machinery' : cat}
            </button>
          );
        })}
      </div>

      {/* Expandable Advanced Filter Drawer */}
      {isExpanded && (
        <div className="pt-3 border-t border-[#E2E6E2] dark:border-[#233027] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in duration-100">
          {/* Distance Chips */}
          <div>
            <label className="block text-[11px] font-semibold text-[#5C6E63] dark:text-[#95A69B] mb-1.5 uppercase">
              Distance Limit: <span className="text-[#1E3A2F] dark:text-[#A8BEB1] font-mono">{filters.maxDistanceKm} km</span>
            </label>
            <div className="flex items-center gap-1.5">
              {DISTANCES.map((d) => (
                <button
                  key={d}
                  onClick={() => onFilterChange({ ...filters, maxDistanceKm: d })}
                  className={`flex-1 py-1 text-xs font-medium rounded-md border transition-colors ${
                    filters.maxDistanceKm === d
                      ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                      : 'bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7] border-[#DCE2DC] dark:border-[#27352D]'
                  }`}
                >
                  {d} km
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-semibold text-[#5C6E63] dark:text-[#95A69B] mb-1 uppercase">
              <span>Max Hourly Rate</span>
              <span className="font-mono text-[#1E3A2F] dark:text-[#A8BEB1]">Rs {filters.maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min="300"
              max="3000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
              className="w-full accent-[#1E3A2F] cursor-pointer"
            />
          </div>

          {/* Inclusions Checkboxes & Reset */}
          <div className="flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#19261E] dark:text-[#E5ECE7]">
                <input
                  type="checkbox"
                  checked={filters.operatorIncluded || false}
                  onChange={(e) =>
                    onFilterChange({ ...filters, operatorIncluded: e.target.checked || undefined })
                  }
                  className="w-4 h-4 rounded text-[#1E3A2F] accent-[#1E3A2F]"
                />
                <span>Operator Included</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#19261E] dark:text-[#E5ECE7]">
                <input
                  type="checkbox"
                  checked={filters.fuelIncluded || false}
                  onChange={(e) =>
                    onFilterChange({ ...filters, fuelIncluded: e.target.checked || undefined })
                  }
                  className="w-4 h-4 rounded text-[#1E3A2F] accent-[#1E3A2F]"
                />
                <span>Fuel Included</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#5C6E63] dark:text-[#95A69B]">
                {totalResults} machinery matching
              </span>
              <button
                onClick={onResetFilters}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
