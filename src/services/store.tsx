import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  Equipment,
  Booking,
  Review,
  AppNotification,
  UserRole,
  LocationData,
  BookingStatus,
} from '../types';
import { INITIAL_EQUIPMENT_DATA } from '../data/mockEquipment';
import { DEFAULT_USER_LOCATION } from '../utils/geo';

export interface OfflineAction {
  id: string;
  type: 'create_booking' | 'update_booking_status' | 'confirm_payment' | 'add_equipment' | 'add_review';
  payload: any;
  timestamp: string;
}

interface StoreContextType {
  currentUser: UserProfile | null;
  userRole: UserRole;
  userLocation: LocationData;
  equipment: Equipment[];
  bookings: Booking[];
  reviews: Review[];
  notifications: AppNotification[];
  compareList: string[]; // equipment IDs
  savedEquipmentIds: string[]; // bookmarked items
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  theme: 'light' | 'dark';
  syncMessage: string | null;
  toggleTheme: () => void;
  setUserLocation: (loc: LocationData) => void;
  setUserRole: (role: UserRole) => void;
  loginWithPhone: (phone: string, otp: string, role: UserRole, name: string, village: string, district: string) => boolean;
  logout: () => void;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  confirmBookingPayment: (bookingId: string, paymentId: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  addEquipment: (item: Omit<Equipment, 'id' | 'ratingAvg' | 'ratingCount' | 'blockedDates'>) => Equipment;
  updateEquipment: (item: Equipment) => void;
  deleteEquipment: (equipmentId: string) => void;
  toggleEquipmentAvailability: (equipmentId: string) => void;
  toggleBlockedDate: (equipmentId: string, dateStr: string) => void;
  toggleCompare: (equipmentId: string) => void;
  clearCompare: () => void;
  toggleBookmark: (equipmentId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  syncOfflineData: () => Promise<void>;
  dismissSyncMessage: () => void;
}

const DEFAULT_FARMER_USER: UserProfile = {
  id: 'farmer-001',
  phone: '+91 98480 98765',
  name: 'Ramesh Babu',
  role: 'farmer',
  village: 'Poranki',
  district: 'NTR (Vijayawada)',
  createdAt: '2026-01-15T00:00:00.000Z',
};

const DEFAULT_OWNER_USER: UserProfile = {
  id: 'owner-101',
  phone: '+91 98480 12345',
  name: 'Venkateswara Rao',
  role: 'owner',
  village: 'Gollapudi',
  district: 'NTR (Vijayawada)',
  createdAt: '2026-01-10T00:00:00.000Z',
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    equipmentId: 'eq-3',
    equipmentName: 'Preet 987 Track Harvester',
    equipmentCategory: 'Harvester',
    equipmentImage: '/images/harvester.jpg',
    farmerId: 'farmer-001',
    farmerName: 'Ramesh Babu',
    farmerPhone: '+91 98480 98765',
    farmerVillage: 'Poranki',
    ownerId: 'owner-103',
    ownerName: 'Subba Rao Goud',
    startDate: '2026-11-08',
    endDate: '2026-11-09',
    hoursOrDaysType: 'days',
    quantity: 2,
    pricePerUnit: 18000,
    totalPrice: 36000,
    status: 'Approved',
    paymentStatus: 'Pending',
    createdAt: '2026-11-05T08:30:00.000Z',
  },
  {
    id: 'bk-102',
    equipmentId: 'eq-1',
    equipmentName: 'Mahindra 575 DI Heavy Duty',
    equipmentCategory: 'Tractor',
    equipmentImage: '/images/tractor_red.jpg',
    farmerId: 'farmer-001',
    farmerName: 'Ramesh Babu',
    farmerPhone: '+91 98480 98765',
    farmerVillage: 'Poranki',
    ownerId: 'owner-101',
    ownerName: 'Venkateswara Rao',
    startDate: '2026-11-10',
    endDate: '2026-11-11',
    hoursOrDaysType: 'days',
    quantity: 2,
    pricePerUnit: 5000,
    totalPrice: 10000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentId: 'pay_rzp_DEMO102',
    createdAt: '2026-11-04T10:15:00.000Z',
  },
  {
    id: 'bk-103',
    equipmentId: 'eq-4',
    equipmentName: 'Garuda 16L Precision Spray Drone',
    equipmentCategory: 'Drone Sprayer',
    equipmentImage: '/images/drone_sprayer.jpg',
    farmerId: 'farmer-001',
    farmerName: 'Ramesh Babu',
    farmerPhone: '+91 98480 98765',
    farmerVillage: 'Poranki',
    ownerId: 'owner-104',
    ownerName: 'Garuda Agri Drones',
    startDate: '2026-11-01',
    endDate: '2026-11-01',
    hoursOrDaysType: 'hours',
    quantity: 3,
    pricePerUnit: 1200,
    totalPrice: 3600,
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentId: 'pay_rzp_COMPLETED4',
    createdAt: '2026-10-31T14:00:00.000Z',
    reviewed: true,
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    bookingId: 'bk-103',
    equipmentId: 'eq-4',
    farmerId: 'farmer-001',
    farmerName: 'Ramesh Babu',
    rating: 5,
    comment: 'Super fast drone spraying! Completed 5 acres of cotton in under 1 hour. No pesticide wastage, operator was very polite.',
    createdAt: '2026-11-02T12:00:00.000Z',
  },
  {
    id: 'rev-2',
    bookingId: 'bk-old-2',
    equipmentId: 'eq-1',
    farmerId: 'farmer-002',
    farmerName: 'Kalyan Chakravarthy',
    rating: 5,
    comment: 'Mahindra tractor handled muddy wet paddy field very easily. Driver Venkateswara arrived exactly on time at 6:30 AM.',
    createdAt: '2026-10-28T16:30:00.000Z',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'farmer-001',
    title: 'Booking Request Approved!',
    message: 'Owner Subba Rao Goud approved your booking for Preet 987 Harvester. Complete token payment to lock slot.',
    type: 'booking_approved',
    read: false,
    createdAt: '2026-11-05T09:00:00.000Z',
    bookingId: 'bk-101',
  },
  {
    id: 'notif-2',
    userId: 'farmer-001',
    title: 'Payment Received',
    message: '₹10,000 paid for Mahindra 575 DI Heavy Duty. Your booking is fully confirmed.',
    type: 'payment_success',
    read: true,
    createdAt: '2026-11-04T10:16:00.000Z',
    bookingId: 'bk-102',
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kisan_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Online / Offline State
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Offline outbox queue
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => {
    const saved = localStorage.getItem('kisan_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved Bookmarks
  const [savedEquipmentIds, setSavedEquipmentIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kisan_bookmarks');
    return saved ? JSON.parse(saved) : ['eq-1', 'eq-4'];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kisan_user');
    return saved ? JSON.parse(saved) : DEFAULT_FARMER_USER;
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('kisan_role');
    return (saved as UserRole) || 'farmer';
  });

  const [userLocation, setUserLocationState] = useState<LocationData>(() => {
    const saved = localStorage.getItem('kisan_location');
    return saved ? JSON.parse(saved) : DEFAULT_USER_LOCATION;
  });

  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('kisan_equipment');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasOutdatedPhotos = parsed.some((eq: Equipment) =>
          eq.images?.some((img: string) => img.includes('unsplash.com'))
        );
        if (!hasOutdatedPhotos) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EQUIPMENT_DATA;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('kisan_bookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasOutdatedPhotos = parsed.some((b: Booking) =>
          b.equipmentImage?.includes('unsplash.com')
        );
        if (!hasOutdatedPhotos) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('kisan_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('kisan_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [compareList, setCompareList] = useState<string[]>([]);

  // Apply Theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kisan_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sync state to localStorage for offline access
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kisan_user', JSON.stringify(currentUser));
      localStorage.setItem('kisan_role', currentUser.role);
    } else {
      localStorage.removeItem('kisan_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kisan_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('kisan_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kisan_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('kisan_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('kisan_bookmarks', JSON.stringify(savedEquipmentIds));
  }, [savedEquipmentIds]);

  useEffect(() => {
    localStorage.setItem('kisan_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Online / Offline Listeners & Automatic Sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage('You are now offline. Changes will be saved locally and synced automatically when online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  const syncOfflineData = async () => {
    const queue = [...offlineQueue];
    if (queue.length === 0) {
      setSyncMessage('Back online. All equipment and booking data are up to date.');
      setTimeout(() => setSyncMessage(null), 4000);
      return;
    }

    setIsSyncing(true);
    setSyncMessage(`Connection restored! Syncing ${queue.length} pending local change${queue.length > 1 ? 's' : ''}...`);

    try {
      // Process pending actions
      await new Promise((resolve) => setTimeout(resolve, 800));
      setOfflineQueue([]);
      localStorage.removeItem('kisan_offline_queue');

      const notif: AppNotification = {
        id: `notif-sync-${Date.now()}`,
        userId: currentUser?.id || 'farmer-001',
        title: 'Offline Sync Complete',
        message: `Successfully synchronized ${queue.length} offline booking request(s) and changes.`,
        type: 'reminder',
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);

      setSyncMessage(`All ${queue.length} offline changes have been synchronized successfully.`);
    } catch (err) {
      console.warn('Sync failed:', err);
      setSyncMessage('Sync failed. Will retry automatically.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const dismissSyncMessage = () => {
    setSyncMessage(null);
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        role,
        ...(role === 'owner' && currentUser.id === 'farmer-001' ? DEFAULT_OWNER_USER : {}),
        ...(role === 'farmer' && currentUser.id === 'owner-101' ? DEFAULT_FARMER_USER : {}),
      };
      setCurrentUser(updatedUser);
    }
  };

  const setUserLocation = (loc: LocationData) => {
    setUserLocationState(loc);
    localStorage.setItem('kisan_location', JSON.stringify(loc));
  };

  const loginWithPhone = (
    phone: string,
    _otp: string,
    role: UserRole,
    name: string,
    village: string,
    district: string
  ): boolean => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      phone,
      name: name.trim() || (role === 'farmer' ? 'Kisan Member' : 'Machinery Owner'),
      role,
      village: village.trim() || 'Vijayawada Rural',
      district: district.trim() || 'NTR',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setUserRoleState(role);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // If offline, add to sync queue
    if (!navigator.onLine) {
      const action: OfflineAction = {
        id: `act-${Date.now()}`,
        type: 'create_booking',
        payload: newBooking,
        timestamp: new Date().toISOString(),
      };
      setOfflineQueue((q) => [...q, action]);
      setSyncMessage('Booking saved offline in local storage. Will sync with owner once you are online.');
    }

    // Owner notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newBooking.ownerId,
      title: 'New Booking Request',
      message: `${newBooking.farmerName} requested to rent ${newBooking.equipmentName} (${newBooking.quantity} ${newBooking.hoursOrDaysType}).`,
      type: 'booking_request',
      read: false,
      createdAt: new Date().toISOString(),
      bookingId: newBooking.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((bk) => {
        if (bk.id !== bookingId) return bk;
        const updated = { ...bk, status };

        if (!navigator.onLine) {
          const action: OfflineAction = {
            id: `act-${Date.now()}`,
            type: 'update_booking_status',
            payload: { bookingId, status },
            timestamp: new Date().toISOString(),
          };
          setOfflineQueue((q) => [...q, action]);
        }

        const notifMsg =
          status === 'Approved'
            ? `Owner ${bk.ownerName} approved your request for ${bk.equipmentName}. Please pay token.`
            : status === 'Rejected'
            ? `Your booking request for ${bk.equipmentName} was rejected.`
            : `Booking status changed to ${status}.`;

        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: bk.farmerId,
          title: `Booking ${status}`,
          message: notifMsg,
          type: status === 'Approved' ? 'booking_approved' : status === 'Rejected' ? 'booking_rejected' : 'reminder',
          read: false,
          createdAt: new Date().toISOString(),
          bookingId: bk.id,
        };
        setNotifications((n) => [newNotif, ...n]);

        return updated;
      })
    );
  };

  const confirmBookingPayment = (bookingId: string, paymentId: string) => {
    let bookedDates: string[] = [];
    let eqId = '';

    setBookings((prev) =>
      prev.map((bk) => {
        if (bk.id !== bookingId) return bk;
        eqId = bk.equipmentId;

        const start = new Date(bk.startDate);
        const end = new Date(bk.endDate);
        const dates: string[] = [];
        while (start <= end) {
          dates.push(start.toISOString().split('T')[0]);
          start.setDate(start.getDate() + 1);
        }
        bookedDates = dates;

        if (!navigator.onLine) {
          const action: OfflineAction = {
            id: `act-${Date.now()}`,
            type: 'confirm_payment',
            payload: { bookingId, paymentId },
            timestamp: new Date().toISOString(),
          };
          setOfflineQueue((q) => [...q, action]);
        }

        const ownerNotif: AppNotification = {
          id: `notif-own-${Date.now()}`,
          userId: bk.ownerId,
          title: 'Payment Confirmed & Slot Locked',
          message: `${bk.farmerName} completed payment of ₹${bk.totalPrice} for ${bk.equipmentName}.`,
          type: 'payment_success',
          read: false,
          createdAt: new Date().toISOString(),
          bookingId: bk.id,
        };
        setNotifications((n) => [ownerNotif, ...n]);

        return {
          ...bk,
          status: 'Confirmed',
          paymentStatus: 'Paid',
          paymentId,
        };
      })
    );

    if (eqId && bookedDates.length > 0) {
      setEquipment((prev) =>
        prev.map((eq) => {
          if (eq.id !== eqId) return eq;
          const combined = Array.from(new Set([...eq.blockedDates, ...bookedDates]));
          return { ...eq, blockedDates: combined };
        })
      );
    }
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);

    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== reviewData.equipmentId) return eq;
        const newCount = eq.ratingCount + 1;
        const newAvg = Math.round(((eq.ratingAvg * eq.ratingCount + reviewData.rating) / newCount) * 10) / 10;
        return {
          ...eq,
          ratingCount: newCount,
          ratingAvg: newAvg,
        };
      })
    );

