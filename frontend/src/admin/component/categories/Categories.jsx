// Frontend/src/admin/component/categories/Categories.jsx
import React, { useEffect, useState, useCallback } from "react";
import { categoryAPI } from "../../../../src/services/api";
import Icon from "../../../../src/user/components/ui/AppIcon";

const BLUE = "#1C4D8D";
const BORDER = "#E8ECF2";
const SURFACE = "#F7F8FA";

// Preset icon names from Heroicons v2 for easier selection
const PRESET_ICONS = [
  { name: "TagIcon", label: "Retail / General" },
  { name: "CakeIcon", label: "Food & Beverage" },
  { name: "SparklesIcon", label: "Beauty & Spa" },
  { name: "BriefcaseIcon", label: "B2B / Professional" },
  { name: "HeartIcon", label: "Health & Fitness" },
  { name: "HomeIcon", label: "Home & Garden" },
  { name: "ShoppingBagIcon", label: "Fashion / Clothing" },
  { name: "WrenchScrewdriverIcon", label: "Construction & Services" },
  { name: "ComputerDesktopIcon", label: "Electronics & Office" },
  { name: "FaceSmileIcon", label: "Kids & Family" },
  { name: "TruckIcon", label: "Automotive & Marine" },
  { name: "GlobeAltIcon", label: "Travel & Leisure" },
  { name: "GiftIcon", label: "Gifts & Hobbies" },
  { name: "BookOpenIcon", label: "Education & Classes" },
  { name: "CameraIcon", label: "Arts & Photo" },
  { name: "UserIcon", label: "Personal Services" },
];

const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => (
  <div
    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl animate-fade-up"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 bg-red-100 text-red-600">
        ⚠️
      </div>
      <p className="text-center text-sm text-slate-600 mb-6 font-semibold leading-relaxed">
        {message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          Delete
        </button>
      </div>
    </div>
  </div>
);

const CategoryModal = ({ category, onSave, onClose, saving }) => {
  const [name, setName] = useState(category ? category.name : "");
  const [description, setDescription] = useState(category ? category.description || "" : "");
  const [imageUrl, setImageUrl] = useState(category ? category.imageUrl || "" : "");
  const [icon, setIcon] = useState(category ? category.icon || "TagIcon" : "TagIcon");
  const [showCustomIcon, setShowCustomIcon] = useState(false);
  const [customIconText, setCustomIconText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      icon: showCustomIcon ? customIconText.trim() : icon,
    });
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors font-medium";
  const labelCls =
    "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h3
              className="font-bold text-slate-900 text-lg md:text-xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {category ? "Edit Category" : "Create New Category"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Configure business classification parameters
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-5">
          <div>
            <label className={labelCls}>Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dining, Wellness, Automotive"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary describing the category..."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          <div>
            <label className={labelCls}>Cover Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={inputCls}
            />
            {imageUrl.trim() && (
              <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-100 h-28 relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Category Icon</label>
              <button
                type="button"
                onClick={() => setShowCustomIcon(!showCustomIcon)}
                className="text-[11px] font-bold text-[#1C4D8D] hover:underline"
              >
                {showCustomIcon ? "Select Preset Icon" : "Use Custom Icon Name"}
              </button>
            </div>

            {showCustomIcon ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Heroicon Name (e.g. ShieldCheckIcon)"
                  value={customIconText}
                  onChange={(e) => setCustomIconText(e.target.value)}
                  className={inputCls}
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Input any valid CamelCase outline icon name from Heroicons v2 library.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {PRESET_ICONS.map((preset) => {
                  const isSelected = icon === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setIcon(preset.name)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#1C4D8D] shadow-sm text-[#1C4D8D]"
                          : "border-transparent hover:bg-white hover:border-slate-200 text-slate-500"
                      }`}
                    >
                      <Icon
                        name={preset.name}
                        size={18}
                        className={isSelected ? "text-[#1C4D8D]" : "text-slate-400 group-hover:text-slate-600"}
                      />
                      <span className="text-[9px] font-bold truncate w-full">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex gap-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Saving..." : category ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Modals
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await categoryAPI.getAll();
      setCategories(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleSaveCategory = async (formData) => {
    setSaving(true);
    try {
      if (selectedCategory) {
        await categoryAPI.update(selectedCategory.id, formData);
        showToast("success", "Category updated successfully");
      } else {
        await categoryAPI.create(formData);
        showToast("success", "New category created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      showToast("error", err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryAPI.delete(deleteTarget.id);
      showToast("success", "Category deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast("error", err.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-2.5 animate-slide-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-600"
          }`}
        >
          {toast.type === "success" ? "✓" : "⚠️"} {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete the category "${deleteTarget.name}"? If there are businesses or offers tied to this category, the deletion will be rejected for database integrity.`}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <CategoryModal
          category={selectedCategory}
          saving={saving}
          onSave={handleSaveCategory}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-xl md:text-2xl font-bold text-slate-900"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.02em",
            }}
          >
            Business Categories
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Manage categorization settings, branding details, and display parameters
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-5 py-2.5 rounded-xl bg-[#1C4D8D] text-white text-xs md:text-sm font-bold hover:bg-[#163d71] transition-all transform hover:-translate-y-0.5 shadow-sm shadow-[#1C4D8D]/15 self-start sm:self-center cursor-pointer"
        >
          + Add New Category
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="mb-6 flex gap-3 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] focus:ring-1 focus:ring-[#1C4D8D] transition-all font-medium"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-semibold flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-64 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-8 bg-slate-100 rounded w-1/2 mt-4" />
              </div>
              <div className="h-10 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-2xl text-slate-400">
            📁
          </div>
          <h3 className="font-bold text-slate-700 text-base mb-1">No Categories Found</h3>
          <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto font-medium">
            {search ? "No categories match your search parameters." : "Add a category to help organize registered businesses."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            return (
              <div
                key={cat.id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md flex flex-col justify-between overflow-hidden relative group"
              >
                {/* Visual Header Image */}
                <div className="h-28 w-full bg-slate-100 relative overflow-hidden">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1C4D8D]/5 to-[#1C4D8D]/15" />
                  )}
                  {/* Floating Icon Badge */}
                  <div className="absolute bottom-3 left-4 w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center border border-slate-100">
                    <Icon name={cat.icon || "TagIcon"} size={20} className="text-[#1C4D8D]" />
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 pt-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3
                        className="font-bold text-slate-900 text-lg leading-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {cat.name}
                      </h3>
                      {cat.isSeeded && (
                        <span className="text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          System
                        </span>
                      )}
                    </div>

                    <p className="text-slate-400 text-[10px] font-semibold tracking-wider font-mono mb-3">
                      slug: {cat.slug}
                    </p>

                    <p className="text-slate-500 text-xs leading-relaxed mb-5 font-medium line-clamp-3">
                      {cat.description || "No description provided."}
                    </p>
                  </div>

                  {/* Counters Stats */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-50">
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100/50">
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                        Businesses
                      </p>
                      <p className="text-slate-800 font-extrabold text-base mt-0.5">
                        {cat.businessCount || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100/50">
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                        Live Deals
                      </p>
                      <p className="text-slate-800 font-extrabold text-base mt-0.5">
                        {cat.dealCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(cat)}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;
