import React from 'react';
import { X } from 'lucide-react';

interface GoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleModal: React.FC<GoogleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-sign-in-title"
        className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 id="google-sign-in-title" className="text-sm font-semibold">
              Google sign-in unavailable
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Google authentication is not configured. Sign up or log in with your email instead.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};
