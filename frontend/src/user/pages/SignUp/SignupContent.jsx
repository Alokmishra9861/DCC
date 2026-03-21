import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import {
  authAPI,
  saveAuthData,
  ROLE_ROUTES,
  getAssociationRoute,
  categoryAPI,
} from "../../../services/api";

const ROLE_TABS = [
  {
    key: "member",
    label: "Individual",
    description: "Personal savings & discounts",
    icon: "UserIcon",
    color: "from-blue-500 to-indigo-600",
  },
  {
    key: "employer",
    label: "Employer",
    description: "Employee benefits program",
    icon: "BriefcaseIcon",
    color: "from-violet-500 to-purple-600",
  },
  {
    key: "business",
    label: "Business",
    description: "List & promote your business",
    icon: "BuildingStorefrontIcon",
    color: "from-emerald-500 to-teal-600",
  },
  {
    key: "association",
    label: "Association",
    description: "Member organization",
    icon: "UserGroupIcon",
    color: "from-orange-500 to-amber-600",
  },
];

const ORG_ROLE_CONFIG = {
  employer: { orgLabel: "Organization / Company Name", orgPlaceholder: "Acme Corp" },
  business: { orgLabel: "Business Name", orgPlaceholder: "My Business LLC" },
  association: { orgLabel: "Association Name", orgPlaceholder: "Cayman Association" },
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) =>
  /^[\d\s\-\(\)\+]+$/.test(phone) && phone.replace(/\D/g, "").length >= 8;
const validatePassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
const validateName = (name) =>
  name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);

const getInputCls = (hasError) =>
  `w-full px-4 py-3 bg-white border-2 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm ${
    hasError
      ? "border-red-300 focus:border-red-500 bg-red-50/30"
      : "border-slate-200 focus:border-[#1C4D8D] hover:border-slate-300"
  }`;

const selectCls =
  "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#1C4D8D] hover:border-slate-300 transition-all text-sm appearance-none cursor-pointer";

