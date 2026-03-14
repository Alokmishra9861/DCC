import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthcallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next") || "/member-dashboard";
    // OAuth provider integration is not configured. Redirect to login.
    navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default AuthcallbackPage;
