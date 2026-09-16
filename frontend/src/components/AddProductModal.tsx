import React, { useState } from 'react';
import type { ProductCreate } from '../types/product';
import { NeoButton } from './NeoButton';
import { NeoCard } from './NeoCard';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Food', 'General'];

interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (data: ProductCreate) => Promise<void>;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalCategory = category === '__custom' ? customCategory : category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const price = parseFloat(basePrice);
    if (!name.trim()) { setError('Product name is required.'); return; }
    if (!finalCategory.trim()) { setError('Category is required.'); return; }
    if (isNaN(price) || price <= 0) { setError('Enter a valid price greater than 0.'); return; }

    setIsLoading(true);
    try {
      await onSubmit({ name: name.trim(), category: finalCategory.trim(), base_price: price });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <NeoCard className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-[3px] border-black bg-neo-lime">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">
            ＋ New Product
          </h2>
          <button
            onClick={onClose}
            className="font-black text-xl leading-none hover:opacity-60 transition-opacity"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-[3px] border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-50 focus:shadow-neo transition-all"
              placeholder="e.g. Wireless Earbuds Pro"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-[3px] border-black p-3 font-bold bg-white focus:outline-none appearance-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__custom">Custom…</option>
            </select>
            {category === '__custom' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full border-[3px] border-black p-3 font-bold bg-white focus:outline-none mt-2"
                placeholder="Enter custom category"
              />
            )}
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">
              Base / Starting Price ($) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full border-[3px] border-black p-3 font-bold bg-white focus:outline-none focus:bg-yellow-50 focus:shadow-neo transition-all"
              placeholder="e.g. 49.99"
              required
            />
            <p className="text-xs text-gray-500 font-bold mt-1">
              This is the minimum price — it will never drop below this value.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-neo-red text-white border-[3px] border-black px-4 py-3 font-bold text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <NeoButton type="submit" variant="ghost" size="lg" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating…' : '✓ Create Product'}
            </NeoButton>
            <NeoButton type="button" variant="secondary" size="lg" onClick={onClose}>
              Cancel
            </NeoButton>
          </div>
        </form>
      </NeoCard>
    </div>
  );
};
