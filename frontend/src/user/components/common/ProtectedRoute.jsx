import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser, membershipAPI } from "../../../services/api";

/**
 * Wraps a route so only authenticated users can access it.
 * Optionally restricts to specific roles.
 * Optionally enforces active membership for MEMBER roles.
 * Redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children, roles, requireMembership = false }) => {
  const token = getToken();
  const user = getUser();
  const userId = user?._id || user?.id || null;
  const userRole = user?.role?.toUpperCase();
  const location = useLocation();
  const [membershipLoading, setMembershipLoading] = useState(requireMembership);
  const [membershipActive, setMembershipActive] = useState(false);

  useEffect(() => {
    if (!requireMembership) return;

    if (userRole !== "MEMBER") {
      setMembershipLoading(false);
      setMembershipActive(false);
      return;
    }

    let isMounted = true;
    setMembershipLoading(true);
    membershipAPI
      .getMy()
      .then((membership) => {
        if (!isMounted) return;
        const status = String(membership?.status || "").toUpperCase();
        setMembershipActive(status === "ACTIVE");
      })
      .catch(() => {
        if (!isMounted) return;
        setMembershipActive(false);
      })
      .finally(() => {
        if (!isMounted) return;
        setMembershipLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requireMembership, userId, userRole]);

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    if (!roles.map((r) => r.toUpperCase()).includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  if (requireMembership) {
    if (userRole === "MEMBER" && membershipLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (userRole === "MEMBER" && !membershipActive) {
      return (
        <Navigate
          to="/membership"
          state={{ from: location, reason: "subscribe" }}
          replace
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
