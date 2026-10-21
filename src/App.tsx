import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Check, LogOut, CheckCircle2, Sprout, Wrench, User } from 'lucide-react';
import { AuthTab, AccountType, UserAccount } from './types/auth';
import { GoogleModal } from './components/GoogleModal';
import { PasswordResetModal } from './components/PasswordResetModal';
import { AccountTypeSelector } from './components/AccountTypeSelector';
import { UserRegisterForm } from './components/UserRegisterForm';
import { FarmerRegisterForm } from './components/FarmerRegisterForm';
import { AgriToolsRegisterForm } from './components/AgriToolsRegisterForm';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { AgriBusinessDashboard } from './components/AgriBusinessDashboard';
import { CustomerMarketplacePage } from './components/CustomerMarketplacePage';
import { clearAuthToken, clearLegacyDemoData, getAuthToken, loadCurrentAccount, loginAccount, migrateLegacyAccountData, registerAccount, requestPasswordReset, resetAccountPassword, saveAuthToken, updateAccountProfile } from './lib/api';
import { useLanguage } from './lib/i18n';

export default function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);

  // Login form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  const [googleModalOpen, setGoogleModalOpen] = useState<boolean>(false);
  const [passwordResetModalOpen, setPasswordResetModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      clearLegacyDemoData();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Could not remove legacy demo data.');
      return;
    }
    if (!getAuthToken()) return;
    let active = true;
    void loadCurrentAccount()
      .then(({ user }) => {
        if (active) setCurrentUser(user);
      })
      .catch(() => {
        if (active) clearAuthToken();
      });
    return () => {
      active = false;
    };
  }, []);

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && currentUser) {
        const updatedUser = { ...currentUser, avatar: reader.result };
        setCurrentUser(updatedUser);
        void updateAccountProfile({ avatar: reader.result }).then(({ user }) => setCurrentUser(user));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginNotice(null);
    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await loginAccount(normalizedEmail, password);
      saveAuthToken(response.token, response.user, response.sessionToken);
      await migrateLegacyAccountData();
      setCurrentUser(response.user);
    } catch (error) {
      clearAuthToken();
      setLoginError(error instanceof Error ? error.message : 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrationFormSubmit = async (userData: Partial<UserAccount>, passwordValue?: string) => {
    const newUserData: Partial<UserAccount> = {
      name: userData.name || 'User',
      email: userData.email || email,
      accountType: userData.accountType || selectedAccountType || 'user',
      provider: 'email',
      phone: userData.phone,
      birthDate: userData.birthDate,
      state: userData.state,
      district: userData.district,
      village: userData.village,
      farmSize: userData.farmSize,
      crops: userData.crops,
      businessName: userData.businessName,
      businessAddress: userData.businessAddress,
      productCategories: userData.productCategories,
    };

    const normalizedEmail = newUserData.email?.trim().toLowerCase();
    if (!normalizedEmail) throw new Error('A valid email address is required.');
    if (!passwordValue) throw new Error('Password is required.');
    const registration: UserAccount = {
      ...newUserData,
      name: newUserData.name || 'User',
      email: normalizedEmail,
      provider: 'email',
      accountType: newUserData.accountType || selectedAccountType || 'user',
    };
    const response = await registerAccount(registration, passwordValue);
    saveAuthToken(response.token, response.user, response.sessionToken);
    await migrateLegacyAccountData();
    setCurrentUser(response.user);
    setSelectedAccountType(null);
    return true;
  };

  const handlePasswordResetComplete = () => {
    setPassword('');
    setLoginError(null);
    setLoginNotice('Your password has been updated. Sign in with your new password.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearAuthToken();
    setSelectedAccountType(null);
    setActiveTab('login');
  };

  const handleTabSwitch = (tab: AuthTab) => {
    setActiveTab(tab);
    if (tab === 'login') {
      setSelectedAccountType(null);
    }
  };

  // Farmer dashboard remains restricted to the farmer account type.
  if (currentUser && currentUser.accountType === 'farmer') {
    return (
      <FarmerDashboard
        initialFarmer={{
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          village: currentUser.village,
          district: currentUser.district,
          state: currentUser.state,
          farmName: currentUser.farmSize ? `${currentUser.name}'s Farm` : '',
          farmSize: currentUser.farmSize || '',
          crops: currentUser.crops || [],
          avatar: currentUser.avatar,
        }}
        onLogout={handleLogout}
      />
    );
  }

  if (currentUser && currentUser.accountType === 'agri-business') {
    return (
      <AgriBusinessDashboard
        user={currentUser}
        onLogout={handleLogout}
        onUpdateUser={setCurrentUser}
      />
    );
  }

  // Customers can browse farmer produce and agricultural tools, including equipment rentals.
  if (currentUser && currentUser.accountType === 'user') {
    return (
      <CustomerMarketplacePage
        user={currentUser}
        onLogout={handleLogout}
        onUpdateUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          void updateAccountProfile(updatedUser).then(({ user }) => setCurrentUser(user));
        }}
      />
    );
  }

  // Determine card container max-width based on view
  const cardMaxWidth =
    currentUser || activeTab === 'login'
      ? 'max-w-[400px]'
      : selectedAccountType
      ? 'max-w-[500px]'
      : 'max-w-[460px]';

  return (
    <div className="min-h-screen bg-[#ECEFE9] text-slate-900 font-sans flex flex-col justify-center items-center py-10 px-4 selection:bg-[#D2F442] selection:text-slate-900">
      {/* Centered Main Card */}
      <div
        className={`w-full ${cardMaxWidth} bg-white rounded-[36px] p-7 sm:p-8 shadow-2xl border border-slate-200/70 text-slate-900 transition-all duration-300`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        {currentUser ? (
          /* Authenticated State */
          <div className="text-center py-4 space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-18 h-18 rounded-full bg-[#D2F442]/30 flex items-center justify-center">
                <div className="w-13 h-13 rounded-full bg-[#D2F442] flex items-center justify-center text-slate-950 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome, {currentUser.name}!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                You are securely logged in as a{' '}
                <span className="font-semibold text-slate-800">
                  {currentUser.accountType === 'farmer'
                    ? 'Farmer'
                    : currentUser.accountType === 'agri-business'
                    ? 'AgriBusiness Owner'
                    : 'Customer'}
                </span>
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="p-4 bg-[#F8F9F6] border border-slate-100 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => profileImageInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D2F442] text-[10px] font-bold text-slate-900 shadow-sm"
                    title="Change profile photo"
                  >
                    +
                  </button>
                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {currentUser.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                      {currentUser.accountType === 'farmer' && <Sprout className="w-3 h-3" />}
                      {currentUser.accountType === 'agri-business' && <Wrench className="w-3 h-3" />}
                      {currentUser.accountType === 'user' && <User className="w-3 h-3" />}
                      <span>
                        {currentUser.accountType === 'farmer'
                          ? 'Farmer'
                          : currentUser.accountType === 'agri-business'
                          ? 'AgriBusiness'
                          : 'Customer'}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Extra details if Farmer */}
              {currentUser.accountType === 'farmer' && (
                <div className="pt-2.5 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-medium text-slate-800">
                      {currentUser.village}, {currentUser.district}, {currentUser.state}
                    </span>
                  </div>
                  {currentUser.farmSize && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Farm Size:</span>
                      <span className="font-medium text-slate-800">{currentUser.farmSize}</span>
                    </div>
                  )}
                  {currentUser.crops && currentUser.crops.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-400 block mb-1">Crops Grown:</span>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.crops.map((c) => (
                          <span
                            key={c}
                            className="bg-[#D2F442]/40 text-slate-900 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Extra details if AgriBusiness */}
              {currentUser.accountType === 'agri-business' && (
                <div className="pt-2.5 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                  {currentUser.businessName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Store / Business:</span>
                      <span className="font-medium text-slate-800">{currentUser.businessName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">
                      {currentUser.district}, {currentUser.state}
                    </span>
                  </div>
                  {currentUser.productCategories && currentUser.productCategories.length > 0 && (
                    <div className="pt-1">
                      <span className="text-slate-400 block mb-1">Product Lines:</span>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.productCategories.map((cat) => (
                          <span
                            key={cat}
                            className="bg-blue-50 text-blue-800 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Main Authentication Container */
          <div>
            {/* Top Segmented Switcher Pill: Preserved Exactly */}
            <div className="bg-[#F5F6F3] p-1 rounded-2xl flex items-center mb-6">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#D2F442] text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-[#D2F442] text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
            </div>
            {/* TAB 1: LOG IN (Exact Same Design & Features Kept Pristine) */}
            {activeTab === 'login' && (
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome Back
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Login to access your account
                  </p>
                </div>

                {/* Google Single Sign-On Button */}
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 rounded-2xl text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-xs mb-5 group"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{t('Continue with Google')}</span>
                </button>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px]">
                    <span className="bg-white px-3 text-slate-400 font-normal">
                      {t('Or continue with email')}
                    </span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                      {loginError}
                    </div>
                  )}
                  {loginNotice && (
                    <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
                      {loginNotice}
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">{t('Email Address')}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Password with working eye toggle */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      {t('Password')}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('Enter your password')}
                        required
                        className="w-full pl-4 pr-11 py-3 text-xs bg-[#FAFAFA] border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono"
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer select-none"
                        aria-label={t(showPassword ? 'Hide password' : 'Show password')}
                        title={t(showPassword ? 'Hide password' : 'Show password')}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-800" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          rememberMe ? 'bg-[#D2F442] border-[#D2F442]' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {rememberMe && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                      </div>
                      <span className="text-xs text-slate-600">{t('Remember me')}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPasswordResetModalOpen(true)}
                      className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      {t('Forgot password?')}
                    </button>
                  </div>

                  {/* Lime Green Log In CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#D2F442] hover:bg-[#c6ec32] active:scale-[0.99] text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center mt-3 disabled:opacity-60"
                  >
                    {isSubmitting ? t('Logging In...') : t('Log In')}
                  </button>
                </form>

                <div className="text-center pt-5 text-xs text-slate-500">
                  <span>{t("Don't have an account?")} </span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('signup')}
                    className="font-bold text-slate-900 hover:underline cursor-pointer"
                  >
                    {t('Sign Up')}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN UP FLOW */}
            {activeTab === 'signup' && (
              <div>
                {/* Step 1: Choose Account Type */}
                {!selectedAccountType && (
                  <AccountTypeSelector
                    selectedType={selectedAccountType}
                    onSelectType={(type) => setSelectedAccountType(type)}
                  />
                )}

                {/* Step 2A: User (Customer) Registration Form */}
                {selectedAccountType === 'user' && (
                  <UserRegisterForm
                    onBack={() => setSelectedAccountType(null)}
                    onSubmitSuccess={handleRegistrationFormSubmit}
                  />
                )}

                {/* Step 2B: Farmer Registration Form */}
                {selectedAccountType === 'farmer' && (
                  <FarmerRegisterForm
                    onBack={() => setSelectedAccountType(null)}
                    onSubmitSuccess={handleRegistrationFormSubmit}
                  />
                )}

                {/* Step 2C: AgriBusiness Registration Form */}
                {selectedAccountType === 'agri-business' && (
                  <AgriToolsRegisterForm
                    onBack={() => setSelectedAccountType(null)}
                    onSubmitSuccess={handleRegistrationFormSubmit}
                  />
                )}

                {/* Bottom link to switch back to login */}
                <div className="text-center pt-4 text-xs text-slate-500">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="font-bold text-slate-900 hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <GoogleModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
      />
      <PasswordResetModal
        isOpen={passwordResetModalOpen}
        initialEmail={email}
        onClose={() => setPasswordResetModalOpen(false)}
        onRequestCode={async (resetEmail) => {
          await requestPasswordReset(resetEmail);
        }}
        onResetPassword={async (resetEmail, code, newPassword) => {
          await resetAccountPassword(resetEmail, code, newPassword);
        }}
        onComplete={handlePasswordResetComplete}
      />
    </div>
  );
}
