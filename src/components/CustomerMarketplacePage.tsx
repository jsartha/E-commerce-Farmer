import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, LogOut, MapPin, ShoppingCart, Star, Leaf, UserRound, PackageCheck, CircleCheck, Clock3, Truck, Wrench, X } from 'lucide-react';
import { Product } from '../types/dashboard';
import { UserAccount } from '../types/auth';
import { getAuthToken, loadAccountData, loadMarketplaceListings, recordMarketplaceTransaction, saveAccountData } from '../lib/api';
import { INITIAL_PRODUCTS } from '../data/mockFarmerData';

type CustomerOrder = {
  id: string;
  product: Product;
  quantity: number;
  listingType: 'sale' | 'rental';
  total: number;
  address: string;
  placedAt: string;
  status: 'Order placed' | 'Confirmed' | 'Shipped' | 'Delivered';
};

interface CustomerMarketplacePageProps {
  user: UserAccount;
  onLogout: () => void;
  onUpdateUser: (user: UserAccount) => void;
}

const ORDER_STEPS = ['Order placed', 'Confirmed', 'Shipped', 'Delivered'] as const;
type CustomerOrderSnapshot = { orders: CustomerOrder[] };

export const CustomerMarketplacePage: React.FC<CustomerMarketplacePageProps> = ({
  user,
  onLogout,
  onUpdateUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeView, setActiveView] = useState<'shop' | 'orders' | 'profile'>('shop');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [checkoutError, setCheckoutError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(
    [user.village, user.district, user.state].filter(Boolean).join(', ')
  );
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersPersistenceStatus, setOrdersPersistenceStatus] = useState<'saving' | 'saved' | 'offline'>(
    () => (getAuthToken() ? 'saving' : 'saved')
  );
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileVillage, setProfileVillage] = useState(user.village || '');
  const [profileDistrict, setProfileDistrict] = useState(user.district || '');
  const [profileState, setProfileState] = useState(user.state || '');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    void loadMarketplaceListings()
      .then(({ products: farmerProducts }) => {
        if (active && farmerProducts.length > 0) setProducts(farmerProducts);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!getAuthToken()) {
      setOrdersLoaded(true);
      return;
    }
    void loadAccountData<CustomerOrderSnapshot>('customer-orders')
      .then(({ data }) => {
        if (!active) return;
        if (data && Array.isArray(data.orders)) setOrders(data.orders);
        setOrdersLoaded(true);
        setOrdersPersistenceStatus('saved');
      })
      .catch(() => {
        if (active) setOrdersPersistenceStatus('offline');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ordersLoaded || !getAuthToken()) return;
    const timeout = window.setTimeout(() => {
      setOrdersPersistenceStatus('saving');
      void saveAccountData<CustomerOrderSnapshot>('customer-orders', { orders })
        .then(() => setOrdersPersistenceStatus('saved'))
        .catch(() => setOrdersPersistenceStatus('offline'));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [ordersLoaded, orders]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);
  const categoryList = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    [products]
  );

  const totalProducts = products.length;
  const freshCollections = products.filter(
    (product) => product.sellerType !== 'agri-business' && product.harvestDate === 'Today'
  ).length;
  const avgRating = products.length ? (products.reduce((sum, product) => sum + product.rating, 0) / products.length).toFixed(1) : '0.0';

  const placeOrder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!checkoutProduct || !deliveryAddress.trim()) {
      setCheckoutError('Enter a delivery address or rental location.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1
      || (checkoutProduct.listingType !== 'rental' && quantity > checkoutProduct.quantity)) {
      setCheckoutError('Enter a valid quantity or rental duration.');
      return;
    }
    const order: CustomerOrder = {
      id: `FM-${crypto.randomUUID()}`,
      product: checkoutProduct,
      quantity,
      listingType: checkoutProduct.listingType === 'rental' ? 'rental' : 'sale',
      total: checkoutProduct.price * quantity,
      address: deliveryAddress.trim(),
      placedAt: new Date().toLocaleString(),
      status: 'Order placed',
    };
    setOrders((previous) => [order, ...previous]);
    if (checkoutProduct.sellerType === 'agri-business' && checkoutProduct.sellerEmail) {
      void recordMarketplaceTransaction({
        id: order.id,
        sellerEmail: checkoutProduct.sellerEmail,
        buyerName: user.name,
        buyerEmail: user.email,
        productId: checkoutProduct.id,
        productName: checkoutProduct.name,
        transactionType: order.listingType,
        quantity,
        unit: checkoutProduct.unit,
        unitPrice: checkoutProduct.price,
        total: order.total,
        location: order.address,
        createdAt: new Date().toISOString(),
        status: 'Requested',
      }).catch((error: unknown) => {
        setCheckoutError(error instanceof Error ? error.message : 'Could not send the seller request.');
      });
    }
    setCheckoutProduct(null);
    setSelectedProduct(null);
    setActiveView('orders');
    setNotice(`${order.listingType === 'rental' ? 'Rental request' : 'Order'} ${order.id} placed successfully.`);
    setCheckoutError('');
  };

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    const updatedUser = {
      ...user,
      name: profileName.trim(),
      phone: profilePhone.trim(),
      village: profileVillage.trim(),
      district: profileDistrict.trim(),
      state: profileState.trim(),
    };
    onUpdateUser(updatedUser);
    setDeliveryAddress([updatedUser.village, updatedUser.district, updatedUser.state].filter(Boolean).join(', '));
    setNotice('Profile details saved.');
  };

  return (
    <div className="min-h-screen bg-[#F6F7F3] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Customer'}
                  className="h-14 w-14 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D2F442] text-base font-bold text-slate-900">
                  {user.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Farm &amp; agri-tools marketplace</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Welcome back, {user.name || 'Customer'}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setActiveView('shop')} className={`rounded-xl px-3 py-2 text-xs font-bold ${activeView === 'shop' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                Shop
              </button>
              <button type="button" onClick={() => setActiveView('orders')} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${activeView === 'orders' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <PackageCheck className="h-3.5 w-3.5" /> Orders {orders.length > 0 && `(${orders.length})`}
              </button>
              <button type="button" onClick={() => setActiveView('profile')} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${activeView === 'profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <UserRound className="h-3.5 w-3.5" /> Profile
              </button>
              <div className="rounded-2xl bg-[#F3F7E5] px-3 py-2 text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Delivering to</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {user.village || 'Ludhiana'}, {user.district || 'Punjab'}
                </p>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAFA] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Products</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{totalProducts}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAFA] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Fresh today</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{freshCollections}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#FAFAFA] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Average rating</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{avgRating}</p>
            </div>
          </div>
        </header>

        {notice && (
          <div role="status" className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {notice}
            <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><X className="h-4 w-4" /></button>
          </div>
        )}

        {getAuthToken() && ordersPersistenceStatus !== 'saved' && (
          <div role="status" className={`rounded-xl border px-4 py-3 text-xs font-medium ${ordersPersistenceStatus === 'offline' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
            {ordersPersistenceStatus === 'offline'
              ? 'Could not save orders in this browser. Your current order list is unchanged; try again after freeing local storage space.'
              : 'Syncing your orders…'}
          </div>
        )}

        {activeView === 'shop' && <>
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Farm products &amp; agri-tools</h2>
              <p className="mt-1 text-xs text-slate-500">
                Shop farmer harvests and agricultural tools, or rent equipment from agri-businesses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categoryList.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-[#F5F6F3] text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product: Product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-sm">
                  {product.category}
                </div>

                <div
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm ${
                    product.status === 'In Stock'
                      ? 'bg-emerald-500'
                      : product.status === 'Low Stock'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                >
                  {product.status}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900">{product.name}</h3>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {product.sellerType === 'agri-business'
                        ? (product.listingType === 'rental' ? 'Equipment rental' : 'Agri-tool for sale')
                        : `Harvested ${product.harvestDate}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {product.rating}
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-600">{product.description}</p>

                <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">
                      {product.listingType === 'rental' ? 'Rental price' : 'Price'}
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">₹{product.price}<span className="text-xs font-medium text-slate-500"> / {product.unit}</span></p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Available</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {product.sellerType === 'agri-business'
                        ? `${product.quantity} available`
                        : `${product.quantity} ${product.unit}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F7F9F5] px-3 py-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    {product.sellerType === 'agri-business'
                      ? <Wrench className="h-3.5 w-3.5 text-emerald-600" />
                      : <Leaf className="h-3.5 w-3.5 text-emerald-600" />}
                    {product.sellerType === 'agri-business'
                      ? product.sellerName || 'Verified agri-business'
                      : 'Verified farmer supply'}
                  </span>
                  <span>{product.soldCount} sold</span>
                </div>
                {product.sellerLocation && (
                  <p className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3" /> Seller location: {product.sellerLocation}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    View details
                  </button>

                  <button
                    type="button"
                    disabled={product.status === 'Out of Stock' || product.quantity < 1}
                    onClick={() => {
                      setCheckoutProduct(product);
                      setQuantity(1);
                    }}
                    className="flex-1 rounded-2xl bg-[#D2F442] px-3 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-[#c7ea34]"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {product.status === 'Out of Stock'
                        ? 'Unavailable'
                        : product.listingType === 'rental' ? 'Rent now' : 'Buy now'}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="rounded-[28px] border border-slate-200/80 bg-slate-900 p-5 text-white shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Why customers choose us</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight">Freshness you can trust.</h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#D2F442] px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-[#c7ea34]"
            >
              Explore more products
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        </>}

        {activeView === 'orders' && (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Your orders</h2>
              <p className="mt-1 text-sm text-slate-500">Follow each order from placement through delivery.</p>
            </div>
            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <PackageCheck className="mx-auto h-9 w-9 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-900">No orders yet</h3>
                <p className="mt-1 text-sm text-slate-500">Your purchases and delivery updates will appear here.</p>
                <button type="button" onClick={() => setActiveView('shop')} className="mt-4 rounded-xl bg-[#D2F442] px-4 py-2.5 text-sm font-bold text-slate-950">Browse products</button>
              </div>
            ) : orders.map((order) => {
              const currentStep = ORDER_STEPS.indexOf(order.status);
              return (
                <article key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <img src={order.product.image} alt={order.product.name} className="h-20 w-20 rounded-2xl object-cover" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{order.listingType === 'rental' ? 'Rental request' : 'Order'} {order.id}</p>
                        <h3 className="mt-1 font-bold text-slate-900">{order.product.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {order.listingType === 'rental'
                            ? `${order.quantity} ${order.product.unit}${order.quantity === 1 ? '' : 's'} rental`
                            : `${order.quantity} ${order.product.unit}`}
                          {' · '}₹{order.total}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Placed {order.placedAt}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{order.status}</div>
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {ORDER_STEPS.map((step, index) => (
                      <div key={step} className="space-y-2 text-center">
                        <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${index <= currentStep ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {index < currentStep ? <CircleCheck className="h-4 w-4" /> : index === currentStep ? <Clock3 className="h-4 w-4" /> : index === 2 ? <Truck className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
                        </div>
                        <p className={`text-[10px] sm:text-xs ${index <= currentStep ? 'font-bold text-slate-800' : 'text-slate-400'}`}>{step}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500"><MapPin className="mr-1 inline h-3.5 w-3.5" />Delivering to {order.address}</p>
                </article>
              );
            })}
          </section>
        )}

        {activeView === 'profile' && (
          <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              {user.avatar ? <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D2F442] font-bold">{user.name.charAt(0)}</div>}
              <div><h2 className="text-xl font-black text-slate-900">Your profile</h2><p className="text-sm text-slate-500">{user.email}</p></div>
            </div>
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Full name<input required value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-semibold text-slate-700">Phone<input type="tel" value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-semibold text-slate-700">Village / City<input value={profileVillage} onChange={(event) => setProfileVillage(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-semibold text-slate-700">District<input value={profileDistrict} onChange={(event) => setProfileDistrict(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
              <label className="text-xs font-semibold text-slate-700">State<input value={profileState} onChange={(event) => setProfileState(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
              <div className="flex items-end"><button type="submit" className="w-full rounded-xl bg-[#D2F442] px-4 py-2.5 text-sm font-bold text-slate-950">Save profile</button></div>
            </form>
          </section>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`${selectedProduct.name} details`}>
            <article className="relative grid max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white md:grid-cols-2">
              <button type="button" onClick={() => setSelectedProduct(null)} aria-label="Close details" className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-slate-700 shadow"><X className="h-4 w-4" /></button>
              <img src={selectedProduct.image} alt={selectedProduct.name} className="h-64 w-full object-cover md:h-full" />
              <div className="space-y-4 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {selectedProduct.category} · {selectedProduct.sellerType === 'agri-business'
                    ? (selectedProduct.listingType === 'rental' ? 'Available to rent' : 'Available to buy')
                    : `Harvested ${selectedProduct.harvestDate}`}
                </p>
                <h2 className="text-2xl font-black text-slate-900">{selectedProduct.name}</h2>
                <p className="text-sm leading-6 text-slate-600">{selectedProduct.description}</p>
                <p className="text-2xl font-black text-slate-900">₹{selectedProduct.price}<span className="text-sm font-medium text-slate-500"> / {selectedProduct.unit}</span></p>
                <p className="text-sm text-slate-600">
                  {selectedProduct.sellerType === 'agri-business'
                    ? `${selectedProduct.quantity} available from ${selectedProduct.sellerName || 'agri-business'}`
                    : `${selectedProduct.quantity} ${selectedProduct.unit} available · ${selectedProduct.rating} ★ from ${selectedProduct.soldCount} sales`}
                </p>
                <button type="button" disabled={selectedProduct.status === 'Out of Stock'} onClick={() => { setCheckoutProduct(selectedProduct); setQuantity(1); setSelectedProduct(null); }} className="w-full rounded-xl bg-[#D2F442] px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
                  {selectedProduct.listingType === 'rental' ? 'Rent now' : 'Buy now'}
                </button>
              </div>
            </article>
          </div>
        )}

        {checkoutProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Checkout">
            <form onSubmit={placeOrder} className="relative w-full max-w-md space-y-4 rounded-3xl bg-white p-6">
              <button type="button" onClick={() => setCheckoutProduct(null)} aria-label="Close checkout" className="absolute right-4 top-4 rounded-full p-1 text-slate-500"><X className="h-4 w-4" /></button>
              <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{checkoutProduct.listingType === 'rental' ? 'Equipment rental request' : 'Checkout'}</p><h2 className="mt-1 text-xl font-black text-slate-900">{checkoutProduct.name}</h2></div>
              <label className="block text-xs font-semibold text-slate-700">
                {checkoutProduct.listingType === 'rental'
                  ? `Rental duration (${checkoutProduct.unit}${quantity === 1 ? '' : 's'})`
                  : `Quantity (${checkoutProduct.unit})`}
                <input
                  type="number"
                  min="1"
                  step="1"
                  max={checkoutProduct.listingType === 'rental' ? undefined : checkoutProduct.quantity}
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(
                    1,
                    checkoutProduct.listingType === 'rental'
                      ? Number(event.target.value)
                      : Math.min(checkoutProduct.quantity, Number(event.target.value))
                  ))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">{checkoutProduct.listingType === 'rental' ? 'Farm / pickup location' : 'Delivery address'}<textarea required rows={3} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Enter full address or farm location" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /></label>
              {checkoutError && <p role="alert" className="text-xs text-rose-700">{checkoutError}</p>}
              <div className="flex justify-between border-t border-slate-100 pt-3 text-sm"><span className="text-slate-600">Estimated total</span><strong className="text-lg text-slate-900">₹{checkoutProduct.price * quantity}</strong></div>
              <button type="submit" className="w-full rounded-xl bg-[#D2F442] px-4 py-3 text-sm font-bold text-slate-950">{checkoutProduct.listingType === 'rental' ? 'Send rental request' : 'Place order'}</button>
              <p className="text-center text-[11px] text-slate-400">Demo checkout; no payment is collected.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
