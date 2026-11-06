import React, { useState } from 'react';
import { useStore } from '../services/store';
import { EquipmentCategory } from '../types';
import { AP_REFERENCE_HUBS } from '../utils/geo';
import { ArrowLeft, MapPin, Check, Plus, Camera } from 'lucide-react';

interface AddEquipmentPageProps {
  onBack: () => void;
  onSuccess: (id: string) => void;
}

const CATEGORIES: EquipmentCategory[] = [
  'Tractor',
  'Harvester',
  'Drone Sprayer',
  'Cultivator',
  'Rotavator',
  'Sprayer',
  'Seed Drill',
  'Water Tanker',
  'Plough',
];

const PRESET_PHOTOS: Record<EquipmentCategory, string> = {
  Tractor: '/images/tractor_red.jpg',
  Harvester: '/images/harvester.jpg',
  'Drone Sprayer': '/images/drone_sprayer.jpg',
  Cultivator: '/images/cultivator.jpg',
  Rotavator: '/images/rotavator.jpg',
  Sprayer: '/images/sprayer.jpg',
  'Seed Drill': '/images/seed_drill.jpg',
  'Water Tanker': '/images/water_tanker.jpg',
  Plough: '/images/plough.jpg',
};

export const AddEquipmentPage: React.FC<AddEquipmentPageProps> = ({
  onBack,
  onSuccess,
}) => {
  const { addEquipment, currentUser, userLocation } = useStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('Tractor');
  const [brand, setBrand] = useState('Mahindra');
  const [model, setModel] = useState('575 DI');
  const [hp, setHp] = useState<number>(45);
  const [pricePerHour, setPricePerHour] = useState<number>(650);
  const [pricePerDay, setPricePerDay] = useState<number>(5000);
  const [description, setDescription] = useState('');
  const [selectedHub, setSelectedHub] = useState(AP_REFERENCE_HUBS[0].name);
  const [village, setVillage] = useState('Mylavaram');
  const [operatorIncluded, setOperatorIncluded] = useState(true);
  const [fuelIncluded, setFuelIncluded] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(PRESET_PHOTOS.Tractor);

  const handleCategoryChange = (cat: EquipmentCategory) => {
    setCategory(cat);
    setPhotoPreview(PRESET_PHOTOS[cat]);
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoPreview(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const hub = AP_REFERENCE_HUBS.find((h) => h.name === selectedHub) || AP_REFERENCE_HUBS[0];

    const newEq = addEquipment({
      ownerId: currentUser?.id || 'owner-101',
      ownerName: currentUser?.name || 'Venkateswara Rao',
      ownerPhone: currentUser?.phone || '+91 98480 12345',
      ownerRating: 5.0,
      ownerReviewCount: 1,
      name: name.trim(),
      category,
      brand: brand.trim(),
      model: model.trim(),
      description:
        description.trim() ||
        `${hp ? `${hp} HP ` : ''}${category} ready for immediate deployment in ${village}, ${hub.district}.`,
      images: [photoPreview],
      pricePerHour,
      pricePerDay,
      location: {
        lat: hub.lat,
        lng: hub.lng,
        village: village.trim() || hub.name,
        district: hub.district,
      },
      specs: {
        hp: hp || undefined,
        fuelType: 'Diesel',
        modelYear: 2024,
      },
      operatorIncluded,
      fuelIncluded,
      isAvailable: true,
    });

    onSuccess(newEq.id);
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] dark:hover:text-[#E5ECE7] rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] tracking-tight">
            Register Farm Machinery
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6E63] dark:text-[#95A69B]">
            Publish your agricultural equipment for nearby farmers in Andhra Pradesh
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-6 shadow-matte-sm space-y-6"
      >
        {/* Category Choice */}
        <div>
          <label className="block text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider mb-2">
            Select Category *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`py-2 px-2 text-center rounded-lg text-xs font-medium border transition-colors ${
                  category === cat
                    ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                    : 'bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7] border-[#DCE2DC] dark:border-[#27352D] hover:bg-[#F0F2F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Machine Photo Upload */}
        <div>
          <label className="block text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider mb-2">
            Machinery Photo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#F2F5F2] dark:bg-[#1C2620] border border-[#E2E6E2] dark:border-[#233027] shrink-0">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="flex-1 cursor-pointer py-4 px-4 bg-[#F7F9F7] dark:bg-[#151D18] hover:bg-[#EEF2EE] rounded-lg border border-dashed border-[#B0BEB5] text-center flex flex-col items-center justify-center transition-colors">
              <Camera className="w-5 h-5 text-[#1E3A2F] dark:text-[#A8BEB1] mb-1" />
              <span className="text-xs font-semibold text-[#1E3A2F] dark:text-[#A8BEB1]">
                Upload Machine Image
              </span>
              <span className="text-[10px] text-[#5C6E63] mt-0.5">PNG, JPG up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSimulatePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Equipment Name & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">
              Machinery Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mahindra 575 DI PowerPro"
              className="w-full p-2.5 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">
              Horsepower / Power Rating (HP)
            </label>
            <input
              type="number"
              value={hp}
              onChange={(e) => setHp(parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 45"
              className="w-full p-2.5 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] focus:outline-none"
            />
          </div>
        </div>

        {/* Pricing Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2] dark:border-[#233027]">
          <div>
            <label className="block text-xs font-medium text-[#5C6E63] dark:text-[#95A69B] mb-1">
              Price per Hour (Rs) *
            </label>
            <input
              type="number"
              required
              min={100}
              value={pricePerHour}
              onChange={(e) => setPricePerHour(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-white dark:bg-[#1A2620] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-bold font-mono text-[#1E3A2F] dark:text-[#A8BEB1]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5C6E63] dark:text-[#95A69B] mb-1">
              Price per Full Day / 8 hrs (Rs) *
            </label>
            <input
              type="number"
              required
              min={1000}
              value={pricePerDay}
              onChange={(e) => setPricePerDay(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-white dark:bg-[#1A2620] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-bold font-mono text-[#1E3A2F] dark:text-[#A8BEB1]"
            />
          </div>
        </div>

        {/* Location & Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">
              Operating Cluster Hub *
            </label>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="w-full p-2.5 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-medium text-[#19261E] dark:text-[#E5ECE7]"
            >
              {AP_REFERENCE_HUBS.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name} ({h.district})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] mb-1">
              Village / Mandal Location *
            </label>
            <input
              type="text"
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Mylavaram Rural"
              className="w-full p-2.5 bg-[#F7F9F7] dark:bg-[#151D18] border border-[#DCE2DC] dark:border-[#27352D] rounded-lg text-xs font-medium text-[#19261E] dark:text-[#E5ECE7]"
            />
          </div>
        </div>

        {/* Inclusions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center gap-2 p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2] dark:border-[#233027] cursor-pointer">
            <input
              type="checkbox"
              checked={operatorIncluded}
              onChange={(e) => setOperatorIncluded(e.target.checked)}
              className="w-4 h-4 rounded text-[#1E3A2F] accent-[#1E3A2F]"
            />
            <span className="font-medium text-[#19261E] dark:text-[#E5ECE7]">Expert Operator Included</span>
          </label>

          <label className="flex items-center gap-2 p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2] dark:border-[#233027] cursor-pointer">
            <input
              type="checkbox"
              checked={fuelIncluded}
              onChange={(e) => setFuelIncluded(e.target.checked)}
              className="w-4 h-4 rounded text-[#1E3A2F] accent-[#1E3A2F]"
            />
            <span className="font-medium text-[#19261E] dark:text-[#E5ECE7]">Diesel / Fuel Included</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-lg shadow-matte-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Publish Machinery Listing</span>
        </button>
      </form>
    </div>
  );
};
