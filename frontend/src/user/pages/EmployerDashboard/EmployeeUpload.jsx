// Frontend/src/employer/pages/EmployeeUpload.jsx
// Two tabs: CSV bulk upload and manual single-employee entry.
// CSV: drag-and-drop zone → parse client-side → validate → show preview → submit.
// Manual: name + email form, adds to list, submit all at once.

import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { employerAPI } from "../../../services/api";

// ── CSV parser (client-side, no library needed for simple name/email) ─────────
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2)
    return {
      rows: [],
      errors: ["CSV must have a header row and at least one data row"],
    };

  const header = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const nameIdx = header.findIndex(
    (h) => h === "name" || h === "full name" || h === "fullname",
  );
  const emailIdx = header.findIndex(
    (h) => h === "email" || h === "email address",
  );

  if (nameIdx === -1 || emailIdx === -1) {
    return {
      rows: [],
      errors: [
        `CSV must have "name" and "email" columns. Found: ${header.join(", ")}`,
      ],
    };
  }

  const rows = [];
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  lines.slice(1).forEach((line, i) => {
    if (!line.trim()) return;
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const name = cols[nameIdx] || "";
    const email = cols[emailIdx] || "";

    if (!name) {
      errors.push(`Row ${i + 2}: missing name`);
      return;
    }
    if (!email || !emailRegex.test(email)) {
      errors.push(`Row ${i + 2}: invalid email "${email}"`);
      return;
    }
    rows.push({ name, email: email.toLowerCase() });
  });

  return { rows, errors };
};

