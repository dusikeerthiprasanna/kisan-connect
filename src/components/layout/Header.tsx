import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../services/store';
import {
  Tractor,
  Bell,
  Languages,
  User,
  ArrowUpDown,
  GitCompare,
  MapPin,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { NotificationCenter } from '../common/NotificationCenter';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenCompare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenCompare,
}) => {
  const { t, i18n } = useTranslation();
  const { currentUser, userRole, setUserRole, notifications, compareList, userLocation, theme, toggleTheme } =
    useStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const unreadNotifs = notifications.filter(
    (n) => (!currentUser || n.userId === currentUser.id) && !n.read
  ).length;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('kisan_lang', lang);
    setIsLangOpen(false);
  };

  const getLanguageLabel = () => {
    switch (i18n.language) {
      case 'te':
        return 'తెలుగు';
      case 'hi':
        return 'हिंदी';
      default:
        return 'EN';
    }
  };

  const toggleRole = () => {
    const nextRole = userRole === 'farmer' ? 'owner' : 'farmer';
    setUserRole(nextRole);
    if (nextRole === 'owner') {
      onSelectTab('owner-dashboard');
    } else {
      onSelectTab('explore');
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Find Machinery' },
    { id: 'map', label: 'Field Map' },
    { id: 'bookings', label: 'My Bookings' },
    { id: 'owner-dashboard', label: 'Owner Hub' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-[#151D18] border-b border-[#E2E6E2] dark:border-[#233027] transition-colors shadow-matte-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-2.5 text-left shrink-0 group"
              aria-label="Kisan Connect Home"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1E3A2F] dark:bg-[#28483B] flex items-center justify-center text-white shadow-matte-sm">
                <Tractor className="w-5 h-5 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-[#19261E] dark:text-[#E5ECE7] block leading-none">
                  KISAN CONNECT
                </span>
                <span className="text-[10px] font-semibold text-[#5C6E63] dark:text-[#95A69B] uppercase tracking-wider">
                  Agri Equipment Network
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Desktop Navigation">
              {navLinks.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EEF3EE] dark:bg-[#202E26] text-[#1E3A2F] dark:text-[#E5ECE7] font-semibold'
                        : 'text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] dark:hover:text-[#E5ECE7]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center-Right: Location Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F4F6F4] dark:bg-[#1A241F] border border-[#E2E6E2] dark:border-[#26352C] text-xs text-[#5C6E63] dark:text-[#95A69B]">
            <MapPin className="w-3.5 h-3.5 text-[#1E3A2F] dark:text-[#88C49E]" strokeWidth={1.8} />
            <span className="font-medium text-[#19261E] dark:text-[#E5ECE7]">
              {userLocation.village || 'Mylavaram'}, AP
            </span>
          </div>

          {/* Right: Actions (Compare, Role, Theme, Language, Notifications, Profile) */}
          <div className="flex items-center gap-2">
            {/* Compare Counter */}
            {compareList.length > 0 && (
              <button
                onClick={onOpenCompare}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-[#1E3A2F] hover:bg-[#162E25] rounded-md shadow-matte-sm transition-all"
                title="Compare selected machinery"
              >
                <GitCompare className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Compare ({compareList.length})</span>
              </button>
            )}

            {/* Role switch toggle */}
            <button
              onClick={toggleRole}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[#DCE2DC] dark:border-[#2A392F] text-[#19261E] dark:text-[#E5ECE7] hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922] transition-colors"
              title="Switch user mode"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5C6E63] dark:text-[#95A69B]" strokeWidth={1.8} />
              <span>{userRole === 'farmer' ? 'Farmer View' : 'Owner Hub'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] dark:hover:text-[#E5ECE7] rounded-md hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#D2924A]" strokeWidth={1.8} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.8} />
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#19261E] dark:text-[#E5ECE7] hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922] rounded-md transition-colors min-h-[36px]"
                aria-label="Language"
              >
                <Languages className="w-3.5 h-3.5 text-[#5C6E63] dark:text-[#95A69B]" strokeWidth={1.8} />
                <span>{getLanguageLabel()}</span>
                <ChevronDown className="w-3 h-3 text-[#5C6E63]" strokeWidth={1.8} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#171F1A] rounded-lg shadow-matte-lg border border-[#E2E6E2] dark:border-[#233027] py-1 z-50">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      i18n.language === 'en'
                        ? 'font-semibold text-[#1E3A2F] dark:text-[#A8BEB1] bg-[#EEF3EE] dark:bg-[#1F2C24]'
                        : 'text-[#19261E] dark:text-[#E5ECE7] hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLanguageChange('te')}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      i18n.language === 'te'
                        ? 'font-semibold text-[#1E3A2F] dark:text-[#A8BEB1] bg-[#EEF3EE] dark:bg-[#1F2C24]'
                        : 'text-[#19261E] dark:text-[#E5ECE7] hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922]'
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className={`w-full text-left px-3 py-1.5 text-xs ${
                      i18n.language === 'hi'
                        ? 'font-semibold text-[#1E3A2F] dark:text-[#A8BEB1] bg-[#EEF3EE] dark:bg-[#1F2C24]'
                        : 'text-[#19261E] dark:text-[#E5ECE7] hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922]'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-[#5C6E63] hover:text-[#19261E] dark:text-[#95A69B] dark:hover:text-[#E5ECE7] rounded-md hover:bg-[#F4F6F4] dark:hover:bg-[#1E2922] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" strokeWidth={1.8} />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B8762E]" />
              )}
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={() => onSelectTab('profile')}
              className="w-8 h-8 rounded-md bg-[#1E3A2F] dark:bg-[#28483B] text-white flex items-center justify-center text-xs font-medium shadow-matte-sm"
              title="Profile"
            >
              {currentUser?.name ? (
                currentUser.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4 text-white" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notification Center Slide-over */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateToBooking={() => {
          onSelectTab(userRole === 'owner' ? 'owner-dashboard' : 'bookings');
        }}
      />
    </>
  );
};
