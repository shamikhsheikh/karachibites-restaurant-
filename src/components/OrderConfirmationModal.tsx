import React from 'react';
import { CheckCircle, Compass, ArrowRight, X } from 'lucide-react';
import { Order } from '../types.ts';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string, phone: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1B1924]/80 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-[#FFF9EF] border border-[#201D22]/15 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#8C8479] hover:text-[#201D22] hover:bg-[#201D22]/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-sans font-semibold tracking-[0.2em] text-[#8C6D27] uppercase block">
            SHUKRIYA! ORDER CONFIRMED
          </span>
          <h3 className="font-serif text-3xl font-bold text-[#201D22]">
            Order #{order.orderId}
          </h3>
          <p className="text-xs sm:text-sm text-[#6E675F] max-w-xs mx-auto">
            Our kitchen has received your order and our chefs are getting the live coals ready.
          </p>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl bg-white border border-[#201D22]/10 p-4 text-left text-xs space-y-2.5">
          <div className="flex justify-between pb-2 border-b border-[#201D22]/10">
            <span className="text-[#8C8479]">Current Status</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C8479]">Branch</span>
            <span className="font-medium text-[#201D22]">{order.branch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C8479]">Customer</span>
            <span className="font-medium text-[#201D22]">{order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C8479]">Mobile</span>
            <span className="font-mono text-[#201D22]">{order.customer.phone}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#201D22]/10 font-bold text-sm text-[#201D22]">
            <span>Total Payable (COD)</span>
            <span className="font-mono text-[#8C6D27]">Rs. {order.total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => onTrackOrder(order.orderId, order.customer.phone)}
            className="w-full py-3 bg-[#1B1924] text-[#E8C878] hover:bg-[#D7AE55] hover:text-[#1B1924] rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>TRACK LIVE PROGRESS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-[#6E675F] hover:text-[#201D22] font-medium"
          >
            Back to Karachi Bites Menu
          </button>
        </div>

      </div>
    </div>
  );
};
