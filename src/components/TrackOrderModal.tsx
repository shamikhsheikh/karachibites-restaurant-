import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Clock, Truck, Home, AlertCircle, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  initialPhone?: string;
}

const STATUS_STAGES: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'Received',
    label: 'Order Received',
    desc: 'Ticket confirmed by kitchen dispatch.',
    icon: Clock,
  },
  {
    status: 'Preparing',
    label: 'Preparing',
    desc: 'Charcoal flames lit & dishes hand-crafted.',
    icon: Clock,
  },
  {
    status: 'Out for Delivery',
    label: 'Out for Delivery',
    desc: 'Rider en route with insulated hot bag.',
    icon: Truck,
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    desc: 'Delivered to your doorstep. Bon appétit!',
    icon: Home,
  },
];

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
  initialPhone = '',
}) => {
  if (!isOpen) return null;

  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (idToSearch: string, phoneToSearch: string) => {
    if (!idToSearch.trim()) {
      setError('Please enter your Order ID (e.g. KB-1001).');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const url = `/api/orders/${encodeURIComponent(idToSearch.trim())}${
        phoneToSearch.trim() ? `?phone=${encodeURIComponent(phoneToSearch.trim())}` : ''
      }`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Order not found. Please verify your Order ID and phone number.');
        }
        throw new Error('Unable to retrieve order details.');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Error loading order tracking.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      if (initialPhone) setPhone(initialPhone);
      fetchOrder(initialOrderId, initialPhone);
    }
  }, [initialOrderId, initialPhone]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId, phone);
  };

  const currentStatusIndex = order
    ? STATUS_STAGES.findIndex((s) => s.status === order.status)
    : -1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1B1924]/75 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-[#FFF9EF] border border-[#201D22]/15 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#201D22]/10">
          <div>
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#D7AE55] uppercase block">
              REAL-TIME STATUS
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#201D22]">
              Track Your Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-[#8C8479] hover:text-[#201D22] hover:bg-[#201D22]/5 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Lookup Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold uppercase text-[#6E675F] block mb-1">
                Order ID *
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. KB-1001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#201D22]/15 bg-white text-xs font-mono uppercase text-[#201D22] focus:outline-none focus:border-[#D7AE55] min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase text-[#6E675F] block mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300-1234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#201D22]/15 bg-white text-xs font-mono text-[#201D22] focus:outline-none focus:border-[#D7AE55] min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1B1924] text-[#E8C878] hover:bg-[#D7AE55] hover:text-[#1B1924] rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer touch-manipulation min-h-[48px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 shrink-0" />
                <span>FIND ORDER</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details & Visual Timeline */}
        {order && (
          <div className="space-y-6 pt-2 border-t border-[#201D22]/10 animate-in fade-in duration-200">
            
            {/* Header info */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#201D22]/10">
              <div>
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">
                  ORDER REF
                </span>
                <span className="font-serif text-lg font-bold text-[#201D22]">
                  {order.orderId}
                </span>
                <span className="text-xs text-[#6E675F] block">
                  Branch: {order.branch}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8C8479] uppercase block font-semibold">
                  AMOUNT (COD)
                </span>
                <span className="font-serif text-lg font-bold text-[#8C6D27] font-mono">
                  Rs. {order.total}
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="py-2 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#201D22]">
                Order Progress Timeline
              </h4>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#201D22]/15">
                {STATUS_STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.status} className="relative flex items-start gap-4">
                      {/* Milestone circle */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                          isCurrent
                            ? 'bg-[#D7AE55] text-[#1B1924] ring-4 ring-[#D7AE55]/25 font-bold'
                            : isCompleted
                            ? 'bg-[#201D22] text-[#F7EBD2]'
                            : 'bg-white border-2 border-[#201D22]/20 text-transparent'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-[#E8C878]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold uppercase tracking-wide ${
                              isCurrent
                                ? 'text-[#8C6D27]'
                                : isCompleted
                                ? 'text-[#201D22]'
                                : 'text-[#8C8479]'
                            }`}
                          >
                            {stage.label}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#D7AE55]/20 text-[#8C6D27] uppercase">
                              Current Step
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6E675F] mt-0.5">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="p-3.5 rounded-xl bg-[#F4E8D3]/50 border border-[#201D22]/10 space-y-1.5 text-xs">
              <span className="font-bold text-[#201D22] block">Items in this order:</span>
              <ul className="space-y-1 text-[#6E675F]">
                {order.items?.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.name} × {it.qty}</span>
                    <span className="font-mono">Rs. {it.price * it.qty}</span>
                  </li>
                ))}
              </ul>
              {order.customer?.address && (
                <div className="pt-2 border-t border-[#201D22]/10 text-[11px] text-[#8C8479]">
                  <strong>Destination:</strong> {order.customer.address}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
