import React, { useState } from 'react';
import { Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types/auth';

interface UserRegisterFormProps {
  onBack: () => void;
  onSubmitSuccess: (userData: Partial<UserAccount>) => void;
}

export const UserRegisterForm: React.FC<UserRegisterFormProps> = ({
  onBack,
  onSubmitSuccess,
}) => {
  const [firstName, setFirstName] = useState<string>('Sarthak');
  const [lastName, setLastName] = useState<string>('Sharma');
  const [email, setEmail] = useState<string>('jsarthak168@gmail.com');
  const [birthDate, setBirthDate] = useState<string>('2000-06-15');
  const [password, setPassword] = useState<string>('SecureKey99#');
  const [confirmPassword, setConfirmPassword] = useState<string>('SecureKey99#');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validate = () => {
    if (!firstName.trim()) {
      return 'First Name is required.';
    }
    if (!lastName.trim()) {
      return 'Last Name is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!birthDate) {
      return 'Date of Birth is required.';
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
        birthDate,
        accountType: 'user',
        provider: 'email',
      });
    }, 450);
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1 -ml-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Change Account Type</span>
        </button>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          User (Customer)
        </span>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          User Registration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Create your customer account to start purchasing
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
              placeholder="e.g. Sarthak"
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
              placeholder="e.g. Sharma"
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jsarthak168@gmail.com"
            className="w-full px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
          />
        </div>

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
            Password *
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer select-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-slate-800" /> : <Eye className="w-4 h-4" />}
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
              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer select-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-800" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#D2F442] hover:bg-[#c6ec32] active:scale-[0.99] text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center mt-3 disabled:opacity-60"
        >
          {isSubmitting ? 'Validating...' : 'Continue to Verification'}
        </button>
      </form>
    </div>
  );
};
