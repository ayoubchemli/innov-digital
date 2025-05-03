import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  // if (isAuthenticated) {
  //   console.log("User authenticated, redirecting from AuthLayout to /");
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
