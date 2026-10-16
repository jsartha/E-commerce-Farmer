import React, { useState } from 'react';
import { History, Package, Pencil, Trash2, ShoppingBag, UserCircle2, Clock, Filter } from 'lucide-react';
import { ActivityLog } from '../../types/dashboard';

interface RecentActivitySectionProps {
  activities: ActivityLog[];
  onClearActivities?: () => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  activities,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered =
    filterType === 'all'
      ? activities
      : activities.filter((act) => act.type === filterType);

  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'product_added':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'product_edited':
        return <Pencil className="w-4 h-4 text-blue-600" />;
      case 'product_deleted':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'order_updated':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'profile_updated':
        return <UserCircle2 className="w-4 h-4 text-amber-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'product_added':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'product_edited':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'product_deleted':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'order_updated':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'profile_updated':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Session Activity Feed</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D2F442] text-slate-950">
              {activities.length} Recorded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of all product additions, edits, deletions, and order status updates
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'product_added', label: 'Added' },
            { id: 'product_edited', label: 'Edited' },
            { id: 'product_deleted', label: 'Deleted' },
            { id: 'order_updated', label: 'Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-[#F5F6F3] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-slate-800">No activities matching this filter</p>
            <p className="text-xs text-slate-400">Perform an action like adding or editing a product to see it appear here.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {filtered.map((act) => (
              <div key={act.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center group-hover:border-slate-950 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                </div>

                <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-slate-200/60 hover:bg-[#F8F9F5] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        {getIcon(act.type)}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {act.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(
                          act.type
                        )}`}
                      >
                        {act.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {act.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
