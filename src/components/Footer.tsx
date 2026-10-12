import React from 'react';
import { ShieldCheck, Compass } from 'lucide-react';

interface FooterProps {
  onOpenTrack: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTrack, onOpenAdmin }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#1B1924] text-[#F7EBD2] border-t border-[#D7AE55]/25 pt-12 md:pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-sm bg-[#D7AE55]/15 border border-[#D7AE55]/40 flex items-center justify-center text-[#D7AE55]">
                <span className="text-xs font-serif font-bold">KB</span>
              </div>
              <div>
                <span className="block font-serif text-xl font-bold tracking-[0.18em] text-[#F7EBD2] uppercase">
                  KARACHI BITES
                </span>
                <span className="block text-[10px] tracking-[0.25em] text-[#D7AE55] uppercase font-sans font-medium">
                  AUTHENTIC PAKISTANI FLAVOURS
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#BDB4A5] leading-relaxed max-w-sm font-light">
              Crafting premium Pakistani dining experiences from charcoal-fired boti to slow-simmered cast iron karahi and royal saffron biryani.
            </p>

            <div className="text-xs text-[#8C8479]">
              <span>Delivery Hours: 12:00 PM – 1:00 AM Daily</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7AE55]">
              Navigation
            </h4>
            <ul className="space-y-1 text-xs text-[#BDB4A5]">
              <li>
                <button
                  onClick={() => scrollTo('hero')}
                  className="hover:text-[#D7AE55] active:text-[#D7AE55] transition-colors py-2 px-1 rounded cursor-pointer touch-manipulation min-h-[36px] flex items-center"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('menu-section')}
                  className="hover:text-[#D7AE55] active:text-[#D7AE55] transition-colors py-2 px-1 rounded cursor-pointer touch-manipulation min-h-[36px] flex items-center"
                >
                  Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('chefs-special')}
                  className="hover:text-[#D7AE55] active:text-[#D7AE55] transition-colors py-2 px-1 rounded cursor-pointer touch-manipulation min-h-[36px] flex items-center"
                >
                  Chef's Special
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('sweet-finish')}
                  className="hover:text-[#D7AE55] active:text-[#D7AE55] transition-colors py-2 px-1 rounded cursor-pointer touch-manipulation min-h-[36px] flex items-center"
                >
                  Traditional Desserts
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('about')}
                  className="hover:text-[#D7AE55] active:text-[#D7AE55] transition-colors py-2 px-1 rounded cursor-pointer touch-manipulation min-h-[36px] flex items-center"
                >
                  About & Branches
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrack}
                  className="hover:text-[#D7AE55] active:text-[#D7AE55] transition-colors flex items-center gap-1.5 text-[#E8C878] py-2 px-1 rounded cursor-pointer touch-manipulation min-h-[36px]"
                >
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Track Order</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Real Branch Contacts */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7AE55]">
              Karachi Branches
            </h4>
            <div className="space-y-3 text-xs text-[#BDB4A5]">
              <div>
                <strong className="text-[#F7EBD2] block">Clifton:</strong>
                <span>Block 4, Near Boat Basin · 021-35870001</span>
              </div>
              <div>
                <strong className="text-[#F7EBD2] block">Gulshan-e-Iqbal:</strong>
                <span>Block 6, University Road · 021-34980002</span>
              </div>
              <div>
                <strong className="text-[#F7EBD2] block">North Nazimabad:</strong>
                <span>Block D, Near Hydri Market · 021-36640003</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Staff Portal link */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8479]">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Karachi Bites. All rights reserved. Authentic Pakistani Flavours.</p>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={onOpenAdmin}
              className="flex items-center justify-center gap-2 hover:text-[#D7AE55] active:text-[#D7AE55] transition-all py-2.5 px-3.5 rounded-xl border border-white/10 hover:border-[#D7AE55]/40 hover:bg-[#D7AE55]/10 active:scale-95 cursor-pointer touch-manipulation min-h-[44px] w-full sm:w-auto"
            >
              <ShieldCheck className="w-4 h-4 text-[#D7AE55] shrink-0" />
              <span>Staff Management Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