const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
    {children} {required && <span className="text-red-500 normal-case tracking-normal">*</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>⚠</span>{msg}</p> : null;

const StepDots = ({ total, current }) => (
  <div className="flex items-center gap-1.5 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i === current ? "w-8 bg-[#1C4D8D]" : i < current ? "w-4 bg-[#1C4D8D]/40" : "w-4 bg-slate-200"
        }`}
      />
    ))}
  </div>
);

// ─── Individual / Member Signup ───────────────────────────────────────────────
const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", age: "", sex: "",
    district: "", salaryLevel: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    else if (!validateName(formData.fullName)) errors.fullName = "Letters and spaces only, min 2 characters";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!validateEmail(formData.email)) errors.email = "Please enter a valid email address";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!validatePhone(formData.phone)) errors.phone = "Please enter a valid phone number (at least 8 digits)";
    if (formData.age && Number.isNaN(Number(formData.age))) errors.age = "Please enter a valid age";
    if (!formData.password) errors.password = "Password is required";
    else if (!validatePassword(formData.password))
      errors.password = "Min 8 chars with uppercase, lowercase, number & special character";
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!validateForm()) { setLoading(false); return; }
    try {
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || firstName;
      // register now returns tokens + redirectTo directly — no second login needed
      const data = await authAPI.register(formData.email, formData.password, "MEMBER", {
        firstName, lastName, phone: formData.phone,
        age: formData.age || null, sex: formData.sex || null,
        district: formData.district || null, salaryLevel: formData.salaryLevel || null,
      });
      saveAuthData(data);
      navigate(data.redirectTo || "/membership", { replace: true });
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
      {/* Main Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 md:p-9 border border-slate-100 shadow-lg">
          <StepDots total={3} current={0} />
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Your Account</h2>
          <p className="text-sm text-slate-500 mb-7">Start saving with Discount Club Cayman today.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {[
              { label: "Full Name", key: "fullName", type: "text", placeholder: "John Smith" },
              { label: "Email Address", key: "email", type: "email", placeholder: "john@example.com" },
              { label: "Phone Number", key: "phone", type: "tel", placeholder: "+1 (345) 123-4567" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <Label required>{label}</Label>
                <input type={type} required value={formData[key]}
                  onChange={(e) => field(key, e.target.value)}
                  className={getInputCls(formErrors[key])} placeholder={placeholder} />
                <FieldError msg={formErrors[key]} />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <input type="number" min="0" value={formData.age}
                  onChange={(e) => field("age", e.target.value)}
                  className={getInputCls(formErrors.age)} placeholder="e.g. 32" />
                <FieldError msg={formErrors.age} />
              </div>
              <div>
                <Label>Sex</Label>
                <div className="relative">
                  <select value={formData.sex} onChange={(e) => field("sex", e.target.value)} className={selectCls}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>District</Label>
                <div className="relative">
                  <select value={formData.district} onChange={(e) => field("district", e.target.value)} className={selectCls}>
                    <option value="">Select</option>
                    <option value="george_town">George Town</option>
                    <option value="west_bay">West Bay</option>
                    <option value="bodden_town">Bodden Town</option>
                    <option value="north_side">North Side</option>
                    <option value="east_end">East End</option>
                    <option value="cayman_brac">Cayman Brac</option>
                    <option value="little_cayman">Little Cayman</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
                </div>
              </div>
              <div>
                <Label>Salary Level</Label>
                <div className="relative">
                  <select value={formData.salaryLevel} onChange={(e) => field("salaryLevel", e.target.value)} className={selectCls}>
                    <option value="">Select</option>
                    <option value="low">Low</option>
                    <option value="mid">Mid</option>
                    <option value="high">High</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-4 mt-3">Choose a strong password to secure your account.</p>
              {[
                { label: "Password", key: "password", show: showPassword, toggle: () => setShowPassword((p) => !p) },
                { label: "Confirm Password", key: "confirmPassword", show: showConfirmPassword, toggle: () => setShowConfirmPassword((p) => !p) },
              ].map(({ label, key, show, toggle }) => (
                <div key={key} className="mb-5">
                  <Label required>{label}</Label>
                  <div className="relative">
                    <input type={show ? "text" : "password"} required value={formData[key]}
                      onChange={(e) => field(key, e.target.value)}
                      className={`${getInputCls(formErrors[key])} pr-11`}
                      placeholder={key === "password" ? "Min 8 characters" : "Re-enter your password"} />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                      <Icon name={show ? "EyeSlashIcon" : "EyeIcon"} size={18} />
                    </button>
                  </div>
                  <FieldError msg={formErrors[key]} />
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <input type="checkbox" required id="terms" className="mt-0.5 w-4 h-4 accent-[#1C4D8D]" />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="text-[#1C4D8D] hover:underline font-semibold">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="text-[#1C4D8D] hover:underline font-semibold">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm tracking-wide hover:bg-[#163d71] active:scale-[0.98] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>Creating account...</>
              ) : <>Create Account <Icon name="ArrowRightIcon" size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-[#1C4D8D] to-[#163d71] rounded-2xl p-7 text-white shadow-lg">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Icon name="SparklesIcon" size={20} />
          </div>
          <h3 className="font-bold text-lg mb-4">Membership Benefits</h3>
          <div className="space-y-3">
            {["Instant access to all discounts", "Digital membership card", "30-day money-back guarantee"].map((feat) => (
              <div key={feat} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="CheckIcon" size={12} />
                </div>
                <span className="text-sm text-blue-100">{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-1">Admin Access</h3>
          <p className="text-xs text-slate-500 mb-4">Manage memberships and approvals.</p>
          <Link to="/login"
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Org Signup Form (Employer / Business / Association) ──────────────────────
const OrgSignupForm = ({ role }) => {
  const navigate = useNavigate();
  const { orgLabel, orgPlaceholder } = ORG_ROLE_CONFIG[role];
  const roleUpper = role.toUpperCase();

  const [formData, setFormData] = useState({
    orgName: "", contactName: "", categoryId: "", categoryName: "",
    // NEW: associationType only used when role === ASSOCIATION
    // defaults to "MEMBER" — user picks via the type selector below
    associationType: "MEMBER",
    email: "", phone: "", password: "", confirmPassword: "",
  });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const field = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find((cat) => String(cat.id) === String(selectedId));
    setFormData((p) => ({
      ...p,
      categoryId: selectedId,
      categoryName: selectedCategory?.name || "",
    }));
  };

  const validate = () => {
    if (!formData.orgName || !formData.contactName || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (roleUpper === "BUSINESS" && !formData.categoryId) {
      setError("Category selection is required for business registration");
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
        profile = { companyName: formData.orgName, industry: "General", district: "", phone: formData.phone };
      } else if (roleUpper === "BUSINESS") {
        const numericCategoryId =
          formData.categoryId && !isNaN(Number(formData.categoryId))
            ? Number(formData.categoryId)
            : null;
        profile = {
          name: formData.orgName,
          ...(numericCategoryId ? { categoryId: numericCategoryId } : {}),
          categoryName: formData.categoryName,
          description: "", phone: formData.phone, address: "", district: "", website: "",
        };
      } else {
        // ASSOCIATION — pass the selected associationType to the backend
        // Backend saves it on the Association record.
        // Login response will include it so frontend can route to the correct dashboard.
        profile = {
          name: formData.orgName,
          associationType: formData.associationType, // "MEMBER" | "BUSINESS"
          type: "General",
          district: "",
          phone: formData.phone,
        };
      }

      // register now returns { accessToken, refreshToken, redirectTo, user }
      // redirectTo is computed by buildAuthResponse on the backend
      // For ASSOCIATION: redirectTo = "/association-member-dashboard" or "/association-business-dashboard"
      const data = await authAPI.register(formData.email, formData.password, roleUpper, profile);
      saveAuthData(data);

      // Prefer backend-computed redirectTo; fallback to client-side resolution
      const dest = data.redirectTo || (
        data.user?.role === "ASSOCIATION"
          ? getAssociationRoute(data.user)
          : ROLE_ROUTES[data.user?.role] || "/member-dashboard"
      );
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleUpper !== "BUSINESS") return;
    let isMounted = true;
    setCategoriesLoading(true);
    categoryAPI
      .getAll()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setCategories(list);
        if (list.length === 0) console.warn("No categories returned from API.");
      })
      .catch((err) => { if (!isMounted) return; console.error("categoryAPI.getAll() failed:", err.message); setCategories([]); })
      .finally(() => { if (isMounted) setCategoriesLoading(false); });
    return () => { isMounted = false; };
  }, [roleUpper]);

  const roleConfig = ROLE_TABS.find((r) => r.key === role);

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-7 md:p-9 border border-slate-100 shadow-lg space-y-5">

        <StepDots total={3} current={0} />
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleConfig?.color || "from-blue-500 to-indigo-600"} flex items-center justify-center text-white shadow-sm`}>
            <Icon name={roleConfig?.icon || "BuildingStorefrontIcon"} size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {role === "employer" ? "Employer" : role === "business" ? "Business" : "Association"} Registration
            </h2>
            <p className="text-xs text-slate-500">{roleConfig?.description}</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <span className="text-red-500 mt-0.5 flex-shrink-0 text-sm">⚠</span>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Common fields — identical to original */}
        {[
          { label: orgLabel, key: "orgName", placeholder: orgPlaceholder },
          { label: "Contact Person Name", key: "contactName", placeholder: "John Smith" },
          { label: "Email Address", key: "email", placeholder: "contact@example.com", type: "email" },
          { label: "Phone Number", key: "phone", placeholder: "+1 (345) 123-4567", type: "tel" },
        ].map(({ label, key, placeholder, type = "text" }) => (
          <div key={key}>
            <Label required>{label}</Label>
            <input type={type} required value={formData[key]}
              onChange={(e) => field(key, e.target.value)}
              className={getInputCls(false)} placeholder={placeholder} />
          </div>
        ))}

        {/* ── NEW: Association type selector ────────────────────────────────
            Only shown when role === "association".
            Two card buttons — Member Association vs Business Association.
            Sets formData.associationType which is sent in the profile object.
            The backend saves this as Association.associationType (enum: MEMBER | BUSINESS).
            On login, the response includes associationType so the frontend
            can navigate to /association-member-dashboard or /association-business-dashboard.
        ─────────────────────────────────────────────────────────────────── */}
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
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.associationType === val
                      ? "border-[#1C4D8D] bg-blue-50/60"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{icon}</span>
                    <p className={`font-bold text-sm ${formData.associationType === val ? "text-[#1C4D8D]" : "text-slate-700"}`}>
                      {label}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{sub}</p>
                  {formData.associationType === val && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-[#1C4D8D] flex items-center justify-center">
                        <Icon name="CheckIcon" size={10} className="text-white" />
                      </div>
                      <span className="text-xs text-[#1C4D8D] font-semibold">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Business category — identical to original */}
        {roleUpper === "BUSINESS" && (
          <div>
            <Label required>Business Category</Label>
            {categoriesLoading ? (
              <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-400 text-sm animate-pulse">
                Loading categories...
              </div>
            ) : categories.length > 0 ? (
              <div className="relative">
                <select
                  required
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  className={`${selectCls} ${!formData.categoryId ? "text-slate-400" : "text-slate-800"}`}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</div>
              </div>
            ) : (
              <input
                type="text"
                required
                value={formData.categoryName}
                onChange={(e) => { field("categoryName", e.target.value); field("categoryId", e.target.value); }}
                className={getInputCls(false)}
                placeholder="e.g. Dining, Fitness, Travel"
              />
            )}
            {formData.categoryId && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                <span>✓</span> Category selected
              </p>
            )}
          </div>
        )}

        {/* Password fields — identical to original */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-4 mt-3">Set a secure password for your account.</p>
          {[
            { label: "Password", key: "password", show: showPassword, toggle: () => setShowPassword((p) => !p) },
            { label: "Confirm Password", key: "confirmPassword", show: showConfirmPassword, toggle: () => setShowConfirmPassword((p) => !p) },
          ].map(({ label, key, show, toggle }) => (
            <div key={key} className="mb-5">
              <Label required>{label}</Label>
              <div className="relative">
                <input type={show ? "text" : "password"} required value={formData[key]}
                  onChange={(e) => field(key, e.target.value)}
                  className={`${getInputCls(false)} pr-11`}
                  placeholder="••••••••" />
                <button type="button" onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <Icon name={show ? "EyeSlashIcon" : "EyeIcon"} size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Terms — identical to original */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <input type="checkbox" required id="terms-org" className="mt-0.5 w-4 h-4 accent-[#1C4D8D]" />
          <label htmlFor="terms-org" className="text-xs text-slate-500 leading-relaxed">
            I agree to the{" "}
            <Link to="/terms" className="text-[#1C4D8D] hover:underline font-semibold">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="text-[#1C4D8D] hover:underline font-semibold">Privacy Policy</Link>
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm tracking-wide hover:bg-[#163d71] active:scale-[0.98] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>Creating Account...</>
          ) : <>Create Account <Icon name="ArrowRightIcon" size={16} /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-[#1C4D8D] hover:underline font-bold">Log in</Link>
      </p>
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 py-12 md:py-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-full text-[#1C4D8D] font-semibold text-xs uppercase tracking-widest mb-5 shadow-sm">
            <Icon name="SparklesIcon" size={14} /> Start Saving Today
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Join Discount Club Cayman
          </h1>
          <p className="text-base text-slate-500">{pageSubtitle[selectedRole]}</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 flex flex-wrap justify-center gap-1 border border-slate-200/80 shadow-sm w-full max-w-xl">
            {ROLE_TABS.map(({ key, label, description, color }) => (
              <button key={key} type="button" onClick={() => setSelectedRole(key)}
                className={`flex-1 min-w-[90px] px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center gap-0.5 ${
                  selectedRole === key
                    ? `bg-gradient-to-br ${color} text-white shadow-md`
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/80"
                }`}>
                <span className="text-sm">{label}</span>
                <span className={`text-[10px] font-normal leading-tight text-center ${selectedRole === key ? "text-white/70" : "text-slate-400"}`}>
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedRole === "member" ? <SignupForm /> : <OrgSignupForm role={selectedRole} />}

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1C4D8D] hover:underline font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupContent;