import React from 'react';
import { EquipmentCategory } from '../../types';
import {
  Tractor,
  Wheat,
  Droplets,
  Sprout,
  Plane,
  Truck,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface CategoryIconProps {
  category: EquipmentCategory | 'All';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'md',
  className = '',
}) => {
  const getIcon = () => {
    const iconClass = "w-5 h-5 text-[#1E3A2F] dark:text-[#A8BEB1]";
    switch (category) {
      case 'Tractor':
        return <Tractor className={iconClass} strokeWidth={1.8} />;
      case 'Harvester':
        return <Wheat className={iconClass} strokeWidth={1.8} />;
      case 'Sprayer':
        return <Droplets className={iconClass} strokeWidth={1.8} />;
      case 'Drone Sprayer':
        return <Plane className={iconClass} strokeWidth={1.8} />;
      case 'Cultivator':
      case 'Rotavator':
        return <Sprout className={iconClass} strokeWidth={1.8} />;
      case 'Water Tanker':
        return <Truck className={iconClass} strokeWidth={1.8} />;
      case 'Seed Drill':
      case 'Plough':
        return <Wrench className={iconClass} strokeWidth={1.8} />;
      default:
        return <Sparkles className={iconClass} strokeWidth={1.8} />;
    }
  };

  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : size === 'lg'
      ? 'w-12 h-12 rounded-xl'
      : 'w-10 h-10 rounded-lg';

  return (
    <div
      className={`${dimensions} bg-[#EEF3EE] dark:bg-[#1A2620] border border-[#DCE4DC] dark:border-[#26382E] flex items-center justify-center shrink-0 shadow-matte-sm ${className}`}
    >
      {getIcon()}
    </div>
  );
};
