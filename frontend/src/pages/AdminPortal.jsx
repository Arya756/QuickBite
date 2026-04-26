import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

function AdminPortal() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // orderId being acted on

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setOrdersLoading(true);
    try {
      const res = await api.get('/orders');
      const sorted = [...res.data].sort((a, b) => b._id.localeCompare(a._id));
      setOrders(sorted);
      setLastRefreshed(new Date());
    } catch (err) {
      if (!silent) setError(err.response?.data?.error || "Failed to fetch orders");
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  }, []);

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await api.get('/menu');
      setMenu(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch menu");
    } finally {
      setMenuLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [fetchOrders]);

  // Auto-poll orders every 5 seconds (silent)
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setMenuLoading(true);
    setError(null);
    try {
      await api.post('/menu', { name: newItem.name, price: Number(newItem.price) });
      setNewItem({ name: '', price: '' });
      await fetchMenu();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add menu item");
    } finally {
      setMenuLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setActionLoading(orderId);
    setError(null);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || "Status update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Delete this menu item?")) return;
    setMenuLoading(true);
    try {
      await api.delete(`/menu/${itemId}`);
      await fetchMenu();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete menu item");
    } finally {
      setMenuLoading(false);
    }
  };

  const statusConfig = {
    CREATED:   { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Created' },
    PAID:      { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Paid' },
    ACCEPTED:  { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Accepted' },
    PREPARING: { color: 'bg-amber-500/20 text-blue-300 border-amber-500/30', label: 'Preparing' },
    DELIVERED: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Delivered' },
  };

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CREATED');
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-gradient tracking-tight">Command Center</h2>
          <p className="text-orange-200/60 mt-1 font-medium">Manage incoming orders and your digital menu</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-[11px] text-orange-300/50 font-medium">
              Live · refreshed {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-[11px] text-green-400 font-bold uppercase tracking-widest">Auto-Polling</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 glass border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3"><span className="text-xl">⚠️</span> {error}</div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: '📦', color: 'indigo' },
          { label: 'Active', value: activeOrders.length, icon: '🔥', color: 'orange' },
          { label: 'Delivered', value: completedOrders.length, icon: '✅', color: 'green' },
          { label: 'Menu Items', value: menu.length, icon: '🍕', color: 'purple' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-5 glass-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-3xl font-black text-white">{stat.value}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-300/60">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Orders Section */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl border border-amber-500/30">📦</div>
              <h3 className="text-2xl font-bold text-white">Live Orders</h3>
              {ordersLoading && <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>}
            </div>
            <button
              onClick={() => fetchOrders()}
              disabled={ordersLoading}
              className="text-xs font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {ordersLoading ? <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span> : '↻'}
              Refresh
            </button>
          </div>

          <div className="glass rounded-3xl overflow-hidden shadow-2xl">
            {orders.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-5xl mb-4 opacity-30">📭</p>
                <p className="text-orange-200/50 italic">No orders yet. Waiting for customers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">ID</th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Items</th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Total</th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Status</th>
                      <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-orange-300/70">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => {
                      const cfg = statusConfig[order.status] || statusConfig.CREATED;
                      const isActing = actionLoading === order._id;
                      return (
                        <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5 font-mono text-xs text-indigo-200/70">…{order._id.slice(-6)}</td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              {order.items?.length > 0
                                ? order.items.map((item, idx) => (
                                    <div key={idx} className="text-xs text-orange-100 flex items-center justify-between gap-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                      <span>{item.name}</span>
                                      <span className="text-orange-400 font-black">×{item.quantity}</span>
                                    </div>
                                  ))
                                : <span className="text-indigo-200/40 italic text-xs">No items</span>
                              }
                            </div>
                          </td>
                          <td className="px-6 py-5 font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 text-sm">
                            ₹{(order.items?.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0) || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            {isActing ? (
                              <span className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                            ) : (
                              <>
                                {order.status === 'PAID' && (
                                  <button onClick={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                                    className="px-4 py-2 bg-purple-600/80 hover:bg-purple-500 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all border border-purple-500/50 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                                    Accept
                                  </button>
                                )}
                                {order.status === 'ACCEPTED' && (
                                  <button onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                                    className="px-4 py-2 bg-orange-600/80 hover:bg-orange-500 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                    Prepare
                                  </button>
                                )}
                                {order.status === 'PREPARING' && (
                                  <button onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                                    className="px-4 py-2 bg-green-600/80 hover:bg-green-500 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                    Deliver ✓
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Menu Management Section */}
        <section className="lg:col-span-4 space-y-8">
          {/* Add Item Form */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl border border-red-500/30">🍕</div>
              <h3 className="text-2xl font-bold text-white">Add Item</h3>
            </div>

            <form onSubmit={handleAddMenuItem} className="glass-card rounded-3xl p-6 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="space-y-2 relative z-10">
                <label className="text-[11px] uppercase font-bold text-orange-300/70 tracking-widest px-1">Item Name</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500 focus:bg-white/10 outline-none px-4 py-3 rounded-xl text-sm transition-all text-white placeholder-white/20 shadow-inner"
                  placeholder="e.g. Truffle Burger"
                />
              </div>
              <div className="space-y-2 relative z-10">
                <label className="text-[11px] uppercase font-bold text-orange-300/70 tracking-widest px-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500 focus:bg-white/10 outline-none px-4 py-3 rounded-xl text-sm transition-all text-white placeholder-white/20 shadow-inner"
                  placeholder="299.00"
                />
              </div>
              <button
                type="submit"
                disabled={menuLoading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 relative z-10"
              >
                {menuLoading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span><span>Adding...</span></>
                  : '+ Publish to Menu'}
              </button>
            </form>
          </div>

          {/* Current Menu */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl border border-purple-500/30">📋</div>
              <h3 className="text-2xl font-bold text-white">Current Menu</h3>
            </div>

            <div className="glass rounded-3xl overflow-hidden max-h-[420px] flex flex-col">
              {menu.length === 0 ? (
                <div className="p-12 text-center text-orange-200/50 italic border-dashed border-2 border-white/5 m-4 rounded-2xl">
                  No items yet. Add one above!
                </div>
              ) : (
                <div className="p-4 grid gap-3 overflow-y-auto flex-1">
                  {menu.map((item) => (
                    <div key={item._id} className="glass border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:border-orange-500/30 transition-all">
                      <div>
                        <p className="font-bold text-white group-hover:text-orange-300 transition-colors">{item.name}</p>
                        <p className="text-xs text-orange-200/50 mt-0.5">Active item</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                          ₹{Number(item.price).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleDeleteMenuItem(item._id)}
                          className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                          title="Delete item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPortal;
