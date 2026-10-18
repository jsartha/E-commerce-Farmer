import React, { useEffect, useRef, useState } from 'react';
import { Camera, Package, Pencil, Plus, Sprout, Trash2, Wrench } from 'lucide-react';
import { UserAccount } from '../types/auth';
import { AGRI_BUSINESS_CATEGORIES, AgriBusinessCategory, DashboardSection, FarmerProfile, MarketplaceTransaction, Product } from '../types/dashboard';
import { getAuthToken, loadAccountData, loadMarketplaceTransactions, saveAccountData, updateAccountProfile, updateMarketplaceTransaction } from '../lib/api';
import { DashboardBreakdown, RoleDashboardOverview } from './RoleDashboardOverview';
import { FarmerHeader } from './farmer/FarmerHeader';
import { FarmerSidebar } from './farmer/FarmerSidebar';

type AgriBusinessSnapshot = { products: Product[] };

interface AgriBusinessDashboardProps {
  user: UserAccount;
  onLogout: () => void;
  onUpdateUser: (user: UserAccount) => void;
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

type AgriBusinessView = Extract<DashboardSection, 'overview' | 'profile' | 'products' | 'add-product' | 'listings' | 'orders'>;

export const AgriBusinessDashboard: React.FC<AgriBusinessDashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [currentView, setCurrentView] = useState<AgriBusinessView>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [businessAddress, setBusinessAddress] = useState(user.businessAddress || '');
  const [district, setDistrict] = useState(user.district || '');
  const [state, setState] = useState(user.state || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [persistenceError, setPersistenceError] = useState('');
  const [loaded, setLoaded] = useState(() => !getAuthToken());
  const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);

