import React, { useState } from 'react';
import { X, Check, Loader2, Shield } from 'lucide-react';
import { UserAccount } from '../types/auth';

interface GoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const GoogleModal: React.FC<GoogleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const ACCOUNTS = [
    {
      name: 'Rajesh Kumar (Farmer)',
      email: 'rajesh.farmer@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      accountType: 'farmer' as const,
      village: 'Kila Raipur',
      district: 'Ludhiana',
      state: 'Punjab',
      farmSize: '8.5 Acres',
      crops: ['Tomatoes', 'Onions', 'Potatoes', 'Mangoes', 'Wheat'],
    },
    {
      name: 'Sarthak (Customer)',
      email: 'jsarthak168@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      accountType: 'user' as const,
    },
    {
      name: 'Vikram Sethi (AgriBusiness)',
      email: 'sarkarraj0766@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      accountType: 'agri-business' as const,
    },
  ];

  const handleSelect = async (acc: typeof ACCOUNTS[0]) => {
    setLoadingEmail(acc.email);
    await new Promise((res) => setTimeout(res, 500));
    setLoadingEmail(null);
    onSuccess({
      name: acc.name.replace(/ \(.*\)/, ''),
      email: acc.email,
      avatar: acc.avatar,
      provider: 'google',
      accountType: acc.accountType,
      village: 'village' in acc ? acc.village : undefined,
      district: 'district' in acc ? acc.district : undefined,
      state: 'state' in acc ? acc.state : undefined,
      farmSize: 'farmSize' in acc ? acc.farmSize : undefined,
      crops: 'crops' in acc ? acc.crops : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Sign in with Google</h3>
              <p className="text-[11px] text-slate-500">Choose your Google account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account list */}
        <div className="p-5 space-y-2.5">
          {ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              disabled={!!loadingEmail}
              onClick={() => handleSelect(acc)}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{acc.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                </div>
              </div>
              {loadingEmail === acc.email ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-blue-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-transparent group-hover:text-blue-500" />
                </div>
              )}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600">
              <Shield className="w-3 h-3" />
              Secure OIDC login
            </span>
            <span>Terms · Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
