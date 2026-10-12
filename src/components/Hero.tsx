import React from 'react';
import { ArrowRight, Flame, MapPin } from 'lucide-react';
import heroFeastImage from '../assets/images/hero_pakistani_feast_1791648599401.jpg';

interface HeroProps {
  onOrderNow: () => void;
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOrderNow, onExploreMenu }) => {
  return (
    <section id="hero" className="w-full px-3 sm:px-6 lg:px-8 py-3 md:py-6">
      {/* Large Dark Hero Panel with rounded outer corners */}
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] bg-[#1B1924] text-[#F7EBD2] border border-[#D7AE55]/25 shadow-2xl">
        {/* Subtle Pakistani / Mughal Architectural Geometry & Jaali in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-islamic-jaali-dark" />
        
        {/* Elegant Gold Corner Filigree / Line Detailing */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-[#D7AE55]/40 pointer-events-none rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-[#D7AE55]/40 pointer-events-none rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-[#D7AE55]/40 pointer-events-none rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-[#D7AE55]/40 pointer-events-none rounded-br-lg" />

        {/* Ambient Warm Golden Glow behind food */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#D7AE55]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: Editorial Typography & Actions (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              
              {/* Small Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#D7AE55]/30 bg-[#D7AE55]/10 text-[#D7AE55] text-[11px] font-sans uppercase tracking-[0.25em]">
                <Flame className="w-3 h-3 text-[#D7AE55]" />
                <span>AUTHENTIC • TRADITIONAL • PAKISTANI</span>
              </div>

              {/* Large Serif Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.08] font-bold tracking-tight text-[#F7EBD2] text-balance">
                The Taste of <span className="text-[#D7AE55] italic font-normal">Pakistan</span>
              </h1>

              {/* Hero Description */}
              <p className="text-sm sm:text-base md:text-lg text-[#BDB4A5] leading-relaxed max-w-xl font-light">
                Experience the rich flavours of Pakistan, from smoky BBQ and aromatic biryani to traditional karahi, fresh rolls and timeless desserts.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                {/* Small gold CTA button */}
                <button
                  onClick={onOrderNow}
                  className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-3 bg-[#D7AE55] text-[#1B1924] hover:bg-[#E8C878] rounded-xl sm:rounded font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-[#D7AE55]/20 active:scale-[0.98] min-h-[44px] cursor-pointer touch-manipulation w-full sm:w-auto"
                >
                  <span>ORDER NOW</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                {/* Secondary link */}
                <button
                  onClick={onExploreMenu}
                  className="inline-flex items-center justify-center px-6 py-3.5 sm:py-3 border border-[#D7AE55]/40 text-[#F7EBD2] hover:text-[#D7AE55] hover:border-[#D7AE55] hover:bg-[#D7AE55]/10 rounded-xl sm:rounded font-medium text-xs uppercase tracking-wider transition-all duration-200 min-h-[44px] cursor-pointer touch-manipulation w-full sm:w-auto active:scale-[0.98]"
                >
                  EXPLORE MENU
                </button>
              </div>

              {/* Subtle Trust & Heritage Badges */}
              <div className="pt-6 border-t border-white/10 w-full flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#BDB4A5]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D7AE55]" />
                  <span>Clifton · Gulshan-e-Iqbal · North Nazimabad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D7AE55]/70" />
                  <span>Charcoal grilled daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D7AE55]/70" />
                  <span>100% Halal authentic cuts</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Food Photograph (5 cols on desktop) */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-none">
                
                {/* Decorative gold hairline frame behind photo */}
                <div className="absolute -inset-2.5 sm:-inset-3 rounded-2xl border border-[#D7AE55]/30 transform rotate-1 pointer-events-none" />
                
                {/* Image Container */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-[#D7AE55]/30 bg-[#201D29] group">
                  <img
                    src={heroFeastImage || '/images/hero_pakistani_feast_1791648599401.jpg'}
                    alt="Authentic Karachi Mixed BBQ Platter featuring Chicken Malai Boti and Beef Seekh Kebabs"
                    className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                    width={800}
                    height={600}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.src.includes('/images/hero_pakistani_feast_1791648599401.jpg')) {
                        img.src = '/images/hero_pakistani_feast_1791648599401.jpg';
                      }
                    }}
                  />

                  {/* Gradient Scrim for subtle contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1924]/85 via-transparent to-transparent opacity-80" />

                  {/* Photo Caption Overlay */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#F7EBD2]">
                    <div>
                      <span className="block font-serif text-sm font-semibold text-[#E8C878]">Royal Sizzler Platter</span>
                      <span className="text-[11px] text-[#BDB4A5]">Chicken Malai Boti & Seekh Kebabs</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#1B1924]/90 border border-[#D7AE55]/40 text-[#D7AE55] font-mono font-medium">
                      Charcoal Grilled
                    </span>
                  </div>
                </div>

                {/* Subtle ornamental crest / badge */}
                <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#201D29]/95 border border-[#D7AE55]/40 text-[#F7EBD2] shadow-xl backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-[#D7AE55]" />
                  <span className="text-xs font-serif italic text-[#F7EBD2]">Prepared Fresh to Order</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
