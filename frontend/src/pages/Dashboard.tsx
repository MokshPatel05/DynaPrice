import React, { useCallback, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useProducts } from '../hooks/useProducts';
import { useCountdown } from '../hooks/useCountdown';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { BackendBanner } from '../components/BackendBanner';
import { ProductCard } from '../components/ProductCard';
import { AddProductModal } from '../components/AddProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { InstructionModal } from '../components/InstructionModal';
import { NeoButton } from '../components/NeoButton';

export const Dashboard: React.FC = () => {
  const { token, isDemo } = useAuth();
  const {
    products,
    flashingIds,
    isLoading,
    simulateActivity,
    runPriceTick,
    addProduct,
    removeProduct,
    incrementStat,
  } = useProducts(token);

  const isBackendOnline = useBackendStatus();
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  const [showInstructions, setShowInstructions] = useState(() => {
    return localStorage.getItem('dynaprice_instructions_seen') !== 'true';
  });

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem('dynaprice_instructions_seen', 'true');
  };

  const handleTick = useCallback(async () => {
    if (!isBackendOnline) return;
    if (products.length === 0) return; // nothing to predict
    try {
      await runPriceTick();
      toast.success('Prices updated!', {
        duration: 2500,
        style: { border: '3px solid #000', boxShadow: '3px 3px 0 #000', fontWeight: 'bold', borderRadius: '0' },
      });
    } catch {
      toast.error('Price update failed — backend may be offline.', {
        duration: 4000,
        style: { border: '3px solid #000', boxShadow: '3px 3px 0 #000', fontWeight: 'bold', borderRadius: '0', background: '#ff3e6c', color: '#fff' },
      });
    }
  }, [isBackendOnline, runPriceTick, products.length]);

  const { secondsLeft, totalSeconds } = useCountdown(handleTick);

  const handleAddProduct = async (data: Parameters<typeof addProduct>[0]) => {
    await addProduct(data);
    toast.success('Product created!', {
      style: { border: '3px solid #000', borderRadius: '0', fontWeight: 'bold' },
    });
  };

  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await removeProduct(productToDelete.id);
      toast.success('Product deleted.');
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      {showInstructions && (
        <InstructionModal
          onClose={handleCloseInstructions}
          onSimulate={simulateActivity}
        />
      )}

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProduct}
        />
      )}

      {productToDelete && (
        <DeleteConfirmModal
          productName={productToDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}

      <Header
        isBackendOnline={isBackendOnline}
        secondsLeft={secondsLeft}
        totalSeconds={totalSeconds}
        onSimulate={simulateActivity}
      />

      <BackendBanner isOnline={isBackendOnline} />

      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page header row */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div className="border-l-4 border-black pl-4">
              <h2 className="text-3xl font-black uppercase tracking-tight text-black">
                Live Product Prices
              </h2>
              <p className="text-sm text-gray-600 font-bold mt-1">
                Prices update every 60 seconds based on real-time shopper interest,
                predicted by a Gradient Boosting model.
              </p>
            </div>

            {/* ＋ New Product button */}
            <NeoButton variant="ghost" size="md" onClick={() => setShowAddModal(true)}>
              ＋ New Product
            </NeoButton>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-bounce">⏳</div>
                <p className="font-black uppercase tracking-widest text-gray-500">Loading products…</p>
              </div>
            </div>
          )}

          {/* Empty state for users with no products */}
          {!isLoading && products.length === 0 && (
            <div className="border-[3px] border-dashed border-black p-12 text-center bg-white shadow-neo">
              <div className="text-6xl mb-6">📦</div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-3">
                No Products Yet
              </h3>
              <p className="text-gray-600 font-bold mb-8 max-w-sm mx-auto">
                Add your first product to start tracking dynamic prices powered by ML.
              </p>
              <NeoButton variant="ghost" size="lg" onClick={() => setShowAddModal(true)}>
                ＋ Add Your First Product
              </NeoButton>
            </div>
          )}

          {/* Product grid */}
          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFlashing={flashingIds.has(product.id)}
                  onDelete={!isDemo ? () => handleDeleteClick(product.id, product.name) : undefined}
                  onIncrementStat={(field) => incrementStat(product.id, field)}
                />
              ))}
            </div>
          )}

          {/* Legend footer */}
          {!isLoading && products.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-4 items-center text-xs font-bold text-gray-500 border-t-2 border-black pt-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-neo-yellow border border-black inline-block" /> Electronics
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-neo-pink border border-black inline-block" /> Fashion
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-neo-lime border border-black inline-block" /> Home
              </span>
              <span className="ml-auto">
                ▲ <span className="text-neo-green">Price up</span>{' '}
                ▼ <span className="text-neo-red">Price down</span>{' '}
                📍 At base price
              </span>
            </div>
          )}
        </div>
      </main>
    </>
  );
};
