import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, RefreshCw, Filter, AlertCircle, CheckCircle2, ChevronRight, LogOut, Phone, MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import { Order, OrderStatus } from '../types.ts';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STEPS: OrderStatus[] = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kb_admin_token'));
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string; role: string } | null>(null);
  
  // Default login credentials hint
  const [identifier, setIdentifier] = useState('Karachi Bites');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Verify existing session on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then((data) => {
          if (data.user?.role !== 'admin') {
            // Customer logged in - deny admin access!
            handleLogout();
            setLoginError('Access Denied: Administrator role required. Customer accounts are prohibited from dispatch operations.');
          } else {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Invalid username, email, or password');
      }

      // Check server-verified role
      if (data.user?.role !== 'admin') {
        // Customer credentials entered! Deny access to admin portal!
        throw new Error('Access Denied: This account does not possess administrator privileges.');
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('kb_admin_token', data.token);
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('kb_admin_token');
  };

  const fetchAdminOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    setActionError(null);

    try {
      const params = new URLSearchParams();
      if (selectedBranch && selectedBranch !== 'All') {
        params.append('branch', selectedBranch);
      }
      if (selectedDate) {
        params.append('date', selectedDate);
      }

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          throw new Error('Session invalid or unauthorized. Please re-authenticate.');
        }
        throw new Error('Failed to load orders.');
      }

      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setActionError(err.message || 'Failed to retrieve orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (token && currentUser?.role === 'admin') {
      fetchAdminOrders();
    }
  }, [token, currentUser, selectedBranch, selectedDate]);

  const handleAdvanceStatus = async (order: Order) => {
    const currentIndex = STATUS_STEPS.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STATUS_STEPS.length - 1) return;

    const nextStatus = STATUS_STEPS[currentIndex + 1];
    setUpdatingOrderId(order.orderId);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update order status');
      }

      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.orderId === updated.orderId ? updated : o))
      );
    } catch (err: any) {
      setActionError(err.message || 'Error advancing status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1B1924]/80 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-[#FFF9EF] border border-[#201D22]/15 rounded-3xl shadow-2xl max-w-4xl w-full p-5 sm:p-8 z-10 max-h-[92vh] overflow-y-auto flex flex-col space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#201D22]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B1924] text-[#D7AE55] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#D7AE55] uppercase block">
                INTERNAL RESTAURANT OPERATIONS
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#201D22]">
                Karachi Bites Dispatch Portal
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C8479] hover:text-[#201D22] hover:bg-[#201D22]/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGIN VIEW (if not authenticated or customer role) */}
        {!token || currentUser?.role !== 'admin' ? (
          <div className="max-w-md mx-auto w-full py-6 space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1B1924]/5 border border-[#201D22]/10 flex items-center justify-center mx-auto text-[#201D22]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold text-[#201D22]">
                Administrator Authentication
              </h4>
              <p className="text-xs text-[#6E675F] mt-1">
                Authorized Karachi Bites owner & branch dispatch access only.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-semibold uppercase text-[#6E675F] block mb-1">
                  Admin Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Karachi Bites or owner email"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#201D22]/15 bg-white text-sm text-[#201D22] focus:outline-none focus:border-[#D7AE55]"
                />
                <span className="text-[10px] text-[#8C8479] block mt-1">
                  Accepts username <strong className="text-[#201D22]">Karachi Bites</strong> or owner email
                </span>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase text-[#6E675F] block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#201D22]/15 bg-white text-sm text-[#201D22] focus:outline-none focus:border-[#D7AE55]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#1B1924] text-[#E8C878] hover:bg-[#D7AE55] hover:text-[#1B1924] rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>LOG IN AS ADMINISTRATOR</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* DASHBOARD VIEW */
          <div className="space-y-6">
            
            {/* Top Toolbar: Branch Filter, Date, Refresh & Logout */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#201D22]/10">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-[#8C8479] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Branch:</span>
                </span>
                {(['All', 'Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBranch(b)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedBranch === b
                        ? 'bg-[#1B1924] text-[#E8C878] font-bold'
                        : 'bg-[#F4E8D3]/50 text-[#6E675F] hover:bg-[#F4E8D3]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D7AE55]/15 border border-[#D7AE55]/30 text-[11px] text-[#8C6D27] font-medium">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{currentUser.username} (Admin)</span>
                </div>
                <button
                  onClick={fetchAdminOrders}
                  disabled={loadingOrders}
                  title="Refresh order queue"
                  className="p-2 rounded-lg border border-[#201D22]/15 hover:bg-[#F4E8D3] text-[#201D22] transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Orders Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8C8479]">
                <span>
                  Showing <strong className="text-[#201D22] font-mono">{orders.length}</strong> orders
                </span>
                <span>Sorted by most recent</span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#201D22]/10">
                  <p className="font-serif text-lg font-bold text-[#201D22]">No orders found</p>
                  <p className="text-xs text-[#6E675F] mt-1">There are no orders matching the selected filter.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {orders.map((ord) => {
                    const currIndex = STATUS_STEPS.indexOf(ord.status);
                    const nextStatus = currIndex < STATUS_STEPS.length - 1 ? STATUS_STEPS[currIndex + 1] : null;

                    return (
                      <div
                        key={ord.orderId}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-[#201D22]/10 shadow-2xs space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#201D22]/8">
                          <div className="flex items-center gap-2.5">
                            <span className="font-serif font-bold text-base sm:text-lg text-[#201D22]">
                              {ord.orderId}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D7AE55]/20 text-[#8C6D27] uppercase">
                              {ord.branch}
                            </span>
                            <span className="text-[11px] text-[#8C8479]">
                              {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'Out for Delivery'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.status === 'Preparing'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Address details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#6E675F]">
                          <div>
                            <span className="font-semibold text-[#201D22] block">{ord.customer?.name}</span>
                            <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                              <Phone className="w-3 h-3 text-[#8C6D27]" />
                              <span className="font-mono text-[#201D22]">{ord.customer?.phone}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-[11px] mt-1 text-[#8C8479]">
                              <MapPin className="w-3 h-3 text-[#8C6D27] shrink-0 mt-0.5" />
                              <span>{ord.customer?.address}</span>
                            </div>
                          </div>

                          <div className="bg-[#F4E8D3]/40 p-2.5 rounded-xl border border-[#201D22]/5">
                            <span className="font-bold text-[#201D22] block text-[11px] mb-1">
                              Ordered Items:
                            </span>
                            <ul className="space-y-0.5 text-[11px]">
                              {ord.items?.map((it) => (
                                <li key={it.id} className="flex justify-between">
                                  <span>{it.name} × {it.qty}</span>
                                  <span className="font-mono font-medium">Rs. {it.price * it.qty}</span>
                                </li>
                              ))}
                            </ul>
                            {ord.notes && (
                              <p className="mt-1 text-[10px] text-amber-800 italic">
                                Note: {ord.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Total & Step Progression Button */}
                        <div className="pt-2 border-t border-[#201D22]/8 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-[#8C8479]">Amount: </span>
                            <span className="font-serif font-bold text-base text-[#201D22] font-mono">
                              Rs. {ord.total}
                            </span>
                            <span className="text-[10px] text-[#8C8479] ml-1">(COD)</span>
                          </div>

                          {nextStatus ? (
                            <button
                              onClick={() => handleAdvanceStatus(ord)}
                              disabled={updatingOrderId === ord.orderId}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D7AE55] text-[#1B1924] hover:bg-[#E8C878] text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-60"
                            >
                              <span>Advance to {nextStatus}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Order Completed</span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
