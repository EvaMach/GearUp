import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading state while auth is initializing
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
