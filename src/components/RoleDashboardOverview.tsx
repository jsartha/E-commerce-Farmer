import React from 'react';
import { ArrowRight, CalendarDays, ChevronDown, CircleHelp, Plus, Sparkles } from 'lucide-react';

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  change?: string;
}

export interface DashboardBreakdown {
  label: string;
  value: number;
  color: string;
}

export interface SalesTrendPoint {
  label: string;
  value: number;
}

interface RoleDashboardOverviewProps {
  role: 'Farmer' | 'AgriBusiness';
  name: string;
  description: string;
  metrics: DashboardMetric[];
  funnelTitle: string;
  funnel: DashboardMetric[];
  breakdownTitle: string;
  breakdown: DashboardBreakdown[];
  audienceTitle: string;
  audience: DashboardBreakdown[];
  salesTrend: SalesTrendPoint[];
  topPerformers: SalesTrendPoint[];
  onAddListing: () => void;
  onViewOrders: () => void;
}

const formatValue = (value: number) => value.toLocaleString('en-IN');

export const RoleDashboardOverview: React.FC<RoleDashboardOverviewProps> = ({
  role,
  name,
  description,
  metrics,
  funnelTitle,
  funnel,
  breakdownTitle,
  breakdown,
  audienceTitle,
  audience,
  salesTrend,
  topPerformers,
  onAddListing,
  onViewOrders,
}) => {
  const maxFunnel = Math.max(1, ...funnel.map(({ value }) => Number(value.replace(/[^\d.-]/g, '')) || 0));
  const breakdownTotal = breakdown.reduce((total, item) => total + item.value, 0);
  const maxTrend = Math.max(1, ...salesTrend.map(({ value }) => value));
  const trendPoints = salesTrend.map((point, index) => ({
    ...point,
    x: salesTrend.length > 1 ? 18 + (index / (salesTrend.length - 1)) * 364 : 200,
    y: 116 - (point.value / maxTrend) * 88,
  }));
  const trendLine = trendPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const trendArea = trendPoints.length
    ? `18,116 ${trendLine} 382,116`
    : '';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-700">{role} workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Sales Overview</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>All time</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
          <button type="button" onClick={onAddListing} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Add listing
          </button>
        </div>
      </header>

      <section aria-label="Dashboard summary" className="grid divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="min-w-0 p-5">
            <p className="text-xs font-medium text-slate-500">{metric.label}</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
              {metric.change && <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[10px] font-bold text-emerald-700">{metric.change}</span>}
            </div>
            <p className="mt-1 text-xs text-slate-400">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Live sales performance</h2>
            <p className="mt-0.5 text-xs text-slate-500">Completed sales recorded over the last six months</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Updates with your sales
          </span>
        </div>
        <div className="px-4 pb-4 pt-5 sm:px-6">
          {salesTrend.length > 0 ? (
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8 pt-1" aria-hidden="true">
                {[0, 1, 2, 3].map((line) => <div key={line} className="border-t border-dashed border-slate-100" />)}
              </div>
              <svg viewBox="0 0 400 140" role="img" aria-label={`Six month sales trend: ${salesTrend.map(({ label, value }) => `${label} ${formatValue(value)} rupees`).join(', ')}`} className="relative h-44 w-full overflow-visible">
                <defs>
                  <linearGradient id="sales-trend-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity=".2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={trendArea} fill="url(#sales-trend-fill)" className="dashboard-chart-area" />
                {trendPoints.length > 1 && (
                  <polyline points={trendLine} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="dashboard-chart-line" />
                )}
                {trendPoints.map((point) => (
                  <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2.5" className="dashboard-chart-point">
                    <title>{point.label}: ₹{formatValue(point.value)}</title>
                  </circle>
                ))}
              </svg>
              <div className="grid grid-cols-6 gap-1 pt-1">
                {salesTrend.map((point) => (
                  <div key={point.label} className="min-w-0 text-center">
                    <p className="truncate text-[10px] font-medium text-slate-500">{point.label}</p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">₹{formatValue(point.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-44 items-center justify-center rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              Sales performance will appear here when you complete an order.
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{funnelTitle}</h2>
            <p className="mt-0.5 text-xs text-slate-500">A live view of your listings and completed activity</p>
          </div>
          <button type="button" onClick={onViewOrders} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800">
            View activity <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {funnel.map((item, index) => {
            const amount = Number(item.value.replace(/[^\d.-]/g, '')) || 0;
            const width = amount === 0 ? 0 : Math.max(10, Math.round((amount / maxFunnel) * 100));
            return (
              <article key={item.label} className="relative border-b border-slate-100 px-5 py-4 last:border-0 sm:nth-[2]:border-l xl:border-b-0 xl:border-l xl:first:border-l-0">
                <p className="text-[11px] text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{item.detail}</p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-blue-50">
                  <div className={`h-full rounded-full ${index === 0 ? 'bg-blue-300' : index === 1 ? 'bg-blue-400' : index === 2 ? 'bg-blue-500' : 'bg-blue-600'}`} style={{ width: `${width}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.28fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{breakdownTitle}</h2>
              <p className="mt-1 text-xs text-slate-500">Distribution across {role.toLowerCase()} listings</p>
            </div>
            <CircleHelp className="h-4 w-4 text-slate-400" aria-label="Based on current listings" />
          </div>
          {breakdown.length > 0 && breakdownTotal > 0 ? (
            <>
              <div
                role="img"
                aria-label={breakdown.map((item) => `${item.label}: ${item.value}`).join(', ')}
                className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(${breakdown.map((item, index) => {
                  const before = breakdown.slice(0, index).reduce((sum, entry) => sum + entry.value, 0);
                  const start = (before / breakdownTotal) * 100;
                  const end = ((before + item.value) / breakdownTotal) * 100;
                  return `${item.color} ${start}% ${end}%`;
                }).join(', ')})` }}
              >
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-bold text-slate-900">{formatValue(breakdownTotal)}</span>
                  <span className="text-[10px] text-slate-400">listings</span>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {breakdown.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.label} ({item.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 flex h-36 items-center justify-center rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              No listings to show yet. Add a listing to see your mix.
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{audienceTitle}</h2>
              <p className="mt-1 text-xs text-slate-500">Current inventory by category</p>
            </div>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          {audience.length > 0 ? (
            <div className="mt-6 space-y-4">
              {audience.map((item) => {
                const maximum = Math.max(1, ...audience.map((entry) => entry.value));
                return (
                  <div key={item.label} className="grid grid-cols-[minmax(74px,0.65fr)_minmax(0,3fr)_40px] items-center gap-3">
                    <span className="truncate text-[11px] text-slate-600">{item.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(4, (item.value / maximum) * 100)}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="text-right text-[11px] font-semibold text-slate-700">{item.value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex h-36 items-center justify-center rounded-xl bg-slate-50 text-center text-xs text-slate-500">
              Category insights appear here when you publish listings.
            </div>
          )}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">{name} · Your dashboard updates as listings and requests change.</p>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Top products by completed sales</h2>
            <p className="mt-1 text-xs text-slate-500">Ranked using completed orders and marketplace transactions</p>
          </div>
          <Sparkles className="h-4 w-4 text-blue-600" />
        </div>
        {topPerformers.length > 0 ? (
          <div className="mt-4 space-y-3">
            {topPerformers.slice(0, 5).map((item, index) => {
              const maximum = Math.max(1, ...topPerformers.map(({ value }) => value));
              return (
                <div key={item.label} className="grid grid-cols-[24px_minmax(0,1fr)_minmax(80px,2fr)_auto] items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">{index + 1}</span>
                  <span className="truncate text-xs font-medium text-slate-700">{item.label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500 transition-[width] duration-700 ease-out" style={{ width: `${Math.max(4, (item.value / maximum) * 100)}%` }} />
                  </div>
                  <span className="text-right text-xs font-semibold text-slate-800">₹{formatValue(item.value)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-7 text-center text-xs text-slate-500">
            Top products will appear after an order is completed.
          </div>
        )}
      </section>
    </div>
  );
};
