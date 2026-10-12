import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types.ts';
import { resolveItemImage, getFoodPlaceholderSvg } from '../assets/images/index.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (itemId: number, delta: number) => void;
  onRemoveItem: (itemId: number) => void;
  onProceedToCheckout: () => void;
  deliveryFee: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  deliveryFee,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, curr) => acc + curr.menuItem.price * curr.qty,
    0
  );
  const total = subtotal > 0 ? subtotal + deliveryFee : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#1B1924]/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFF9EF] border-l border-[#201D22]/15 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-[#201D22]/10 bg-[#1B1924] text-[#F7EBD2] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D7AE55]" />
              <h3 className="font-serif text-xl font-bold tracking-wide">
                Your Order
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-[#BDB4A5] hover:text-[#F7EBD2] hover:bg-white/10 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1B1924]/5 border border-[#201D22]/10 mx-auto flex items-center justify-center text-[#8C8479]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg font-bold text-[#201D22]">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-[#6E675F] max-w-xs mx-auto">
                    Explore our BBQ, karahi, and fresh dishes to begin your order.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(({ menuItem, qty }) => (
                  <div
                    key={menuItem.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-[#201D22]/8 shadow-2xs"
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={resolveItemImage(menuItem.image, menuItem.id)}
                      alt={menuItem.name}
                      className="w-14 h-14 rounded-lg object-cover bg-[#1B1924]/10 shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getFoodPlaceholderSvg(menuItem.name, menuItem.category);
                      }}
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-[#201D22] truncate">
                        {menuItem.name}
                      </h4>
                      <div className="text-xs text-[#8C8479] font-mono tabular-nums">
                        Rs. {menuItem.price} × {qty} ={' '}
                        <span className="font-bold text-[#201D22]">
                          Rs. {menuItem.price * qty}
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 sm:gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQty(menuItem.id, -1)}
                          className="w-8 h-8 rounded-lg border border-[#201D22]/20 flex items-center justify-center text-[#201D22] hover:bg-[#F4E8D3] active:bg-[#D7AE55]/20 transition-colors cursor-pointer touch-manipulation min-w-[32px] min-h-[32px]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold font-mono px-2 py-1 min-w-[24px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(menuItem.id, 1)}
                          className="w-8 h-8 rounded-lg border border-[#201D22]/20 flex items-center justify-center text-[#201D22] hover:bg-[#F4E8D3] active:bg-[#D7AE55]/20 transition-colors cursor-pointer touch-manipulation min-w-[32px] min-h-[32px]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveItem(menuItem.id)}
                      className="p-2.5 text-[#8C8479] hover:text-red-700 active:text-red-800 transition-colors cursor-pointer touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-red-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#201D22]/10 bg-white space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6E675F]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-[#201D22]">
                    Rs. {subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-[#6E675F]">
                  <span>Delivery Charge</span>
                  <span className="font-mono tabular-nums text-[#201D22]">
                    Rs. {deliveryFee}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#201D22]/10 flex justify-between text-sm font-bold text-[#201D22]">
                  <span>Total (Cash on Delivery)</span>
                  <span className="font-serif text-lg text-[#8C6D27] font-mono tabular-nums">
                    Rs. {total}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-4 sm:py-3.5 bg-[#D7AE55] text-[#1B1924] hover:bg-[#E8C878] rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer touch-manipulation min-h-[48px]"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
