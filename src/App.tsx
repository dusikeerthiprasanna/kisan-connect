import React, { useState } from 'react';
import { StoreProvider, useStore } from './services/store';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { CompareModal } from './components/equipment/CompareModal';
import { AskKisanRent } from './components/ai/AskKisanRent';
import { OfflineSyncBanner } from './components/common/OfflineSyncBanner';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { EquipmentDetailsPage } from './pages/EquipmentDetailsPage';
import { BookingsPage } from './pages/BookingsPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AddEquipmentPage } from './pages/AddEquipmentPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthModal } from './pages/AuthModal';
import { EquipmentCategory } from './types';
import './i18n';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'All'>('All');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { theme } = useStore();

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEquipment = (id: string) => {
    setSelectedEquipmentId(id);
    setCurrentTab('equipment-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreCategory = (category?: EquipmentCategory | 'All') => {
    setSelectedCategory(category || 'All');
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingComplete = (_bookingId: string) => {
    setCurrentTab('bookings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddEquipmentSuccess = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setCurrentTab('owner-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] dark:bg-[#101512] text-[#19261E] dark:text-[#E5ECE7] flex flex-col transition-colors duration-200">
      {/* Offline / Background Sync Notification Banner */}
      <OfflineSyncBanner />

      {/* Top Responsive Header (Desktop Nav + Mobile Controls) */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      {/* Main Responsive Canvas (max-w-7xl fluid layout) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'home' && (
          <HomePage
            onNavigateToExplore={handleExploreCategory}
            onNavigateToMap={() => handleSelectTab('map')}
            onSelectEquipment={handleSelectEquipment}
            onOpenAssistant={() => {}}
          />
        )}

        {currentTab === 'explore' && (
          <SearchPage
            initialCategory={selectedCategory}
            initialViewMode="list"
            onSelectEquipment={handleSelectEquipment}
            onOpenCompare={() => setIsCompareOpen(true)}
          />
        )}

        {currentTab === 'map' && (
          <SearchPage
            initialCategory={selectedCategory}
            initialViewMode="map"
            onSelectEquipment={handleSelectEquipment}
            onOpenCompare={() => setIsCompareOpen(true)}
          />
        )}

        {currentTab === 'equipment-details' && selectedEquipmentId && (
          <EquipmentDetailsPage
            equipmentId={selectedEquipmentId}
            onBack={() => handleSelectTab('explore')}
            onBookingComplete={handleBookingComplete}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingsPage
            onSelectEquipment={handleSelectEquipment}
            onExplore={() => handleSelectTab('explore')}
          />
        )}

        {currentTab === 'owner-dashboard' && (
          <OwnerDashboardPage
            onNavigateToAddEquipment={() => handleSelectTab('add-equipment')}
            onSelectEquipment={handleSelectEquipment}
          />
        )}

        {currentTab === 'add-equipment' && (
          <AddEquipmentPage
            onBack={() => handleSelectTab('owner-dashboard')}
            onSuccess={handleAddEquipmentSuccess}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            onNavigateToBookings={() => handleSelectTab('bookings')}
            onNavigateToDashboard={() => handleSelectTab('owner-dashboard')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Full-width Responsive Footer */}
      <Footer onSelectTab={handleSelectTab} />

      {/* Floating Bottom Navigation Bar (Hidden on desktop md:hidden) */}
      <MobileNav currentTab={currentTab} onSelectTab={handleSelectTab} />

      {/* KISAN CONNECT AI Assistant */}
      <AskKisanRent onSelectEquipment={handleSelectEquipment} />

      {/* Compare Side-by-Side Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectEquipment={handleSelectEquipment}
      />

      {/* Phone OTP Login/Signup Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
