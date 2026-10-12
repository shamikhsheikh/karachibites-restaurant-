import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { Specialties } from './components/Specialties.tsx';
import { ChefsSpecial } from './components/ChefsSpecial.tsx';
import { DessertSection } from './components/DessertSection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { FinalCTA } from './components/FinalCTA.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { TrackOrderModal } from './components/TrackOrderModal.tsx';
import { AdminDashboardModal } from './components/AdminDashboardModal.tsx';
import { INITIAL_MENU } from './data/menu.ts';
import { CartItem, MenuItem, Order } from './types.ts';
import { ShoppingBag, Check } from 'lucide-react';

const DELIVERY_FEE = 150;

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kb_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackParams, setTrackParams] = useState<{ id: string; phone: string }>({
    id: '',
    phone: '',
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check URL hash/path for direct navigation (e.g. /admin, #admin, #track)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#admin' || path === '/admin' || path.startsWith('/admin/')) {
        setIsAdminOpen(true);
      } else if (hash === '#track' || path === '/track') {
        setIsTrackOpen(true);
      }
    };
    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kb_cart_v1', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Fetch live menu from API with fallback
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => {
        if (!res.ok) throw new Error('API menu error');
        return res.json();
      })
      .then((data: MenuItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API data with image paths if needed
          const merged = data.map((item) => {
            const fallback = INITIAL_MENU.find((m) => m.id === item.id);
            const rawImage = item.image || fallback?.image || '';
            const normalizedImage = rawImage.replace(/^\/src\/assets\/images\//, '/images/');
            return {
              ...item,
              image: normalizedImage,
            };
          });
          setMenuItems(merged);
        }
      })
      .catch((err) => {
        console.warn('Using seeded menu fallback:', err.message);
      });
  }, []);

  // Quick Cart Add
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { menuItem: item, qty: 1 }];
    });

    // Trigger feedback toast
    setToastMessage(`Added ${item.name} to order`);
    setTimeout(() => {
      setToastMessage((curr) => (curr?.includes(item.name) ? null : curr));
    }, 2200);
  };

  const handleUpdateQty = (itemId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const newQty = c.qty + delta;
            return newQty > 0 ? { ...c, qty: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: number) => {
    setCartItems((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCartSubtotal = cartItems.reduce(
    (acc, curr) => acc + curr.menuItem.price * curr.qty,
    0
  );

  const cartCountsMap = cartItems.reduce<Record<number, number>>((acc, curr) => {
    acc[curr.menuItem.id] = curr.qty;
    return acc;
  }, {});

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
    setIsConfirmOpen(true);
    // Clear cart after placing order
    setCartItems([]);
  };

  const handleTrackFromConfirm = (orderId: string, phone: string) => {
    setIsConfirmOpen(false);
    setTrackParams({ id: orderId, phone });
    setIsTrackOpen(true);
  };

  const handleFocusSearch = () => {
    const el = document.getElementById('menu-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 400);
  };

  const dessertItems = menuItems.filter((m) => m.category === 'DESSERTS');

  return (
    <div className="min-h-screen bg-[#F4E8D3] text-[#201D22] font-sans relative selection:bg-[#D7AE55]/30">
      
      {/* Background Islamic Geometric Subtle Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.035] bg-islamic-pattern-light z-0" />

      {/* Main Page Layout */}
      <div className="relative z-10">
        
        {/* Navigation & Header */}
        <Header
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenTrack={() => {
            setTrackParams({ id: '', phone: '' });
            setIsTrackOpen(true);
          }}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onFocusSearch={handleFocusSearch}
          onOrderNow={() => {
            const el = document.getElementById('menu-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 2. Dark Hero Section */}
        <Hero
          onOrderNow={() => {
            const el = document.getElementById('menu-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreMenu={() => {
            const el = document.getElementById('menu-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 13. Section Transition & Menu Grid */}
        <Specialties
          menuItems={menuItems}
          cartItemCounts={cartCountsMap}
          onAddToCart={handleAddToCart}
          searchRef={searchInputRef}
        />

        {/* 18. Chef's Special (Shinwari Karahi Spotlight) */}
        <ChefsSpecial
          onDiscoverMenu={() => {
            const el = document.getElementById('menu-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 19. Dessert Section: A Sweet Finish */}
        <DessertSection
          dessertItems={dessertItems}
          cartItemCounts={cartCountsMap}
          onAddToCart={handleAddToCart}
        />

        {/* Heritage & 3 Branches Information */}
        <AboutSection />

        {/* 20. Final CTA */}
        <FinalCTA
          onOrderNow={() => {
            const el = document.getElementById('menu-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 21. Minimal Footer */}
        <Footer
          onOpenTrack={() => {
            setTrackParams({ id: '', phone: '' });
            setIsTrackOpen(true);
          }}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

      </div>

      {/* Mobile Floating Sticky Cart Bar (when items in cart) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden pb-[env(safe-area-inset-bottom,0px)]">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-5 rounded-2xl bg-[#1B1924] text-[#F7EBD2] border border-[#D7AE55]/40 shadow-2xl flex items-center justify-between font-medium text-xs tracking-wider uppercase active:scale-[0.98] transition-transform cursor-pointer touch-manipulation min-h-[50px]"
            aria-label={`View Cart with ${totalCartCount} items`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#D7AE55] text-[#1B1924] flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                {totalCartCount}
              </div>
              <span className="font-serif text-sm font-semibold tracking-normal text-[#E8C878]">
                View Order Cart
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#F7EBD2]">
                Rs. {totalCartSubtotal}
              </span>
              <ShoppingBag className="w-4 h-4 text-[#D7AE55] shrink-0" />
            </div>
          </button>
        </div>
      )}

      {/* Instant Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#1B1924] text-[#F7EBD2] border border-[#D7AE55]/40 shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="w-4 h-4 rounded-full bg-[#D7AE55] text-[#1B1924] flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        deliveryFee={DELIVERY_FEE}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        deliveryFee={DELIVERY_FEE}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setIsConfirmOpen(false)}
        onTrackOrder={handleTrackFromConfirm}
      />

      <TrackOrderModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        initialOrderId={trackParams.id}
        initialPhone={trackParams.phone}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
}
