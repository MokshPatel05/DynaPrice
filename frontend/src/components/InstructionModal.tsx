import React from 'react';
import { NeoCard } from './NeoCard';
import { NeoButton } from './NeoButton';

interface InstructionModalProps {
  onClose: () => void;
  onSimulate: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ onClose, onSimulate }) => {
  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <NeoCard className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-[3px] border-black bg-neo-yellow shrink-0">
          <h2 className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>👋</span> Welcome to DynaPrice
          </h2>
          <button
            onClick={onClose}
            className="font-black text-2xl leading-none hover:opacity-60 transition-opacity"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          
          <section>
            <h3 className="text-lg font-black uppercase tracking-widest mb-2 border-b-2 border-black inline-block">
              What is this?
            </h3>
            <p className="text-gray-800 font-bold leading-relaxed">
              DynaPrice is an ML-powered dynamic pricing engine. It automatically adjusts product prices every 60 seconds based on simulated shopper traffic (views, wishlists, carts, and purchases).
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black uppercase tracking-widest mb-2 border-b-2 border-black inline-block">
              How it is made
            </h3>
            <p className="text-gray-800 font-bold leading-relaxed">
              Built with a **FastAPI backend** and a **React + Vite frontend**. The pricing logic is driven by a custom <code>GradientBoostingRegressor</code> trained via scikit-learn on thousands of simulated shopping interactions. The data is persisted locally using **SQLite**.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black uppercase tracking-widest mb-2 border-b-2 border-black inline-block">
              How to use it
            </h3>
            <ul className="list-disc pl-5 font-bold text-gray-800 space-y-2">
              <li>Wait for the 60-second timer to run down.</li>
              <li>When the timer hits zero, the backend ML model evaluates the traffic on every product.</li>
              <li>High engagement (buys, carts) drives prices up; low engagement drives prices down towards the base price.</li>
            </ul>
          </section>

          <section className="bg-neo-pink p-4 border-[3px] border-black shadow-neo">
            <h3 className="text-lg font-black uppercase tracking-widest mb-2 text-black">
              Simulate or Interact
            </h3>
            <p className="text-black font-bold leading-relaxed mb-4">
              You don't have to wait for organic traffic. Tap the button below to instantly simulate random shoppers viewing, wishlisting, and buying products. 
              <br /><br />
              <strong>Want precise control?</strong> You can also manually click the Views, Wish, Cart, and Buys labels on any product card to increment that specific metric!
            </p>
            <NeoButton variant="primary" size="lg" onClick={onSimulate} className="w-full">
              ⚡ Simulate Shoppers Now
            </NeoButton>
          </section>

          <section>
            <h3 className="text-lg font-black uppercase tracking-widest mb-2 border-b-2 border-black inline-block">
              Visualizations
            </h3>
            <p className="text-gray-800 font-bold leading-relaxed">
              Every product card features a live <strong>Sparkline Chart</strong> at the bottom. As the ML model adjusts the price every 60 seconds, the chart will plot the product's price history over time, allowing you to easily spot pricing trends.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-5 border-t-[3px] border-black bg-gray-50 shrink-0">
          <NeoButton variant="secondary" size="lg" className="w-full" onClick={onClose}>
            Got it, let's go!
          </NeoButton>
        </div>
      </NeoCard>
    </div>
  );
};
