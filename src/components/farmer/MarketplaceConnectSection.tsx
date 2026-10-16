import React, { useState } from 'react';
import { Users, MessageSquare, MapPin, Calendar, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { CustomerInquiry } from '../../types/dashboard';
import { SAMPLE_CUSTOMER_INQUIRIES } from '../../data/mockFarmerData';

export const MarketplaceConnectSection: React.FC = () => {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(SAMPLE_CUSTOMER_INQUIRIES);
  const [connectedIds, setConnectedIds] = useState<string[]>(['inq-102']);

  const handleConnect = (id: string) => {
    setConnectedIds((prev) => [...prev, id]);
  };

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
        {inquiries.map((inq) => {
          const isConnected = connectedIds.includes(inq.id);
          return (
            <div
              key={inq.id}
              className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {inq.customerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                        {inq.customerName}
                      </h4>
                      <span className="text-[10px] text-slate-400 block font-mono">{inq.date}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isConnected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isConnected ? 'Deal Active' : 'Open Request'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Requested Harvest:</span>
                    <span className="font-bold text-slate-900 text-sm">{inq.productNeeded}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#FAFAFA] rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Volume:</span>
                      <span className="font-semibold text-slate-800">{inq.quantity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Offer Rate:</span>
                      <span className="font-mono font-bold text-emerald-700">{inq.offerPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inq.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isConnected ? (
                  <div className="w-full py-2.5 px-3 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connected via In-App Chat</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(inq.id)}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Accept & Connect with Buyer</span>
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
