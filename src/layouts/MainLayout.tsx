import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">
            Loading secure environment...
          </p>
        </div>
      </div>
    );
  }

  // if (!isAuthenticated) {
  //   console.log(
  //     "User not authenticated, redirecting from MainLayout to /login"
  //   );
  //   navigate("/login", { state: { from: location }, replace: true });
  //   return null;
  // }

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
