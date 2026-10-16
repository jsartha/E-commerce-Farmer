import React, { useState, useEffect } from 'react';
import { X, Package, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types/dashboard';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit: Product | null;
  onClose: () => void;
  onSaveProduct: (product: Omit<Product, 'id'>, id?: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80' },
  { label: 'Onions', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80' },
  { label: 'Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80' },
  { label: 'Mangoes', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80' },
  { label: 'Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80' },
  { label: 'Chillies', url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
  onSaveProduct,
}) => {
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<Product['category']>('Vegetables');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('30');
  const [unit, setUnit] = useState<Product['unit']>('kg');
  const [quantity, setQuantity] = useState<string>('500');
  const [status, setStatus] = useState<Product['status']>('In Stock');
  const [image, setImage] = useState<string>(PRESET_IMAGES[0].url);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price.toString());
      setUnit(productToEdit.unit);
      setQuantity(productToEdit.quantity.toString());
      setStatus(productToEdit.status);
      setImage(productToEdit.image);
    } else {
      setName('');
      setCategory('Vegetables');
      setDescription('');
      setPrice('35');
      setUnit('kg');
      setQuantity('500');
      setStatus('In Stock');
      setImage(PRESET_IMAGES[0].url);
    }
    setErrorMessage(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Please enter a valid price greater than 0.');
      return;
    }
    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty < 0) {
      setErrorMessage('Quantity cannot be negative.');
      return;
    }

    onSaveProduct(
      {
        name: name.trim(),
        category,
        description: description.trim() || `Freshly harvested ${name.trim()} from farm.`,
        price: numPrice,
        unit,
        quantity: numQty,
        status,
        image: image || PRESET_IMAGES[0].url,
        harvestDate: 'Today',
        rating: productToEdit ? productToEdit.rating : 4.8,
        soldCount: productToEdit ? productToEdit.soldCount : 0,
      },
      productToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#D2F442] flex items-center justify-center text-slate-950 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {productToEdit ? 'Edit Product Listing' : 'Add New Harvest Product'}
            </h2>
            <p className="text-xs text-slate-400">
              {productToEdit
                ? 'Update price, stock, and details'
                : 'Publish your farm harvest to the Flipkart-style marketplace'}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Tomatoes"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Spices">Spices</option>
                <option value="Pulses">Pulses</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freshly harvested, naturally grown without chemical pesticides..."
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Price, Unit & Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Per Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Product['unit'])}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="quintal">quintal (100 kg)</option>
                <option value="crate">crate (25 kg)</option>
                <option value="ton">ton (1,000 kg)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Available Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Availability Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['In Stock', 'Low Stock', 'Out of Stock'] as Product['status'][]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    status === st
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-[#FAFAFA] text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Image Presets & Preview */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Product Image Preview & Presets
            </label>
            <div className="flex items-center gap-4 p-3 bg-[#FAFAFA] border border-slate-200 rounded-2xl mb-2">
              <img
                src={image}
                alt="Product Preview"
                className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or enter custom image URL"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-400 mb-1.5"
                />
                <span className="text-[11px] text-slate-400 block">
                  Choose from quick harvest crop presets below:
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    image === preset.url
                      ? 'bg-[#D2F442] text-slate-950 font-bold shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold rounded-2xl cursor-pointer shadow-xs transition-colors"
            >
              {productToEdit ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
