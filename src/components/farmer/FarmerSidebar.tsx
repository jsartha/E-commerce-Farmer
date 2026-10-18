import React from 'react';
import {
  LayoutDashboard,
  UserCircle2,
  Package,
  PlusCircle,
  ListFilter,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  X,
  Sprout,
  Star,
} from 'lucide-react';
import { DashboardSection, FarmerProfile } from '../../types/dashboard';

interface FarmerSidebarProps {
  role?: 'Farmer' | 'AgriBusiness';
  currentSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  profile: FarmerProfile;
  ordersCount: number;
  productsCount: number;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const FarmerSidebar: React.FC<FarmerSidebarProps> = ({
  role = 'Farmer',
  currentSection,
  onSelectSection,
  profile,
  ordersCount,
  productsCount,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const farmerNavItems: Array<{
    id: DashboardSection;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: 'overview',
      label: 'Sales Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: <UserCircle2 className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'My Products',
      icon: <Package className="w-4 h-4" />,
      badge: productsCount,
    },
    {
      id: 'add-product',
      label: 'Add Product',
      icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'listings',
      label: 'My Listings',
      icon: <ListFilter className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: ordersCount,
    },
    {
      id: 'marketplace-connect',
      label: 'Customer Inquiries',
      icon: <Users className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'agribusiness-connect',
      label: 'AgriBusiness Hub',
      icon: <Store className="w-4 h-4 text-amber-600" />,
    },
  ];
  const agriBusinessNavItems: typeof farmerNavItems = [
    {
      id: 'overview',
      label: 'Sales Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'Business Profile',
      icon: <UserCircle2 className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'My Products',
      icon: <Package className="w-4 h-4" />,
      badge: productsCount,
    },
    {
      id: 'add-product',
      label: 'Add Product',
      icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'listings',
      label: 'My Listings',
      icon: <ListFilter className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Farmer & User Requests',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: ordersCount,
    },
  ];
  const navItems = role === 'Farmer' ? farmerNavItems : agriBusinessNavItems;
  const workspaceName = role === 'Farmer' ? 'Farmer Hub' : 'AgriBusiness Hub';
  const workspaceSubtitle = role === 'Farmer' ? 'Farmer workspace' : 'Business workspace';

  const handleNavClick = (section: DashboardSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#f7f8fa] border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand & Mobile Close */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  {workspaceName}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">{workspaceSubtitle}</p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mini seller profile badge */}
          <div className="p-3 mx-3 my-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <UserCircle2 className="h-11 w-11 text-slate-400" aria-label={profile.name} />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-slate-900 truncate">{profile.name}</h3>
              <p className="text-[11px] text-slate-500 truncate">{profile.farmName}</p>
              {profile.sellerRating > 0 && (
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-amber-600 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{profile.sellerRating}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label={`${role} dashboard`} className="flex-1 px-3 py-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out to Login</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
