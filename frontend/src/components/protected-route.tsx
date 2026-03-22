// src/components/protected-route.tsx
import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { Spinner } from '@heroui/react';
import { UserRole } from '../contexts/auth-context';
import { useAuth } from '../contexts/auth-context';

interface ProtectedRouteProps extends Omit<RouteProps, 'component'> {
  component: React.ComponentType<any>;
  role?: UserRole | UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  role,
  ...rest
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  const checkRole = () => {
    if (!role || !user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-screen">
              <Spinner size="lg" color="primary" />
            </div>
          );
        }

        if (!isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }

        if (role && !checkRole()) {
          // Agar rol mos kelmasa, foydalanuvchini o'zining asosiy sahifasiga yo'naltirish
          if (user?.role === 'admin') {
            return <Redirect to="/admin/dashboard" />;
          }
          if (user?.role === 'doctor') {
            return <Redirect to="/doctor/dashboard" />;
          }
          return <Redirect to="/user/dashboard" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;