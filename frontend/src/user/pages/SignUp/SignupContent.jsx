import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { authAPI, saveAuthData, ROLE_ROUTES } from "../../../services/api";

const ROLE_TABS = [
  {
    key: "member",
    label: "Individual",
    description: "Personal savings & discounts",
  },
  {
    key: "employer",
    label: "Employer",
    description: "Employee benefits program",
  },
  {
    key: "business",
    label: "Business",
    description: "List & promote your business",
  },
  {
    key: "association",
    label: "Association",
    description: "Member organization",
  },
];

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
        "Min 8 characters with uppercase, lowercase, number & special character";
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

      // 1. Register
      await authAPI.register(formData.email, formData.password, "MEMBER", {
        firstName,
        lastName,
        phone: formData.phone,
        age: formData.age || null,
        sex: formData.sex || null,
        district: formData.district || null,
        salaryLevel: formData.salaryLevel || null,
      });

      // 2. Auto-login
      const loginData = await authAPI.login(formData.email, formData.password);

      // 3. Save token — works whether backend returns { token } or { accessToken }
      saveAuthData(loginData);

      // 4. Member goes to /membership to pay & activate
      //    (dashboard shows inactive banner until they pay)
      navigate("/membership", { replace: true });
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

  const inputCls = (key) =>
    `w-full px-5 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 transition-all ${
      formErrors[key]
        ? "border-red-300 focus:border-red-500"
        : "border-slate-200 focus:border-[#1C4D8D]"
    }`;

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-fade-up animation-delay-200">
      <div className="lg:col-span-2">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <Icon
                name="ExclamationCircleIcon"
                size={20}
                className="text-red-600 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">
              Create Your Account
            </h2>

            {[
              {
                label: "Full Name",
                key: "fullName",
                type: "text",
                placeholder: "John Smith",
                hint: "Letters and spaces only",
              },
              {
                label: "Email Address",
                key: "email",
                type: "email",
                placeholder: "john@example.com",
                hint: "Valid email required",
              },
              {
                label: "Phone Number",
                key: "phone",
                type: "tel",
                placeholder: "+1 (345) 123-4567",
                hint: "At least 8 digits",
              },
            ].map(({ label, key, type, placeholder, hint }) => (
              <div key={key}>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  {label} <span className="text-red-500">*</span>
                </label>
                <input
                  type={type}
                  required
                  value={formData[key]}
                  onChange={(e) => field(key, e.target.value)}
                  className={inputCls(key)}
                  placeholder={placeholder}
                />
                {formErrors[key] && (
                  <p className="text-sm text-red-600 mt-1 ml-1">
                    {formErrors[key]}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1 ml-1">{hint}</p>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Age
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(e) => field("age", e.target.value)}
                  className={inputCls("age")}
                  placeholder="e.g. 32"
                />
                {formErrors.age && (
                  <p className="text-sm text-red-600 mt-1 ml-1">
                    {formErrors.age}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Sex
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => field("sex", e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  District
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => field("district", e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                >
                  <option value="">Select</option>
                  <option value="george_town">George Town</option>
                  <option value="west_bay">West Bay</option>
                  <option value="bodden_town">Bodden Town</option>
                  <option value="north_side">North Side</option>
                  <option value="east_end">East End</option>
                  <option value="cayman_brac">Cayman Brac</option>
                  <option value="little_cayman">Little Cayman</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Salary Level
                </label>
                <select
                  value={formData.salaryLevel}
                  onChange={(e) => field("salaryLevel", e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                >
                  <option value="">Select</option>
                  <option value="low">Low</option>
                  <option value="mid">Mid</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Password */}
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
              <div key={key}>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  {label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    required
                    value={formData[key]}
                    onChange={(e) => field(key, e.target.value)}
                    className={`${inputCls(key)} pr-12`}
                    placeholder={
                      key === "password"
                        ? "At least 8 characters"
                        : "Re-enter your password"
                    }
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Icon name={show ? "EyeSlashIcon" : "EyeIcon"} size={20} />
                  </button>
                </div>
                {formErrors[key] && (
                  <p className="text-sm text-red-600 mt-1 ml-1">
                    {formErrors[key]}
                  </p>
                )}
              </div>
            ))}

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                required
                id="terms"
                className="mt-1 w-4 h-4 text-[#1C4D8D] border-slate-300 rounded focus:ring-[#1C4D8D]"
              />
              <label htmlFor="terms" className="text-sm text-slate-500">
                I agree to the{" "}
                <Link to="/terms" className="text-[#1C4D8D] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  className="text-[#1C4D8D] hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
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
                  {" "}
                  Create Account <Icon name="ArrowRightIcon" size={18} />{" "}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg sticky top-24">
          <h3 className="font-heading text-xl font-bold text-slate-900 mb-6">
            Membership Benefits
          </h3>
          <div className="pt-2 space-y-3">
            {[
              "Instant access to all discounts",
              "Digital membership card",
              "30-day money-back guarantee",
            ].map((feat) => (
              <div key={feat} className="flex items-start gap-3">
                <Icon
                  name="CheckCircleIcon"
                  size={20}
                  className="text-[#1C4D8D] flex-shrink-0 mt-0.5"
                  variant="solid"
                />
                <span className="text-sm text-slate-500">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
          <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">
            Admin Access
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Admins can sign in to manage memberships and approvals.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-colors"
          >
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
  const [formData, setFormData] = useState({
    orgName: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const field = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

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
      const roleUpper = role.toUpperCase();
      let profile;
      if (roleUpper === "EMPLOYER") {
        profile = {
          companyName: formData.orgName,
          industry: "General",
          district: "",
          phone: formData.phone,
        };
      } else if (roleUpper === "BUSINESS") {
        profile = {
          name: formData.orgName,
          category: "General",
          description: "",
          phone: formData.phone,
          address: "",
          district: "",
          website: "",
        };
      } else {
        profile = {
          name: formData.orgName,
          type: "General",
          district: "",
          phone: formData.phone,
        };
      }

      await authAPI.register(
        formData.email,
        formData.password,
        roleUpper,
        profile,
      );
      const loginData = await authAPI.login(formData.email, formData.password);

      // saveAuthData handles { token } or { accessToken }
      saveAuthData(loginData);

      // Org roles go straight to their dashboard
      navigate(ROLE_ROUTES[loginData.user?.role] || "/member-dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all";

  return (
    <div className="max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl space-y-5"
      >
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <Icon
              name="ExclamationCircleIcon"
              size={20}
              className="text-red-600 mt-0.5 flex-shrink-0"
            />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

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
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
              {label} *
            </label>
            <input
              type={type}
              required
              value={formData[key]}
              onChange={(e) => field(key, e.target.value)}
              className={inputCls}
              placeholder={placeholder}
            />
          </div>
        ))}

        {[
          { label: "Password", key: "password" },
          { label: "Confirm Password", key: "confirmPassword" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
              {label} *
            </label>
            <input
              type="password"
              required
              value={formData[key]}
              onChange={(e) => field(key, e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
        ))}

        <div className="flex items-start gap-3 pt-1">
          <input
            type="checkbox"
            required
            id="terms-org"
            className="mt-1 w-4 h-4 text-[#1C4D8D] border-slate-300 rounded focus:ring-[#1C4D8D]"
          />
          <label htmlFor="terms-org" className="text-sm text-slate-500">
            I agree to the{" "}
            <Link to="/terms" className="text-[#1C4D8D] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-[#1C4D8D] hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
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
              {" "}
              Create Account <Icon name="ArrowRightIcon" size={20} />{" "}
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-[#1C4D8D] hover:underline font-bold">
          Log in
        </Link>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[#1C4D8D] font-semibold text-sm mb-6 shadow-sm">
            <Icon name="SparklesIcon" size={16} /> Start Saving Today
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Join Discount Club Cayman
          </h1>
          <p className="text-xl text-slate-600">{pageSubtitle[selectedRole]}</p>
        </div>

        <div className="flex justify-center mb-10 animate-fade-up animation-delay-100">
          <div className="bg-white rounded-2xl p-1.5 flex flex-wrap justify-center gap-1 border border-slate-100 shadow-sm">
            {ROLE_TABS.map(({ key, label, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedRole(key)}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-0.5 min-w-[110px] ${
                  selectedRole === key
                    ? "bg-[#1C4D8D] text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] font-normal ${selectedRole === key ? "text-blue-200" : "text-slate-400"}`}
                >
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedRole === "member" ? (
          <SignupForm />
        ) : (
          <OrgSignupForm role={selectedRole} />
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#1C4D8D] hover:underline font-bold"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupContent;
