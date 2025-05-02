
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading secure environment...</p>
        </div>
      </div>
    );
  }

  // Allow access to protected routes even when not authenticated
  // This is not recommended for production use but allows direct access for testing
  console.log("Authentication status:", isAuthenticated ? "Authenticated" : "Not authenticated");
  console.log("Allowing access to protected routes without authentication");

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
