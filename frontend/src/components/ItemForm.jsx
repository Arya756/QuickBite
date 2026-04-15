import { useState } from 'react';

function ItemForm({ onAddItem, disabled }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);
    if (!trimmedName || isNaN(parsedPrice) || parsedPrice <= 0) return;

    onAddItem({ name: trimmedName, price: parsedPrice });
    setName('');
    setPrice('');
  };

  const quickItems = [
    { name: 'Classic Burger', price: 149 },
    { name: 'Margherita Pizza', price: 249 },
    { name: 'French Fries', price: 99 },
    { name: 'Chicken Wrap', price: 179 },
    { name: 'Cold Coffee', price: 89 },
    { name: 'Chocolate Shake', price: 129 },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
        <span className="text-xl">➕</span>
        <h2 className="text-lg font-bold">Add Items</h2>
      </div>

      {/* Quick-add buttons */}
      <div className="mb-6">
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-3">Quick Add Picks</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickItems.map((item) => (
            <button
              key={item.name}
              id={`quick-add-${item.name.toLowerCase().replace(/\s/g, '-')}`}
              className="bg-gray-800/50 hover:bg-blue-600/20 hover:border-blue-500/50 border border-gray-800 text-gray-300 hover:text-blue-400 text-[10px] font-bold py-2 px-3 rounded-lg transition-all text-center"
              disabled={disabled}
              onClick={() => onAddItem(item)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-800 mb-6" />

      {/* Custom item form */}
      <form onSubmit={handleSubmit}>
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-3">Custom Entry</span>
        <div className="space-y-3">
          <input
            id="item-name-input"
            className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white text-sm py-2.5 px-4 rounded-xl transition-all placeholder:text-gray-600"
            type="text"
            placeholder="What are you craving?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
          />
          <div className="flex gap-3">
            <input
              id="item-price-input"
              className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white text-sm py-2.5 px-4 rounded-xl transition-all placeholder:text-gray-600"
              type="number"
              placeholder="Price (₹)"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={disabled}
            />
            <button
              id="add-item-btn"
              type="submit"
              disabled={disabled || !name.trim() || !price}
              className="px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              {disabled && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {disabled ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ItemForm;
