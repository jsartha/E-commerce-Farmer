import React from 'react';
import {
  Package,
  ListFilter,
  ShoppingBag,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Product, Order, FarmerProfile, DashboardSection } from '../../types/dashboard';

interface DashboardOverviewProps {
  profile: FarmerProfile;
  products: Product[];
  orders: Order[];
  onNavigate: (section: DashboardSection) => void;
  onOpenAddProduct: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  products,
  orders,
  onNavigate,
  onOpenAddProduct,
}) => {
  const totalProducts = products.length;
  const activeListings = products.filter((p) => p.status !== 'Out of Stock').length;
  const ordersReceived = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Welcome Banner with Harvest Visual */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-950 text-white p-6 sm:p-8 shadow-lg">
        {/* Banner image backdrop */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <img
            src="/src/assets/images/farmer_harvest_banner_1792124802913.jpg"
            alt="Farm harvest crates"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#D2F442]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-[#D2F442]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flipkart-Style Farmer Seller Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {profile.name}! 🌾
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your farm <span className="text-white font-semibold">{profile.farmName}</span> has{' '}
              <strong className="text-[#D2F442]">{activeListings} active crop listings</strong> in high demand. You have{' '}
              <strong>{orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed').length} pending shipments</strong> to fulfill today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddProduct}
              className="px-4 py-2.5 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Harvest Listing</span>
            </button>
            <button
              onClick={() => onNavigate('orders')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Manage Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Key Metric Cards (Flipkart Seller Panel Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Products */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalProducts}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
              Across 5 Categories
            </span>
          </div>
        </div>

        {/* Active Listings */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Listings</span>
            <div className="w-8 h-8 rounded-xl bg-[#D2F442]/30 flex items-center justify-center text-slate-950">
              <ListFilter className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {activeListings}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
              Available on Market
            </span>
          </div>
        </div>

        {/* Orders Received */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Orders Received</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {ordersReceived}
            </span>
            <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
              Customer bookings
            </span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {completedOrders}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
              100% Fulfillment Rate
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Sales</span>
            <div className="w-8 h-8 rounded-xl bg-[#D2F442] flex items-center justify-center text-slate-950">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              ₹{totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Direct Farmer Payouts
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Live Activity Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Customer Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-slate-400">Direct purchases from verified customers</p>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-slate-200/60 flex items-center justify-between gap-3 hover:bg-[#F5F6F3] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {ord.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Dispatched'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'Confirmed'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 mt-1 truncate">
                      {ord.productName} ({ord.quantity} {ord.unit})
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">Buyer: {ord.customerName}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      ₹{ord.totalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{ord.orderDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fast dispatch enabled for local farm routes</span>
            <span className="text-emerald-600 font-semibold">Zero Commission Payout</span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-[28px] border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="p-3.5 bg-[#F8F9F5] border border-slate-200/60 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                AgriBusiness Supplies
              </span>
              <span className="text-[11px] text-slate-500">
                18% discount on fertilizers & seed kits
              </span>
            </div>
            <button
              onClick={() => onNavigate('agribusiness-connect')}
              className="px-3 py-1.5 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold text-[11px] rounded-xl cursor-pointer"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
