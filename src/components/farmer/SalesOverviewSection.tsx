import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Percent, ArrowUpRight, BarChart3 } from 'lucide-react';
import { Order, Product } from '../../types/dashboard';

interface SalesOverviewSectionProps {
  orders: Order[];
  products: Product[];
}

export const SalesOverviewSection: React.FC<SalesOverviewSectionProps> = ({
  orders,
  products,
}) => {
  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const avgOrderVal = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;
  const totalQtySold = products.reduce((sum, p) => sum + p.soldCount, 0);

  const MONTHLY_SALES = [
    { month: 'May', amount: 18400, percent: 45 },
    { month: 'Jun', amount: 22600, percent: 55 },
    { month: 'Jul', amount: 28900, percent: 70 },
    { month: 'Aug', amount: 31200, percent: 78 },
    { month: 'Sep', amount: 33800, percent: 84 },
    { month: 'Oct', amount: 35060, percent: 92 },
  ];

  const TOP_CROPS = [
    { name: 'Fresh Red Farm Tomatoes', revenue: '₹14,200', share: '40%', sold: '3,400 kg' },
    { name: 'Ratnagiri Alphonso Mangoes', revenue: '₹9,800', share: '28%', sold: '1,650 kg' },
    { name: 'Nasik Grade-A Red Onions', revenue: '₹6,400', share: '18%', sold: '5,200 kg' },
    { name: 'Sharbati Golden Wheat', revenue: '₹4,660', share: '14%', sold: '180 quintals' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Farmer Sales & Earnings Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Flipkart Seller Hub revenue insights, top performing harvests, and payout summaries
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Net Sales</span>
            <div className="w-8 h-8 rounded-xl bg-[#D2F442] flex items-center justify-center text-slate-950">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              ₹{totalSales.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+24.5% vs last month</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Avg. Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              ₹{avgOrderVal.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Per retail & commercial order
            </span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Lifetime Units Placed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {totalQtySold.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              High market liquidity
            </span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Commission Saved</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              ₹4,200
            </span>
            <span className="text-[11px] text-amber-700 font-medium block mt-1">
              Zero middlemen deduction
            </span>
          </div>
        </div>
      </div>

      {/* Visual Chart & Top Crops Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Sales Visual Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Monthly Earnings Growth (INR)
              </h3>
              <p className="text-xs text-slate-400">Direct sales progression across harvest seasons</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              Harvest Surge
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-4 flex items-end justify-between gap-3 sm:gap-6 h-56 px-2">
            {MONTHLY_SALES.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{Math.round(item.amount / 1000)}k
                </span>
                <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-[#D2F442] hover:bg-[#c6ec32] rounded-t-xl transition-all duration-500 flex items-center justify-center"
                    style={{ height: `${item.percent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct payments wired to State Bank of India account</span>
            <span className="text-slate-900 font-semibold">T+1 Settlement</span>
          </div>
        </div>

        {/* Top Performing Crops (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Top Revenue Crops
            </h3>
            <p className="text-xs text-slate-400">Products driving highest profitability</p>
          </div>

          <div className="space-y-3.5">
            {TOP_CROPS.map((crop, idx) => (
              <div key={crop.name} className="p-3 bg-[#FAFAFA] rounded-2xl border border-slate-200/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="truncate max-w-[170px]">{idx + 1}. {crop.name}</span>
                  <span className="font-mono">{crop.revenue}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full"
                    style={{ width: crop.share }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{crop.sold}</span>
                  <span>{crop.share} of total revenue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
