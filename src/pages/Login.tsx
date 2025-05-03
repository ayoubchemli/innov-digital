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
import { Separator } from "@/components/ui/separator"; // Import Separator
import { toast } from "sonner"; // Using sonner for toasts

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
    initiateOAuthLogin,
    loginWithBiometrics, // *** Add this function to your AuthContext ***
    isLoading,
    webAuthnSupported,
    isAuthenticated, // Check if already authenticated
  } = useAuthContext() as ExtendedAuthContextType; // Cast for the new function

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"password" | "biometrics">(
    "password"
  );

  const from = location.state?.from?.pathname || "/dashboard"; // Default to dashboard or appropriate route

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
      await login(email, password);
      // Login function in context now handles potential 2nd factor (WebAuthn)
      // If successful, navigation happens automatically or via useEffect
      toast.success("Login Successful!");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Password login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  const handleBiometricLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    if (!email) {
      setError(
        "Email is required to identify your account for biometric login."
      );
      return;
    }

    if (!loginWithBiometrics) {
      setError("Biometric login function is not available in AuthContext.");
      console.error("loginWithBiometrics function missing in AuthContext");
      return;
    }
    if (!webAuthnSupported) {
      setError(
        "Your browser or device does not support biometric authentication."
      );
      return;
    }

    try {
      toast.info(
        "Please verify using your device biometric (Face ID, Touch ID, Windows Hello...)"
      );
      await loginWithBiometrics(email);
      // If successful, context should set user and tokens
      toast.success("Biometric Login Successful!");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Biometric login failed:", err);
      // Handle specific WebAuthn errors if possible
      if (err.name === "NotAllowedError") {
        setError("Biometric authentication was cancelled or not allowed.");
      } else {
        setError(
          err.message ||
            "Biometric login failed. Ensure biometrics are set up for this account."
        );
      }
    }
  };

  const handleOAuth = async () => {
    setError("");
    try {
      await initiateOAuthLogin();
      // User will be redirected to OAuth provider
    } catch (err: any) {
      console.error("OAuth initiation failed:", err);
      setError(err.message || "Could not start the OAuth login process.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 p-6 border-b border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3 border border-primary/20 shadow-sm">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center text-gray-800">
          Confidex Exchange
        </CardTitle>
        <CardDescription className="text-center text-gray-500">
          Secure Document Exchange Platform
        </CardDescription>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "password" | "biometrics")
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-gray-100 p-1">
          <TabsTrigger
            value="password"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
          >
            Password
          </TabsTrigger>
          <TabsTrigger
            value="biometrics"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
            disabled={!webAuthnSupported}
          >
            Biometrics {webAuthnSupported ? "✓" : "✕"}
          </TabsTrigger>
        </TabsList>

        <CardContent className="p-6 space-y-4">
          <TabsContent value="password" className="mt-0 border-0 p-0">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-pass" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-pass"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading && activeTab === "password" ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="biometrics" className="mt-0 border-0 p-0">
            {/* Using a button click handler instead of form submit for biometrics */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-bio" className="text-gray-700">
                  Account Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-bio"
                    placeholder="Enter email to find account"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                    autoComplete="email"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 pt-1">
                  Enter your email, then click the button below to verify with
                  biometrics.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="button" // Important: type="button" to prevent form submission
                  variant="outline"
                  size="lg"
                  className="h-20 w-20 rounded-full flex flex-col items-center justify-center gap-1 border-2 border-primary/50 hover:border-primary hover:bg-primary/5 text-primary shadow-sm"
                  onClick={handleBiometricLogin}
                  disabled={isLoading || !email || !webAuthnSupported}
                  aria-label="Sign in with biometrics"
                >
                  <Fingerprint className="h-8 w-8" />
                  <span className="text-xs">Verify</span>
                </Button>
              </div>
              {isLoading && activeTab === "biometrics" && (
                <div className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Waiting for verification...</span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Common Error Display */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/30">
              {error}
            </div>
          )}
        </CardContent>
      </Tabs>

      <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 w-full">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Login;
