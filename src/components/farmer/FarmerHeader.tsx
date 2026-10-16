import React from 'react';
import { Menu, Plus, Bell, Search, MapPin, ShieldCheck } from 'lucide-react';
import { FarmerProfile } from '../../types/dashboard';

interface FarmerHeaderProps {
  profile: FarmerProfile;
  onOpenMobileSidebar: () => void;
  onOpenAddProduct: () => void;
  onViewActivity: () => void;
  activityCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const FarmerHeader: React.FC<FarmerHeaderProps> = ({
  profile,
  onOpenMobileSidebar,
  onOpenAddProduct,
  onViewActivity,
  activityCount,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search crops, orders, listings..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F6F3] border border-transparent focus:border-slate-300 focus:bg-white rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Farm Location Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9F5] border border-slate-200/60 rounded-xl text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {profile.village}, {profile.state}
          </span>
        </div>

        {/* Verified Seller Pill */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-xl text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>FSSAI / Organic Verified</span>
        </div>

        {/* Activity Notification Bell */}
        <button
          onClick={onViewActivity}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Recent session activities"
        >
          <Bell className="w-4 h-4" />
          {activityCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#D2F442] ring-2 ring-white rounded-full"></span>
          )}
        </button>

        {/* Add Product Button */}
        <button
          onClick={onOpenAddProduct}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Product</span>
        </button>

        {/* Avatar */}
        <img
          src={profile.avatar}
          alt={profile.name}
          referrerPolicy="no-referrer"
          className="w-9 h-9 rounded-full object-cover border border-slate-200"
        />
      </div>
    </header>
  );
};
