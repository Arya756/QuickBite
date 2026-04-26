import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

function CustomerPortal() {
  const [menu, setMenu] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [pastOrders, setPastOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setMenu(res.data);
    } catch (err) {
      setError("Failed to load menu");
    }
  };

  const fetchOrder = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        localStorage.removeItem('activeOrderId');
        setOrder(null);
      } else {
        setError("Failed to load order");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPastOrders = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await api.get('/orders/mine');
      setPastOrders(res.data);
    } catch (err) {
      setHistoryError("Failed to load order history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    const savedOrderId = localStorage.getItem('activeOrderId');
    if (savedOrderId) {
      fetchOrder(savedOrderId);
    }
    fetchPastOrders();
  }, [fetchOrder, fetchPastOrders]);
  useEffect(() => {
    if (!order?._id || order.status === 'PAID') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${order._id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?._id, order?.status]);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/orders');
      setOrder(res.data);
      localStorage.setItem('activeOrderId', res.data._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemId) => {
    setLoading(true);
    setError(null);

    let retryCount = 0;
    const maxRetries = 1;

    let threadOrder = order;

    const performAdd = async (orderId) => {
      try {
        let targetId = orderId;

        if (!threadOrder || threadOrder.status === 'PAID') {
          const res = await api.post('/orders');
          const newOrder = res.data;
          targetId = newOrder._id;
          threadOrder = newOrder;
          setOrder(newOrder);
          localStorage.setItem('activeOrderId', targetId);
        }

        await api.post(`/orders/${targetId}/items`, { itemId });
        await fetchOrder(targetId);

      } catch (err) {
        const errorMessage = err.response?.data?.error;

        if (errorMessage === "Cannot add items to a paid order" && retryCount < maxRetries) {
          retryCount++;
          console.log("Stale frontend state detected. Creating new order and retrying...");

          const res = await api.post('/orders');
          const freshOrder = res.data;
          threadOrder = freshOrder;
          setOrder(freshOrder);
          localStorage.setItem('activeOrderId', freshOrder._id);

          return performAdd(freshOrder._id);
        }

        throw err;
      }
    };

    try {
      await performAdd(threadOrder?._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      await api.post(`/orders/${order._id}/pay`, {
        method: paymentMethod
      });

      await fetchOrder(order._id);
      await fetchPastOrders();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (index) => {
    if (!order) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/orders/${order._id}/items/${index}`);
      await fetchOrder(order._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (index, action) => {
    if (!order) return;
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/orders/${order._id}/items/${index}`, { action });
      await fetchOrder(order._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const clearOrder = () => {
    localStorage.removeItem('activeOrderId');
    setOrder(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-gradient tracking-tight">Menu Dashboard</h2>
          <p className="text-orange-200/60 mt-1 font-medium">Fresh and delicious food at your fingertips</p>
        </div>
        {!order ? (
          <button
            onClick={handleCreateOrder}
            className="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] active:scale-[0.98] flex items-center gap-2 group"
          >
            <span>Start New Order</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        ) : (
          <button
            onClick={clearOrder}
            className={`px-8 py-3.5 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center gap-2 ${
              order.status === 'PAID'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'glass hover:bg-white/5 text-gray-300'
            }`}
          >
            {order.status === 'PAID' ? '🚀 Start New Order' : 'Start Fresh Session'}
          </button>
        )}
      </header>

      {error && (
        <div className="p-4 glass border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-8 space-y-12">
          
          {/* Menu Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl border border-orange-500/30">🍔</div>
              <h3 className="text-2xl font-bold text-white">Available Items</h3>
            </div>
            
            {menu.length === 0 ? (
              <div className="p-16 text-center glass rounded-3xl border-dashed border-2 border-white/10 text-orange-200/50 italic">
                The menu is currently empty. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {menu.map((item) => (
                  <div key={item._id} className="group glass rounded-2xl p-6 glass-hover relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                    <div>
                      <h4 className="font-bold text-xl text-white group-hover:text-orange-300 transition-colors">{item.name}</h4>
                      <p className="text-xs text-orange-200/50 mt-1">Freshly prepared</p>
                    </div>
                    <div className="mt-6 flex flex-col gap-4">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 font-black text-2xl">₹{(item.price || 0).toFixed(2)}</span>
                      {(() => {
                        const cartItemIndex = order?.items?.findIndex(i => i.name === item.name);
                        if (cartItemIndex > -1) {
                          return (
                            <div className="flex items-center justify-between w-full bg-orange-500/20 rounded-xl border border-orange-500/30 overflow-hidden shadow-inner">
                              <button
                                onClick={() => handleUpdateQuantity(cartItemIndex, 'DECREMENT')}
                                disabled={loading}
                                className="px-4 py-3 hover:bg-orange-500/30 text-orange-300 font-bold transition-colors w-1/3"
                              >
                                -
                              </button>
                              <span className="font-bold text-white w-1/3 text-center">
                                {order.items[cartItemIndex].quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(cartItemIndex, 'INCREMENT')}
                                disabled={loading}
                                className="px-4 py-3 hover:bg-orange-500/30 text-orange-300 font-bold transition-colors w-1/3"
                              >
                                +
                              </button>
                            </div>
                          );
                        }
                        return (
                          <button
                            onClick={() => handleAddItem(item._id)}
                            disabled={loading}
                            className="w-full py-3 rounded-xl border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/20 text-sm font-bold transition-all disabled:opacity-30 disabled:grayscale hover:shadow-[0_0_15px_rgba(234,88,12,0.2)] z-10 relative"
                          >
                            {!order
                              ? 'Start Order First'
                              : order.status === 'PAID'
                                ? '🚀 Start New Order'
                                : 'Add to Order'}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order History Section */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl border border-amber-500/30">📜</div>
                <h3 className="text-2xl font-bold text-white">Order History</h3>
              </div>
              <button 
                onClick={fetchPastOrders} 
                className="text-xs font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-lg"
                disabled={historyLoading}
              >
                {historyLoading ? (
                  <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                ) : '↻'} 
                {historyLoading ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
            
            {historyError && (
              <div className="p-4 glass border-red-500/30 rounded-xl text-red-400 text-sm mb-6">
                {historyError}
              </div>
            )}

            <div className="glass rounded-3xl overflow-hidden shadow-2xl">
              {historyLoading && pastOrders.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-orange-200/50 font-medium">Loading your past orders...</p>
                </div>
              ) : pastOrders.length === 0 ? (
                <div className="p-16 text-center text-orange-200/50 italic border-dashed border-2 border-white/5 m-4 rounded-2xl">
                  No past orders yet. Start your first order above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Order ID</th>
                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Date</th>
                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Total</th>
                        <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pastOrders.map((pOrder) => (
                        <tr key={pOrder._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-orange-200/70">{pOrder._id.slice(-6)}</td>
                          <td className="px-6 py-4 text-xs text-orange-200/70">
                            {new Date(pOrder.createdAt || parseInt(pOrder._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-white text-sm">
                            ₹{(pOrder.totalPrice || pOrder.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                              pOrder.status === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              pOrder.status === 'DELIVERED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {pOrder.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cart Section */}
        <section className="lg:col-span-4">
          <div className="sticky top-28 space-y-6 animate-in slide-in-from-bottom-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl border border-red-500/30">🛒</div>
              <h3 className="text-2xl font-bold text-white">Your Cart</h3>
            </div>
            
            {!order ? (
              <div className="p-12 glass border-dashed border-2 border-white/10 rounded-3xl text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">🥗</div>
                <p className="text-orange-200/50 text-sm font-medium">Create an order to start adding delicious items!</p>
              </div>
            ) : (
              <div className="glass-card rounded-3xl overflow-hidden flex flex-col max-h-[calc(100vh-150px)] relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Current Order</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      order.status === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-orange-200/50">{order._id}</p>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-3 min-h-[200px]">
                  {(!order.items || order.items.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-orange-200/40 text-sm italic space-y-4 py-8">
                      <span className="text-3xl grayscale opacity-50">🍽️</span>
                      <p>No items added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center glass p-4 rounded-2xl hover:border-orange-500/30 transition-colors group">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-orange-200 transition-colors">{item.name}</span>
                            <span className="text-xs text-orange-300/70 font-medium mt-0.5">₹{item.price} x {item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                              ₹{item.price * item.quantity}
                            </span>
                            {order.status !== 'PAID' && (
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                disabled={loading}
                                className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5 space-y-5 z-10">
                  {/* Notifications */}
                  {order.notifications && order.notifications.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400/70 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        Live Updates
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {order.notifications.map((note, index) => (
                          <div key={index} className="glass border-orange-500/20 text-orange-100 text-xs p-3 rounded-xl border-l-2 border-l-orange-500">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-end pt-2">
                    <span className="text-orange-200/60 font-bold uppercase tracking-widest text-[11px]">Total Amount</span>
                    <span className="text-3xl font-black text-white leading-none text-gradient">
                      ₹{(order.totalPrice || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}
                    </span>
                  </div>

                  {order.status === 'PAID' ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Payment Completed
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="flex gap-3">
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="flex-1 glass border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-orange-500 focus:bg-white/10 appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                          <option value="UPI" className="bg-gray-900">UPI</option>
                          <option value="CARD" className="bg-gray-900">Credit/Debit Card</option>
                        </select>
                        <button
                          onClick={handlePay}
                          disabled={loading || order.items.length === 0}
                          className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-30 disabled:grayscale text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] active:scale-95"
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CustomerPortal;
