import React, { useEffect, useRef, useState } from 'react';
import { Camera, ChartNoAxesCombined, LayoutDashboard, LogOut, Package, Pencil, Plus, Sprout, Trash2, Tractor, TrendingUp, Wrench } from 'lucide-react';
import { UserAccount } from '../types/auth';
import { AGRI_BUSINESS_CATEGORIES, AgriBusinessCategory, MarketplaceTransaction, Product } from '../types/dashboard';
import { getAuthToken, loadAccountData, loadMarketplaceTransactions, saveAccountData, updateMarketplaceTransaction } from '../lib/api';

type AgriBusinessSnapshot = { products: Product[] };

interface AgriBusinessDashboardProps {
  user: UserAccount;
  onLogout: () => void;
}

const EMPTY_FORM = {
  name: '',
  category: 'Farming Equipment' as AgriBusinessCategory,
  listingType: 'sale' as Product['listingType'],
  description: '',
  price: '',
  unit: 'piece' as Product['unit'],
  quantity: '1',
  image: '',
  status: 'In Stock' as Product['status'],
};

type AgriBusinessView = 'overview' | 'products' | 'add-product' | 'sales';

export const AgriBusinessDashboard: React.FC<AgriBusinessDashboardProps> = ({ user, onLogout }) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [currentView, setCurrentView] = useState<AgriBusinessView>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [persistenceError, setPersistenceError] = useState('');
  const [loaded, setLoaded] = useState(() => !getAuthToken());
  const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) return;
    let active = true;
    void loadAccountData<AgriBusinessSnapshot>('agri-business-dashboard')
      .then(({ data }) => {
        if (!active) return;
        setProducts(data && Array.isArray(data.products) ? data.products : []);
        setLoaded(true);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setPersistenceError(loadError instanceof Error ? loadError.message : 'Could not load your listings.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void loadMarketplaceTransactions(user.email)
      .then(({ transactions: savedTransactions }) => {
        if (active) {
          setTransactions(savedTransactions);
          setTransactionsLoaded(true);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setPersistenceError(loadError instanceof Error ? loadError.message : 'Could not load sales and rental requests.');
          setTransactionsLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [user.email]);

  useEffect(() => {
    if (!loaded || !getAuthToken()) return;
    const timeout = window.setTimeout(() => {
      void saveAccountData<AgriBusinessSnapshot>('agri-business-dashboard', { products })
        .then(() => setPersistenceError(''))
        .catch((saveError: unknown) => {
          setPersistenceError(saveError instanceof Error ? saveError.message : 'Could not save your listings.');
        });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [loaded, products]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose a valid image file for the listing photo.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((current) => ({ ...current, image: reader.result as string }));
        setError('');
      } else {
        setError('Could not read the selected photo. Please try again.');
      }
    };
    reader.onerror = () => setError('Could not read the selected photo. Please try again.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const addListing = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    if (!form.name.trim()) {
      setError('Enter a name for your tool or equipment.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a price greater than zero.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Available quantity must be at least one.');
      return;
    }
    if (!form.image.trim()) {
      setError('Add a listing photo using your camera, device, or a photo URL.');
      return;
    }

    const listing: Product = {
      id: editingId || `agri-${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      listingType: form.listingType || 'sale',
      description: form.description.trim() || `${form.name.trim()} for agricultural use.`,
      price,
      unit: form.listingType === 'rental' ? form.unit : form.unit === 'piece' || form.unit === 'set' ? form.unit : 'piece',
      quantity,
      status: form.status,
      image: form.image.trim(),
      harvestDate: 'Listed today',
      rating: 0,
      soldCount: 0,
      sellerType: 'agri-business',
      sellerName: user.businessName || user.name,
      createdAt: editingId
        ? products.find((product) => product.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };
    setProducts((current) => editingId
      ? current.map((product) => product.id === editingId ? listing : product)
      : [listing, ...current]);
    resetForm();
    setCurrentView('products');
  };

  const editListing = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category as AgriBusinessCategory,
      listingType: product.listingType || 'sale',
      description: product.description,
      price: String(product.price),
      unit: product.unit,
      quantity: String(product.quantity),
      image: product.image,
      status: product.status,
    });
    setError('');
    setCurrentView('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rentalCount = products.filter((product) => product.listingType === 'rental').length;
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const completedTransactions = transactions.filter((transaction) => transaction.status === 'Completed');
  const completedRevenue = completedTransactions.reduce((total, transaction) => total + transaction.total, 0);
  const pendingTransactions = transactions.filter((transaction) => transaction.status === 'Requested' || transaction.status === 'Accepted');
  const pendingValue = pendingTransactions.reduce((total, transaction) => total + transaction.total, 0);
  const recentRevenue = completedTransactions
    .filter((transaction) => now - new Date(transaction.createdAt).getTime() <= thirtyDays)
    .reduce((total, transaction) => total + transaction.total, 0);
  const previousRevenue = completedTransactions
    .filter((transaction) => {
      const age = now - new Date(transaction.createdAt).getTime();
      return age > thirtyDays && age <= thirtyDays * 2;
    })
    .reduce((total, transaction) => total + transaction.total, 0);
  const revenueGrowth = previousRevenue > 0
    ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)
    : null;
  const recentListings = products.filter((product) => product.createdAt && now - new Date(product.createdAt).getTime() <= thirtyDays).length;
  const monthlySales = Array.from({ length: 6 }, (_, offset) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setMonth(monthStart.getMonth() - (5 - offset));
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const sales = completedTransactions
      .filter((transaction) => {
        const created = new Date(transaction.createdAt).getTime();
        return created >= monthStart.getTime() && created < monthEnd.getTime();
      })
      .reduce((total, transaction) => total + transaction.total, 0);
    return {
      label: monthStart.toLocaleDateString(undefined, { month: 'short' }),
      sales,
    };
  });
  const maxMonthlySales = Math.max(1, ...monthlySales.map((month) => month.sales));

  const setTransactionStatus = async (transaction: MarketplaceTransaction, status: MarketplaceTransaction['status']) => {
    try {
      const { transactions: updatedTransactions } = await updateMarketplaceTransaction(user.email, transaction.id, status);
      setTransactions(updatedTransactions);
      setPersistenceError('');
    } catch (updateError) {
      setPersistenceError(updateError instanceof Error ? updateError.message : 'Could not update this request.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F3] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D2F442] text-slate-950">
                <Tractor className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Agri-tools seller hub</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{user.businessName || user.name}</h1>
                <p className="mt-1 text-sm text-slate-500">List agricultural tools for sale or equipment for rent.</p>
              </div>
            </div>
            <button type="button" onClick={onLogout} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAFA] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Tool listings</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAFA] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Equipment rentals</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{rentalCount}</p>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {([
              ['overview', 'Dashboard Overview', LayoutDashboard],
              ['products', 'My Products', Package],
              ['add-product', editingId ? 'Edit Product' : 'Add Product', Plus],
              ['sales', 'Sales & Growth', TrendingUp],
            ] as const).map(([view, label, Icon]) => (
              <button
                key={view}
                type="button"
                onClick={() => {
                  setCurrentView(view);
                  if (view === 'add-product' && !editingId) resetForm();
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                  currentView === view
                    ? 'bg-[#D2F442] text-slate-950'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>
        </header>

        {persistenceError && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{persistenceError}</p>
        )}

        {currentView === 'overview' && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button type="button" onClick={() => setCurrentView('add-product')} className="rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D2F442]"><Plus className="h-5 w-5" /></div>
              <h2 className="mt-4 font-black text-slate-900">Create a listing</h2>
              <p className="mt-1 text-sm text-slate-500">Sell a tool or offer equipment for rent.</p>
            </button>
            <button type="button" onClick={() => setCurrentView('products')} className="rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F7E5]"><Package className="h-5 w-5" /></div>
              <h2 className="mt-4 font-black text-slate-900">Manage your products</h2>
              <p className="mt-1 text-sm text-slate-500">{products.length} listings available to edit or remove.</p>
            </button>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Tractor className="h-5 w-5" /></div>
              <h2 className="mt-4 font-black text-slate-900">Reach farmers and buyers</h2>
              <p className="mt-1 text-sm text-slate-500">Published listings appear in the customer marketplace and farmer AgriBusiness Hub.</p>
            </div>
            <button type="button" onClick={() => setCurrentView('sales')} className="rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><TrendingUp className="h-5 w-5" /></div>
              <h2 className="mt-4 font-black text-slate-900">Sales &amp; growth</h2>
              <p className="mt-1 text-sm text-slate-500">{transactions.length} buyer or rental requests · {recentListings} new listings this month.</p>
            </button>
          </section>
        )}

        {currentView === 'sales' && (
          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Completed sales & rentals', String(completedTransactions.length)],
                ['Completed demo revenue', `₹${completedRevenue.toLocaleString('en-IN')}`],
                ['Open request value', `₹${pendingValue.toLocaleString('en-IN')}`],
                ['New listings (30 days)', String(recentListings)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ChartNoAxesCombined className="h-5 w-5 text-emerald-700" />
                  <div><h2 className="font-black text-slate-900">Monthly completed sales</h2><p className="text-xs text-slate-500">Based on seller-accepted demo requests marked complete.</p></div>
                </div>
                <div className="mt-6 grid h-48 grid-cols-6 items-end gap-3">
                  {monthlySales.map((month) => (
                    <div key={month.label} className="flex h-full flex-col items-center justify-end gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">{month.sales ? `₹${month.sales.toLocaleString('en-IN')}` : '₹0'}</span>
                      <div className="flex h-32 w-full items-end rounded-t-lg bg-slate-50">
                        <div className="w-full rounded-t-lg bg-[#D2F442]" style={{ height: `${month.sales ? Math.max(8, (month.sales / maxMonthlySales) * 100) : 0}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-500">{month.label}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-700" /><h2 className="font-black text-slate-900">Growth signals</h2></div>
                <div className="rounded-2xl bg-[#F3F7E5] p-4">
                  <p className="text-xs text-slate-500">Completed revenue · last 30 days</p>
                  <p className="mt-1 text-xl font-black text-slate-900">₹{recentRevenue.toLocaleString('en-IN')}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-800">
                    {revenueGrowth === null ? 'Comparison appears after the previous period has sales.' : `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% vs previous 30 days`}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Listings published · last 30 days</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{recentListings}</p>
                  <p className="mt-1 text-xs text-slate-500">Add and keep listings available to grow marketplace reach.</p>
                </div>
              </section>
            </div>
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-black text-slate-900">Sales, rental requests &amp; demo orders</h2>
              {transactions.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No customer requests yet. Published listings can receive purchase and rental requests from the marketplace.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {transactions.map((transaction) => (
                    <article key={transaction.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{transaction.transactionType} · {transaction.id}</p>
                        <h3 className="mt-1 font-bold text-slate-900">{transaction.productName}</h3>
                        <p className="mt-1 text-xs text-slate-500">{transaction.buyerName} · {transaction.quantity} {transaction.unit} · {transaction.location}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="mr-1 text-sm text-slate-900">₹{transaction.total.toLocaleString('en-IN')}</strong>
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold">{transaction.status}</span>
                        {transaction.status !== 'Completed' && transaction.status !== 'Cancelled' && (
                          <>
                            <button type="button" onClick={() => void setTransactionStatus(transaction, 'Accepted')} className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">Accept</button>
                            <button type="button" onClick={() => void setTransactionStatus(transaction, 'Completed')} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Complete</button>
                            <button type="button" onClick={() => void setTransactionStatus(transaction, 'Cancelled')} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Decline</button>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {!transactionsLoaded && <p role="status" className="mt-3 text-xs text-slate-500">Loading sales and requests…</p>}
            </section>
            <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-900">Demo analytics only: totals are calculated from simulated marketplace requests saved in this browser. Completed revenue is an estimate, not a real payment.</p>
          </section>
        )}

        {currentView === 'add-product' && <section className="mx-auto max-w-3xl">
          <form onSubmit={addListing} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#F3F7E5] p-2 text-slate-900"><Plus className="h-5 w-5" /></div>
              <div><h2 className="font-black text-slate-900">Add a listing</h2><p className="text-xs text-slate-500">Agricultural tools and equipment only</p></div>
            </div>
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}

            <label className="block text-xs font-semibold text-slate-700">Listing type
              <select value={form.listingType} onChange={(event) => {
                const listingType = event.target.value as Product['listingType'];
                setForm({
                  ...form,
                  listingType,
                  unit: listingType === 'rental' ? 'day' : 'piece',
                });
              }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                <option value="sale">Sell a tool</option><option value="rental">Rent out equipment</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">Tool / equipment name
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. 45 HP tractor" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as AgriBusinessCategory })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                {AGRI_BUSINESS_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">Description
              <textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Condition, features, or rental terms" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-700">Price (₹)
                <input required type="number" min="1" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Price unit
                <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value as Product['unit'] })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  {form.listingType === 'rental' ? <><option value="day">per day</option><option value="week">per week</option><option value="month">per month</option></> : <><option value="piece">per item</option><option value="set">per set</option></>}
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-700">Available quantity
              <input required type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block text-xs font-semibold text-slate-700">Availability
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Product['status'] })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                <option value="In Stock">Available</option><option value="Low Stock">Limited availability</option><option value="Out of Stock">Unavailable</option>
              </select>
            </label>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Listing photo *</label>
              {form.image && (
                <img src={form.image} alt="Listing photo preview" className="mt-2 h-36 w-full rounded-xl border border-slate-200 bg-slate-100 object-cover" />
              )}
              <button type="button" onClick={() => photoInputRef.current?.click()} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                <Camera className="h-4 w-4" /> Camera / Choose photo
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
              <input type="url" value={form.image.startsWith('data:') ? '' : form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Or enter a photo URL" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              <p className="mt-1 text-[11px] text-slate-500">A photo is required. Use your camera, choose a device photo, or enter a photo URL.</p>
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D2F442] px-4 py-3 text-sm font-bold text-slate-950 hover:bg-[#c6ec32]">
              <Package className="h-4 w-4" /> {editingId ? 'Save listing changes' : 'Publish listing'}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancel editing</button>}
          </form>
        </section>}

        {currentView !== 'add-product' && <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">{currentView === 'overview' ? 'Recent listings' : 'My Agri-Tools Products'}</h2>
              <p className="mt-1 text-sm text-slate-500">Manage the equipment you sell or rent to farmers and customers.</p>
            </div>
            {products.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
                <Wrench className="mx-auto h-9 w-9 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-900">No tools listed yet</h3>
                <p className="mt-1 text-sm text-slate-500">Add your first tool for sale or equipment rental.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <article key={product.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                    <img src={product.image} alt={product.name} className="h-40 w-full bg-slate-100 object-cover" />
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{product.category}</p><h3 className="mt-1 font-bold text-slate-900">{product.name}</h3></div>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">{product.listingType === 'rental' ? 'For rent' : 'For sale'}</span>
                      </div>
                      <p className="text-sm text-slate-600">₹{product.price} / {product.unit} · {product.quantity} available · {product.status}</p>
                      {product.description && <p className="text-xs leading-5 text-slate-500">{product.description}</p>}
                      <div className="flex gap-2">
                        <button type="button" onClick={() => editListing(product)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => {
                          setProducts((current) => current.filter((item) => item.id !== product.id));
                          if (editingId === product.id) resetForm();
                        }} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                          <Trash2 className="h-3.5 w-3.5" /> Remove listing
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="flex items-center gap-2 rounded-2xl bg-[#F3F7E5] p-4 text-xs leading-5 text-slate-700">
              <Sprout className="h-4 w-4 shrink-0 text-emerald-700" />
              Farmer harvest products are not displayed in this seller dashboard.
            </p>
          </section>}
      </div>
    </main>
  );
};
