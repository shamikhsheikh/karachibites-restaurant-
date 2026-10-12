import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onOrderNow: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOrderNow }) => {
  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[36px] bg-[#1B1924] text-[#F7EBD2] border border-[#D7AE55]/30 shadow-2xl max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-20 text-center">
        
        {/* Subtle Islamic Jaali Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-islamic-jaali-dark" />
        
        {/* Decorative Gold Filigree Accents */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t border-l border-[#D7AE55]/40 pointer-events-none rounded-tl-md" />
        <div className="absolute top-4 right-4 w-10 h-10 border-t border-r border-[#D7AE55]/40 pointer-events-none rounded-tr-md" />
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b border-l border-[#D7AE55]/40 pointer-events-none rounded-bl-md" />
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b border-r border-[#D7AE55]/40 pointer-events-none rounded-br-lg" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <span className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#D7AE55] uppercase block">
            FINE PAKISTANI DINING AT YOUR DOORSTEP
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#F7EBD2] tracking-tight">
            Ready to Taste Karachi?
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-[#BDB4A5] leading-relaxed font-light">
            Order your favourite Pakistani dishes and enjoy authentic flavours wherever you are.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              onClick={onOrderNow}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-3.5 bg-[#D7AE55] text-[#1B1924] hover:bg-[#E8C878] rounded-xl sm:rounded font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#D7AE55]/20 active:scale-[0.98] w-full sm:w-auto min-h-[44px] cursor-pointer touch-manipulation"
            >
              <span>ORDER NOW</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
            </button>
          </div>

          <p className="text-xs text-[#8C8479] pt-2">
            Delivering across Clifton · Gulshan-e-Iqbal · North Nazimabad · Flat Rs. 150 Delivery
          </p>
        </div>

      </div>
    </section>
  );
};
