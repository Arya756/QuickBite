function OrderPanel({ orderData, onNewOrder }) {
  if (!orderData) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <span className="text-xl">📋</span>
          <h2 className="text-lg font-bold">Order Details</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 opacity-50">
          <span className="text-3xl mb-2">⏳</span>
          <p className="text-sm">Loading order data...</p>
        </div>
      </div>
    );
  }

  const items = orderData.items || [];
  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const status = orderData.status || 'CREATED';
  const displayId = (orderData._id || orderData.id || '').toString();
  const shortId = displayId.length > 8 ? `…${displayId.slice(-8)}` : displayId;

  const statusStyles = {
    CREATED: "bg-gray-800 text-gray-400 border-gray-700",
    PREPARING: "bg-amber-900/30 text-amber-400 border-amber-800/50",
    DELIVERED: "bg-emerald-900/30 text-emerald-400 border-emerald-800/50",
    CANCELLED: "bg-red-900/30 text-red-400 border-red-800/50",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <h2 className="text-lg font-bold">Order Details</h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${statusStyles[status] || statusStyles.CREATED}`}>
          {status}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tight">Order ID</span>
          <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">#{shortId}</span>
        </div>

        {items.length === 0 ? (
          <div className="py-12 flex flex-col items-center border border-dashed border-gray-800 rounded-xl">
            <span className="text-3xl mb-2 opacity-20">🍽️</span>
            <p className="text-sm text-gray-500 italic">No items added yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            <ul className="divide-y divide-gray-800/50">
              {items.map((item, idx) => (
                <li className="flex justify-between py-3 group" key={idx}>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-100 italic">₹{item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 p-4 bg-gray-800/30 border border-gray-800 rounded-xl flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
              <span className="text-2xl font-black text-blue-400 tracking-tight">₹{total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {orderData.payment && (
        <div className="mb-6 p-3 bg-emerald-900/10 border border-emerald-900/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="text-lg">✅</span>
          <p className="text-xs font-medium text-emerald-400">
            Paid <span className="text-white font-bold">₹{orderData.payment.amount?.toFixed(2)}</span> via <span className="uppercase">{orderData.payment.method}</span>
          </p>
        </div>
      )}

      <button
        id="new-order-btn"
        onClick={onNewOrder}
        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition-all border border-gray-700 active:scale-95 flex items-center justify-center gap-2"
      >
        ✨ Start New Order
      </button>
    </div>
  );
}

export default OrderPanel;