  const businessProfile: FarmerProfile = {
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    village: user.district || user.businessAddress || '',
    district: user.district || '',
    state: user.state || '',
    farmName: user.businessName || 'Business profile',
    farmSize: '',
    crops: [],
    avatar: user.avatar || '',
    joinedDate: '',
    sellerRating: 0,
  };

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
    const refreshTransactions = () => {
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
    };
    refreshTransactions();
    const refreshInterval = window.setInterval(refreshTransactions, 5000);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
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
  const agriListingBreakdown: DashboardBreakdown[] = Object.entries(
    products.reduce<Record<string, number>>((counts, product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
      return counts;
    }, {})
  )
    .sort(([, first], [, second]) => second - first)
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value,
      color: ['#2563eb', '#4f46e5', '#0d9488', '#f59e0b', '#94a3b8'][index],
    }));
  const agriTopPerformers = Object.entries(
    completedTransactions.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.productName] = (totals[transaction.productName] || 0) + transaction.total;
      return totals;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value);
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const setTransactionStatus = async (transaction: MarketplaceTransaction, status: MarketplaceTransaction['status']) => {
    try {
      const { transactions: updatedTransactions } = await updateMarketplaceTransaction(user.email, transaction.id, status);
      setTransactions(updatedTransactions);
      setPersistenceError('');
    } catch (updateError) {
      setPersistenceError(updateError instanceof Error ? updateError.message : 'Could not update this request.');
    }
  };

  const openSection = (section: DashboardSection) => {
    switch (section) {
      case 'add-product':
        if (!editingId) resetForm();
        setCurrentView('add-product');
        break;
      case 'overview':
      case 'profile':
      case 'products':
      case 'listings':
      case 'orders':
        setCurrentView(section);
        break;
      default:
        break;
    }
  };

  const saveBusinessProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { user: updatedUser } = await updateAccountProfile({
        name: profileName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        businessAddress: businessAddress.trim(),
        district: district.trim(),
        state: state.trim(),
      });
      onUpdateUser(updatedUser);
      setPersistenceError('');
    } catch (profileError) {
      setPersistenceError(profileError instanceof Error ? profileError.message : 'Could not save your business profile.');
    }
  };

  const renderTransactions = () => (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Farmer &amp; User Requests</h2>
          <p className="mt-1 text-xs text-slate-500">Purchase and rental requests from farmers and customers for your listings.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">{transactions.length} total</span>
      </div>
      {transactions.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No requests for your listings yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {transactions.map((transaction) => (
            <article key={transaction.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{transaction.transactionType} · {transaction.id}</p>
                <h3 className="mt-1 font-bold text-slate-900">{transaction.productName}</h3>
                <p className="mt-1 text-xs text-slate-500">{transaction.buyerName} · {transaction.buyerEmail} · {transaction.quantity} {transaction.unit} · {transaction.location}</p>
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
  );

  return (
    <div className="min-h-screen bg-[#eef1f5] text-slate-900 font-sans flex antialiased">
      <FarmerSidebar
        role="AgriBusiness"
        currentSection={currentView}
        onSelectSection={openSection}
        profile={businessProfile}
        ordersCount={transactions.length}
        productsCount={products.length}
        onLogout={onLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <FarmerHeader
          role="AgriBusiness"
          profile={businessProfile}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddProduct={() => openSection('add-product')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">

        {persistenceError && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{persistenceError}</p>
        )}

        {currentView === 'overview' && (
          <>
          <RoleDashboardOverview
            role="AgriBusiness"
            name={user.businessName || user.name}
            description={`${user.district || 'Local'}${user.state ? `, ${user.state}` : ''} · Your tools and equipment reach farmers and customers through the shared marketplace.`}
            metrics={[
              { label: 'Completed revenue', value: `₹${completedRevenue.toLocaleString('en-IN')}`, detail: 'Completed sales & rentals' },
              { label: 'Open requests', value: String(pendingTransactions.length), detail: `₹${pendingValue.toLocaleString('en-IN')} potential value` },
              { label: 'Product listings', value: String(products.length), detail: `${rentalCount} equipment rentals` },
              { label: 'New this month', value: String(recentListings), detail: 'Listings added in the last 30 days' },
            ]}
            funnelTitle="Marketplace activity"
            funnel={[
              { label: 'Products listed', value: String(products.length), detail: 'Available to farmers' },
              { label: 'Requests received', value: String(transactions.length), detail: 'From farmers & customers' },
              { label: 'In progress', value: String(pendingTransactions.length), detail: 'Awaiting completion' },
              { label: 'Completed', value: String(completedTransactions.length), detail: 'Fulfilled requests' },
            ]}
            breakdownTitle="Listing mix"
            breakdown={agriListingBreakdown}
            audienceTitle="Equipment categories"
            audience={agriListingBreakdown}
            salesTrend={monthlySales.map(({ label, sales }) => ({ label, value: sales }))}
            topPerformers={agriTopPerformers}
            onAddListing={() => { resetForm(); setCurrentView('add-product'); }}
            onViewOrders={() => setCurrentView('orders')}
          />
          </>
        )}

        {currentView === 'profile' && (
          <section className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-semibold text-blue-700">AgriBusiness workspace</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Business profile</h2>
              <p className="mt-1 text-sm text-slate-500">Keep your business details up to date for farmers and buyers.</p>
            </div>
            <form onSubmit={(event) => void saveBusinessProfile(event)} className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Contact name
                <input required value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Business name
                <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Email
                <input readOnly value={user.email} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
              </label>
              <label className="text-xs font-semibold text-slate-700">Phone
                <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Business address
                <input value={businessAddress} onChange={(event) => setBusinessAddress(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="text-xs font-semibold text-slate-700">District
                <input value={district} onChange={(event) => setDistrict(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="text-xs font-semibold text-slate-700">State
                <input value={state} onChange={(event) => setState(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <button type="submit" className="rounded-xl bg-[#D2F442] px-4 py-3 text-sm font-bold text-slate-950 sm:col-span-2">Save business profile</button>
            </form>
          </section>
        )}

        {currentView === 'orders' && renderTransactions()}

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

        {(currentView === 'products' || currentView === 'listings') && <section className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">{currentView === 'products' ? 'My Agri-Tools Products' : 'My Listings'}</h2>
              <p className="mt-1 text-sm text-slate-500">Manage the equipment you sell or rent to farmers and customers.</p>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
                <Wrench className="mx-auto h-9 w-9 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-900">{products.length ? 'No matching listings' : 'No tools listed yet'}</h3>
                <p className="mt-1 text-sm text-slate-500">{products.length ? 'Try another search term.' : 'Add your first tool for sale or equipment rental.'}</p>
                {!products.length && <button type="button" onClick={() => openSection('add-product')} className="mt-4 rounded-xl bg-[#D2F442] px-4 py-2.5 text-sm font-bold text-slate-950">Add first product</button>}
              </div>
            ) : (
              <div className={currentView === 'products' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-3'}>
                {filteredProducts.map((product) => (
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
        </main>
      </div>
    </div>
  );
};
