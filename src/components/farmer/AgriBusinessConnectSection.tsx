import React, { useState } from 'react';
import { Store, Wrench, Sprout, Star, Phone, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { AgriBusinessDeal } from '../../types/dashboard';
import { SAMPLE_AGRIBUSINESS_DEALS } from '../../data/mockFarmerData';

export const AgriBusinessConnectSection: React.FC = () => {
  const [deals, setDeals] = useState<AgriBusinessDeal[]>(SAMPLE_AGRIBUSINESS_DEALS);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  const handleClaim = (id: string) => {
    setClaimedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">AgriBusiness Supplier Hub</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              AgriBusiness Connect
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Procure certified seeds, organic fertilizers, machinery, and irrigation tools directly from registered merchants
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D2F442]/50 text-slate-900 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <Tag className="w-4 h-4" />
          <span>Exclusive Farmer Discount Rates</span>
        </div>
      </div>

      {/* Supplier Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {deals.map((deal) => {
          const isClaimed = claimedIds.includes(deal.id);
          return (
            <div
              key={deal.id}
              className="bg-white rounded-[26px] border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {deal.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{deal.rating}</span>
                    <span className="text-slate-400 font-normal">· Verified Merchant</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {deal.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>{deal.supplierName}</span>
                  </p>
                </div>

                <div className="p-3 bg-[#F8F9F5] rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Farmer Special Price</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{deal.price}</span>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg">
                    {deal.discount}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono flex-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{deal.contact}</span>
                </div>

                {isClaimed ? (
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Discount Code Sent</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(deal.id)}
                    className="px-4 py-2 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Claim Farmer Discount
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
