import React from 'react';
import { Equipment } from '../../types';
import { useStore } from '../../services/store';
import { calculateDistanceKm } from '../../utils/geo';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  MapPin,
  Star,
  Heart,
  CalendarCheck,
  UserCheck,
  Fuel,
  GitCompare,
  ArrowRight,
} from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
  onViewDetails: (id: string) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onViewDetails,
}) => {
  const { userLocation, compareList, toggleCompare, savedEquipmentIds, toggleBookmark } =
    useStore();

  const isCompared = compareList.includes(equipment.id);
  const isBookmarked = savedEquipmentIds.includes(equipment.id);
  const distance = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    equipment.location.lat,
    equipment.location.lng
  );

  const getAvailabilityPill = () => {
    if (!equipment.isAvailable) {
      return {
        label: 'Under Maintenance',
        className: 'bg-[#F2F4F2] dark:bg-[#1C2520] text-[#63736A] dark:text-[#8D9F94] border-[#DCE2DC] dark:border-[#27352D]',
      };
    }
    const today = new Date().toISOString().split('T')[0];
    if (equipment.blockedDates.includes(today)) {
      return {
        label: 'Booked Today',
        className: 'bg-[#FAF4EB] dark:bg-[#251E14] text-[#785623] dark:text-[#DDB278] border-[#EAE0CF] dark:border-[#3D301E]',
      };
    }
    return {
      label: 'Available Today',
      className: 'bg-[#EEF5F0] dark:bg-[#182B1F] text-[#245835] dark:text-[#97D2AC] border-[#CCE0D2] dark:border-[#254631]',
    };
  };

  const pill = getAvailabilityPill();

  return (
    <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] shadow-matte-sm hover:shadow-matte transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Cover Photo with Category Tag & Bookmark */}
        <div className="relative aspect-[16/10] w-full bg-[#F2F5F2] dark:bg-[#1C2620] overflow-hidden">
          {equipment.images && equipment.images[0] ? (
            <img
              src={equipment.images[0]}
              alt={equipment.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon category={equipment.category} size="lg" />
            </div>
          )}

          {/* Category Tag */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-white/90 dark:bg-[#171F1A]/90 backdrop-blur-xs text-[#19261E] dark:text-[#E5ECE7] px-2 py-0.5 rounded border border-[#E2E6E2]/80 dark:border-[#233027]">
              {equipment.category}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark(equipment.id)}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-md bg-white/90 dark:bg-[#171F1A]/90 backdrop-blur-xs flex items-center justify-center text-[#5C6E63] hover:text-rose-500 transition-colors border border-[#E2E6E2]/80 dark:border-[#233027]"
            aria-label="Save"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isBookmarked ? 'fill-rose-500 text-rose-500' : 'stroke-[1.8]'
              }`}
            />
          </button>

          {/* Availability Pill */}
          <div className="absolute bottom-2.5 left-2.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border shadow-matte-sm ${pill.className}`}
            >
              <CalendarCheck className="w-3 h-3" strokeWidth={1.8} />
              <span>{pill.label}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Title & Owner */}
          <div>
            <h3
              onClick={() => onViewDetails(equipment.id)}
              className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] hover:text-[#1E3A2F] dark:hover:text-[#A8BEB1] cursor-pointer line-clamp-1 transition-colors"
            >
              {equipment.name}
            </h3>
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] truncate mt-0.5">
              Owner: {equipment.ownerName} · {equipment.location.village}
            </p>
          </div>

          {/* Distance & Rating */}
          <div className="flex items-center justify-between text-xs text-[#5C6E63] dark:text-[#95A69B] pt-1">
            <span className="flex items-center gap-1 font-medium text-[#19261E] dark:text-[#E5ECE7]">
              <MapPin className="w-3.5 h-3.5 text-[#5C6E63] dark:text-[#95A69B]" strokeWidth={1.8} />
              <span>{distance} km away</span>
            </span>

            <span className="flex items-center gap-1 text-[#19261E] dark:text-[#E5ECE7] font-medium">
              <Star className="w-3.5 h-3.5 fill-[#B8762E] text-[#B8762E]" strokeWidth={1.8} />
              <span>{equipment.ratingAvg}</span>
              <span className="text-[#5C6E63] dark:text-[#95A69B] font-normal text-[11px]">
                ({equipment.ratingCount})
              </span>
            </span>
          </div>

          {/* Specs strip */}
          <div className="flex items-center gap-2.5 text-[11px] text-[#5C6E63] dark:text-[#95A69B] pt-2 border-t border-[#E2E6E2]/80 dark:border-[#233027]">
            {equipment.specs.hp && (
              <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                {equipment.specs.hp} HP
              </span>
            )}
            <span>·</span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-[#5C6E63]" strokeWidth={1.8} />
              <span>{equipment.operatorIncluded ? 'Operator incl.' : 'Self drive'}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3 h-3 text-[#5C6E63]" strokeWidth={1.8} />
              <span>{equipment.fuelIncluded ? 'Fuel incl.' : 'Fuel extra'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="px-4 py-3 bg-[#F9FAF9] dark:bg-[#151D18] border-t border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline">
            <span className="text-base font-bold text-[#1E3A2F] dark:text-[#A8BEB1] tracking-tight">
              Rs {equipment.pricePerHour}
            </span>
            <span className="text-xs text-[#5C6E63] dark:text-[#95A69B] ml-1 font-normal">
              /hr
            </span>
          </div>
          <span className="text-[11px] text-[#5C6E63] dark:text-[#95A69B] block">
            Rs {equipment.pricePerDay} /day
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Compare Button */}
          <button
            onClick={() => toggleCompare(equipment.id)}
            className={`p-2 rounded-md text-xs border transition-all ${
              isCompared
                ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                : 'bg-white dark:bg-[#1C2520] text-[#5C6E63] border-[#DCE2DC] dark:border-[#2A392F] hover:text-[#19261E]'
            }`}
            title="Compare"
            aria-label="Compare"
          >
            <GitCompare className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>

          {/* Solid Matte Book Button */}
          <button
            onClick={() => onViewDetails(equipment.id)}
            className="px-3.5 py-1.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-md shadow-matte-sm transition-colors flex items-center gap-1"
          >
            <span>Book</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
