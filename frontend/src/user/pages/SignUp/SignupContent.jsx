// Frontend/src/user/pages/SignUp/SignupContent.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import {
  authAPI,
  saveAuthData,
  ROLE_ROUTES,
  getAssociationRoute,
  categoryAPI,
  uploadAPI,
} from "../../../services/api";

// ── Role tabs — B2B Partner added ─────────────────────────────────────────────
const ROLE_TABS = [
  {
    key: "member",
    label: "Individual",
    description: "Personal savings & discounts",
    icon: "UserIcon",
    color: "from-[#D4A62A] to-[#E0B53A]",
  },
  {
    key: "employer",
    label: "Employer",
    description: "Employee benefits program",
    icon: "BriefcaseIcon",
    color: "from-[#D4A62A] to-[#E0B53A]",
  },
  {
    key: "business",
    label: "Business",
    description: "Offer discounts & certificates",
    icon: "BuildingStorefrontIcon",
    color: "from-[#D4A62A] to-[#E0B53A]",
  },
  {
    key: "association",
    label: "Association",
    description: "Member organization",
    icon: "UserGroupIcon",
    color: "from-[#D4A62A] to-[#E0B53A]",
  },
  {
    key: "b2b",
    label: "B2B Partner",
    description: "Provide business services",
    icon: "BuildingOffice2Icon",
    color: "from-[#D4A62A] to-[#E0B53A]",
  },
];

