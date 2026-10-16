import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Product } from '../../types/dashboard';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onCancel: () => void;
  onConfirm: (productId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200 text-center">
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
          <AlertTriangle className="w-7 h-7 stroke-[2]" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">Delete Product Listing?</h3>
        <p className="text-xs text-slate-500 mt-1 mb-2 leading-relaxed">
          Are you sure you want to delete <strong className="text-slate-900">{product.name}</strong>?
        </p>
        <p className="text-[11px] text-slate-400 mb-6">
          This listing will be immediately removed from the customer marketplace and your active inventory.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
            className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl cursor-pointer shadow-xs transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
