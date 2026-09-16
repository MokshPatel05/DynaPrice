import React from 'react';
import { NeoCard } from './NeoCard';
import { NeoButton } from './NeoButton';

interface DeleteConfirmModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  productName,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <NeoCard className="w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-[3px] border-black bg-neo-red shrink-0 text-white">
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <span>⚠️</span> Confirm Deletion
          </h2>
          <button
            onClick={onCancel}
            className="font-black text-2xl leading-none hover:opacity-60 transition-opacity text-white"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 bg-white">
          <p className="text-gray-800 font-bold leading-relaxed text-lg text-center">
            Are you sure you want to delete <br />
            <span className="font-black text-xl text-black">"{productName}"</span>?
          </p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-center mt-2">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="p-5 border-t-[3px] border-black bg-gray-50 flex gap-4 justify-end shrink-0">
          <NeoButton variant="secondary" size="md" onClick={onCancel} className="flex-1">
            Cancel
          </NeoButton>
          <NeoButton variant="primary" size="md" onClick={onConfirm} className="flex-1 bg-neo-red hover:bg-red-600 text-white">
            Yes, Delete
          </NeoButton>
        </div>
      </NeoCard>
    </div>
  );
};
