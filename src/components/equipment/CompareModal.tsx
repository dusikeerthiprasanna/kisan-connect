import React from 'react';
import { useStore } from '../../services/store';
import { calculateDistanceKm } from '../../utils/geo';
import { useTranslation } from 'react-i18next';
import {
  X,
  Star,
  MapPin,
  Check,
  CheckCircle2,
  Minus,
  Trash2,
  Tractor,
} from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipment: (id: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  onSelectEquipment,
}) => {
  const { equipment, compareList, toggleCompare, clearCompare, userLocation } = useStore();

  if (!isOpen) return null;

  const comparedItems = equipment.filter((eq) => compareList.includes(eq.id));

  // Determine best value in each category for the green check badge
  const minPerHour = Math.min(...comparedItems.map((i) => i.pricePerHour));
  const minPerDay = Math.min(...comparedItems.map((i) => i.pricePerDay));
  const maxRating = Math.max(...comparedItems.map((i) => i.ratingAvg));
  const distances = comparedItems.map((i) =>
    calculateDistanceKm(userLocation.lat, userLocation.lng, i.location.lat, i.location.lng)
  );
  const minDistance = Math.min(...distances);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#171F1A] rounded-xl shadow-matte-lg flex flex-col overflow-hidden border border-[#E2E6E2] dark:border-[#233027]"
        role="dialog"
        aria-label="Machinery Comparison"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between bg-[#F7F9F7] dark:bg-[#151D18]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#19261E] dark:text-[#E5ECE7]">
              Side-by-Side Machinery Comparison
            </h2>
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
              Comparing {comparedItems.length} of max 3 machinery options · Best values highlighted
            </p>
          </div>
          <div className="flex items-center gap-2">
            {comparedItems.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] rounded-md hover:bg-[#F0F2F0] dark:hover:bg-[#1E2922] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          {comparedItems.length === 0 ? (
            <div className="py-16 text-center text-[#5C6E63] dark:text-[#95A69B]">
              <Tractor className="w-12 h-12 mx-auto stroke-[#1E3A2F] mb-3 opacity-60" />
              <p className="text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                No machinery selected for comparison
              </p>
              <p className="text-xs mt-1">
                Tap the "Compare" icon on any machinery card to compare side-by-side.
              </p>
            </div>
          ) : (
            <div className="min-w-[620px]">
              {/* Product Header Cards */}
              <div className="grid grid-cols-4 gap-4 pb-4 border-b border-[#E2E6E2] dark:border-[#233027]">
                <div className="text-xs font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase tracking-wider flex items-end pb-2">
                  Machinery
                </div>
                {comparedItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => toggleCompare(item.id)}
                      className="absolute top-1.5 right-1.5 z-10 p-1 bg-white/90 dark:bg-black/80 rounded-md text-stone-500 hover:text-rose-600 shadow-matte-sm"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="aspect-[16/10] rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 mb-2 border border-[#E2E6E2] dark:border-[#233027]">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase block">
                      {item.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] line-clamp-1">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => {
                        onSelectEquipment(item.id);
                        onClose();
                      }}
                      className="mt-2 w-full py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] hover:bg-[#162E25] rounded-md shadow-matte-sm transition-colors"
                    >
                      Book Machinery
                    </button>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="divide-y divide-[#E2E6E2]/80 dark:divide-[#233027] text-xs sm:text-sm">
                {/* Price / Hour */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="font-medium text-[#5C6E63] dark:text-[#95A69B]">Price / Hour</div>
                  {comparedItems.map((item) => {
                    const isBest = item.pricePerHour === minPerHour;
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#1E3A2F] dark:text-[#A8BEB1] text-sm sm:text-base">
                          Rs {item.pricePerHour}
                          <span className="text-xs font-normal text-[#5C6E63] dark:text-[#95A69B]">/hr</span>
                        </span>
                        {isBest && (
                          <span className="inline-flex items-center text-[10px] text-[#245835] bg-[#EEF5F0] dark:bg-[#1A2E22] px-1.5 py-0.5 rounded font-semibold border border-[#CCE0D2] dark:border-[#2C4D39]">
                            <Check className="w-3 h-3 mr-0.5" /> Best
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Price / Day */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="font-medium text-[#5C6E63] dark:text-[#95A69B]">Price / Day</div>
                  {comparedItems.map((item) => {
                    const isBest = item.pricePerDay === minPerDay;
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <span className="font-mono font-medium text-[#19261E] dark:text-[#E5ECE7]">
                          Rs {item.pricePerDay}
                          <span className="text-xs font-normal text-[#5C6E63] dark:text-[#95A69B]">/day</span>
                        </span>
                        {isBest && (
                          <span className="inline-flex items-center text-[10px] text-[#245835] bg-[#EEF5F0] dark:bg-[#1A2E22] px-1.5 py-0.5 rounded font-semibold border border-[#CCE0D2] dark:border-[#2C4D39]">
                            <Check className="w-3 h-3 mr-0.5" /> Best
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Distance */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="font-medium text-[#5C6E63] dark:text-[#95A69B]">Distance</div>
                  {comparedItems.map((item) => {
                    const dist = calculateDistanceKm(
                      userLocation.lat,
                      userLocation.lng,
                      item.location.lat,
                      item.location.lng
                    );
                    const isBest = dist === minDistance;
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5C6E63]" />
                        <span className="font-medium text-[#19261E] dark:text-[#E5ECE7]">
                          {dist} km
                        </span>
                        {isBest && (
                          <span className="inline-flex items-center text-[10px] text-[#245835] bg-[#EEF5F0] dark:bg-[#1A2E22] px-1.5 py-0.5 rounded font-semibold border border-[#CCE0D2] dark:border-[#2C4D39]">
                            <Check className="w-3 h-3 mr-0.5" /> Nearest
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rating */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="font-medium text-[#5C6E63] dark:text-[#95A69B]">Rating</div>
                  {comparedItems.map((item) => {
                    const isBest = item.ratingAvg === maxRating;
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-[#B8762E] text-[#B8762E]" />
                        <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                          {item.ratingAvg}
                        </span>
                        <span className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
                          ({item.ratingCount})
                        </span>
                        {isBest && (
                          <span className="inline-flex items-center text-[10px] text-[#245835] bg-[#EEF5F0] dark:bg-[#1A2E22] px-1.5 py-0.5 rounded font-semibold border border-[#CCE0D2] dark:border-[#2C4D39]">
                            <Check className="w-3 h-3 mr-0.5" /> Top
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Operator Included */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="font-medium text-[#5C6E63] dark:text-[#95A69B]">Operator</div>
                  {comparedItems.map((item) => (
                    <div key={item.id}>
                      {item.operatorIncluded ? (
                        <span className="text-[#245835] dark:text-[#88C49E] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Included
                        </span>
                      ) : (
                        <span className="text-[#5C6E63] dark:text-[#95A69B] flex items-center gap-1">
                          <Minus className="w-4 h-4" /> Self-drive
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Fuel Included */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="font-medium text-[#5C6E63] dark:text-[#95A69B]">Fuel</div>
                  {comparedItems.map((item) => (
                    <div key={item.id}>
                      {item.fuelIncluded ? (
                        <span className="text-[#245835] dark:text-[#88C49E] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Included
                        </span>
                      ) : (
                        <span className="text-[#5C6E63] dark:text-[#95A69B] flex items-center gap-1">
                          <Minus className="w-4 h-4" /> Extra
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Owner */}
                <div className="grid grid-cols-4 gap-4 py-3 items-center">
                  <div className="font-medium text-[#5C6E63] dark:text-[#95A69B]">Owner</div>
                  {comparedItems.map((item) => (
                    <div key={item.id} className="text-[#19261E] dark:text-[#E5ECE7] truncate font-medium">
                      {item.ownerName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
