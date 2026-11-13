import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ANALYST' | 'ADMIN' | 'ENGINEER')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const fullPath = location.pathname + location.search + location.hash;
    return <Navigate to={`/login?next=${encodeURIComponent(fullPath)}`} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
