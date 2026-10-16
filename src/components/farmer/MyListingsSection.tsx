import React, { useState } from 'react';
import { Search, Filter, Pencil, Trash2, Plus, ArrowUpDown, Package, Eye } from 'lucide-react';
import { Product } from '../../types/dashboard';

interface MyListingsSectionProps {
  products: Product[];
  onOpenAddModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const MyListingsSection: React.FC<MyListingsSectionProps> = ({
  products,
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity'>('name');

  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchStat = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchCat && matchStat;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Controls Header */}
      <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage Farm Listings</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Search, filter, edit, or delete inventory visible to retail and wholesale buyers
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Listing</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by product name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
            >
              <option value="All">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains">Grains</option>
              <option value="Spices">Spices</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Table View */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9F5] border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Product Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price / Unit</th>
                <th className="py-3.5 px-4">Available Qty</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No listings found matching your search and filter criteria.</span>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAFAFA] transition-colors">
                    {/* Item */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                            {prod.name}
                          </p>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ID: {prod.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[11px]">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        ₹{prod.price}
                      </span>
                      <span className="text-slate-400 text-[11px]"> / {prod.unit}</span>
                    </td>

                    {/* Available Qty */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {prod.quantity} {prod.unit}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          prod.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditProduct(prod)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Listing"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(prod)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-[#F8F9F5] border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filtered.length}</strong> of{' '}
            <strong className="text-slate-900">{products.length}</strong> listings
          </span>
          <span className="font-medium text-emerald-700">All prices in Indian Rupees (INR)</span>
        </div>
      </div>
    </div>
  );
};
