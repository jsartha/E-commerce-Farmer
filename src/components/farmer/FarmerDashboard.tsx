import React, { useEffect, useState } from 'react';
import { DashboardSection, Product, Order, ActivityLog, FarmerProfile, OrderStatus } from '../../types/dashboard';
import {
  INITIAL_FARMER_PROFILE,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ACTIVITIES,
} from '../../data/mockFarmerData';
import { FarmerSidebar } from './FarmerSidebar';
import { FarmerHeader } from './FarmerHeader';
import { DashboardOverview } from './DashboardOverview';
import { MyProfileSection } from './MyProfileSection';
import { MyProductsSection } from './MyProductsSection';
import { MyListingsSection } from './MyListingsSection';
import { OrdersSection } from './OrdersSection';
import { SalesOverviewSection } from './SalesOverviewSection';
import { RecentActivitySection } from './RecentActivitySection';
import { MarketplaceConnectSection } from './MarketplaceConnectSection';
import { AgriBusinessConnectSection } from './AgriBusinessConnectSection';
import { ProductFormModal } from './ProductFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { getAuthToken, loadAccountData, saveAccountData } from '../../lib/api';

type FarmerDashboardSnapshot = {
  profile: FarmerProfile;
  products: Product[];
  orders: Order[];
  activities: ActivityLog[];
};

