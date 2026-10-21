import React from 'react';
import { User, Sprout, Wrench, ArrowRight } from 'lucide-react';
import { AccountType } from '../types/auth';
import { useLanguage } from '../lib/i18n';

interface AccountTypeSelectorProps {
  selectedType: AccountType | null;
  onSelectType: (type: AccountType) => void;
}

export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  const { t } = useLanguage();
  const ACCOUNT_OPTIONS: Array<{
    type: AccountType;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    tag: string;
  }> = [
    {
      type: 'user',
      title: 'User (Customer)',
      subtitle: 'Buyer & Consumer',
      description: 'Explore and purchase fresh farm produce, organic goods, and agricultural products directly.',
      icon: <User className="w-6 h-6 text-slate-800" />,
      tag: 'Customer Account',
    },
    {
      type: 'farmer',
      title: 'Farmer',
      subtitle: 'Grower & Producer',
      description: 'Register your land, list crops, access regional market demand, and sell harvests at fair prices.',
      icon: <Sprout className="w-6 h-6 text-slate-800" />,
      tag: 'Producer Account',
    },
    {
      type: 'agri-business',
      title: 'AgriBusiness',
      subtitle: 'Agricultural Supplies & Equipment Seller',
      description: 'Sell seeds, fertilizers, farming machinery, irrigation systems, and agricultural products.',
      icon: <Wrench className="w-6 h-6 text-slate-800" />,
      tag: 'AgriBusiness',
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {t('Choose Your Account Type')}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t('Select how you want to join our agricultural platform')}
        </p>
      </div>

      <div className="space-y-3">
        {ACCOUNT_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelectType(opt.type)}
              className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer group flex items-start gap-4 ${
                isSelected
                  ? 'border-slate-950 bg-[#F8F9F5] shadow-xs ring-1 ring-slate-950/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-[#FAFAFA]'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#D2F442] shadow-xs'
                    : 'bg-[#F4F5F2] group-hover:bg-[#D2F442]/60'
                }`}
              >
                {opt.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {t(opt.title)}
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-500 bg-[#ECEEE9] px-2 py-0.5 rounded-full">
                    {t(opt.tag)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t(opt.description)}
                </p>
              </div>

              <div className="self-center pl-1 text-slate-400 group-hover:text-slate-900 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
