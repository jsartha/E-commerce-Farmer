import React, { useState, useRef } from 'react';
import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  Sprout,
  Pencil,
  Check,
  Star,
  ShieldCheck,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { FarmerProfile } from '../../types/dashboard';

interface MyProfileSectionProps {
  profile: FarmerProfile;
  onUpdateProfile: (updated: FarmerProfile) => void;
}

export const MyProfileSection: React.FC<MyProfileSectionProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<FarmerProfile>(profile);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [cropInput, setCropInput] = useState<string>('');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditForm((prev) => ({ ...prev, avatar: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditing(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const addCrop = () => {
    if (cropInput.trim() && !editForm.crops.includes(cropInput.trim())) {
      setEditForm({ ...editForm, crops: [...editForm.crops, cropInput.trim()] });
      setCropInput('');
    }
  };

  const removeCrop = (cropToRemove: string) => {
    setEditForm({
      ...editForm,
      crops: editForm.crops.filter((c) => c !== cropToRemove),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-[#D2F442] text-slate-950 flex items-center justify-center font-bold">
            ✓
          </div>
          <span>Farmer profile updated successfully!</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-white rounded-[32px] border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white shadow-md"
                />
              ) : (
                <UserCircle2 className="h-20 w-20 text-slate-300 sm:h-24 sm:w-24" aria-label={profile.name} />
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-[#D2F442] text-slate-950 p-1.5 rounded-full ring-2 ring-white shadow-xs"
                title="Change profile photo"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                {profile.sellerRating > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D2F442]/50 text-slate-900 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-slate-900" />
                    <span>{profile.sellerRating} Rating</span>
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-600 mt-1">{profile.farmName}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {[profile.village, profile.district, profile.state].filter(Boolean).join(', ') || 'Add farm location'}
                </span>
                {profile.joinedDate && (
                  <>
                    <span>·</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member since {profile.joinedDate}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditForm(profile);
              setIsEditing(true);
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Card 1: Contact Details */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase text-slate-500">
              Contact Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-mono font-medium">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>
                  {profile.village}, Dist. {profile.district}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Farm Specifics */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase text-slate-500">
              Farm & Land Details
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Farm Name:</span>
                <span className="font-semibold text-slate-900">{profile.farmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Land Holding:</span>
                <span className="font-semibold text-slate-900">{profile.farmSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Soil Condition:</span>
                <span className="font-semibold text-emerald-700">Certified Organic Soil</span>
              </div>
            </div>
          </div>

          {/* Card 3: Crops Cultivated */}
          <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase text-slate-500">
              Cultivated Crops
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.crops.map((crop) => (
                <span
                  key={crop}
                  className="px-2.5 py-1 bg-[#D2F442]/40 text-slate-900 font-semibold text-xs rounded-xl flex items-center gap-1"
                >
                  <Sprout className="w-3 h-3 text-slate-800" />
                  <span>{crop}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#D2F442] flex items-center justify-center text-slate-950">
                <UserCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Farmer Profile</h3>
                <p className="text-xs text-slate-400">Update your public seller information</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Farmer Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Farm Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.farmName}
                    onChange={(e) => setEditForm({ ...editForm, farmName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Land Size</label>
                  <input
                    type="text"
                    required
                    value={editForm.farmSize}
                    onChange={(e) => setEditForm({ ...editForm, farmSize: e.target.value })}
                    placeholder="e.g. 8.5 Acres"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={editForm.village}
                    onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Crops tag manager */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Crops Cultivated</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cropInput}
                    onChange={(e) => setCropInput(e.target.value)}
                    placeholder="Add a crop (e.g. Mustard, Cotton)"
                    className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={addCrop}
                    className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl cursor-pointer hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAFAFA] border border-slate-200 rounded-xl">
                  {editForm.crops.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-900 font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => removeCrop(c)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#D2F442] hover:bg-[#c6ec32] text-slate-950 font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
