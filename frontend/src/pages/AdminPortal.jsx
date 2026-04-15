import { useState, useEffect } from 'react';
import api from '../api/axios';

function AdminPortal() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders');
      // Sort by _id descending to ensure most recent is at top (fallback for backend)
      const sortedOrders = [...res.data].sort((a, b) => b._id.localeCompare(a._id));
      setOrders(sortedOrders);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

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

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, []);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setMenuLoading(true);
    setError(null);
    try {
      await api.post('/menu', newItem);
      setNewItem({ name: '', price: '' });
      await fetchMenu(); // refresh menu instantly
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add menu item");
    } finally {
      setMenuLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setOrdersLoading(true);
    setError(null);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || "Status update failed");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Admin Dashboard</h2>
          <p className="text-gray-400">Manage orders and your menu</p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Section */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              📦 Recent Orders
              {ordersLoading && <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>}
            </h3>
            <button onClick={fetchOrders} className="text-sm text-blue-400 hover:text-blue-300">Refresh</button>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-500 italic">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800/40 border-b border-gray-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Products</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Total</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-300">{order._id.slice(-6)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="text-xs text-gray-400 flex items-center justify-between gap-4">
                                <span>{item.name}</span>
                                <span className="text-blue-500/80 font-bold">x{item.quantity}</span>
                              </div>
                            )) || <span className="text-gray-600 italic">No items</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-400">
                          ₹{(
                            order.items?.reduce((sum, item) => sum + ((item?.price || 0) * (item?.quantity || 1)), 0) || 0
                          ).toFixed(2)}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'CREATED' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50' :
                            order.status === 'PAID' ? 'bg-purple-900/40 text-purple-400 border border-purple-700/50' :
                            order.status === 'ACCEPTED' ? 'bg-orange-900/40 text-orange-400 border border-orange-700/50' :
                            order.status === 'PREPARING' ? 'bg-blue-900/40 text-blue-400 border border-blue-700/50' :
                            'bg-green-900/40 text-green-400 border border-green-700/50'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {order.status === 'PAID' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                              Accept Order
                            </button>
                          )}
                          {order.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.status === 'PREPARING' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Menu Management Section */}
        <section className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">🍕 Add Menu Item</h3>
            <form onSubmit={handleAddMenuItem} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                  placeholder="Delicious Burger..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                  placeholder="9.99"
                />
              </div>
              <button
                type="submit"
                disabled={menuLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {menuLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                Add to Menu
              </button>
            </form>
          </div>

          <div className="pt-4 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">📋 Current Menu</h3>
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto">
              {menu.length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">No menu items found.</div>
              ) : (
                <div className="p-4 grid gap-3">
                  {menu.map((item) => (
                    <div key={item._id} className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
                      <div>
                        <p className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{item.name}</p>
                        <p className="text-xs text-gray-500">Regular Item</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-black text-blue-400 text-lg">₹{Number(item.price).toFixed(2)}</p>
                        <button
                          onClick={() => handleDeleteMenuItem(item._id)}
                          className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Item"
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
