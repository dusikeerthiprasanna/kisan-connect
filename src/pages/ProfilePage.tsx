import React, { useState } from 'react';
import { useStore } from '../services/store';
import { useTranslation } from 'react-i18next';
import { AP_REFERENCE_HUBS } from '../utils/geo';
import {
  User,
  Phone,
  MapPin,
  ArrowUpDown,
  LogOut,
  CalendarDays,
  ShieldCheck,
  Sun,
  Moon,
  Languages,
  Wifi,
  WifiOff,
  RefreshCw,
  Heart,
  Check,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigateToBookings: () => void;
  onNavigateToDashboard: () => void;
  onOpenAuth: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigateToBookings,
  onNavigateToDashboard,
  onOpenAuth,
}) => {
  const { i18n } = useTranslation();
  const {
    currentUser,
    userRole,
    setUserRole,
    userLocation,
    setUserLocation,
    logout,
    bookings,
    theme,
    toggleTheme,
    isOnline,
    pendingSyncCount,
    syncOfflineData,
    isSyncing,
    savedEquipmentIds,
  } = useStore();

  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [village, setVillage] = useState(userLocation.village);
  const [selectedHub, setSelectedHub] = useState(AP_REFERENCE_HUBS[0].name);

  if (!currentUser) {
    return (
      <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-xl bg-[#EEF2EE] dark:bg-[#1A2620] flex items-center justify-center mx-auto text-[#1E3A2F] dark:text-[#A8BEB1]">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#19261E] dark:text-[#E5ECE7]">
          Sign in to KISAN CONNECT
        </h2>
        <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
          Log in with phone number to view your bookings and machinery listings.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-[#1E3A2F] hover:bg-[#162E25] text-white text-xs font-semibold rounded-md shadow-matte-sm transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveLocation = () => {
    const hub = AP_REFERENCE_HUBS.find((h) => h.name === selectedHub) || AP_REFERENCE_HUBS[0];
    setUserLocation({
      lat: hub.lat,
      lng: hub.lng,
      village: village.trim() || hub.name,
      district: hub.district,
    });
    setIsEditingLoc(false);
  };

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('kisan_lang', lang);
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#19261E] dark:text-[#E5ECE7] tracking-tight">
          User Account & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6E63] dark:text-[#95A69B]">
          Manage your agricultural profile, language, and regional location
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white dark:bg-[#171F1A] rounded-xl border border-[#E2E6E2] dark:border-[#233027] p-6 shadow-matte-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#1E3A2F] text-white flex items-center justify-center text-xl font-bold shadow-matte-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#19261E] dark:text-[#E5ECE7]">
                {currentUser.name}
              </h2>
              <ShieldCheck className="w-4 h-4 text-[#245835]" strokeWidth={2} />
            </div>
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B] font-mono mt-0.5">
              {currentUser.phone}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#5C6E63] dark:text-[#95A69B] mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {userLocation.village}, {userLocation.district}
              </span>
            </div>
          </div>
        </div>

        {/* Role Toggle Switch */}
        <div className="p-3.5 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase block">
              Active Portal Role
            </span>
            <span className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] capitalize">
              {userRole === 'farmer' ? 'Farmer (Machinery Renter)' : 'Machinery Owner (Fleet Lister)'}
            </span>
          </div>

          <button
            onClick={() => setUserRole(userRole === 'farmer' ? 'owner' : 'farmer')}
            className="px-3 py-1.5 bg-white dark:bg-[#1A2620] text-[#19261E] dark:text-[#E5ECE7] border border-[#DCE2DC] dark:border-[#27352D] rounded-md text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F0F2F0] transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Switch Role</span>
          </button>
        </div>

        {/* Theme & Language Quick Preferences */}
        <div className="space-y-3 pt-3 border-t border-[#E2E6E2] dark:border-[#233027]">
          <h3 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
            Display & Connectivity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg bg-[#F7F9F7] dark:bg-[#151D18] border border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between text-left"
            >
              <div>
                <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B] block">Color Theme</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                  {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
                </span>
              </div>
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#D2924A]" />
              ) : (
                <Sun className="w-4 h-4 text-[#5C6E63]" />
              )}
            </button>

            {/* Offline Sync State Card */}
            <div className="p-3 rounded-lg bg-[#F7F9F7] dark:bg-[#151D18] border border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#5C6E63] dark:text-[#95A69B] block">Network State</span>
                <span className="font-semibold text-[#19261E] dark:text-[#E5ECE7]">
                  {isOnline ? 'Online (Synced)' : 'Offline Local Storage'}
                </span>
              </div>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-[#245835]" />
              ) : (
                <WifiOff className="w-4 h-4 text-[#B8762E]" />
              )}
            </div>
          </div>

          {/* Language Selector Chips */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#5C6E63] dark:text-[#95A69B] block mb-1.5">
              Application Language
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'te', label: 'తెలుగు (Telugu)' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`py-2 px-2 text-center rounded-lg text-xs font-medium border transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-[#1E3A2F] text-white border-[#1E3A2F]'
                      : 'bg-[#F7F9F7] dark:bg-[#151D18] text-[#19261E] dark:text-[#E5ECE7] border-[#DCE2DC] dark:border-[#27352D] hover:bg-[#F0F2F0]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location Change */}
        <div className="space-y-2 pt-3 border-t border-[#E2E6E2] dark:border-[#233027]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] uppercase tracking-wider">
              Base Farmland Location
            </h3>
            <button
              onClick={() => setIsEditingLoc(!isEditingLoc)}
              className="text-xs font-semibold text-[#1E3A2F] dark:text-[#A8BEB1] hover:underline"
            >
              {isEditingLoc ? 'Cancel' : 'Change Location'}
            </button>
          </div>

          {isEditingLoc ? (
            <div className="p-3 bg-[#F7F9F7] dark:bg-[#151D18] rounded-lg border border-[#E2E6E2] dark:border-[#233027] space-y-2 text-xs">
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="w-full p-2 bg-white dark:bg-[#1A2620] border border-[#DCE2DC] dark:border-[#27352D] rounded-md text-xs font-medium"
              >
                {AP_REFERENCE_HUBS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name} ({h.district})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Village / Mandal name"
                className="w-full p-2 bg-white dark:bg-[#1A2620] border border-[#DCE2DC] dark:border-[#27352D] rounded-md text-xs font-medium"
              />
              <button
                onClick={handleSaveLocation}
                className="w-full py-2 bg-[#1E3A2F] text-white rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Base Location</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#5C6E63] dark:text-[#95A69B]">
              Distances to all nearby tractors, combine harvesters, and sprayers are measured from {userLocation.village}, {userLocation.district}.
            </p>
          )}
        </div>

        {/* Quick Nav Links */}
        <div className="space-y-2 pt-3 border-t border-[#E2E6E2] dark:border-[#233027]">
          <button
            onClick={onNavigateToBookings}
            className="w-full p-3 bg-[#F7F9F7] dark:bg-[#151D18] hover:bg-[#EEF2EE] rounded-lg border border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] transition-colors"
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#1E3A2F] dark:text-[#A8BEB1]" />
              <span>View My Reservations</span>
            </span>
            <span className="font-mono text-[#5C6E63]">({bookings.length})</span>
          </button>

          {userRole === 'owner' && (
            <button
              onClick={onNavigateToDashboard}
              className="w-full p-3 bg-[#F7F9F7] dark:bg-[#151D18] hover:bg-[#EEF2EE] rounded-lg border border-[#E2E6E2] dark:border-[#233027] flex items-center justify-between text-xs font-semibold text-[#19261E] dark:text-[#E5ECE7] transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B8762E]" />
                <span>Owner Dashboard & Rental Requests</span>
              </span>
              <span className="text-[#1E3A2F] dark:text-[#A8BEB1]">Open Hub</span>
            </button>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full py-2.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
