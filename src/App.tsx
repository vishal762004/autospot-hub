/**
 * @file App.tsx
 * @description Main application controller for Auto Spot Hub - Modern Luxury Car Sales web app.
 * Manages global application state (Cart, Orders, Test Drives, Reviews, User Profile),
 * localStorage synchronization, active tabs, search queries, modals, and PDF invoice triggers.
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CarGrid } from './components/CarGrid';
import { CarDetailModal } from './components/CarDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { TestDriveModal } from './components/TestDriveModal';
import { BrandsSection } from './components/BrandsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ProfileView } from './components/ProfileView';
import { ContactView } from './components/ContactView';
import { AboutView } from './components/AboutView';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AdminPortalView } from './components/AdminPortalView';
import { PageNavigation } from './components/PageNavigation';

import { LUXURY_CARS } from './data/cars';
import {
  Car,
  CartItem,
  Order,
  TestDriveAppointment,
  Review,
  UserProfile,
  AddressDetails,
  DocumentVerification,
  ActiveTab,
} from './types';
import { calculateTaxBreakdown } from './utils/taxCalculator';
import {
  auth,
  updateUserProfileDoc,
  fetchUserOrders,
  saveOrderToFirestore,
  fetchUserTestDrives,
  saveTestDriveToFirestore,
  logoutUser,
  syncUserProfileDoc,
  isCurrentUserAdmin,
} from './lib/firebase';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string | null>(null);

  // Keep a lightweight in-app history so Back returns to the page the user actually came from.
  const navigateToTab = (nextTab: ActiveTab) => {
    if (nextTab === activeTab) return;

    if (nextTab === 'home') {
      setTabHistory([]);
    } else {
      setTabHistory((history) => [...history, activeTab]);
    }

    setActiveTab(nextTab);
  };

  const goBack = () => {
    setTabHistory((history) => {
      const previousTab = history[history.length - 1];
      if (!previousTab) {
        setActiveTab('home');
        return [];
      }

      setActiveTab(previousTab);
      return history.slice(0, -1);
    });
  };


  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Cars Catalog State (initialized from LUXURY_CARS dataset)
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = localStorage.getItem('autoSpotHub_cars');
    if (!saved) return LUXURY_CARS;
    try {
      const parsed = JSON.parse(saved) as Car[];
      const parsedMap = new Map(parsed.map((c) => [c.id, c]));

      // Migrate previously saved catalogue records to the current source-of-truth image.
      // Older builds used remote image URLs, so blindly restoring localStorage would keep
      // those broken URLs alive even after the catalogue was fixed.
      const merged = LUXURY_CARS.map((baseCar) => {
        const savedCar = parsedMap.get(baseCar.id);
        return savedCar ? { ...baseCar, ...savedCar, image: baseCar.image } : baseCar;
      });

      // The catalogue file is the source of truth. Do not resurrect removed or
      // obsolete vehicles from an older browser cache.
      return merged;
    } catch {
      return LUXURY_CARS;
    }
  });

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('autoSpotHub_cart');
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved) as CartItem[];
      // Keep cart thumbnails aligned with the catalogue's local image assets too.
      return parsed.flatMap((item) => {
        const currentCar = LUXURY_CARS.find((car) => car.id === item.car.id);
        // Drop cart entries for vehicles removed from the current catalogue.
        return currentCar ? [{ ...item, car: currentCar }] : [];
      });
    } catch {
      return [];
    }
  });

  // Completed Orders State
  // Customer-owned records are intentionally not initialized from localStorage.
  // Firestore is the source of truth and prevents data from one account leaking into another.
  const [orders, setOrders] = useState<Order[]>([]);

  // Scheduled Test Drives State
  const [testDrives, setTestDrives] = useState<TestDriveAppointment[]>([]);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    uid: '',
    name: 'Luxury Collector',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    avatarUrl: '',
    carsViewedCount: 12,
  });

  // Listen to Firebase Auth state change
  // Subscribe once to Firebase Auth so every route reacts to sign-in/sign-out consistently.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        // Admin status comes only from a Firebase Auth custom claim.
        const admin = await isCurrentUserAdmin(fbUser);
        setIsAdmin(admin);

        // Sync & load user profile from Firestore
        const profile = await syncUserProfileDoc(fbUser);
        if (profile) {
          setUserProfile(profile);
        }
        // Load user orders from Firestore
        const userOrders = await fetchUserOrders(fbUser.uid);
        setOrders(userOrders);

        // Load user test drives from Firestore
        const userTDs = await fetchUserTestDrives(fbUser.uid);
        setTestDrives(userTDs);
      } else {
        setOrders([]);
        setTestDrives([]);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Global Dealership Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>(() => {
    const saved = localStorage.getItem('autoSpotHub_reviews');
    if (saved) {
      try {
        return JSON.parse(saved) as Review[];
      } catch {
        localStorage.removeItem('autoSpotHub_reviews');
      }
    }

    // Extract all reviews across all cars as initial global list
    const initialReviews: Review[] = [];
    LUXURY_CARS.forEach((c) => {
      if (c.reviews) initialReviews.push(...c.reviews);
    });
    return initialReviews;
  });

  // Modals & Drawers Visibility State
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [testDriveModalOpen, setTestDriveModalOpen] = useState(false);
  const [selectedCarForModal, setSelectedCarForModal] = useState<Car | null>(null);
  const [selectedCarForTestDrive, setSelectedCarForTestDrive] = useState<Car | null>(null);
  const [completedOrderModal, setCompletedOrderModal] = useState<Order | null>(null);

  // Close the topmost overlay with Escape, matching the visible X controls.
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (authModalOpen) setAuthModalOpen(false);
      else if (testDriveModalOpen) setTestDriveModalOpen(false);
      else if (cartDrawerOpen) setCartDrawerOpen(false);
      else if (selectedCarForModal) setSelectedCarForModal(null);
      else if (completedOrderModal) setCompletedOrderModal(null);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [authModalOpen, testDriveModalOpen, cartDrawerOpen, selectedCarForModal, completedOrderModal]);

  // Toast Notification Message State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- LOCALSTORAGE SYNCHRONIZATION EFFECTS ---
  useEffect(() => {
    localStorage.setItem('autoSpotHub_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('autoSpotHub_reviews', JSON.stringify(reviewsList));
  }, [reviewsList]);

  useEffect(() => {
    localStorage.setItem('autoSpotHub_cars', JSON.stringify(cars));
  }, [cars]);

  // Toast trigger helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add vehicle to Shopping Cart
  // Keep cart operations in one place so cards, details and future features share the same rules.
  const handleAddToCart = (car: Car) => {
    const exists = cartItems.some((item) => item.car.id === car.id);
    if (exists) {
      showToast(`${car.make} ${car.model} is already in your cart.`);
      return;
    }

    const newItem: CartItem = {
      car,
      addedAt: new Date().toISOString(),
    };

    setCartItems((prev) => [...prev, newItem]);
    showToast(`Added ${car.make} ${car.model} to cart!`);
  };

  // Remove vehicle from Shopping Cart
  const handleRemoveFromCart = (carId: number) => {
    setCartItems((prev) => prev.filter((item) => item.car.id !== carId));
    showToast('Vehicle removed from cart.');
  };

  // Add review to a specific car model
  const handleAddCarReview = (carId: number, newReviewData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...newReviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      carId,
    };

    // Update car in cars array
    setCars((prevCars) =>
      prevCars.map((c) => {
        if (c.id === carId) {
          return {
            ...c,
            reviews: [newRev, ...c.reviews],
          };
        }
        return c;
      })
    );

    // Update global reviews list
    setReviewsList((prev) => [newRev, ...prev]);

    // Also update current modal car
    if (selectedCarForModal && selectedCarForModal.id === carId) {
      setSelectedCarForModal((prev) =>
        prev
          ? {
              ...prev,
              reviews: [newRev, ...prev.reviews],
            }
          : null
      );
    }

    showToast('Thank you! Your review has been published.');
  };

  // Add global dealership review
  const handleAddGlobalReview = (newReviewData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...newReviewData,
      id: `rev-global-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setReviewsList((prev) => [newRev, ...prev]);
    showToast('Your dealership review has been published!');
  };

  // Schedule Test Drive Appointment
  const handleBookTestDrive = async (
    appointmentData: Omit<TestDriveAppointment, 'id' | 'status' | 'bookedAt'>
  ): Promise<boolean> => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast('Please sign in before booking a test drive.');
      return false;
    }

    const newAppt: TestDriveAppointment = {
      ...appointmentData,
      id: `TD-${crypto.randomUUID()}`,
      userId: currentUser.uid,
      status: 'Scheduled',
      bookedAt: new Date().toISOString(),
    };

    try {
      await saveTestDriveToFirestore(newAppt);
      setTestDrives((prev) => [newAppt, ...prev]);
      showToast(`Test Drive appointment scheduled for ${appointmentData.preferredDate}!`);
      return true;
    } catch {
      showToast('Unable to save the test-drive booking. Please try again.');
      return false;
    }
  };

  // Handle Checkout Order Submission
  const handleCompleteOrder = async (
    address: AddressDetails,
    paymentMethod: 'Credit/Debit Card' | 'Net Banking' | 'UPI',
    documentVerification: DocumentVerification,
  ) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast('Please sign in before placing an order.');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty.');
      return;
    }

    const taxBreakdown = calculateTaxBreakdown(cartItems);

    // Calculate delivery date (14 days from today)
    const deliveryDateObj = new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + 14);
    const estimatedDeliveryDate = deliveryDateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const newOrder: Order = {
      id: `ASH-${crypto.randomUUID()}`,
      userId: currentUser.uid,
      trackingNumber: `ASH-TRK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: 'Confirmed',
      items: [...cartItems],
      address,
      taxBreakdown,
      paymentMethod,
      documentVerification,
      estimatedDeliveryDate,
    };

    try {
      // Persist first. The UI only reports success after Firestore accepts the order.
      await saveOrderToFirestore(newOrder);
      setOrders((prev) => [newOrder, ...prev]);
      setCartItems([]);
      setCompletedOrderModal(newOrder);
    } catch {
      showToast('Unable to place your order. Please try again.');
    }
  };

  // Brand Filter Selection
  const handleSelectBrand = (brandName: string) => {
    setSearchQuery('');
    setSelectedBrandFilter(brandName);
    navigateToTab('cars');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsAdmin(false);
    setOrders([]);
    setTestDrives([]);
    setUserProfile({
      uid: '',
      name: 'Luxury Collector',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      avatarUrl: '',
      carsViewedCount: 12,
    });
    showToast('Signed out of Firebase account.');
  };

  const featuredCarsList = cars.filter((c) => c.featured);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-950 font-sans text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      
      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-slate-900 border border-amber-500 text-amber-300 font-bold px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <Header
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        cartCount={cartItems.length}
        isAdmin={isAdmin}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenTestDrive={() => setTestDriveModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT AREA DEPENDING ON ACTIVE TAB */}
      <main className="flex-1 pt-16 sm:pt-20">
        {activeTab !== 'home' && (
          <PageNavigation
            title={
              activeTab === 'cars' ? 'Showroom Catalog' :
              activeTab === 'brands' ? 'Luxury Brands' :
              activeTab === 'reviews' ? 'Client Reviews' :
              activeTab === 'about' ? 'About Auto Spot Hub' :
              activeTab === 'contact' ? 'Contact Concierge' :
              activeTab === 'profile' ? 'My Profile' :
              activeTab === 'admin' ? 'Owner Portal' :
              'Vehicle Checkout'
            }
            canGoBack={tabHistory.length > 0}
            onBack={goBack}
          />
        )}

        
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* HERO CAROUSEL */}
            <HeroBanner
              featuredCars={featuredCarsList.length > 0 ? featuredCarsList : cars.slice(0, 5)}
              onSelectCar={(car) => setSelectedCarForModal(car)}
              onBookTestDrive={() => setTestDriveModalOpen(true)}
              onExploreClick={() => navigateToTab('cars')}
            />

            {/* FEATURED BRANDS */}
            <BrandsSection onSelectBrand={handleSelectBrand} />

            {/* MAIN CATALOG GRID */}
            <CarGrid
              cars={cars}
              cartItemsCarIds={cartItems.map((item) => item.car.id)}
              onSelectCar={(car) => setSelectedCarForModal(car)}
              onAddToCart={handleAddToCart}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedBrandFilter={selectedBrandFilter}
              onClearBrandFilter={() => setSelectedBrandFilter(null)}
            />

            {/* CUSTOMER REVIEWS PREVIEW */}
            <ReviewsSection
              reviews={reviewsList}
              onAddGlobalReview={handleAddGlobalReview}
            />
          </div>
        )}

        {/* TAB 2: SHOWROOM CATALOG */}
        {activeTab === 'cars' && (
          <CarGrid
            cars={cars}
            cartItemsCarIds={cartItems.map((item) => item.car.id)}
            onSelectCar={(car) => setSelectedCarForModal(car)}
            onAddToCart={handleAddToCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedBrandFilter={selectedBrandFilter}
            onClearBrandFilter={() => setSelectedBrandFilter(null)}
          />
        )}

        {/* TAB 3: BRANDS SHOWCASE */}
        {activeTab === 'brands' && (
          <BrandsSection onSelectBrand={handleSelectBrand} />
        )}

        {/* TAB 4: CLIENT REVIEWS */}
        {activeTab === 'reviews' && (
          <ReviewsSection
            reviews={reviewsList}
            onAddGlobalReview={handleAddGlobalReview}
          />
        )}

        {/* TAB 5: ABOUT US */}
        {activeTab === 'about' && <AboutView />}

        {/* TAB 6: CONTACT US */}
        {activeTab === 'contact' && <ContactView />}

        {/* TAB 7: USER PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            user={userProfile}
            onUpdateUser={(updated) => {
              setUserProfile(updated);
              if (currentUser) {
                updateUserProfileDoc(currentUser.uid, updated);
              }
              showToast('Profile details updated in Firestore!');
            }}
            orders={orders}
            testDrives={testDrives}
            currentUser={currentUser}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {/* TAB 8: OWNER PORTAL & USER TRACKER */}
        {activeTab === 'admin' && isAdmin && <AdminPortalView />}
        {activeTab === 'admin' && !isAdmin && (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center text-white">
            <h2 className="text-2xl font-bold">Admin access required</h2>
            <p className="mt-2 text-slate-400">Your account does not have the required administrator role.</p>
          </div>
        )}

        {/* TAB 8: CHECKOUT */}
        {activeTab === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            onBackToShowroom={goBack}
            onCompleteOrder={handleCompleteOrder}
            savedAddress={{
              fullName: userProfile.name,
              phone: userProfile.phone,
              email: userProfile.email,
              address: userProfile.address,
              city: userProfile.city,
              state: '',
              pincode: userProfile.pincode,
            }}
          />
        )}

      </main>

      {/* FOOTER */}
      <Footer setActiveTab={navigateToTab} />

      {/* MODAL 1: CAR DETAIL MODAL */}
      <CarDetailModal
        car={selectedCarForModal}
        onClose={() => setSelectedCarForModal(null)}
        onAddToCart={handleAddToCart}
        onBookTestDrive={(car) => {
          setSelectedCarForTestDrive(car);
          setTestDriveModalOpen(true);
        }}
        isInCart={selectedCarForModal ? cartItems.some((i) => i.car.id === selectedCarForModal.id) : false}
        onAddReview={handleAddCarReview}
      />

      {/* MODAL 2: SHOPPING CART DRAWER */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => navigateToTab('checkout')}
      />

      {/* MODAL 3: TEST DRIVE BOOKING MODAL */}
      <TestDriveModal
        isOpen={testDriveModalOpen}
        onClose={() => setTestDriveModalOpen(false)}
        cars={cars}
        selectedCarInitial={selectedCarForTestDrive}
        onBookTestDrive={handleBookTestDrive}
      />

      {/* MODAL 4: ORDER CONFIRMATION & PDF RECEIPT */}
      <OrderConfirmationModal
        order={completedOrderModal}
        onClose={() => setCompletedOrderModal(null)}
        onNavigateHome={() => navigateToTab('home')}
        onNavigateProfile={() => navigateToTab('profile')}
      />

      {/* MODAL 5: FIREBASE AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}
