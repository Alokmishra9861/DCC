import React, { useState, useEffect } from "react";
import Icon from "../../components/ui/AppIcon";
import { categoryAPI, uploadAPI, businessAPI } from "../../../services/api";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const EditProfileView = ({ businessData, onBack, onSaved }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Basic Information States
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");

  // Location States
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [country, setCountry] = useState("Cayman Islands");

  // Media States
  const [logoUrl, setLogoUrl] = useState("");
  const [coverBannerUrl, setCoverBannerUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [documentUrls, setDocumentUrls] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Opening Hours State
  const defaultHours = [
    { day: "Monday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Tuesday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Wednesday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Thursday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Friday", open: "9:00 AM", close: "11:00 PM", closed: false },
    { day: "Saturday", open: "10:00 AM", close: "11:00 PM", closed: false },
    { day: "Sunday", open: "10:00 AM", close: "9:00 PM", closed: true }
  ];
  const [hours, setHours] = useState(defaultHours);

  // Social Links State
  const [socials, setSocials] = useState([]);

  // Time select options
  const TIME_OPTIONS = [
    "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", 
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", 
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", 
    "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "1:00 AM", "2:00 AM"
  ];

  const DISTRICTS = [
    "George Town", "West Bay", "Bodden Town", "North Side", "East End", "Cayman Brac", "Little Cayman"
  ];

  const CUISINES = [
    "General", "Seafood", "Italian", "Steakhouse", "Fast Food", "Bakery & Cafe", "Asian Fusion", 
    "Caribbean", "American", "Spa & Wellness", "Retail & Shopping", "Home Services"
  ];

  const SOCIAL_PLATFORMS = [
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "youtube", label: "YouTube" }
  ];

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLoadingCats(true);
    categoryAPI.getAll()
      .then(res => {
        setCategories(Array.isArray(res) ? res : res?.data || []);
      })
      .catch(err => console.error("Categories fetch failed:", err))
      .finally(() => setLoadingCats(false));

    const p = businessData?.raw || {};
    setName(p.name || "");
    setCategoryId(p.categoryId || "");
    setCuisineType(p.cuisineType || "General");
    setPhone(p.phone || "");
    setEmail(p.email || "");
    setWebsite(p.website || "");
    setDistrict(p.district || "George Town");
    setDescription(p.description || "");

    setAddressLine1(p.addressLine1 || p.address || "");
    setAddressLine2(p.addressLine2 || "");
    setLandmark(p.landmark || "");
    setCountry(p.country || "Cayman Islands");

    setLogoUrl(p.logoUrl || "");
    setCoverBannerUrl(p.coverBannerUrl || "");
    setGalleryImages(p.imageUrls || []);
    setDocumentUrls(p.documentUrls || []);
    setVideoUrl(p.videoUrl || "");

    if (p.workingHours) {
      try {
        const parsed = JSON.parse(p.workingHours);
        if (Array.isArray(parsed) && parsed.length === 7) {
          setHours(parsed);
        }
      } catch {
        // use default
      }
    }

    if (p.socialLinks) {
      try {
        const parsed = JSON.parse(p.socialLinks);
        if (Array.isArray(parsed)) {
          setSocials(parsed);
        }
      } catch {
        // use default
      }
    }
  }, [businessData]);

  // Image Upload Handlers
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadAPI.image(file);
      setLogoUrl(res.url || res.secure_url);
      showToast("success", "Logo uploaded successfully!");
    } catch (err) {
      showToast("error", "Logo upload failed: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadAPI.image(file);
      setCoverBannerUrl(res.url || res.secure_url);
      showToast("success", "Cover banner uploaded!");
    } catch (err) {
      showToast("error", "Cover upload failed: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryAdd = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (galleryImages.length >= 6) {
      showToast("error", "Maximum of 6 gallery images allowed.");
      return;
    }
    setUploadingGallery(true);
    try {
      const file = files[0];
      const res = await uploadAPI.image(file);
      setGalleryImages(prev => [...prev, res.url || res.secure_url]);
      showToast("success", "Gallery image added!");
    } catch (err) {
      showToast("error", "Gallery upload failed: " + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryRemove = (idx) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx));
    showToast("success", "Image removed from gallery.");
  };

  const handleDocumentAdd = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (documentUrls.length >= 5) {
      showToast("error", "Maximum of 5 documents allowed.");
      return;
    }
    setUploadingDoc(true);
    try {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        showToast("error", "Document size must be under 10MB");
        return;
      }
      const res = await uploadAPI.document(file);
      setDocumentUrls(prev => [...prev, res.url || res.secure_url]);
      showToast("success", "Document added!");
    } catch (err) {
      showToast("error", "Document upload failed: " + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDocumentRemove = (idx) => {
    setDocumentUrls(prev => prev.filter((_, i) => i !== idx));
    showToast("success", "Document removed.");
  };

  // Hour Handlers
  const handleHourToggle = (idx) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, closed: !h.closed } : h));
  };

  const handleHourTimeChange = (idx, field, value) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  // Social Links Handlers
  const addSocialLink = () => {
    setSocials(prev => [...prev, { platform: "facebook", url: "" }]);
  };

  const handleSocialChange = (idx, field, value) => {
    setSocials(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeSocialLink = (idx) => {
    setSocials(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showToast("error", "Business name is required!");
    if (!phone.trim()) return showToast("error", "Phone number is required!");
    if (!email.trim()) return showToast("error", "Email is required!");
    if (!description.trim()) return showToast("error", "Description is required!");
    if (!addressLine1.trim()) return showToast("error", "Address is required!");
    if (!logoUrl) return showToast("error", "Business logo is required!");
    if (!coverBannerUrl) return showToast("error", "Cover banner is required!");

    setSaving(true);
    try {
      const payload = {
        name,
        categoryId,
        cuisineType,
        phone,
        email,
        website,
        district,
        description,
        addressLine1,
        addressLine2,
        landmark,
        country,
        logoUrl,
        coverBannerUrl,
        imageUrls: galleryImages,
        documentUrls,
        videoUrl,
        workingHours: JSON.stringify(hours),
        socialLinks: JSON.stringify(socials)
      };

      await businessAPI.updateProfile(payload);
      showToast("success", "Profile updated successfully!");
      setTimeout(() => onSaved(), 1000);
    } catch (err) {
      showToast("error", err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 pb-24 font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm font-bold animate-in slide-in-from-top-4 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-white/95 backdrop-blur-md border-emerald-200 text-emerald-800"
              : "bg-white/95 backdrop-blur-md border-rose-200 text-rose-800"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
          >
            <Icon
              name={toast.type === "success" ? "CheckIcon" : "XMarkIcon"}
              size={14}
            />
          </div>
          {toast.msg}
        </div>
      )}

      {/* Editor Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
            >
              <Icon name="ArrowLeftIcon" size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={HEADING_FONT}>
                Edit Business...
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Update your business info, location, media and hours
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open(`/business-profile/${businessData?.id}`, "_blank")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-extrabold text-xs tracking-wide uppercase transition-all shadow-xs"
          >
            <Icon name="EyeIcon" size={16} />
            See how member will see ur profile
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10 space-y-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3">
              Basic Information
            </h3>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icon name="BuildingStorefrontIcon" size={18} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tillie's Restaurant"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Business ID
                </label>
                <input
                  type="text"
                  value={businessData?.id ? `DCC-BIZ-${businessData.id.slice(-6).toUpperCase()}` : "DCC-BIZ-NEW"}
                  disabled
                  className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-400 font-mono tracking-wider cursor-not-allowed select-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Category
                </label>
                 <input
                  type="text"
                  value={
                    categories.find(c => String(c.id) === String(categoryId))?.name ||
                    (typeof businessData?.raw?.category === "object"
                      ? businessData?.raw?.category?.name
                      : businessData?.raw?.category) ||
                    "Retail"
                  }
                  disabled
                  className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Cuisine Type / Tag
                </label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  {CUISINES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icon name="PhoneIcon" size={18} />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(345) 123-4567"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icon name="EnvelopeIcon" size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@tilliesrestaurant.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icon name="GlobeAltIcon" size={18} />
                  </span>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.tilliesrestaurant.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Cayman District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Business Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="seafood, expertly grilled specialties, and a beautiful waterfront atmosphere..."
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Card 2: Business Location */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3">
              Business Location
            </h3>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Address Line 1 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icon name="MapPinIcon" size={18} />
                  </span>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 West Bay Rd"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Landmark
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                    <Icon name="FlagIcon" size={18} />
                  </span>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Cayman Reef Resort"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Suite 200, 2nd Floor"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all cursor-pointer appearance-none"
                >
                  <option value="Cayman Islands">Cayman Islands</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
            </div>

            {/* Tap to Update Location on Map Placeholder */}
            <div 
              className="relative rounded-2xl h-56 overflow-hidden border border-slate-200 shadow-inner cursor-pointer group flex items-center justify-center"
              onClick={() => alert("Interactive Cayman Districts map view opened! Drag pointer to save custom GPS coordinates.")}
            >
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
                alt="Cayman Map" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-50"
              />
              <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/20 transition-colors" />
              <div className="relative text-center text-white p-4">
                <div className="w-12 h-12 bg-white/25 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform">
                  <Icon name="MapPinIcon" size={24} className="text-white" />
                </div>
                <p className="font-black text-sm tracking-wide uppercase drop-shadow-md">
                  Tap to Update Location on Map
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Business Media */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Business Media
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                These images and videos will appear on your public profile
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Business Logo Upload */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Business Logo <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white rounded-2xl h-36 flex flex-col items-center justify-center p-4 transition-all overflow-hidden group cursor-pointer">
                  {logoUrl ? (
                    <>
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-bold text-xs uppercase bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">Change Logo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {uploadingLogo ? (
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-2" />
                      ) : (
                        <Icon name="CameraIcon" size={28} className="text-slate-400 mx-auto mb-2" />
                      )}
                      <p className="text-xs font-bold text-slate-500">Upload Logo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Cover Banner Upload */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Cover Banner <span className="text-rose-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white rounded-2xl h-36 flex flex-col items-center justify-center p-4 transition-all overflow-hidden group cursor-pointer">
                  {coverBannerUrl ? (
                    <>
                      <img src={coverBannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-bold text-xs uppercase bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">Change Cover</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {uploadingCover ? (
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-2" />
                      ) : (
                        <Icon name="PhotoIcon" size={28} className="text-slate-400 mx-auto mb-2" />
                      )}
                      <p className="text-xs font-bold text-slate-500">Upload Cover</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Images Grid */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Gallery Images (Maximum 6)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative rounded-2xl h-24 border border-slate-100 overflow-hidden group shadow-sm">
                    <img src={img} alt="Gallery item" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleGalleryRemove(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                ))}
                
                {galleryImages.length < 6 && (
                  /* Upload box */
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white rounded-2xl h-24 flex flex-col items-center justify-center p-2 cursor-pointer transition-all overflow-hidden group">
                    {uploadingGallery ? (
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Icon name="PlusIcon" size={20} className="text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Add Photo</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryAdd}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Document Uploads Grid */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Document Uploads (Maximum 5 PDFs/Docs)
              </label>
              <div className="space-y-2">
                {documentUrls.map((url, i) => {
                  const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0] || `document_${i + 1}.pdf`;
                  const decodedName = decodeURIComponent(filename);
                  return (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <span className="text-xs font-bold text-slate-700 truncate max-w-xs">{decodedName}</span>
                      <button
                        type="button"
                        onClick={() => handleDocumentRemove(i)}
                        className="px-2.5 py-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors flex items-center gap-1"
                        title="Remove document"
                      >
                        <Icon name="TrashIcon" size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })}

                {documentUrls.length < 5 && (
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group">
                    {uploadingDoc ? (
                      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-2" />
                    ) : (
                      <>
                        <Icon name="ArrowUpTrayIcon" size={24} className="text-slate-400 mb-2 group-hover:-translate-y-0.5 transition-transform" />
                        <p className="text-xs font-extrabold text-slate-600">Click to upload PDF / Word document</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">Files must be under 10MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleDocumentAdd}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Video URL (YouTube / Vimeo)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Icon name="PlayIcon" size={18} />
                </span>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/10 focus:border-[#1C4D8D] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Business Details (Opening Hours) */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3">
              Opening Hours
            </h3>

            <div className="space-y-4">
              {hours.map((h, idx) => (
                <div 
                  key={h.day} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4 rounded-2xl border transition-all ${h.closed ? "bg-slate-50/50 border-slate-100 opacity-60" : "bg-white border-slate-200/60 shadow-xs"}`}
                >
                  <span className="font-bold text-slate-900 w-28 text-sm">
                    {h.day}
                  </span>

                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <select
                      value={h.open}
                      disabled={h.closed}
                      onChange={(e) => handleHourTimeChange(idx, "open", e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                    >
                      {TIME_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    <span className="text-slate-400 font-bold text-xs">—</span>

                    <select
                      value={h.close}
                      disabled={h.closed}
                      onChange={(e) => handleHourTimeChange(idx, "close", e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                    >
                      {TIME_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {h.closed ? "Closed" : "Open"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHourToggle(idx)}
                      className={`relative w-12 h-6.5 rounded-full transition-colors duration-300 focus:outline-none border ${h.closed ? "bg-rose-500 border-rose-600" : "bg-slate-200 border-slate-300"}`}
                    >
                      <span 
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${h.closed ? "translate-x-6" : "translate-x-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Social Media Links */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-100 pb-3">
              Social Media Links
            </h3>

            <div className="space-y-4">
              {socials.map((soc, idx) => (
                <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                  <select
                    value={soc.platform}
                    onChange={(e) => handleSocialChange(idx, "platform", e.target.value)}
                    className="w-32 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer appearance-none focus:outline-none"
                  >
                    {SOCIAL_PLATFORMS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={soc.url}
                    onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                    placeholder="e.g. facebook.com/tilliesrestaurant"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:bg-white transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => removeSocialLink(idx)}
                    className="w-10 h-10 rounded-xl border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all active:scale-90"
                    title="Delete Link"
                  >
                    <Icon name="MinusIcon" size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSocialLink}
                className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white text-[#1C4D8D] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Icon name="PlusIcon" size={18} />
                Add Social Link
              </button>
            </div>
          </div>

          {/* Card 6: Action Submit Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex items-center gap-4 sticky bottom-4 z-40">
            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-4 bg-[#1C4D8D] text-white rounded-2xl font-bold hover:bg-[#0F2854] shadow-lg shadow-blue-900/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Icon name="CheckIcon" size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfileView;