// ── Org field config by role ───────────────────────────────────────────────────
const ORG_ROLE_CONFIG = {
  employer: {
    orgLabel: "Organization / Company Name",
    orgPlaceholder: "Acme Corp",
  },
  business: { orgLabel: "Business Name", orgPlaceholder: "My Business LLC" },
  association: {
    orgLabel: "Association Name",
    orgPlaceholder: "Cayman Association",
  },
  b2b: { orgLabel: "Company Name", orgPlaceholder: "Marketing Agency LLC" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePhone = (p) =>
  /^[\d\s\-\(\)\+]+$/.test(p) && p.replace(/\D/g, "").length >= 8;
const validatePassword = (p) =>
  p.length >= 8 &&
  /[A-Z]/.test(p) &&
  /[a-z]/.test(p) &&
  /\d/.test(p) &&
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
const validateName = (n) => n.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(n);

const getInputCls = (hasError) =>
  `w-full px-4 py-3 bg-[#0D1328]/60 border rounded-xl text-white placeholder-[#8D95A8] focus:outline-none transition-all text-sm shadow-inner ${hasError
    ? "border-rose-500/50 focus:border-rose-500 bg-rose-500/5"
    : "border-white/8 focus:border-[#D4A62A] focus:ring-2 focus:ring-[#D4A62A]/10"
  }`;

const selectCls =
  "w-full px-4 py-3 bg-[#0D1328]/60 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#D4A62A] hover:border-white/12 transition-all text-sm appearance-none cursor-pointer";

const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-[#B8C0D4] uppercase tracking-wider mb-2">
    {children}
    {required && (
      <span className="text-[#D4A62A] normal-case tracking-normal"> *</span>
    )}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-bold">
      <span>⚠</span>
      {msg}
    </p>
  ) : null;

const StepDots = ({ total, current }) => (
  <div className="flex items-center gap-1.5 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${i === current
            ? "w-8 bg-[#D4A62A] shadow-[0_0_8px_#D4A62A]"
            : i < current
              ? "w-4 bg-[#D4A62A]/40"
              : "w-4 bg-white/10"
          }`}
      />
    ))}
  </div>
);

// ─── Individual / Member Signup ───────────────────────────────────────────────
const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    sex: "",
    district: "",
    salaryLevel: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    else if (!validateName(formData.fullName))
      errors.fullName = "Letters and spaces only, min 2 characters";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!validateEmail(formData.email))
      errors.email = "Please enter a valid email address";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!validatePhone(formData.phone))
      errors.phone = "Please enter a valid phone number (at least 8 digits)";
    if (formData.age && Number.isNaN(Number(formData.age)))
      errors.age = "Please enter a valid age";
    if (!formData.password) errors.password = "Password is required";
    else if (!validatePassword(formData.password))
      errors.password =
        "Min 8 chars with uppercase, lowercase, number & special character";
    if (!formData.confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;
      const data = await authAPI.register(
        formData.email,
        formData.password,
        "MEMBER",
        {
          firstName,
          lastName,
          phone: formData.phone,
          age: formData.age || null,
          sex: formData.sex || null,
          district: formData.district || null,
          salaryLevel: formData.salaryLevel || null,
        },
      );
      saveAuthData(data);
      navigate(data.redirectTo || "/member-dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (key, value) => {
    setFormData((p) => ({ ...p, [key]: value }));
    if (formErrors[key]) setFormErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <form
          onSubmit={handleSubmit}
          className="glass-panel bg-[#111936]/80 rounded-2xl p-7 md:p-9 border border-white/8 shadow-2xl"
        >
          <StepDots total={3} current={0} />
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Create Your Account
          </h2>
          <p className="text-sm text-[#B8C0D4] mb-7 font-medium">
            Start saving with Discount Club Cayman today.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
              <span className="text-rose-400 mt-0.5 flex-shrink-0 font-bold">⚠</span>
              <p className="text-sm text-rose-400 font-bold leading-tight">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {[
              {
                label: "Full Name",
                key: "fullName",
                type: "text",
                placeholder: "John Smith",
              },
              {
                label: "Email Address",
                key: "email",
                type: "email",
                placeholder: "john@example.com",
              },
              {
                label: "Phone Number",
                key: "phone",
                type: "tel",
                placeholder: "+1 (345) 123-4567",
              },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <Label required>{label}</Label>
                <input
                  type={type}
                  required
                  value={formData[key]}
                  onChange={(e) => field(key, e.target.value)}
                  className={getInputCls(formErrors[key])}
                  placeholder={placeholder}
                />
                <FieldError msg={formErrors[key]} />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <input
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(e) => field("age", e.target.value)}
                  className={getInputCls(formErrors.age)}
                  placeholder="e.g. 32"
                />
                <FieldError msg={formErrors.age} />
              </div>
              <div>
                <Label>Sex</Label>
                <div className="relative">
                  <select
                    value={formData.sex}
                    onChange={(e) => field("sex", e.target.value)}
                    className={selectCls}
                  >
                    <option value="" className="bg-[#111936]">Select</option>
                    <option value="male" className="bg-[#111936]">Male</option>
                    <option value="female" className="bg-[#111936]">Female</option>
                    <option value="other" className="bg-[#111936]">Other</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8D95A8] font-bold">
                    ▾
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>District</Label>
                <div className="relative">
                  <select
                    value={formData.district}
                    onChange={(e) => field("district", e.target.value)}
                    className={selectCls}
                  >
                    <option value="" className="bg-[#111936]">Select</option>
                    <option value="george_town" className="bg-[#111936]">George Town</option>
                    <option value="west_bay" className="bg-[#111936]">West Bay</option>
                    <option value="bodden_town" className="bg-[#111936]">Bodden Town</option>
                    <option value="north_side" className="bg-[#111936]">North Side</option>
                    <option value="east_end" className="bg-[#111936]">East End</option>
                    <option value="cayman_brac" className="bg-[#111936]">Cayman Brac</option>
                    <option value="little_cayman" className="bg-[#111936]">Little Cayman</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8D95A8] font-bold">
                    ▾
                  </div>
                </div>
              </div>
              <div>
                <Label>Salary Level</Label>
                <div className="relative">
                  <select
                    value={formData.salaryLevel}
                    onChange={(e) => field("salaryLevel", e.target.value)}
                    className={selectCls}
                  >
                    <option value="" className="bg-[#111936]">Select</option>
                    <option value="low" className="bg-[#111936]">Low</option>
                    <option value="mid" className="bg-[#111936]">Mid</option>
                    <option value="high" className="bg-[#111936]">High</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8D95A8] font-bold">
                    ▾
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-white/8">
              <p className="text-xs text-[#8D95A8] font-bold mb-4 mt-3">
                Choose a strong password to secure your account.
              </p>
              {[
                {
                  label: "Password",
                  key: "password",
                  show: showPassword,
                  toggle: () => setShowPassword((p) => !p),
                },
                {
                  label: "Confirm Password",
                  key: "confirmPassword",
                  show: showConfirmPassword,
                  toggle: () => setShowConfirmPassword((p) => !p),
                },
              ].map(({ label, key, show, toggle }) => (
                <div key={key} className="mb-5">
                  <Label required>{label}</Label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      required
                      value={formData[key]}
                      onChange={(e) => field(key, e.target.value)}
                      className={`${getInputCls(formErrors[key])} pr-11`}
                      placeholder={
                        key === "password"
                          ? "Min 8 characters"
                          : "Re-enter your password"
                      }
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D95A8] hover:text-white transition-colors p-1 cursor-pointer"
                    >
                      <Icon
                        name={show ? "EyeSlashIcon" : "EyeIcon"}
                        size={18}
                      />
                    </button>
                  </div>
                  <FieldError msg={formErrors[key]} />
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#0D1328]/50 rounded-xl border border-white/8">
              <input
                type="checkbox"
                required
                id="terms"
                className="mt-0.5 w-4 h-4 accent-[#D4A62A] bg-[#0D1328] border-white/10 rounded focus:ring-0"
              />
              <label
                htmlFor="terms"
                className="text-xs text-[#8D95A8] leading-relaxed font-bold"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-[#D4A62A] hover:underline font-extrabold"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  className="text-[#D4A62A] hover:underline font-extrabold"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium-gold w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <Icon name="ArrowRightIcon" size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-[#111936] to-[#161F3D] rounded-2xl p-7 text-white border border-white/8 shadow-2xl">
          <div className="w-10 h-10 bg-[#D4A62A]/15 text-[#D4A62A] rounded-xl flex items-center justify-center mb-4 border border-[#D4A62A]/20">
            <Icon name="SparklesIcon" size={20} />
          </div>
          <h3 className="font-bold text-lg mb-4 text-[#D4A62A] tracking-wide">Membership Benefits</h3>
          <div className="space-y-4">
            {[
              "Instant access to all discounts",
              "Digital membership card",
              "30-day money-back guarantee",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#D4A62A]/15 text-[#D4A62A] border border-[#D4A62A]/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                  <Icon name="CheckIcon" size={12} />
                </div>
                <span className="text-sm text-[#B8C0D4] font-bold">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#111936]/80 rounded-2xl p-6 border border-white/8 shadow-xl">
          <h3 className="font-bold text-white mb-1">Admin Access</h3>
          <p className="text-xs text-[#8D95A8] font-bold mb-4">
            Manage memberships and approvals.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl border border-white/8 text-white bg-[#161F3D]/50 hover:bg-[#161F3D] hover:border-[#D4A62A] hover:text-[#D4A62A] text-sm font-semibold transition-all"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Org / B2B Signup Form ────────────────────────────────────────────────────
const OrgSignupForm = ({ role }) => {
  const navigate = useNavigate();
  const roleUpper = role.toUpperCase();
  const { orgLabel, orgPlaceholder } = ORG_ROLE_CONFIG[role];

  const [formData, setFormData] = useState({
    orgName: "",
    contactName: "",
    categoryId: "",
    categoryName: "",
    associationType: "MEMBER", // only relevant for ASSOCIATION
    servicesOffered: "", // only relevant for B2B
    email: "",
    phone: "",
    website: "",
    password: "",
    confirmPassword: "",
    logoUrl: "",
    coverBannerUrl: "",
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const field = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WEBP, GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }
    setLogoUploading(true);
    setError("");
    try {
      const { url } = await uploadAPI.image(file);
      field("logoUrl", url);
    } catch (err) {
      setError(err.message || "Failed to upload logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, WEBP, GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }
    setCoverUploading(true);
    setError("");
    try {
      const { url } = await uploadAPI.image(file);
      field("coverBannerUrl", url);
    } catch (err) {
      setError(err.message || "Failed to upload cover banner.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const cat = categories.find((c) => String(c.id) === String(selectedId));
    setFormData((p) => ({
      ...p,
      categoryId: selectedId,
      categoryName: cat?.name || "",
    }));
  };

  const validate = () => {
    if (
      !formData.orgName ||
      !formData.contactName ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (roleUpper === "BUSINESS" && !formData.categoryId) {
      setError("Category selection is required for business registration.");
      return false;
    }
    if (roleUpper === "B2B" && !formData.servicesOffered.trim()) {
      setError("Please describe the services your company offers.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setLoading(true);
    try {
      let profile;

      if (roleUpper === "EMPLOYER") {
        profile = {
          companyName: formData.orgName,
          industry: "General",
          district: "",
          phone: formData.phone,
        };
      } else if (roleUpper === "BUSINESS") {
        const numId =
          formData.categoryId && !isNaN(Number(formData.categoryId))
            ? Number(formData.categoryId)
            : null;
        profile = {
          name: formData.orgName,
          ...(numId ? { categoryId: numId } : {}),
          categoryName: formData.categoryName,
          description: "",
          phone: formData.phone,
          address: "",
          district: "",
          website: formData.website || "",
        };
      } else if (roleUpper === "ASSOCIATION") {
        profile = {
          name: formData.orgName,
          associationType: formData.associationType, // "MEMBER" | "BUSINESS"
          type: "General",
          district: "",
          phone: formData.phone,
        };
      } else if (roleUpper === "B2B") {
        profile = {
          companyName: formData.orgName,
          servicesOffered: formData.servicesOffered.trim(),
          phone: formData.phone,
          website: formData.website || "",
          logoUrl: formData.logoUrl || null,
          coverBannerUrl: formData.coverBannerUrl || null,
        };
      }

      const data = await authAPI.register(
        formData.email,
        formData.password,
        roleUpper,
        profile,
      );
      saveAuthData(data);

      const dest =
        data.redirectTo ||
        (data.user?.role === "ASSOCIATION"
          ? getAssociationRoute(data.user)
          : ROLE_ROUTES[data.user?.role] || "/member-dashboard");

      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load categories for BUSINESS role
  useEffect(() => {
    if (roleUpper !== "BUSINESS") return;
    let mounted = true;
    setCategoriesLoading(true);
    categoryAPI
      .getAll()
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setCategories(list);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      })
      .finally(() => {
        if (mounted) setCategoriesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [roleUpper]);

  const roleConfig = ROLE_TABS.find((r) => r.key === role);

  return (
    <div className="max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="glass-panel bg-[#111936]/80 rounded-2xl p-7 md:p-9 border border-white/8 shadow-2xl space-y-5"
      >
        <StepDots total={3} current={0} />

        {/* Role header */}
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A62A] to-[#E0B53A] flex items-center justify-center text-[#0D1328] shadow-md shadow-[#D4A62A]/10 font-bold"
          >
            <Icon
              name={roleConfig?.icon || "BuildingStorefrontIcon"}
              size={20}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {roleConfig?.label} Registration
            </h2>
            <p className="text-xs text-[#8D95A8] font-bold">{roleConfig?.description}</p>
          </div>
        </div>

        {/* B2B info banner */}
        {roleUpper === "B2B" && (
          <div className="p-4 bg-[#161F3D] border border-white/8 rounded-xl shadow-inner">
            <p className="text-sm font-bold text-[#D4A62A] mb-1">
              🤝 B2B Partner Registration
            </p>
            <p className="text-xs text-[#B8C0D4] leading-relaxed font-semibold">
              Your profile will appear in the B2B Partner Directory visible to
              all DCC members, employers, and associations. Admin approval
              required before going live.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
            <span className="text-rose-400 mt-0.5 flex-shrink-0 text-sm font-bold">⚠</span>
            <p className="text-sm text-rose-400 font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Common fields */}
        {[
          { label: orgLabel, key: "orgName", placeholder: orgPlaceholder },
          {
            label: "Contact Person Name",
            key: "contactName",
            placeholder: "John Smith",
          },
          {
            label: "Email Address",
            key: "email",
            placeholder: "contact@example.com",
            type: "email",
          },
          {
            label: "Phone Number",
            key: "phone",
            placeholder: "+1 (345) 123-4567",
            type: "tel",
          },
        ].map(({ label, key, placeholder, type = "text" }) => (
          <div key={key}>
            <Label required>{label}</Label>
            <input
              type={type}
              required
              value={formData[key]}
              onChange={(e) => field(key, e.target.value)}
              className={getInputCls(false)}
              placeholder={placeholder}
            />
          </div>
        ))}

        {/* Website — shown for BUSINESS and B2B */}
        {(roleUpper === "BUSINESS" || roleUpper === "B2B") && (
          <div>
            <Label>Website URL</Label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => field("website", e.target.value)}
              className={getInputCls(false)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        )}

        {/* ── B2B: Services Offered textarea ────────────────────────────────── */}
        {roleUpper === "B2B" && (
          <>
            <div>
              <Label required>Services Offered</Label>
              <p className="text-xs text-[#8D95A8] font-bold mb-1.5">
                Describe what services your business provides to other DCC
                businesses, employers, or associations.
              </p>
              <textarea
                required
                value={formData.servicesOffered}
                onChange={(e) => field("servicesOffered", e.target.value)}
                rows={4}
                className={`${getInputCls(false)} resize-none`}
                placeholder="e.g. Digital marketing, SEO, social media management, content creation, office supplies..."
              />
            </div>

            {/* ── B2B: Logo and Cover Uploaders ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Business Logo</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                  className="block w-full text-xs text-[#8D95A8] file:mr-4 file:rounded-xl file:border-0 file:bg-[#1C4D8D]/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#D4A62A] hover:file:bg-[#1C4D8D]/30 cursor-pointer"
                />
                {logoUploading && (
                  <p className="text-xs text-[#8D95A8] mt-1 animate-pulse">Uploading logo...</p>
                )}
                {formData.logoUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden bg-[#0D1328] flex items-center justify-center">
                      <AppImage
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => field("logoUrl", "")}
                      className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <Label>Cover Banner Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={coverUploading}
                  className="block w-full text-xs text-[#8D95A8] file:mr-4 file:rounded-xl file:border-0 file:bg-[#1C4D8D]/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#D4A62A] hover:file:bg-[#1C4D8D]/30 cursor-pointer"
                />
                {coverUploading && (
                  <p className="text-xs text-[#8D95A8] mt-1 animate-pulse">Uploading banner...</p>
                )}
                {formData.coverBannerUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-20 h-10 rounded-lg border border-white/10 overflow-hidden bg-[#0D1328] flex items-center justify-center">
                      <AppImage
                        src={formData.coverBannerUrl}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => field("coverBannerUrl", "")}
                      className="text-xs text-rose-400 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── ASSOCIATION: Type selector ─────────────────────────────────────── */}
        {roleUpper === "ASSOCIATION" && (
          <div>
            <Label required>Association Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                {
                  val: "MEMBER",
                  label: "Member Association",
                  sub: "Link individual members, manage savings & join codes",
                  icon: "👥",
                },
                {
                  val: "BUSINESS",
                  label: "Business Association",
                  sub: "Link & manage businesses, B2B offers & directory",
                  icon: "🏪",
                },
              ].map(({ val, label, sub, icon }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => field("associationType", val)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${formData.associationType === val
                      ? "border-[#D4A62A] bg-[#D4A62A]/5"
                      : "border-white/8 hover:border-white/12 bg-[#0D1328]/60"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{icon}</span>
                    <p
                      className={`font-bold text-sm ${formData.associationType === val ? "text-white" : "text-[#B8C0D4]"}`}
                    >
                      {label}
                    </p>
                  </div>
                  <p className="text-xs text-[#8D95A8] leading-relaxed font-semibold">
                    {sub}
                  </p>
                  {formData.associationType === val && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-[#D4A62A] flex items-center justify-center">
                        <Icon
                          name="CheckIcon"
                          size={10}
                          className="text-[#0D1328] font-black"
                        />
                      </div>
                      <span className="text-xs text-[#D4A62A] font-extrabold">
                        Selected
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── BUSINESS: Category selector ────────────────────────────────────── */}
        {roleUpper === "BUSINESS" && (
          <div>
            <Label required>Business Category</Label>
            {categoriesLoading ? (
              <div className="w-full px-4 py-3 bg-[#0D1328]/60 border border-white/8 rounded-xl text-[#8D95A8] text-sm animate-pulse font-bold">
                Loading categories...
              </div>
            ) : categories.length > 0 ? (
              <div className="relative">
                <select
                  required
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  className={`${selectCls} ${!formData.categoryId ? "text-[#8D95A8]" : "text-white"}`}
                >
                  <option value="" disabled className="bg-[#111936]">
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#111936]">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8D95A8] font-bold">
                  ▾
                </div>
              </div>
            ) : (
              <input
                type="text"
                required
                value={formData.categoryName}
                onChange={(e) => {
                  field("categoryName", e.target.value);
                  field("categoryId", e.target.value);
                }}
                className={getInputCls(false)}
                placeholder="e.g. Dining, Fitness, Travel"
              />
            )}
            {formData.categoryId && (
              <p className="text-xs text-[#D4A62A] mt-1.5 flex items-center gap-1 font-bold">
                <span>✓</span> Category selected
              </p>
            )}
          </div>
        )}

        {/* Password fields */}
        <div className="pt-2 border-t border-white/8">
          <p className="text-xs text-[#8D95A8] font-bold mb-4 mt-3">
            Set a secure password for your account.
          </p>
          {[
            {
              label: "Password",
              key: "password",
              show: showPassword,
              toggle: () => setShowPassword((p) => !p),
            },
            {
              label: "Confirm Password",
              key: "confirmPassword",
              show: showConfirmPassword,
              toggle: () => setShowConfirmPassword((p) => !p),
            },
          ].map(({ label, key, show, toggle }) => (
            <div key={key} className="mb-5">
              <Label required>{label}</Label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  value={formData[key]}
                  onChange={(e) => field(key, e.target.value)}
                  className={`${getInputCls(false)} pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D95A8] hover:text-white transition-colors p-1 cursor-pointer"
                >
                  <Icon name={show ? "EyeSlashIcon" : "EyeIcon"} size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 p-4 bg-[#0D1328]/50 rounded-xl border border-white/8">
          <input
            type="checkbox"
            required
            id="terms-org"
            className="mt-0.5 w-4 h-4 accent-[#D4A62A] bg-[#0D1328] border-white/10 rounded focus:ring-0"
          />
          <label
            htmlFor="terms-org"
            className="text-xs text-[#8D95A8] leading-relaxed font-bold"
          >
            I agree to the{" "}
            <Link
              to="/terms"
              className="text-[#D4A62A] hover:underline font-extrabold"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-[#D4A62A] hover:underline font-extrabold"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-premium-gold w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating Account...
            </>
          ) : (
            <>
              Create Account <Icon name="ArrowRightIcon" size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// ─── Main SignupContent ───────────────────────────────────────────────────────
const SignupContent = () => {
  const [selectedRole, setSelectedRole] = useState("member");

  const pageSubtitle = {
    member: "Start saving in less than 2 minutes",
    employer: "Offer exclusive benefits to your team",
    business: "Reach thousands of DCC members",
    association: "Connect your members with exclusive discounts",
    b2b: "Join the B2B Partner Directory",
  };

  return (
    <div className="min-h-screen bg-[#0D1328] py-12 md:py-20 relative overflow-hidden grid-background animate-fade-up">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="glow-orb w-[450px] h-[450px] bg-[#D4A62A]/5 -top-40 -right-40 rounded-full" />
        <div className="glow-orb w-[450px] h-[450px] bg-[#E0B53A]/5 -bottom-40 -left-40 rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111936]/80 backdrop-blur-sm border border-white/8 rounded-full text-[#D4A62A] font-bold text-xs uppercase tracking-widest mb-5 shadow-md">
            <Icon name="SparklesIcon" size={14} /> Start Saving Today
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Join Discount Club Cayman
          </h1>
          <p className="text-base text-[#B8C0D4] font-semibold">
            {pageSubtitle[selectedRole]}
          </p>
        </div>

        {/* Role selector — 5 cards styled with luxury selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {ROLE_TABS.map(({ key, label, icon, color }) => (
            <button
              key={key}
              onClick={() => setSelectedRole(key)}
              className={`p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${selectedRole === key
                  ? "bg-gradient-to-br from-[#D4A62A] to-[#E0B53A] text-[#0D1328] border-transparent shadow-lg shadow-[#D4A62A]/10 scale-[1.03]"
                  : "bg-[#111936]/50 border-white/8 text-[#8D95A8] hover:border-[#D4A62A]/30 hover:text-white"
                }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon name={icon} size={20} />
                <span className="text-xs font-bold tracking-wide">{label}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedRole === "member" ? (
          <SignupForm />
        ) : (
          <OrgSignupForm role={selectedRole} />
        )}

        <p className="mt-8 text-center text-sm text-[#B8C0D4] font-bold">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#D4A62A] hover:underline font-black"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupContent;
