import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Documents from "./pages/Documents";
import Upload from "./pages/Upload";
import Share from "./pages/Share";
import Signatures from "./pages/Signatures";
import ViewDocument from "./pages/ViewDocument";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Forms from "./pages/Forms";
import FormDesigner from "./pages/FormDesigner";
import ClientProfile from "./pages/ClientProfile";

// Context providers
import { AuthProvider } from "./contexts/AuthContext";
import { DocumentProvider } from "./contexts/DocumentContext";

// Layout components
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DocumentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Protected routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/documents/:id" element={<ViewDocument />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/share" element={<Share />} />
                <Route path="/signatures" element={<Signatures />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/forms/create" element={<FormDesigner />} />
                <Route path="/forms/:id" element={<FormDesigner />} />
                <Route path="/forms/:id/edit" element={<FormDesigner />} />
                <Route path="/profile" element={<ClientProfile />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DocumentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
