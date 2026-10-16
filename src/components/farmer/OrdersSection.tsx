import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Truck, Clock, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import { Order, OrderStatus } from '../../types/dashboard';

interface OrdersSectionProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Dispatched', 'Delivered'];

  const filteredOrders =
    statusFilter === 'All'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Customer Orders</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {orders.length} Bookings
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time direct farm-to-table consumer and commercial orders
          </p>
        </div>

        <div className="p-3 bg-[#F8F9F5] border border-slate-200/60 rounded-2xl flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Total Booked Volume</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              ₹{totalSales.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count =
            tab === 'All'
              ? orders.length
              : orders.filter((o) => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-slate-200/80 shadow-xs space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Orders in this category</h3>
            <p className="text-xs text-slate-400">All orders have been updated or completed.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isExpanded = selectedOrderId === ord.id;
            return (
              <div
                key={ord.id}
                className="bg-white rounded-[24px] border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Main Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-slate-900">
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
                        <span className="text-[11px] text-slate-400">· {ord.orderDate}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {ord.productName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Quantity Ordered:{' '}
                        <strong className="text-slate-800">
                          {ord.quantity} {ord.unit}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Price & Status Changer */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-lg font-extrabold text-slate-900 font-mono">
                        ₹{ord.totalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium block">
                        Direct Account Transfer
                      </span>
                    </div>

                    {/* Status Update Quick Dropdown */}
                    <div className="flex items-center gap-2">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1 text-xs font-semibold bg-[#F5F6F3] border border-slate-200 rounded-xl text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Buyer & Delivery Details Accordion */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 gap-2 bg-[#FAFAFA] p-3 rounded-xl">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-semibold text-slate-900">{ord.customerName}</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5" />
                      {ord.customerPhone}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {ord.deliveryAddress}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700">
                    Fulfillment Ready
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
