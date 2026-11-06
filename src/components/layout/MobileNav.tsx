import React from 'react';
import { useStore } from '../../services/store';
import { Home, MapPin, CalendarDays, User, PlusCircle } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const { userRole, bookings } = useStore();

  const pendingFarmerActions = bookings.filter(
    (b) => b.status === 'Approved' && b.paymentStatus === 'Pending'
  ).length;

  const pendingOwnerActions = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <nav
      className="md:hidden fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto bg-white/95 dark:bg-[#171F1A]/95 backdrop-blur-md rounded-xl border border-[#E2E6E2] dark:border-[#233027] shadow-matte-lg px-2 py-1 transition-all"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 items-center h-12">
        {/* Tab 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center h-full rounded-lg transition-colors ${
            currentTab === 'home'
              ? 'text-[#1E3A2F] dark:text-[#E5ECE7] font-semibold'
              : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
          }`}
          aria-label="Home"
        >
          <Home className={`w-4 h-4 ${currentTab === 'home' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Tab 2: Map */}
        <button
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center justify-center h-full rounded-lg transition-colors ${
            currentTab === 'map'
              ? 'text-[#1E3A2F] dark:text-[#E5ECE7] font-semibold'
              : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
          }`}
          aria-label="Map"
        >
          <MapPin className={`w-4 h-4 ${currentTab === 'map' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5">Map</span>
        </button>

        {/* Tab 3: Bookings or Add Equipment for Owner */}
        {userRole === 'farmer' ? (
          <button
            onClick={() => onSelectTab('bookings')}
            className={`flex flex-col items-center justify-center h-full rounded-lg transition-colors relative ${
              currentTab === 'bookings'
                ? 'text-[#1E3A2F] dark:text-[#E5ECE7] font-semibold'
                : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
            }`}
            aria-label="Bookings"
          >
            <div className="relative">
              <CalendarDays className={`w-4 h-4 ${currentTab === 'bookings' ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              {pendingFarmerActions > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B8762E]" />
              )}
            </div>
            <span className="text-[10px] mt-0.5">Bookings</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('add-equipment')}
            className={`flex flex-col items-center justify-center h-full rounded-lg transition-colors ${
              currentTab === 'add-equipment'
                ? 'text-[#1E3A2F] dark:text-[#E5ECE7] font-semibold'
                : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
            }`}
            aria-label="Add Equipment"
          >
            <PlusCircle className="w-4 h-4 stroke-[1.8] text-[#1E3A2F] dark:text-[#A8BEB1]" />
            <span className="text-[10px] mt-0.5">List Machine</span>
          </button>
        )}

        {/* Tab 4: Profile / Dashboard */}
        <button
          onClick={() => onSelectTab(userRole === 'owner' ? 'owner-dashboard' : 'profile')}
          className={`flex flex-col items-center justify-center h-full rounded-lg transition-colors relative ${
            currentTab === 'profile' || currentTab === 'owner-dashboard'
              ? 'text-[#1E3A2F] dark:text-[#E5ECE7] font-semibold'
              : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B]'
          }`}
          aria-label="Profile"
        >
          <div className="relative">
            <User
              className={`w-4 h-4 ${
                currentTab === 'profile' || currentTab === 'owner-dashboard'
                  ? 'stroke-[2.2]'
                  : 'stroke-[1.8]'
              }`}
            />
            {userRole === 'owner' && pendingOwnerActions > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B8762E]" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">
            {userRole === 'owner' ? 'Hub' : 'Profile'}
          </span>
        </button>
      </div>
    </nav>
  );
};
