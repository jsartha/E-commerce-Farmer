import React, { useState } from 'react';
import { Eye, EyeOff, ChevronLeft, AlertCircle, Sprout } from 'lucide-react';
import { UserAccount } from '../types/auth';

interface FarmerRegisterFormProps {
  onBack: () => void;
  onSubmitSuccess: (userData: Partial<UserAccount>) => void;
}

const STATES_DATA: Record<string, string[]> = {
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Firozpur'],
  Haryana: ['Karnal', 'Hisar', 'Ambala', 'Sirsa', 'Kurukshetra', 'Rohtak'],
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Kanpur', 'Agra', 'Meerut', 'Prayagraj'],
  Maharashtra: ['Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur'],
  Gujarat: ['Surat', 'Rajkot', 'Ahmedabad', 'Vadodara', 'Junagadh', 'Bhavnagar'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Ujjain', 'Jabalpur', 'Gwalior', 'Dewas'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', 'Sri Ganganagar'],
  Karnataka: ['Mysuru', 'Belagavi', 'Shivamogga', 'Dharwad', 'Ballari', 'Mandya'],
  'Andhra Pradesh': ['Guntur', 'Krishna', 'East Godavari', 'Kurnool', 'Visakhapatnam'],
  Bihar: ['Patna', 'Muzaffarpur', 'Gaya', 'Bhagalpur', 'Purnia', 'Darbhanga'],
};

const COMMON_CROPS = [
  'Wheat',
  'Rice (Paddy)',
  'Cotton',
  'Sugarcane',
  'Maize',
  'Mustard',
  'Soybean',
  'Pulses (Dal)',
  'Vegetables',
  'Fruits',
];

export const FarmerRegisterForm: React.FC<FarmerRegisterFormProps> = ({
  onBack,
  onSubmitSuccess,
}) => {
  const [firstName, setFirstName] = useState<string>('Rajesh');
  const [lastName, setLastName] = useState<string>('Kumar');
  const [email, setEmail] = useState<string>('rajesh.farmer@example.com');
  const [phone, setPhone] = useState<string>('9876543210');
  const [birthDate, setBirthDate] = useState<string>('1988-04-12');
  const [selectedState, setSelectedState] = useState<string>('Punjab');
  const [district, setDistrict] = useState<string>('Ludhiana');
  const [village, setVillage] = useState<string>('Kila Raipur');
  const [farmSize, setFarmSize] = useState<string>('5 - 10 Acres');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Wheat', 'Rice (Paddy)']);
  const [password, setPassword] = useState<string>('KisanPass2026#');
  const [confirmPassword, setConfirmPassword] = useState<string>('KisanPass2026#');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    const districts = STATES_DATA[st] || [];
    setDistrict(districts[0] || '');
  };

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== crop));
      }
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const validate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      return 'First and Last name are required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address for OTP delivery.';
    }
    const phoneClean = phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return 'Please enter a valid 10-digit mobile number.';
    }
    if (!village.trim()) {
      return 'Village name is required.';
    }
    if (selectedCrops.length === 0) {
      return 'Please choose at least one crop grown on your farm.';
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
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        birthDate,
        state: selectedState,
        district,
        village: village.trim(),
        farmSize,
        crops: selectedCrops,
        accountType: 'farmer',
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
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
          <Sprout className="w-3 h-3" />
          Farmer Account
        </span>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Farmer Registration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Join the community of verified farmers & harvest producers
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Rajesh"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Kumar"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Email & Mobile */}
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
              placeholder="farmer@example.com"
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
              placeholder="9876543210"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        {/* Date of Birth & Farm Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Farm Size *
            </label>
            <select
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            >
              <option value="< 2 Acres">&lt; 2 Acres (Marginal)</option>
              <option value="2 - 5 Acres">2 - 5 Acres (Small)</option>
              <option value="5 - 10 Acres">5 - 10 Acres (Medium)</option>
              <option value="10 - 25 Acres">10 - 25 Acres (Large)</option>
              <option value="25+ Acres">25+ Acres (Commercial)</option>
            </select>
          </div>
        </div>

        {/* State & District Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              State *
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            >
              {Object.keys(STATES_DATA).map((st) => (
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
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            >
              {(STATES_DATA[selectedState] || []).map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Village */}
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Village / Tehsil *
          </label>
          <input
            type="text"
            required
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            placeholder="e.g. Kila Raipur"
            className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>

        {/* Main Crops Grown (Selectable Chips) */}
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
            Main Crops Grown (Select all that apply) *
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-[#FAFAFA] border border-slate-200 rounded-2xl">
            {COMMON_CROPS.map((crop) => {
              const active = selectedCrops.includes(crop);
              return (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-xl transition-all cursor-pointer ${
                    active
                      ? 'bg-[#D2F442] text-slate-950 font-semibold shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {crop}
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
          {isSubmitting ? 'Validating...' : 'Register as Farmer'}
        </button>
      </form>
    </div>
  );
};