// ─────────────────────────────────────────────────────────────────────────────
const EmployeeUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState("csv"); // "csv" | "manual"
  const [dragging, setDragging] = useState(false);

  // CSV state
  const [csvFile, setCsvFile] = useState(null);
  const [csvRows, setCsvRows] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [csvParsed, setCsvParsed] = useState(false);

  // Manual state
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualList, setManualList] = useState([]);
  const [manualError, setManualError] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  // ── CSV drag-and-drop ───────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleFileSelect = (file) => {
    if (!file.name.endsWith(".csv")) {
      setCsvErrors(["Please upload a .csv file"]);
      return;
    }
    setCsvFile(file);
    setCsvParsed(false);
    setCsvRows([]);
    setCsvErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const { rows, errors } = parseCSV(e.target.result);
      setCsvRows(rows);
      setCsvErrors(errors);
      setCsvParsed(true);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const clearCSV = () => {
    setCsvFile(null);
    setCsvRows([]);
    setCsvErrors([]);
    setCsvParsed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Manual entry ────────────────────────────────────────────────────────────
  const addManual = () => {
    setManualError("");
    if (!manualName.trim()) {
      setManualError("Name is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail)) {
      setManualError("Valid email is required");
      return;
    }
    if (manualList.some((e) => e.email === manualEmail.toLowerCase())) {
      setManualError("This email is already in the list");
      return;
    }
    setManualList((prev) => [
      ...prev,
      { name: manualName.trim(), email: manualEmail.toLowerCase() },
    ]);
    setManualName("");
    setManualEmail("");
  };

  const removeManual = (email) =>
    setManualList((prev) => prev.filter((e) => e.email !== email));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const employees = tab === "csv" ? csvRows : manualList;
    if (employees.length === 0) {
      setSubmitError("No employees to upload");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await employerAPI.bulkAddEmployees({ employees });
      setResult(res);
    } catch (err) {
      setSubmitError(err.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const employees = tab === "csv" ? csvRows : manualList;
  const canSubmit =
    employees.length > 0 && (tab !== "csv" || csvErrors.length === 0);

  // ── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              name="CheckCircleIcon"
              size={32}
              className="text-emerald-600"
              variant="solid"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Employees Invited!
          </h2>
          <p className="text-slate-500 mb-6">
            They'll receive a welcome email with a link to activate their
            account.
          </p>
          <div className="bg-slate-50 rounded-xl p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Invited</span>
              <span className="font-bold text-emerald-600">
                {result.created}
              </span>
            </div>
            {result.skipped > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Already invited (skipped)
                </span>
                <span className="font-semibold text-slate-600">
                  {result.skipped}
                </span>
              </div>
            )}
          </div>
          {result.skippedEmails?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-amber-700 mb-2">
                Skipped (already invited):
              </p>
              <ul className="text-xs text-amber-600 space-y-1">
                {result.skippedEmails.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => navigate("/employer-dashboard/employees")}
            className="w-full py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-colors"
          >
            View All Employees
          </button>
          <button
            onClick={() => {
              setResult(null);
              clearCSV();
              setManualList([]);
            }}
            className="w-full py-2 mt-2 text-slate-500 text-sm hover:text-slate-700 transition-colors"
          >
            Upload More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm"
          >
            <Icon name="ArrowLeftIcon" size={16} /> Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Add Employees</h1>
          <p className="text-slate-500 mt-1">
            Upload a CSV file or add employees manually.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-5">
          <div className="flex border-b border-slate-100">
            {[
              { key: "csv", label: "CSV Upload", icon: "DocumentArrowUpIcon" },
              { key: "manual", label: "Manual Entry", icon: "PlusCircleIcon" },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                  tab === key
                    ? "bg-[#1C4D8D] text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon name={icon} size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── CSV Tab ── */}
            {tab === "csv" && (
              <div>
                {!csvParsed ? (
                  <>
                    {/* CSV template download */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-500">
                        Upload a CSV with{" "}
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                          name
                        </code>{" "}
                        and{" "}
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                          email
                        </code>{" "}
                        columns.
                      </p>
                      <a
                        href="data:text/csv;charset=utf-8,name,email%0AJohn%20Smith,john%40example.com%0AJane%20Doe,jane%40example.com"
                        download="employee_template.csv"
                        className="text-xs text-[#1C4D8D] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Icon name="ArrowDownTrayIcon" size={14} /> Download
                        template
                      </a>
                    </div>

                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                        dragging
                          ? "border-[#1C4D8D] bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        name="DocumentArrowUpIcon"
                        size={36}
                        className="text-slate-300 mx-auto mb-3"
                      />
                      <p className="font-semibold text-slate-700 mb-1">
                        Drop your CSV here or{" "}
                        <span className="text-[#1C4D8D]">browse</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        .csv files only · max 5MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Parse result */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon
                          name="DocumentTextIcon"
                          size={18}
                          className="text-slate-400"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          {csvFile?.name}
                        </span>
                      </div>
                      <button
                        onClick={clearCSV}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <Icon name="XMarkIcon" size={14} /> Remove
                      </button>
                    </div>

                    {csvErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold text-red-600 mb-2">
                          {csvErrors.length} error(s) found — fix your CSV and
                          re-upload:
                        </p>
                        <ul className="text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto">
                          {csvErrors.map((e, i) => (
                            <li key={i}>· {e}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {csvRows.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-slate-700">
                            {csvRows.length} valid employee
                            {csvRows.length !== 1 ? "s" : ""} ready to invite
                          </p>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            Ready
                          </span>
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Email
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {csvRows.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-4 py-2.5 text-slate-800">
                                    {row.name}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-500">
                                    {row.email}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Manual Tab ── */}
            {tab === "manual" && (
              <div>
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addManual()}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addManual()}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  {manualError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span>⚠</span>
                      {manualError}
                    </p>
                  )}

                  <button
                    onClick={addManual}
                    className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="PlusIcon" size={16} /> Add to list
                  </button>
                </div>

                {manualList.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {manualList.length} employee
                      {manualList.length !== 1 ? "s" : ""} to invite
                    </p>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {manualList.map((emp) => (
                            <tr key={emp.email} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 text-slate-800">
                                {emp.name}
                              </td>
                              <td className="px-4 py-2.5 text-slate-500">
                                {emp.email}
                              </td>
                              <td className="px-2 py-2.5">
                                <button
                                  onClick={() => removeManual(emp.email)}
                                  className="text-slate-300 hover:text-red-400 transition-colors"
                                >
                                  <Icon name="XMarkIcon" size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <Icon
              name="ExclamationCircleIcon"
              size={18}
              className="text-red-500 shrink-0"
            />
            <p className="text-sm text-red-600 font-medium">{submitError}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full py-4 bg-[#1C4D8D] text-white rounded-xl font-bold text-base hover:bg-[#163d71] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
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
              Sending invites...
            </>
          ) : (
            <>
              <Icon name="PaperAirplaneIcon" size={18} />
              Send Invites to {employees.length} Employee
              {employees.length !== 1 ? "s" : ""}
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Each employee will receive a welcome email with a link to activate
          their account.
        </p>
      </div>
    </div>
  );
};

export default EmployeeUpload;
