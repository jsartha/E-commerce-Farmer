import React, { useState } from 'react';
import { Eye, EyeOff, ChevronLeft, AlertCircle, Wrench, Check } from 'lucide-react';
import { UserAccount } from '../types/auth';

interface AgriToolsRegisterFormProps {
  onBack: () => void;
  onSubmitSuccess: (userData: Partial<UserAccount>) => void;
}

const CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Farming Equipment',
  'Irrigation',
  'Pesticides',
  'Other Agricultural Products',
];

const STATES_LIST = [
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Maharashtra',
  'Gujarat',
  'Madhya Pradesh',
  'Rajasthan',
  'Karnataka',
  'Andhra Pradesh',
  'Bihar',
  'Tamil Nadu',
  'West Bengal',
];

export const AgriToolsRegisterForm: React.FC<AgriToolsRegisterFormProps> = ({
  onBack,
  onSubmitSuccess,
}) => {
  const [ownerFirstName, setOwnerFirstName] = useState<string>('Vikram');
  const [ownerLastName, setOwnerLastName] = useState<string>('Singh');
  const [businessName, setBusinessName] = useState<string>('Kisan Agro Equipment & Seeds');
  const [email, setEmail] = useState<string>('contact@kisanagro.com');
  const [phone, setPhone] = useState<string>('9812345678');
  const [businessAddress, setBusinessAddress] = useState<string>('Shop 14, Main Mandi Road, Sector 3');
  const [state, setState] = useState<string>('Haryana');
  const [district, setDistrict] = useState<string>('Karnal');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Seeds',
    'Farming Equipment',
    'Irrigation',
  ]);
  const [password, setPassword] = useState<string>('AgriSeller2026#');
  const [confirmPassword, setConfirmPassword] = useState<string>('AgriSeller2026#');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const validate = () => {
    if (!ownerFirstName.trim() || !ownerLastName.trim()) {
      return "Owner's first and last name are required.";
    }
    if (!businessName.trim()) {
      return 'Business or Shop name is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid business email address.';
    }
    const phoneClean = phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return 'Please enter a valid 10-digit mobile number.';
    }
    if (!businessAddress.trim()) {
      return 'Business address is required.';
    }
    if (!district.trim()) {
      return 'District is required.';
    }
    if (selectedCategories.length === 0) {
      return 'Please select at least one agricultural product category.';
    }
    if (password.length < 8) {
      return 'Password must contain at least 8 characters.';
    }
    if (password !== confirmPassword) {
      return 'Confirm Password does not match Password.';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const error = validate();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess({
        name: `${ownerFirstName.trim()} ${ownerLastName.trim()}`,
        businessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        businessAddress: businessAddress.trim(),
        state,
        district: district.trim(),
        productCategories: selectedCategories,
        accountType: 'agri-business',
        provider: 'email',
      });
    }, 450);
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1 -ml-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Change Account Type</span>
        </button>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1">
          <Wrench className="w-3 h-3" />
          AgriBusiness
        </span>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          AgriBusiness Registration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Register your agricultural supplies, products, and equipment store
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Owner Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Owner's First Name *
            </label>
            <input
              type="text"
              required
              value={ownerFirstName}
              onChange={(e) => setOwnerFirstName(e.target.value)}
              placeholder="Vikram"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Owner's Last Name *
            </label>
            <input
              type="text"
              required
              value={ownerLastName}
              onChange={(e) => setOwnerLastName(e.target.value)}
              placeholder="Singh"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Business or Shop Name *
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Kisan Agro Equipment & Seeds"
            className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@kisanagro.com"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9812345678"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        {/* Business Address */}
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Business / Shop Address *
          </label>
          <input
            type="text"
            required
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            placeholder="Shop 14, Main Mandi Road, Sector 3"
            className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>

        {/* State & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              State *
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            >
              {STATES_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              District *
            </label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Karnal"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Product Categories (Multi-select) */}
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
            Product Categories (Select all that you sell) *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-[#FAFAFA] border border-slate-200 rounded-2xl">
            {CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-white border border-slate-900 shadow-xs text-slate-950 font-semibold'
                      : 'bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-[#D2F442] border-[#D2F442]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                  </div>
                  <span className="text-[11px] truncate">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars"
                className="w-full pl-3 pr-8 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer select-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5 text-slate-800" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-3 pr-8 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer select-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-slate-800" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#D2F442] hover:bg-[#c6ec32] active:scale-[0.99] text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center mt-3 disabled:opacity-60"
        >
          {isSubmitting ? 'Validating...' : 'Register AgriBusiness'}
        </button>
      </form>
    </div>
  );
};
