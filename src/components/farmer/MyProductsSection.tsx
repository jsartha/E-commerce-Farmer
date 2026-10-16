import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Star, AlertCircle, Package } from 'lucide-react';
import { Product } from '../../types/dashboard';

interface MyProductsSectionProps {
  products: Product[];
  onOpenAddModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const MyProductsSection: React.FC<MyProductsSectionProps> = ({
  products,
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Pulses'];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">My Farm Products</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D2F442] text-slate-950">
              {products.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Flipkart-style seller catalog with real-time stock & price control
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid (Flipkart Seller Card Style) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Products in this Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't listed any crops under {selectedCategory} yet. Click below to add your first harvest.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-2 px-4 py-2 bg-[#D2F442] text-slate-950 font-bold text-xs rounded-xl shadow-xs"
          >
            Add Product Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-[28px] border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-900 shadow-xs">
                    {prod.category}
                  </div>

                  {/* Stock Status Badge */}
                  <div
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs ${
                      prod.status === 'In Stock'
                        ? 'bg-emerald-500 text-white'
                        : prod.status === 'Low Stock'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {prod.status}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Price & Sold Stats */}
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400">Price: </span>
                      <span className="text-xl font-extrabold text-slate-900 font-mono">
                        ₹{prod.price}
                      </span>
                      <span className="text-xs text-slate-500"> / {prod.unit}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{prod.rating}</span>
                      <span className="text-slate-400 font-normal">({prod.soldCount} sold)</span>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Available Inventory:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {prod.quantity} {prod.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Flipkart Seller Hub Actions) */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEditProduct(prod)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteProduct(prod)}
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Delete product listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
