import React from 'react';
import { ArrowRight, Sparkles, Clock, Flame } from 'lucide-react';
import specialMuttonKarahi from '../assets/images/special_mutton_karahi_1791648611986.jpg';

interface ChefsSpecialProps {
  onDiscoverMenu: () => void;
}

export const ChefsSpecial: React.FC<ChefsSpecialProps> = ({ onDiscoverMenu }) => {
  return (
    <section id="chefs-special" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-[#FFF9EF] border border-[#201D22]/10 rounded-3xl md:rounded-[36px] overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* LEFT: Large authentic photograph of Shinwari Mutton Karahi in cast iron wok */}
          <div className="lg:col-span-6 relative overflow-hidden min-h-[360px] lg:min-h-[500px] bg-[#1B1924]">
            <img
              src={specialMuttonKarahi || '/images/special_mutton_karahi_1791648611986.jpg'}
              alt="Artisanal Shinwari Mutton Karahi cooked in traditional cast iron wok with fresh ginger juliennes"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
              width={700}
              height={600}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.includes('/images/special_mutton_karahi_1791648611986.jpg')) {
                  img.src = '/images/special_mutton_karahi_1791648611986.jpg';
                }
              }}
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1924]/80 via-transparent to-transparent lg:hidden" />
            
            {/* Floating Tag */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-4 py-2 bg-[#1B1924]/90 border border-[#D7AE55]/40 text-[#F7EBD2] rounded-xl shadow-lg backdrop-blur-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D7AE55]" />
              <span className="font-serif text-sm font-semibold tracking-wide">Cast Iron Shinwari Mutton Karahi</span>
            </div>
          </div>

          {/* RIGHT: Editorial Magazine Layout */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-sans font-bold tracking-[0.25em] text-[#8C6D27] uppercase">
                <Flame className="w-3.5 h-3.5 text-[#D7AE55]" />
                CHEF'S SPECIAL
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#201D22] tracking-tight leading-[1.15]">
                Made With Tradition
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#6E675F] leading-relaxed font-light">
              Our signature Mutton Karahi honors timeless culinary craftsmanship passed through generations. Slow-simmered in seasoned cast iron woks over open coals, we use only hand-crushed whole coriander, fresh ginger juliennes, ripe mountain tomatoes, and pure desi ghee.
            </p>

            {/* Editorial highlights list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-[#201D22]/10">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D7AE55] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#201D22]">Slow Open-Flame Cooking</h4>
                  <p className="text-[11px] text-[#8C8479]">Reduced until rich, thick gravy coats every tender morsel.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#D7AE55] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#201D22]">Freshly Ground Spices</h4>
                  <p className="text-[11px] text-[#8C8479]">Small-batch roasted spices prepared in-house each morning.</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 w-full sm:w-auto">
              <button
                onClick={onDiscoverMenu}
                className="group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#201D22] text-[#F7EBD2] hover:bg-[#D7AE55] hover:text-[#1B1924] rounded-xl sm:rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 min-h-[44px] w-full sm:w-auto active:scale-[0.98] cursor-pointer touch-manipulation shadow-sm"
              >
                <span>Discover Our Menu</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