interface FarmerDashboardProps {
  initialFarmer?: Partial<FarmerProfile>;
  onLogout: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  initialFarmer,
  onLogout,
}) => {
  const [currentSection, setCurrentSection] = useState<DashboardSection>('overview');
  const [profile, setProfile] = useState<FarmerProfile>({
    ...INITIAL_FARMER_PROFILE,
    name: initialFarmer?.name || INITIAL_FARMER_PROFILE.name,
    email: initialFarmer?.email || INITIAL_FARMER_PROFILE.email,
    phone: initialFarmer?.phone || INITIAL_FARMER_PROFILE.phone,
    village: initialFarmer?.village || INITIAL_FARMER_PROFILE.village,
    district: initialFarmer?.district || INITIAL_FARMER_PROFILE.district,
    state: initialFarmer?.state || INITIAL_FARMER_PROFILE.state,
    farmName: initialFarmer?.farmName || INITIAL_FARMER_PROFILE.farmName,
    farmSize: initialFarmer?.farmSize || INITIAL_FARMER_PROFILE.farmSize,
    crops: initialFarmer?.crops?.length ? initialFarmer.crops : INITIAL_FARMER_PROFILE.crops,
    avatar: initialFarmer?.avatar || INITIAL_FARMER_PROFILE.avatar,
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [snapshotLoaded, setSnapshotLoaded] = useState(() => !getAuthToken());
  const [persistenceStatus, setPersistenceStatus] = useState<'saving' | 'saved' | 'offline'>(
    () => (getAuthToken() ? 'saving' : 'saved')
  );

  useEffect(() => {
    let active = true;
    if (!getAuthToken()) {
      return;
    }

    void loadAccountData<FarmerDashboardSnapshot>('farmer-dashboard')
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setProfile(data.profile || INITIAL_FARMER_PROFILE);
          setProducts(Array.isArray(data.products) ? data.products : INITIAL_PRODUCTS);
          setOrders(Array.isArray(data.orders) ? data.orders : INITIAL_ORDERS);
          setActivities(Array.isArray(data.activities) ? data.activities : INITIAL_ACTIVITIES);
        }
        setSnapshotLoaded(true);
        setPersistenceStatus('saved');
      })
      .catch(() => {
        if (active) setPersistenceStatus('offline');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!snapshotLoaded || !getAuthToken()) return;
    const timeout = window.setTimeout(() => {
      setPersistenceStatus('saving');
      void saveAccountData<FarmerDashboardSnapshot>('farmer-dashboard', {
        profile,
        products,
        orders,
        activities,
      })
        .then(() => setPersistenceStatus('saved'))
        .catch(() => setPersistenceStatus('offline'));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [snapshotLoaded, profile, products, orders, activities]);

  // Search query in header
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mobile sidebar open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addActivity = (
    type: ActivityLog['type'],
    title: string,
    description: string
  ) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      title,
      description,
      timestamp: 'Just now',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Add or Edit Product Handler
  const handleSaveProduct = (
    productData: Omit<Product, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === existingId ? { ...productData, id: existingId } : p
        )
      );
      addActivity(
        'product_edited',
        `Updated: ${productData.name}`,
        `Price updated to ₹${productData.price}/${productData.unit}, inventory at ${productData.quantity} ${productData.unit}.`
      );
      showToast(`Updated "${productData.name}" successfully!`);
    } else {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now().toString().slice(-4)}`,
      };
      setProducts((prev) => [newProduct, ...prev]);
      addActivity(
        'product_added',
        `Added New Harvest: ${productData.name}`,
        `Listed ${productData.quantity} ${productData.unit} at ₹${productData.price}/${productData.unit}.`
      );
      showToast(`Added "${productData.name}" to your farm listings!`);
    }
  };

  // Delete Product Handler
  const handleConfirmDelete = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addActivity(
        'product_deleted',
        `Deleted Listing: ${target.name}`,
        `Removed listing (${target.quantity} ${target.unit}) from active marketplace.`
      );
      showToast(`Deleted "${target.name}" from your listings.`);
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    const target = orders.find((o) => o.id === orderId);
    addActivity(
      'order_updated',
      `Order ${orderId} Status: ${newStatus}`,
      `Order for ${target?.productName || 'Harvest'} marked as ${newStatus}.`
    );
    showToast(`Order ${orderId} updated to ${newStatus}.`);
  };

  // Profile update
  const handleUpdateProfile = (updatedProfile: FarmerProfile) => {
    setProfile(updatedProfile);
    addActivity(
      'profile_updated',
      'Farmer Profile Updated',
      `Updated farm details for ${updatedProfile.farmName}.`
    );
    showToast('Profile information saved!');
  };

  // Open modals
  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleSelectSection = (section: DashboardSection) => {
    if (section === 'add-product') {
      handleOpenAddModal();
    } else {
      setCurrentSection(section);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEFE9] text-slate-900 font-sans flex antialiased">
      {/* Dynamic Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-fade-in font-sans">
          <div className="w-6 h-6 rounded-full bg-[#D2F442] text-slate-950 flex items-center justify-center font-bold">
            ✓
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Flipkart-Style Seller Sidebar Navigation */}
      <FarmerSidebar
        currentSection={currentSection}
        onSelectSection={handleSelectSection}
        profile={profile}
        ordersCount={orders.length}
        productsCount={products.length}
        onLogout={onLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <FarmerHeader
          profile={profile}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAddProduct={handleOpenAddModal}
          onViewActivity={() => setCurrentSection('activity')}
          activityCount={activities.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {getAuthToken() && persistenceStatus !== 'saved' && (
            <div role="status" className={`mb-4 rounded-xl border px-4 py-3 text-xs font-medium ${persistenceStatus === 'offline' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
              {persistenceStatus === 'offline'
                ? 'Could not save dashboard data in this browser. Your current screen data is unchanged; try again after freeing local storage space.'
                : 'Syncing your dashboard data…'}
            </div>
          )}
          {currentSection === 'overview' && (
            <DashboardOverview
              profile={profile}
              products={products}
              orders={orders}
              activities={activities}
              onNavigate={setCurrentSection}
              onOpenAddProduct={handleOpenAddModal}
            />
          )}

          {currentSection === 'profile' && (
            <MyProfileSection
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentSection === 'products' && (
            <MyProductsSection
              products={products}
              onOpenAddModal={handleOpenAddModal}
              onEditProduct={handleOpenEditModal}
              onDeleteProduct={handleOpenDeleteModal}
            />
          )}

          {currentSection === 'listings' && (
            <MyListingsSection
              products={products}
              onOpenAddModal={handleOpenAddModal}
              onEditProduct={handleOpenEditModal}
              onDeleteProduct={handleOpenDeleteModal}
            />
          )}

          {currentSection === 'orders' && (
            <OrdersSection
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {currentSection === 'sales' && (
            <SalesOverviewSection orders={orders} products={products} />
          )}

          {currentSection === 'activity' && (
            <RecentActivitySection activities={activities} />
          )}

          {currentSection === 'marketplace-connect' && (
            <MarketplaceConnectSection />
          )}

          {currentSection === 'agribusiness-connect' && (
            <AgriBusinessConnectSection />
          )}

        </main>
      </div>

      {/* Add / Edit Product Modal Form */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        productToEdit={productToEdit}
        onClose={() => setIsProductModalOpen(false)}
        onSaveProduct={handleSaveProduct}
      />

      {/* Delete Product Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={productToDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
