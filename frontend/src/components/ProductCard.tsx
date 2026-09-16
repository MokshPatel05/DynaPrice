import React from 'react';
import type { Product } from '../types/product';
import { NeoCard } from './NeoCard';
import { PriceSparkline } from './PriceSparkline';

interface ProductCardProps {
  product: Product;
  isFlashing?: boolean;
  onDelete?: () => void;
  onIncrementStat?: (field: 'viewCount' | 'wishlistAddCount' | 'cartAddCount' | 'buyCount') => void;
}

const CATEGORY_ACCENTS: Record<string, string> = {
  Electronics: 'border-t-neo-yellow',
  Fashion: 'border-t-neo-pink',
  Home: 'border-t-neo-lime',
};

const CATEGORY_BG: Record<string, string> = {
  Electronics: 'bg-neo-yellow',
  Fashion: 'bg-neo-pink',
  Home: 'bg-neo-lime',
};

const SPARKLINE_COLORS: Record<string, string> = {
  Electronics: '#d97706',
  Fashion: '#be185d',
  Home: '#65a30d',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, isFlashing = false, onDelete, onIncrementStat }) => {
  const {
    name,
    category,
    basePrice,
    currentPrice,
    viewCount,
    wishlistAddCount,
    cartAddCount,
    buyCount,
    priceHistory,
    lastChangePct,
  } = product;

  const priceDelta = currentPrice - basePrice;
  const isAtBase = Math.abs(priceDelta) < 0.005;
  const isUp = priceDelta > 0.005;
  const isTopProduct = currentPrice >= (basePrice * 1.5) - 0.005;

  const accentClass = CATEGORY_ACCENTS[category] ?? 'border-t-black';
  const badgeBg = CATEGORY_BG[category] ?? 'bg-gray-200';
  const sparklineColor = SPARKLINE_COLORS[category] ?? '#000000';

  return (
    <NeoCard accent={accentClass} className={`flex flex-col gap-0 overflow-hidden${isFlashing ? ' card-flash' : ''}`}>
      {/* Card header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 border border-black ${badgeBg}`}
            >
              {category}
            </span>
            {isTopProduct && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border border-black bg-neo-red text-white flex items-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                🔥 Top
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {lastChangePct !== null && (
              <span
                className={`text-xs font-black px-2 py-0.5 border border-black ${
                  lastChangePct > 0
                    ? 'bg-neo-green text-white'
                    : lastChangePct < 0
                    ? 'bg-neo-red text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {lastChangePct > 0 ? '▲' : lastChangePct < 0 ? '▼' : '—'}{' '}
                {Math.abs(lastChangePct).toFixed(2)}%
              </span>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-xs px-1.5 py-0.5 border border-black font-black hover:bg-neo-red hover:text-white transition-colors"
                title="Delete product"
                aria-label="Delete product"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <h2 className="font-black text-base leading-tight text-black mt-2">{name}</h2>
      </div>

      {/* Price block */}
      <div className="px-4 pb-3 border-b-2 border-black">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-black text-black">
            ${currentPrice.toFixed(2)}
          </span>
          <div className="flex flex-col pb-0.5">
            <span className="text-xs text-gray-500 font-bold uppercase">Base</span>
            <span className="text-sm font-bold text-gray-600">${basePrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Delta / floor tag */}
        <div className="mt-1.5 flex items-center gap-2">
          {isAtBase ? (
            <span className="text-xs font-black px-2 py-0.5 bg-gray-100 border border-black text-gray-700 uppercase tracking-wide">
              📍 At Base Price
            </span>
          ) : (
            <span
              className={`text-sm font-black ${
                isUp ? 'text-neo-green' : 'text-neo-red'
              }`}
            >
              {isUp ? '+' : ''}
              {priceDelta.toFixed(2)} ({isUp ? '+' : ''}
              {(((currentPrice - basePrice) / basePrice) * 100).toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Price History</p>
        <PriceSparkline history={priceHistory} color={sparklineColor} />
      </div>

      {/* Interest counts */}
      <div className="px-4 pt-2 pb-4 border-t-2 border-black mt-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shopper Activity</p>
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: '👁 Views', value: viewCount, field: 'viewCount' },
            { label: '❤ Wish', value: wishlistAddCount, field: 'wishlistAddCount' },
            { label: '🛒 Cart', value: cartAddCount, field: 'cartAddCount' },
            { label: '✅ Buys', value: buyCount, field: 'buyCount' },
          ].map(({ label, value, field }) => (
            <button 
              key={label}
              onClick={() => onIncrementStat?.(field as any)}
              disabled={!onIncrementStat}
              className="flex flex-col items-center bg-gray-50 border border-black py-1.5 px-1 hover:bg-neo-yellow transition-colors cursor-pointer disabled:cursor-default disabled:hover:bg-gray-50 active:scale-95"
              title={`Click to manually add ${label.split(' ')[1]}`}
            >
              <span className="text-xs font-black">{value}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </NeoCard>
  );
};
