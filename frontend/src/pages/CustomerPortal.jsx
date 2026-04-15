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

    // Use a local variable to keep track of the session in the current thread
    // This avoids being trapped by a stale React closure of the 'order' variable
    let threadOrder = order;

    const performAdd = async (orderId) => {
      try {
        let targetId = orderId;

        // LAYER 1: Proactive Check
        // If no order OR order is paid, create one
        if (!threadOrder || threadOrder.status === 'PAID') {
          const res = await api.post('/orders');
          const newOrder = res.data;
          targetId = newOrder._id;
          threadOrder = newOrder; // Update thread-local variable
          setOrder(newOrder);      // Update React state
          localStorage.setItem('activeOrderId', targetId);
        }

        await api.post(`/orders/${targetId}/items`, { itemId });
        await fetchOrder(targetId);

      } catch (err) {
        // LAYER 2: Reactive Check (Catching backend-only PAID status)
        const errorMessage = err.response?.data?.error;

        if (errorMessage === "Cannot add items to a paid order" && retryCount < maxRetries) {
          retryCount++;
          console.log("Stale frontend state detected. Creating new order and retrying...");

          const res = await api.post('/orders');
          const freshOrder = res.data;
          threadOrder = freshOrder; // Update thread-local variable
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Menu Dashboard</h2>
          <p className="text-gray-400">Fresh and delicious food at your fingertips</p>
        </div>
        {!order ? (
          <button
            onClick={handleCreateOrder}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 flex items-center gap-2"
          >
            Start New Order
          </button>
        ) : (
          <button
            onClick={clearOrder}
            className={`px-6 py-2 font-bold rounded-xl transition-all border ${order.status === 'PAID'
              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
              }`}
          >
            {order.status === 'PAID' ? '🚀 Start New Order' : 'New Session'}
          </button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🍔 Available Items</h3>
          {menu.length === 0 ? (
            <div className="p-12 text-center bg-gray-900/30 rounded-2xl border border-gray-800 text-gray-500 italic">
              The menu is currently empty. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menu.map((item) => (
                <div key={item._id} className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.05)]">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{item.name}</h4>
                    <span className="text-blue-400 font-black text-lg">₹{(item.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    {(() => {
                      const cartItemIndex = order?.items?.findIndex(i => i.name === item.name);
                      if (cartItemIndex > -1) {
                        return (
                          <div className="flex items-center justify-between w-full bg-blue-600/10 rounded-xl border border-blue-500/30 overflow-hidden">
                            <button
                              onClick={() => handleUpdateQuantity(cartItemIndex, 'DECREMENT')}
                              disabled={loading}
                              className="px-4 py-2.5 hover:bg-blue-600/20 text-blue-400 font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="font-bold text-blue-400">
                              {order.items[cartItemIndex].quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(cartItemIndex, 'INCREMENT')}
                              disabled={loading}
                              className="px-4 py-2.5 hover:bg-blue-600/20 text-blue-400 font-bold transition-colors"
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
                          className="w-full py-2.5 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 text-sm font-bold transition-all disabled:opacity-30 disabled:grayscale"
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
        </section>

        {/* Order History Section */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">📜 Order History</h3>
            <button 
              onClick={fetchPastOrders} 
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              disabled={historyLoading}
            >
              {historyLoading ? 'Refreshing...' : 'Refresh History'}
            </button>
          </div>
          
          {historyError && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {historyError}
            </div>
          )}

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            {historyLoading && pastOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your past orders...</p>
              </div>
            ) : pastOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500 italic">
                No past orders yet. Start your first order above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800/40 border-b border-gray-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Total</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {pastOrders.map((pOrder) => (
                      <tr key={pOrder._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{pOrder._id.slice(-6)}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(pOrder.createdAt || parseInt(pOrder._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-white text-sm">
                          ₹{(pOrder.totalPrice || pOrder.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            pOrder.status === 'PAID' ? 'bg-green-900/30 text-green-400 border border-green-700/30' :
                            pOrder.status === 'DELIVERED' ? 'bg-blue-900/30 text-blue-400 border border-blue-700/30' :
                            'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'
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
        </section>

        <section>
          <div className="sticky top-28 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">🛒 Your Cart</h3>
            {!order ? (
              <div className="p-10 bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl text-center">
                <span className="text-4xl block mb-4 opacity-50">🥗</span>
                <p className="text-gray-500 text-sm">Create an order to start adding delicious items!</p>
              </div>
            ) : (
              <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400">Order ID</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${order.status === 'PAID' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>{order.status}</span>
                  </div>
                  <p className="font-mono text-xs text-gray-500">{order._id}</p>
                </div>

                <div className="p-6 max-h-60 overflow-y-auto space-y-3">
                  {(!order.items || order.items.length === 0) ? (
                    <p className="text-gray-600 text-sm italic text-center py-4">No items added yet</p>
                  ) : (
                    <div className="space-y-4">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-200">{item.name}</span>
                            <span className="text-xs text-gray-400">₹{item.price} x {item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-2">
                              <button
                                onClick={() => handleUpdateQuantity(idx, 'DECREMENT')}
                                disabled={loading || order.status === 'PAID'}
                                className="text-blue-400 hover:text-blue-300 w-6 h-8 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="text-xs w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(idx, 'INCREMENT')}
                                disabled={loading || order.status === 'PAID'}
                                className="text-blue-400 hover:text-blue-300 w-6 h-8 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-bold text-white w-16 text-right">
                              ₹{item.price * item.quantity}
                            </span>
                            {order.status !== 'PAID' && (
                              <button
                                onClick={() => handleRemoveItem(idx)}
                                disabled={loading}
                                className="text-red-400 hover:text-red-300 ml-2"
                              >

                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-800/30 space-y-4">
                  {/* 🔔 Notifications Section */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      Notifications
                    </h4>

                    {(!order.notifications || order.notifications.length === 0) ? (
                      <p className="text-gray-500 text-sm italic">No updates yet</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {order.notifications.map((note, index) => (
                          <div
                            key={index}
                            className="bg-gray-900 border border-gray-700 text-gray-300 text-xs p-2 rounded-lg"
                          >
                            {note}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Total Amount</span>
                    <span className="text-2xl font-black text-white">₹{(order.totalPrice || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}</span>
                  </div>

                  {order.status === 'PAID' ? (
                    <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-xl text-green-400 text-center font-bold animate-pulse">
                      ✅ Payment Completed
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="flex-1 bg-black border border-gray-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="UPI">UPI</option>
                          <option value="CARD">Credit/Debit Card</option>
                        </select>
                        <button
                          onClick={handlePay}
                          disabled={loading || order.items.length === 0}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-bold rounded-xl transition-all active:scale-95"
                        >
                          Pay
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
