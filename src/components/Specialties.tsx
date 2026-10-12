import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { MenuItem } from '../types.ts';
import { MenuCard } from './MenuCard.tsx';

interface SpecialtiesProps {
  menuItems: MenuItem[];
  cartItemCounts: Record<number, number>;
  onAddToCart: (item: MenuItem) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
}

const CATEGORIES = ['ALL', 'BBQ', 'KARAHI', 'RICE', 'ROLLS', 'DRINKS', 'DESSERTS'] as const;

export const Specialties: React.FC<SpecialtiesProps> = ({
  menuItems,
  cartItemCounts,
  onAddToCart,
  searchRef,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [spicyOnly, setSpicyOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  // Compute minimum & maximum prices for the slider
  const { minMenuPrice, maxMenuPrice } = useMemo(() => {
    if (!menuItems.length) return { minMenuPrice: 150, maxMenuPrice: 2000 };
    const prices = menuItems.map((m) => m.price);
    return {
      minMenuPrice: Math.min(...prices),
      maxMenuPrice: Math.max(...prices),
    };
  }, [menuItems]);

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    searchQuery.trim() !== '' ||
    vegOnly ||
    spicyOnly ||
    maxPrice < maxMenuPrice;

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setVegOnly(false);
    setSpicyOnly(false);
    setMaxPrice(maxMenuPrice);
  };

  // Combined filtering: Category + Search + Veg + Spicy + Max Price
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      // Veg only
      if (vegOnly && !item.tags.includes('veg')) {
        return false;
      }
      // Spicy only
      if (spicyOnly && !item.tags.includes('spicy')) {
        return false;
      }
      // Max price
      if (item.price > maxPrice) {
        return false;
      }
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, vegOnly, spicyOnly, maxPrice]);

  return (
    <section id="menu-section" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 13. SECTION TRANSITION: Clean & Minimal Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <span className="text-xs font-sans font-semibold tracking-[0.25em] text-[#D7AE55] uppercase block">
          OUR SPECIALTIES
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#201D22] tracking-tight">
          A Taste of Karachi
        </h2>
        <p className="text-sm sm:text-base text-[#6E675F] leading-relaxed font-light">
          Traditional recipes, carefully prepared with authentic flavours and fresh ingredients.
        </p>
      </div>

      {/* 15. MENU NAVIGATION: Refined text navigation with gold active states */}
      <div className="border-b border-[#201D22]/10 mb-8 pb-1">
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 md:gap-10 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`group relative py-2.5 sm:pb-3 px-2 sm:px-1 text-xs sm:text-sm font-sans uppercase tracking-[0.15em] sm:tracking-[0.18em] transition-all whitespace-nowrap cursor-pointer touch-manipulation min-h-[44px] flex items-center shrink-0 ${
                  isActive
                    ? 'text-[#8C6D27] font-bold'
                    : 'text-[#6E675F] hover:text-[#201D22] active:text-[#201D22] font-medium'
                }`}
              >
                <span>{cat}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D7AE55] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER CONTROLS BAR: Search + Combined Veg / Spicy / Max Price */}
      <div className="bg-[#FFF9EF] border border-[#201D22]/10 rounded-2xl p-4 sm:p-5 mb-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchRef as any}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Biryani, Boti, Karahi)..."
              className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-[#201D22]/15 bg-[#F4E8D3]/50 text-sm text-[#201D22] placeholder-[#8C8479] focus:outline-none focus:border-[#D7AE55] focus:ring-1 focus:ring-[#D7AE55] transition-all min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8C8479] hover:text-[#201D22] p-2 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer touch-manipulation active:scale-95"
                aria-label="Clear search input"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Dietary Filters */}
          <div className="md:col-span-4 flex items-center gap-2.5">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium tracking-wide transition-all cursor-pointer touch-manipulation min-h-[44px] active:scale-[0.98] ${
                vegOnly
                  ? 'border-[#73A657] bg-[#73A657]/15 text-[#376121] font-semibold shadow-2xs'
                  : 'border-[#201D22]/15 bg-[#F4E8D3]/30 text-[#6E675F] hover:border-[#73A657]/50 active:bg-[#F4E8D3]/60'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${vegOnly ? 'border-[#376121] bg-[#376121]' : 'border-[#6E675F]'}`}>
                {vegOnly && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="truncate">Vegetarian</span>
            </button>

            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium tracking-wide transition-all cursor-pointer touch-manipulation min-h-[44px] active:scale-[0.98] ${
                spicyOnly
                  ? 'border-[#D7AE55] bg-[#D7AE55]/20 text-[#8C6D27] font-semibold shadow-2xs'
                  : 'border-[#201D22]/15 bg-[#F4E8D3]/30 text-[#6E675F] hover:border-[#D7AE55]/50 active:bg-[#F4E8D3]/60'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${spicyOnly ? 'border-[#8C6D27] bg-[#8C6D27]' : 'border-[#6E675F]'}`}>
                {spicyOnly && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="truncate">Spicy</span>
            </button>
          </div>

          {/* Price Range & Reset */}
          <div className="md:col-span-3 flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px] text-[#8C8479]">
                <span>Max Price</span>
                <span className="font-semibold text-[#201D22] font-mono">Rs. {maxPrice}</span>
              </div>
              <input
                type="range"
                min={minMenuPrice}
                max={maxMenuPrice}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#D7AE55] cursor-pointer h-2 bg-[#201D22]/15 rounded-lg touch-manipulation"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-2.5 rounded-xl border border-[#201D22]/15 hover:bg-[#F4E8D3] active:bg-[#F4E8D3]/80 text-[#8C8479] hover:text-[#201D22] transition-colors cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 active:scale-95 shadow-2xs"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Results Counter and Active Chips */}
        <div className="mt-3 pt-3 border-t border-[#201D22]/5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8C8479]">
          <span>
            Showing <strong className="text-[#201D22] font-mono">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'dish' : 'dishes'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-[#8C6D27] hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* MENU CARDS GRID: 3-column desktop editorial grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              inCartQty={cartItemCounts[item.id] || 0}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[#FFF9EF] rounded-3xl border border-[#201D22]/10 max-w-md mx-auto">
          <p className="font-serif text-2xl font-bold text-[#201D22] mb-2">No dishes match your filter</p>
          <p className="text-sm text-[#6E675F] mb-6">
            Try adjusting your search keywords, price range, or dietary toggles.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D7AE55] text-[#1B1924] rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#E8C878] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

    </section>
  );
};
