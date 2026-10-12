import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Flame, Leaf } from 'lucide-react';
import { MenuItem } from '../types.ts';
import { resolveItemImage, getFoodPlaceholderSvg } from '../assets/images/index.ts';

interface MenuCardProps {
  item: MenuItem;
  inCartQty: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQty?: (itemId: number, delta: number) => void;
  onRemoveItem?: (itemId: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  inCartQty,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
}) => {
  const isSpicy = item.tags.includes('spicy');
  const isVeg = item.tags.includes('veg');
  const [imgSrc, setImgSrc] = useState(() => resolveItemImage(item.image, item.id));

  useEffect(() => {
    setImgSrc(resolveItemImage(item.image, item.id));
  }, [item.image, item.id]);

  return (
    <div className="group flex flex-col justify-between rounded-2xl bg-[#FFF9EF] border border-[#201D22]/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#D7AE55]/60 hover:-translate-y-0.5">
      {/* Food Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1B1924]/10">
        <img
          src={imgSrc}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          width={400}
          height={300}
          onError={() => {
            // Sensible graceful fallback if primary image fails
            setImgSrc(getFoodPlaceholderSvg(item.name, item.category));
          }}
        />

        {/* Subtle top right culinary tag */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isSpicy && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-[#1B1924]/85 text-[#E8C878] border border-[#D7AE55]/30 backdrop-blur-xs">
              <Flame className="w-3 h-3 text-[#D7AE55]" />
              <span>Spicy</span>
            </span>
          )}
          {isVeg && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-[#1B1924]/85 text-[#73A657] border border-[#73A657]/30 backdrop-blur-xs">
              <Leaf className="w-3 h-3 text-[#73A657]" />
              <span>Veg</span>
            </span>
          )}
        </div>

        {!item.available && (
          <div className="absolute inset-0 bg-[#1B1924]/75 backdrop-blur-xs flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#F7EBD2] px-3 py-1 border border-white/20 rounded">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Editorial Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Small Category */}
          <span className="text-[11px] font-sans font-semibold tracking-[0.2em] text-[#8C6D27] uppercase block">
            {item.category}
          </span>

          {/* Product Name */}
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#201D22] group-hover:text-[#8C6D27] transition-colors">
            {item.name}
          </h3>

          {/* Culinary Description with enhanced contrast */}
          <p className="text-xs sm:text-[13px] text-[#3D3833] leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Price and Responsive Add Action */}
        <div className="pt-3 border-t border-[#201D22]/8 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-[#8C8479] block">Price</span>
            <span className="font-serif text-lg sm:text-xl font-bold text-[#201D22] font-mono tabular-nums">
              Rs. {item.price}
            </span>
          </div>

          {!item.available ? (
            <button
              disabled
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider opacity-40 cursor-not-allowed bg-neutral-200 text-neutral-500 w-full sm:w-auto"
            >
              Unavailable
            </button>
          ) : inCartQty > 0 ? (
            /* Active Stepper Control directly in the card */
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => onUpdateQty ? onUpdateQty(item.id, -1) : onAddToCart(item)}
                className="w-9 h-9 rounded-xl border border-[#201D22]/20 bg-white hover:bg-[#F4E8D3] active:bg-[#D7AE55]/20 flex items-center justify-center text-[#201D22] transition-colors cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] shadow-2xs"
                aria-label={`Decrease quantity of ${item.name}`}
                title={inCartQty <= 1 ? "Minimum quantity is 1. Use the delete option to remove this item." : "Decrease quantity"}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="px-3 py-1.5 rounded-xl bg-[#1B1924] text-[#E8C878] font-mono font-bold text-xs flex items-center gap-1 shadow-2xs">
                <span>{inCartQty}</span>
                <span className="text-[10px] text-[#BDB4A5] font-sans uppercase">in cart</span>
              </div>
              <button
                onClick={() => onUpdateQty ? onUpdateQty(item.id, 1) : onAddToCart(item)}
                className="w-9 h-9 rounded-xl border border-[#201D22]/20 bg-white hover:bg-[#F4E8D3] active:bg-[#D7AE55]/20 flex items-center justify-center text-[#201D22] transition-colors cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] shadow-2xs"
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {onRemoveItem && (
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="w-9 h-9 rounded-xl text-[#8C8479] hover:text-red-700 hover:bg-red-50 active:bg-red-100 flex items-center justify-center transition-colors cursor-pointer touch-manipulation min-w-[36px] min-h-[36px]"
                  aria-label={`Remove ${item.name} from cart`}
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              aria-label={`Add ${item.name} to cart`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider bg-[#201D22] text-[#F7EBD2] hover:bg-[#D7AE55] hover:text-[#1B1924] shadow-xs transition-all duration-200 cursor-pointer touch-manipulation min-h-[44px] active:scale-[0.97] w-full sm:w-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
