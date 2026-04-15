import { useState } from 'react';

function PaymentPanel({ orderData, onPay, onUpdateStatus, loading }) {
  const [selectedStatus, setSelectedStatus] = useState('PREPARING');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');

  const items = orderData?.items || [];
  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const isPaid = !!orderData?.payment;
  const currentStatus = orderData?.status || 'CREATED';
  const isTerminal = currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
        <span className="text-xl">💳</span>
        <h2 className="text-lg font-bold">Checkout & Status</h2>
      </div>

      {/* Payment Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Payment Strategy</span>
          {isPaid && <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/50 font-bold uppercase tracking-tighter">Verified</span>}
        </div>

        {isPaid ? (
          <div className="p-4 bg-emerald-900/5 border border-emerald-900/20 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              ✓
            </div>
            <div>
              <p className="text-sm font-bold text-white">Payment Successful</p>
              <p className="text-xs text-emerald-400 capitalize">Method: {orderData.payment.method}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-800/20 rounded-xl border border-dashed border-gray-800">
                Add items to your cart to pay.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <select
                  id="payment-method-select"
                  className="w-full bg-gray-800 border border-gray-700 outline-none text-white text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer hover:border-blue-500"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  disabled={loading}
                >
                  <option value="UPI">UPI Transfer</option>
                  <option value="CARD">Debit / Credit Card</option>
                </select>
                <button
                  id="pay-order-btn"
                  onClick={() => onPay(selectedPaymentMethod)}
                  disabled={loading || items.length === 0}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  💳 Pay ₹{total.toFixed(2)}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="h-px bg-gray-800" />

      {/* Status Update Section */}
      <section>
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-4">Operations Manager</span>

        {isTerminal ? (
          <div className={`p-4 rounded-xl text-center border ${currentStatus === 'DELIVERED' ? 'bg-emerald-900/10 border-emerald-800/30 text-emerald-400' : 'bg-red-900/10 border-red-800/30 text-red-400'}`}>
            <p className="text-sm font-black uppercase tracking-widest leading-none">
              {currentStatus === 'DELIVERED' ? '🎉 Delivered' : '🚫 Cancelled'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <select
              id="status-select"
              className="w-full bg-gray-800 border border-gray-700 outline-none text-white text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer hover:border-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={loading || !isPaid}
            >
              <option value="PREPARING">🔥 Mark as Preparing</option>
              <option value="DELIVERED">📦 Mark as Delivered</option>
            </select>

            <button
              id="update-status-btn"
              onClick={() => onUpdateStatus(selectedStatus)}
              disabled={loading || selectedStatus === currentStatus || !isPaid}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:grayscale text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-600"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              🔄 {isPaid ? 'Update Progress' : 'Pay to proceed'}
            </button>
          </div>
        )}
      </section>

      <div className="h-px bg-gray-800" />

      {/* Notifications Section */}
      <section>
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-4">Live Updates Feed</span>
        <div className="relative">
          {!orderData?.notifications || orderData.notifications.length === 0 ? (
            <div className="py-8 flex flex-col items-center border border-dashed border-gray-800 rounded-xl opacity-40">
              <span className="text-2xl mb-1">📡</span>
              <p className="text-[10px] uppercase tracking-tighter">No live updates yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderData.notifications.map((notif, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    {idx !== orderData.notifications.length - 1 && <div className="w-px flex-1 bg-gray-800 my-1 font-black" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-xs text-gray-200 font-medium group-hover:text-blue-400 transition-colors leading-relaxed">
                      {notif}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PaymentPanel;
