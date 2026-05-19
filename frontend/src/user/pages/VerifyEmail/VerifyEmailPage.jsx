import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { authAPI } from "../../../services/api";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState(token ? "loading" : "idle");
  const [message, setMessage] = useState("");

  const heading = useMemo(() => {
    if (status === "loading") return "Verifying your email";
    if (status === "success") return "Email verified";
    if (status === "error") return "Verification failed";
    return "Check your email";
  }, [status]);

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage("Your email is verified. You can log in to continue.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.message || "We could not verify that link. Please try again.",
        );
      }
    };

    run();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0D1328] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full bg-white/5 backdrop-blur-md rounded-3xl p-10 border border-white/10 shadow-xl text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 bg-[#D4AF37]/10 text-[#D4AF37]">
          <Icon name="EnvelopeIcon" size={28} />
        </div>

        <h1 className="font-heading text-3xl font-bold text-white mb-3">
          {heading}
        </h1>

        {status === "loading" && (
          <p className="text-slate-300">
            One moment while we confirm your email.
          </p>
        )}

        {status === "idle" && (
          <div className="text-slate-300 space-y-3">
            <p>
              We sent a verification link to
              {email ? ` ${email}` : " your email"}.
            </p>
            <p className="text-sm text-slate-300">
              Open the email and click the link to verify your account. Then log
              in to complete payment.
            </p>
          </div>
        )}

        {status === "success" && <p className="text-slate-300">{message}</p>}

        {status === "error" && <p className="text-red-600">{message}</p>}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-[#D4AF37] text-white font-semibold hover:bg-[#0F2854] transition-colors"
          >
            Go to Login
          </Link>
          <Link
            to="/sign-up"
            className="px-6 py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:border-[#1C4D8D] hover:text-[#D4AF37] transition-colors"
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
