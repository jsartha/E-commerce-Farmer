import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const MarketplaceConnectSection: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Direct Customer Inquiries</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              User Connect
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect directly with verified retail buyers, hotels, and consumer cooperatives looking for bulk harvests
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Direct Farm-to-Consumer</span>
        </div>
      </div>

      {/* Inquiries Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center text-sm text-slate-500">
          No customer inquiries are available yet.
        </div>
      </div>
    </div>
  );
};
