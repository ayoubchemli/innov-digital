import React, { useState, useEffect } from "react"; // Import React and useEffect
import { useNavigate, useLocation, Link, NavLink } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext"; // Assuming AuthContext is updated
import { Fingerprint, Lock, Mail, ShieldCheck, LogIn } from "lucide-react"; // Added LogIn, ShieldCheck
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"; // Using sonner for toasts
import { Authorizer } from "@authorizerdev/authorizer-react";

// Placeholder for the new function needed in AuthContext
// You'll need to add this function to your AuthContext implementation
interface ExtendedAuthContextType extends ReturnType<typeof useAuthContext> {
  loginWithBiometrics?: (email: string) => Promise<void>;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Ensure useAuth returns the extended type with loginWithBiometrics
  const {
    login,
    loginWithBiometrics, // *** Add this function to your AuthContext ***
    isLoading,
    isAuthenticated, // Check if already authenticated
  } = useAuthContext() as ExtendedAuthContextType; // Cast for the new function

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"password" | "biometrics">(
    "password"
  );

  const from = location.state?.from?.pathname || "/"; // Default to dashboard or appropriate route

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handlePasswordLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      // await login(email, password);
      // Login function in context now handles potential 2nd factor (WebAuthn)
      // If successful, navigation happens automatically or via useEffect
      toast.success("Login Successful!");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Password login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  // const handleBiometricLogin = async (e?: React.FormEvent) => {
  //   e?.preventDefault();
  //   setError("");

  //   if (!email) {
  //     setError(
  //       "Email is required to identify your account for biometric login."
  //     );
  //     return;
  //   }

  //   if (!loginWithBiometrics) {
  //     setError("Biometric login function is not available in AuthContext.");
  //     console.error("loginWithBiometrics function missing in AuthContext");
  //     return;
  //   }
  //   if (!webAuthnSupported) {
  //     setError(
  //       "Your browser or device does not support biometric authentication."
  //     );
  //     return;
  //   }

  //   try {
  //     toast.info(
  //       "Please verify using your device biometric (Face ID, Touch ID, Windows Hello...)"
  //     );
  //     await loginWithBiometrics(email);
  //     // If successful, context should set user and tokens
  //     toast.success("Biometric Login Successful!");
  //     navigate(from, { replace: true });
  //   } catch (err: any) {
  //     console.error("Biometric login failed:", err);
  //     // Handle specific WebAuthn errors if possible
  //     if (err.name === "NotAllowedError") {
  //       setError("Biometric authentication was cancelled or not allowed.");
  //     } else {
  //       setError(
  //         err.message ||
  //           "Biometric login failed. Ensure biometrics are set up for this account."
  //       );
  //     }
  //   }
  // };

  // const handleOAuth = async () => {
  //   setError("");
  //   try {
  //     await initiateOAuthLogin();
  //     // User will be redirected to OAuth provider
  //   } catch (err: any) {
  //     console.error("OAuth initiation failed:", err);
  //     setError(err.message || "Could not start the OAuth login process.");
  //   }
  // };

  return (
    <Card className="w-full max-w-[50vw] shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 p-4 border-b border-gray-200 flex flex-row justify-between">
        <div className="flex justify-center items-center">
          <div className="rounded-full bg-primary/10 p-3 border border-primary/20 shadow-sm">
            <ShieldCheck className="h-14 w-14 text-primary" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Confidex Exchange
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Secure Document Exchange Platform
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Authorizer
          onLogin={(data) => {
            login(data);
            navigate(from, { replace: true });
          }}
          onSignup={(data) => {
            console.log("Signed up via Authorizer UI", data);
            // navigate("/");
          }}
        />
      </CardContent>
    </Card>
  );
};

export default Login;
