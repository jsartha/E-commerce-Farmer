import React, { useEffect, useState } from 'react';
import { Wrench, ShieldCheck, Tag, ShoppingCart, Tractor, X } from 'lucide-react';
import { MarketplaceTransactionStatus, Product } from '../../types/dashboard';
import { getAuthToken, loadAccountData, loadMarketplaceListings, loadMarketplaceTransactionsForBuyer, recordMarketplaceTransaction, saveAccountData } from '../../lib/api';

interface FarmerEquipmentOrder {
  id: string;
  product: Product;
  listingType: 'sale' | 'rental';
  quantity: number;
  total: number;
  location: string;
  createdAt: string;
  status: string;
}

type FarmerEquipmentOrderSnapshot = { orders: FarmerEquipmentOrder[] };

interface AgriBusinessConnectSectionProps {
  farmerName: string;
  farmerEmail: string;
}

const TRANSACTION_STATUS_LABELS: Record<MarketplaceTransactionStatus, string> = {
  Requested: 'Request sent',
  Accepted: 'Accepted',
  Completed: 'Completed',
  Cancelled: 'Declined',
};

export const AgriBusinessConnectSection: React.FC<AgriBusinessConnectSectionProps> = ({ farmerName, farmerEmail }) => {
  const [tools, setTools] = useState<Product[]>([]);
  const [equipmentOrders, setEquipmentOrders] = useState<FarmerEquipmentOrder[]>([]);
  const [buyerTransactions, setBuyerTransactions] = useState<{ id: string; status: MarketplaceTransactionStatus }[]>([]);
  const [selectedTool, setSelectedTool] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState('');
  const [orderNotice, setOrderNotice] = useState('');
  const [orderError, setOrderError] = useState('');
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const refreshListings = () => {
      void loadMarketplaceListings()
        .then(({ products }) => {
          if (active) setTools(products.filter((product) => product.sellerType === 'agri-business'));
        })
        .catch((error: unknown) => {
          if (active) setOrderError(error instanceof Error ? error.message : 'Could not load agri-business products.');
        });
    };
    const refreshTransactions = () => {
      if (!getAuthToken() || !farmerEmail) return;
      void loadMarketplaceTransactionsForBuyer(farmerEmail)
        .then(({ transactions }) => {
          if (active) setBuyerTransactions(transactions.map(({ id, status }) => ({ id, status })));
        })
        .catch((error: unknown) => {
          if (active) setOrderError(error instanceof Error ? error.message : 'Could not refresh your equipment requests.');
        });
    };
    refreshListings();
    refreshTransactions();
    const refreshInterval = window.setInterval(() => {
      refreshListings();
      refreshTransactions();
    }, 5000);
    if (!getAuthToken()) {
      setOrdersLoaded(true);
    } else {
      void loadAccountData<FarmerEquipmentOrderSnapshot>('farmer-agri-orders')
        .then(({ data }) => {
          if (!active) return;
          if (data && Array.isArray(data.orders)) setEquipmentOrders(data.orders);
          setOrdersLoaded(true);
        })
        .catch((error: unknown) => {
          if (active) setOrderError(error instanceof Error ? error.message : 'Could not load your equipment requests.');
        });
    }
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, [farmerEmail]);

  useEffect(() => {
    if (!ordersLoaded || !getAuthToken()) return;
    const timeout = window.setTimeout(() => {
      void saveAccountData<FarmerEquipmentOrderSnapshot>('farmer-agri-orders', { orders: equipmentOrders })
        .catch((error: unknown) => setOrderError(error instanceof Error ? error.message : 'Could not save your equipment request.'));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [equipmentOrders, ordersLoaded]);

  const submitEquipmentRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    const count = Number(quantity);
    if (!selectedTool || !location.trim() || !Number.isInteger(count) || count < 1
      || !selectedTool.sellerEmail
      || (selectedTool.listingType !== 'rental' && count > selectedTool.quantity)) {
      setOrderError('Enter a valid quantity or rental duration and your pickup/farm location.');
      return;
    }
    const order: FarmerEquipmentOrder = {
      id: `AGR-${Date.now().toString().slice(-8)}`,
      product: selectedTool,
      listingType: selectedTool.listingType === 'rental' ? 'rental' : 'sale',
      quantity: count,
      total: selectedTool.price * count,
      location: location.trim(),
      createdAt: new Date().toLocaleString(),
      status: 'Request sent',
    };
    try {
      await recordMarketplaceTransaction({
        id: order.id,
        sellerEmail: selectedTool.sellerEmail,
        buyerName: farmerName,
        buyerEmail: farmerEmail,
        productId: selectedTool.id,
        productName: selectedTool.name,
        transactionType: order.listingType,
        quantity: count,
        unit: selectedTool.unit,
        unitPrice: selectedTool.price,
        total: order.total,
        location: order.location,
        createdAt: new Date().toISOString(),
        status: 'Requested',
      });
      setEquipmentOrders((current) => [order, ...current]);
      setOrderNotice(`${order.listingType === 'rental' ? 'Rental request' : 'Purchase request'} ${order.id} sent.`);
      setSelectedTool(null);
      setOrderError('');
    } catch (error: unknown) {
      setOrderError(error instanceof Error ? error.message : 'Could not send the seller request.');
    }
  };

  const transactionStatusById = new Map(buyerTransactions.map(({ id, status }) => [id, status]));

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">AgriBusiness Supplier Hub</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              AgriBusiness Connect
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Procure certified seeds, organic fertilizers, machinery, and irrigation tools directly from registered merchants
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D2F442]/50 text-slate-900 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <Tag className="w-4 h-4" />
          <span>Registered merchant listings</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tractor className="h-5 w-5 text-emerald-700" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Agri-tools &amp; Equipment Marketplace</h2>
            <p className="mt-1 text-xs text-slate-500">Purchase tools or request equipment rental from registered AgriBusiness sellers.</p>
          </div>
        </div>
        {orderError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{orderError}</p>}
        {orderNotice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{orderNotice}</p>}
        {tools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center text-sm text-slate-500">
            No AgriBusiness listings are available yet. New seller products will appear here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <article key={tool.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <img src={tool.image} alt={tool.name} className="h-44 w-full bg-slate-100 object-cover" />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-[10px] font-bold uppercase text-emerald-700">{tool.category}</p><h3 className="mt-1 font-bold text-slate-900">{tool.name}</h3></div>
                    <span className="rounded-full bg-[#F3F7E5] px-2.5 py-1 text-[10px] font-bold">{tool.listingType === 'rental' ? 'For rent' : 'For sale'}</span>
                  </div>
                  <p className="text-sm leading-5 text-slate-600">{tool.description}</p>
                  <p className="text-sm font-bold text-slate-900">₹{tool.price} / {tool.unit}</p>
                  <p className="text-xs text-slate-500">Seller: {tool.sellerName || 'AgriBusiness'}</p>
                  {tool.sellerLocation && <p className="text-xs text-slate-500">Location: {tool.sellerLocation}</p>}
                  <button type="button" onClick={() => { setSelectedTool(tool); setQuantity('1'); setOrderError(''); }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D2F442] px-3 py-2.5 text-xs font-bold text-slate-950 hover:bg-[#c6ec32]">
                    <ShoppingCart className="h-3.5 w-3.5" />{tool.listingType === 'rental' ? 'Request rental' : 'Purchase'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {equipmentOrders.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 font-bold text-slate-900">My AgriBusiness orders &amp; rental requests</h3>
            <div className="space-y-2">
              {equipmentOrders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <span><strong>{order.product.name}</strong> · {order.product.sellerName || 'AgriBusiness'} · {order.listingType === 'rental' ? `${order.quantity} ${order.product.unit}(s)` : `${order.quantity} item(s)`} · ₹{order.total}</span>
                  <span className="text-slate-500">{TRANSACTION_STATUS_LABELS[transactionStatusById.get(order.id) || 'Requested']} · {order.id}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={submitEquipmentRequest} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-bold uppercase text-emerald-700">{selectedTool.listingType === 'rental' ? 'Equipment rental' : 'Purchase request'}</p><h3 className="mt-1 text-xl font-black">{selectedTool.name}</h3></div>
              <button type="button" onClick={() => setSelectedTool(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <label className="block text-xs font-semibold">{selectedTool.listingType === 'rental' ? `Rental duration (${selectedTool.unit})` : `Quantity (${selectedTool.unit})`}
              <input required type="number" min="1" max={selectedTool.listingType === 'rental' ? undefined : selectedTool.quantity} value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block text-xs font-semibold">Farm / pickup location
              <textarea required rows={2} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Village, district, state" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </label>
            {orderError && <p role="alert" className="text-xs text-rose-700">{orderError}</p>}
            <p className="text-sm">Estimated total: <strong>₹{selectedTool.price * (Number(quantity) || 0)}</strong></p>
            <button type="submit" className="w-full rounded-xl bg-[#D2F442] px-4 py-3 text-sm font-bold">Send request</button>
            <p className="text-center text-[11px] text-slate-400">Your request will be sent to the seller. No payment is collected here.</p>
          </form>
        </div>
      )}
    </div>
  );
};
