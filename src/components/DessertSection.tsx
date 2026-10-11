import React from 'react';
import { Plus, Check, Sparkles } from 'lucide-react';
import { MenuItem } from '../types.ts';

interface DessertSectionProps {
  dessertItems: MenuItem[];
  cartItemCounts: Record<number, number>;
  onAddToCart: (item: MenuItem) => void;
}

export const DessertSection: React.FC<DessertSectionProps> = ({
  dessertItems,
  cartItemCounts,
  onAddToCart,
}) => {
  return (
    <section id="sweet-finish" className="w-full px-3 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[36px] bg-[#1B1924] text-[#F7EBD2] border border-[#D7AE55]/20 shadow-2xl max-w-7xl mx-auto p-6 sm:p-10 lg:p-16">
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-islamic-pattern-dark" />
        
        {/* Header */}
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <span className="text-xs font-sans font-semibold tracking-[0.25em] text-[#D7AE55] uppercase block">
            ROYAL CONFECTIONS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F7EBD2] tracking-tight">
            A Sweet Finish
          </h2>
          <p className="text-sm sm:text-base text-[#BDB4A5] leading-relaxed font-light">
            Traditional desserts to complete your Karachi dining experience.
          </p>
        </div>

        {/* Content Layout: Visual Showcase + Product Spotlight */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Atmospheric Photography */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-[#D7AE55]/30 shadow-2xl bg-[#201D29] group">
              <img
                src="/src/assets/images/dessert_gulab_jamun_kheer_1791648636566.jpg"
                alt="Luxury presentation of Gulab Jamun in cardamom syrup and creamy chilled Kheer in clay pot"
                className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                width={700}
                height={525}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1924]/85 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#F7EBD2]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D7AE55]" />
                  <span className="font-serif text-sm font-medium">Sweet Dumplings & Royal Rice Pudding</span>
                </div>
                <span className="text-[11px] text-[#D7AE55] tracking-widest uppercase font-mono">
                  Pure Khoya & Saffron
                </span>
              </div>
            </div>
          </div>

          {/* Right: The 2 Curated Desserts with quick-add */}
          <div className="lg:col-span-5 space-y-5">
            {dessertItems.map((item) => {
              const inCartQty = cartItemCounts[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#201D29]/90 border border-[#D7AE55]/25 p-5 sm:p-6 transition-all duration-300 hover:border-[#D7AE55]/60 hover:bg-[#201D29]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] font-sans font-semibold tracking-[0.2em] text-[#D7AE55] uppercase block">
                        TRADITIONAL DESSERT
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F7EBD2]">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#BDB4A5] leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#8C8479] block">Price</span>
                      <span className="font-serif text-lg font-bold text-[#E8C878] font-mono tabular-nums">
                        Rs. {item.price}
                      </span>
                    </div>

                    <button
                      onClick={() => onAddToCart(item)}
                      disabled={!item.available}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold tracking-wider transition-all duration-200 ${
                        inCartQty > 0
                          ? 'bg-[#D7AE55] text-[#1B1924] font-bold shadow-md'
                          : 'bg-[#F7EBD2] text-[#1B1924] hover:bg-[#D7AE55]'
                      }`}
                    >
                      {inCartQty > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added ({inCartQty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