    setBookings((prev) =>
      prev.map((bk) => (bk.id === reviewData.bookingId ? { ...bk, reviewed: true } : bk))
    );
  };

  const addEquipment = (
    itemData: Omit<Equipment, 'id' | 'ratingAvg' | 'ratingCount' | 'blockedDates'>
  ): Equipment => {
    const newId = `eq-${Date.now()}`;
    const newEq: Equipment = {
      ...itemData,
      id: newId,
      ratingAvg: 5.0,
      ratingCount: 1,
      blockedDates: [],
    };
    setEquipment((prev) => [newEq, ...prev]);

    if (!navigator.onLine) {
      const action: OfflineAction = {
        id: `act-${Date.now()}`,
        type: 'add_equipment',
        payload: newEq,
        timestamp: new Date().toISOString(),
      };
      setOfflineQueue((q) => [...q, action]);
      setSyncMessage('Machinery listed offline! Stored locally and will publish when online.');
    }

    return newEq;
  };

  const updateEquipment = (item: Equipment) => {
    setEquipment((prev) => prev.map((eq) => (eq.id === item.id ? item : eq)));
  };

  const deleteEquipment = (equipmentId: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== equipmentId));
  };

  const toggleEquipmentAvailability = (equipmentId: string) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === equipmentId ? { ...eq, isAvailable: !eq.isAvailable } : eq))
    );
  };

  const toggleBlockedDate = (equipmentId: string, dateStr: string) => {
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id !== equipmentId) return eq;
        const hasDate = eq.blockedDates.includes(dateStr);
        const updated = hasDate
          ? eq.blockedDates.filter((d) => d !== dateStr)
          : [...eq.blockedDates, dateStr];
        return { ...eq, blockedDates: updated };
      })
    );
  };

  const toggleCompare = (equipmentId: string) => {
    setCompareList((prev) => {
      if (prev.includes(equipmentId)) {
        return prev.filter((id) => id !== equipmentId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, equipmentId];
    });
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const toggleBookmark = (equipmentId: string) => {
    setSavedEquipmentIds((prev) =>
      prev.includes(equipmentId) ? prev.filter((id) => id !== equipmentId) : [...prev, equipmentId]
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        userRole,
        userLocation,
        equipment,
        bookings,
        reviews,
        notifications,
        compareList,
        savedEquipmentIds,
        isOnline,
        isSyncing,
        pendingSyncCount: offlineQueue.length,
        theme,
        syncMessage,
        toggleTheme,
        setUserLocation,
        setUserRole,
        loginWithPhone,
        logout,
        createBooking,
        updateBookingStatus,
        confirmBookingPayment,
        addReview,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        toggleEquipmentAvailability,
        toggleBlockedDate,
        toggleCompare,
        clearCompare,
        toggleBookmark,
        markNotificationRead,
        markAllNotificationsRead,
        syncOfflineData,
        dismissSyncMessage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
