import React, { useState } from 'react';
import { ShoppingBag, Search, Menu as MenuIcon, X, Compass, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrack: () => void;
  onOpenAdmin: () => void;
  onFocusSearch: () => void;
  onOrderNow: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenTrack,
  onOpenAdmin,
  onFocusSearch,
  onOrderNow,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative z-30 w-full pt-4 md:pt-6 pb-4 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 md:gap-8 border-b border-[#D7AE55]/20 pb-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            {/* Subtle Islamic 8-point geometric star emblem */}
            <div className="w-8 h-8 rounded-sm bg-[#D7AE55]/15 border border-[#D7AE55]/40 flex items-center justify-center text-[#D7AE55] transition-transform duration-300 group-hover:rotate-45">
              <span className="text-xs font-serif font-bold tracking-widest">KB</span>
            </div>
            <div>
              <span className="block font-serif text-xl md:text-2xl font-bold tracking-[0.18em] text-[#F7EBD2] uppercase transition-colors group-hover:text-[#E8C878]">
                KARACHI BITES
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-[#D7AE55] uppercase font-sans font-medium">
                AUTHENTIC PAKISTANI FLAVOURS
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs tracking-wider uppercase font-medium text-[#F7EBD2]/80">
          <button
            onClick={() => scrollToSection('hero')}
            className="hover:text-[#D7AE55] transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[1.5px] hover:after:bg-[#D7AE55]"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('menu-section')}
            className="hover:text-[#D7AE55] transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[1.5px] hover:after:bg-[#D7AE55]"
          >
            Menu
          </button>
          <button
            onClick={() => scrollToSection('chefs-special')}
            className="hover:text-[#D7AE55] transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[1.5px] hover:after:bg-[#D7AE55]"
          >
            Chef's Special
          </button>
          <button
            onClick={() => scrollToSection('sweet-finish')}
            className="hover:text-[#D7AE55] transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[1.5px] hover:after:bg-[#D7AE55]"
          >
            Desserts
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="hover:text-[#D7AE55] transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[1.5px] hover:after:bg-[#D7AE55]"
          >
            About Us
          </button>
          <button
            onClick={onOpenTrack}
            className="hover:text-[#D7AE55] transition-colors flex items-center gap-1.5 text-[#E8C878]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
          <button
            onClick={onFocusSearch}
            aria-label="Search Menu"
            className="p-2 text-[#F7EBD2]/80 hover:text-[#D7AE55] hover:bg-[#D7AE55]/10 rounded-full transition-colors"
          >
            <Search className="w-4 h-4 md:w-4.5 md:h-4.5" />
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="View Cart"
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D7AE55]/40 bg-[#1B1924]/80 text-[#F7EBD2] hover:border-[#D7AE55] hover:bg-[#D7AE55]/15 transition-all text-xs font-medium"
          >
            <ShoppingBag className="w-4 h-4 text-[#D7AE55]" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="min-w-5 h-5 px-1 bg-[#D7AE55] text-[#1B1924] rounded-full text-[11px] font-bold flex items-center justify-center font-mono tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOrderNow}
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#1B1924] bg-[#D7AE55] hover:bg-[#E8C878] rounded transition-all duration-200 shadow-sm hover:shadow-[#D7AE55]/20"
          >
            Order Now
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#F7EBD2]/80 hover:text-[#D7AE55]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 p-5 rounded-2xl bg-[#1B1924] border border-[#D7AE55]/30 shadow-2xl text-[#F7EBD2] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => scrollToSection('hero')}
            className="text-left py-2 border-b border-white/5 text-sm font-medium hover:text-[#D7AE55]"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('menu-section')}
            className="text-left py-2 border-b border-white/5 text-sm font-medium hover:text-[#D7AE55]"
          >
            Menu Specialties
          </button>
          <button
            onClick={() => scrollToSection('chefs-special')}
            className="text-left py-2 border-b border-white/5 text-sm font-medium hover:text-[#D7AE55]"
          >
            Chef's Special (Karahi)
          </button>
          <button
            onClick={() => scrollToSection('sweet-finish')}
            className="text-left py-2 border-b border-white/5 text-sm font-medium hover:text-[#D7AE55]"
          >
            Traditional Desserts
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="text-left py-2 border-b border-white/5 text-sm font-medium hover:text-[#D7AE55]"
          >
            Our Branches & Heritage
          </button>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrack();
              }}
              className="flex items-center gap-2 py-2 text-sm text-[#E8C878] font-medium"
            >
              <Compass className="w-4 h-4" />
              <span>Track Your Order</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center gap-2 py-2 text-xs text-[#BDB4A5] hover:text-[#D7AE55]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOrderNow();
              }}
              className="mt-2 w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider bg-[#D7AE55] text-[#1B1924] rounded"
            >
              Order Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
