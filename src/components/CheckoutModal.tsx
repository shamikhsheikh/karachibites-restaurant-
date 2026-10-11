import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, MapPin, Phone, User, FileText, ArrowRight } from 'lucide-react';
import { CartItem, Order } from '../types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  deliveryFee: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  deliveryFee,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState<'Clifton' | 'Gulshan-e-Iqbal' | 'North Nazimabad'>('Clifton');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, curr) => acc + curr.menuItem.price * curr.qty,
    0
  );
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    const pkPhoneRegex = /^((\+92)|(0092)|(0))?3[0-9]{9}$/;
    if (!pkPhoneRegex.test(cleanPhone)) {
      setError('Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or 03219876543).');
      return;
    }

    if (!address.trim() || address.trim().length < 8) {
      setError('Please provide a complete delivery address including street and area.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      },
      branch,
      items: cartItems.map((c) => ({
        id: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        qty: c.qty,
      })),
      notes: notes.trim(),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to place order. Please check your information.');
      }

      const orderData = await res.json();
      onOrderSuccess(orderData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1B1924]/75 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Surface */}
      <div className="relative bg-[#FFF9EF] border border-[#201D22]/15 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#201D22]/10">
          <div>
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#D7AE55] uppercase block">
              FINAL STEP
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#201D22]">
              Delivery Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C8479] hover:text-[#201D22] hover:bg-[#201D22]/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {/* Branch Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#201D22] block">
              Select Delivering Branch *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBranch(b)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                    branch === b
                      ? 'border-[#D7AE55] bg-[#D7AE55]/15 text-[#8C6D27] font-bold shadow-2xs'
                      : 'border-[#201D22]/15 bg-white text-[#6E675F] hover:border-[#D7AE55]/50'
                  }`}
                >
                  <span className="block font-serif text-sm text-[#201D22]">{b}</span>
                  <span className="text-[10px] text-[#8C8479]">Flat Rs. 150</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#201D22] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8C6D27]" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hamza Tariq"
              className="w-full px-4 py-2.5 rounded-xl border border-[#201D22]/15 bg-white text-sm text-[#201D22] focus:outline-none focus:border-[#D7AE55] focus:ring-1 focus:ring-[#D7AE55]"
            />
          </div>

          {/* Pakistani Mobile Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#201D22] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#8C6D27]" />
              <span>Pakistani Mobile Number *</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0300-1234567 or 03219876543"
              className="w-full px-4 py-2.5 rounded-xl border border-[#201D22]/15 bg-white text-sm text-[#201D22] font-mono focus:outline-none focus:border-[#D7AE55] focus:ring-1 focus:ring-[#D7AE55]"
            />
            <p className="text-[11px] text-[#8C8479]">
              Used for delivery rider call and order tracking lookup.
            </p>
          </div>

          {/* Full Delivery Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#201D22] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#8C6D27]" />
              <span>Full Delivery Address *</span>
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Apartment number, street name, block, area..."
              className="w-full px-4 py-2 rounded-xl border border-[#201D22]/15 bg-white text-sm text-[#201D22] focus:outline-none focus:border-[#D7AE55] focus:ring-1 focus:ring-[#D7AE55]"
            />
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#201D22] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#8C8479]" />
              <span>Special Instructions (Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra mint chutney, ring the doorbell twice"
              className="w-full px-4 py-2.5 rounded-xl border border-[#201D22]/15 bg-white text-sm text-[#201D22] focus:outline-none focus:border-[#D7AE55]"
            />
          </div>

          {/* Order Summary Review */}
          <div className="p-4 rounded-2xl bg-[#F4E8D3]/70 border border-[#201D22]/10 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-[#201D22] pb-1 border-b border-[#201D22]/10">
              <span>Order Summary ({cartItems.length} items)</span>
              <span>Subtotal: Rs. {subtotal}</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 text-[#6E675F]">
              {cartItems.map((c) => (
                <div key={c.menuItem.id} className="flex justify-between">
                  <span>{c.menuItem.name} × {c.qty}</span>
                  <span className="font-mono">Rs. {c.menuItem.price * c.qty}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-[#201D22]/10 flex justify-between font-bold text-sm text-[#201D22]">
              <span>Total due upon delivery</span>
              <span className="text-[#8C6D27] font-serif font-bold text-base font-mono">
                Rs. {total}
              </span>
            </div>
            <div className="text-[11px] text-[#8C8479] flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Payment Mode: Cash on Delivery (COD)</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#D7AE55] text-[#1B1924] hover:bg-[#E8C878] rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Order with Kitchen...</span>
              </>
            ) : (
              <>
                <span>CONFIRM ORDER (Rs. {total})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
