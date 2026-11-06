import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Equipment } from '../../types';
import { useStore } from '../../services/store';
import { calculateDistanceKm, AP_REFERENCE_HUBS, getCurrentPositionAsync } from '../../utils/geo';
import {
  Navigation,
  MapPin,
  Star,
  Search,
  ChevronUp,
  ChevronDown,
  GitCompare,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface EquipmentMapProps {
  equipmentList: Equipment[];
  onSelectEquipment: (id: string) => void;
  onOpenCompare?: () => void;
}

export const EquipmentMap: React.FC<EquipmentMapProps> = ({
  equipmentList,
  onSelectEquipment,
  onOpenCompare,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const { userLocation, setUserLocation, compareList } = useStore();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'cheapest' | 'rating'>('nearest');
  const [mapSearch, setMapSearch] = useState('');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([userLocation.lat, userLocation.lng], map.getZoom() || 12);

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userDotIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(30, 58, 47, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #1E3A2F; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userDotIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`<b>You are here</b><br/>${userLocation.village}`);
    }
  }, [userLocation]);

  // Update Equipment Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    equipmentList.forEach((eq) => {
      const isSelected = selectedEquipment?.id === eq.id;
      const markerHtml = `
        <div class="custom-price-pill ${isSelected ? 'selected' : ''}">
          <span>Rs ${eq.pricePerHour}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'eq-price-pin',
        html: markerHtml,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      const marker = L.marker([eq.location.lat, eq.location.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedEquipment(eq);
        map.panTo([eq.location.lat, eq.location.lng]);
      });

      marker.addTo(layer);
    });
  }, [equipmentList, selectedEquipment]);

  // Geolocation trigger
  const handleGPS = async () => {
    setIsLocating(true);
    try {
      const pos = await getCurrentPositionAsync();
      setUserLocation({
        lat: pos.lat,
        lng: pos.lng,
        village: 'GPS Detected Location',
        district: 'Current Location',
      });
    } catch {
      alert('Could not acquire GPS position. Showing reference hub.');
    } finally {
      setIsLocating(false);
    }
  };

  // Filtered & sorted equipment list for bottom sheet
  const sortedEquipment = [...equipmentList]
    .filter((eq) => {
      if (!mapSearch.trim()) return true;
      const q = mapSearch.toLowerCase();
      return eq.name.toLowerCase().includes(q) || eq.category.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
      if (sortBy === 'nearest') return distA - distB;
      if (sortBy === 'cheapest') return a.pricePerHour - b.pricePerHour;
      if (sortBy === 'rating') return b.ratingAvg - a.ratingAvg;
      return 0;
    });

  return (
    <div className="relative w-full h-[620px] lg:h-[700px] rounded-xl overflow-hidden border border-[#E2E6E2] dark:border-[#233027] shadow-matte-sm bg-[#F7F9F7] flex flex-col">
      {/* Floating Search Bar & Location Controls at Top */}
      <div className="absolute top-3 left-3 right-3 z-30 space-y-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto max-w-lg">
          {/* Floating Search Input */}
          <div className="flex-1 bg-white dark:bg-[#171F1A] rounded-lg shadow-matte-sm border border-[#E2E6E2] dark:border-[#233027] px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#5C6E63] shrink-0" strokeWidth={1.8} />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Search field map for machinery..."
              className="w-full text-xs font-medium bg-transparent text-[#19261E] dark:text-[#E5ECE7] focus:outline-none"
            />
          </div>

          {/* GPS Locate Button */}
          <button
            onClick={handleGPS}
            disabled={isLocating}
            className="p-2.5 bg-[#1E3A2F] text-white rounded-lg shadow-matte-sm hover:bg-[#162E25] transition-colors flex items-center justify-center shrink-0"
            title="Locate with GPS"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" strokeWidth={1.8} />
            )}
          </button>

          {/* Hub Dropdown */}
          <select
            value={userLocation.village}
            onChange={(e) => {
              const hub = AP_REFERENCE_HUBS.find((h) => h.name === e.target.value);
              if (hub) {
                setUserLocation({ lat: hub.lat, lng: hub.lng, village: hub.name, district: hub.district });
              }
            }}
            className="bg-white/95 dark:bg-[#171F1A]/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#E2E6E2] dark:border-[#233027] text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] shadow-matte-sm cursor-pointer shrink-0"
          >
            {AP_REFERENCE_HUBS.map((h) => (
              <option key={h.name} value={h.name}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Full-width Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Expandable Bottom Sheet / Drawer */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#171F1A] rounded-t-xl border-t border-[#E2E6E2] dark:border-[#233027] shadow-matte-lg transition-all duration-300 flex flex-col ${
          isSheetExpanded ? 'h-[65%]' : 'h-[220px]'
        }`}
      >
        {/* Drag Handle & Header */}
        <div
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          className="pt-2 pb-2 px-5 cursor-pointer hover:bg-[#F7F9F7] dark:hover:bg-[#1E2922] rounded-t-xl transition-colors"
        >
          {/* Centered Drag Pill */}
          <div className="w-8 h-1 bg-[#DCE2DC] dark:bg-[#2A392F] rounded-full mx-auto mb-2" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#19261E] dark:text-[#E5ECE7] leading-none">
                {sortedEquipment.length} machines available in this cluster
              </h3>
              <p className="text-[11px] text-[#5C6E63] dark:text-[#95A69B] mt-0.5">
                Around {userLocation.village || 'Mylavaram'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {compareList.length > 0 && onOpenCompare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCompare();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#1E3A2F] rounded-md flex items-center gap-1 shadow-matte-sm"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare ({compareList.length})</span>
                </button>
              )}
              {isSheetExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#5C6E63]" />
              ) : (
                <ChevronUp className="w-4 h-4 text-[#5C6E63]" />
              )}
            </div>
          </div>

          {/* Sort Chips */}
          <div className="flex items-center gap-1.5 mt-2">
            {(['nearest', 'cheapest', 'rating'] as const).map((mode) => (
              <button
                key={mode}
                onClick={(e) => {
                  e.stopPropagation();
                  setSortBy(mode);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium capitalize transition-colors border ${
                  sortBy === mode
                    ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                    : 'bg-[#F7F9F7] dark:bg-[#151D18] text-[#5C6E63] dark:text-[#95A69B] border-[#DCE2DC] dark:border-[#27352D]'
                }`}
              >
                {mode === 'nearest' ? 'Nearest' : mode === 'cheapest' ? 'Cheapest' : 'Top Rated'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Compact Equipment Cards List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 divide-y divide-[#E2E6E2]/80 dark:divide-[#233027]">
          {sortedEquipment.map((eq) => {
            const dist = calculateDistanceKm(
              userLocation.lat,
              userLocation.lng,
              eq.location.lat,
              eq.location.lng
            );

            return (
              <div
                key={eq.id}
                onClick={() => {
                  setSelectedEquipment(eq);
                  mapInstanceRef.current?.panTo([eq.location.lat, eq.location.lng]);
                }}
                className="py-2.5 flex items-center justify-between gap-3 cursor-pointer group hover:bg-[#F7F9F7] dark:hover:bg-[#1E2922] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 border border-[#E2E6E2] dark:border-[#233027]">
                    <img
                      src={eq.images[0]}
                      alt={eq.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] truncate group-hover:text-[#1E3A2F]">
                      {eq.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#5C6E63] dark:text-[#95A69B] mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{dist} km</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-[#B8762E] text-[#B8762E]" />
                        <span>{eq.ratingAvg}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#1E3A2F] dark:text-[#A8BEB1] font-mono">
                      Rs {eq.pricePerHour}/hr
                    </div>
                    <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B]">
                      Rs {eq.pricePerDay}/d
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEquipment(eq.id);
                    }}
                    className="px-3 py-1.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-md shadow-matte-sm transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
