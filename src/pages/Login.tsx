
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Fingerprint, Lock, Mail, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SecurityBadge from "@/components/SecurityBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, hasMfaEnabled, hasBiometricsEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState("");
  const [authMethod, setAuthMethod] = useState<"password" | "biometrics">("password");

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authMethod === "password" && (!email || !password)) {
      setError("Email and password are required");
      return;
    }

    try {
      if (authMethod === "biometrics") {
        await login(email, "", undefined, true);
        navigate(from, { replace: true });
        return;
      }

      await login(email, password, showMfa ? mfaCode : undefined);
      // After successful login, explicitly navigate to the home route
      console.log("Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.needsMfa) {
        setShowMfa(true);
      } else {
        setError(err.message || "Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <Card className="w-full max-w-md shadow-vault">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">SecureVault</CardTitle>
        <CardDescription className="text-center">
          Secure Document Exchange Platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showMfa && (
          <Tabs defaultValue="password" className="w-full" onValueChange={(value) => setAuthMethod(value as "password" | "biometrics")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="biometrics" disabled={!hasBiometricsEnabled}>Biometrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password" className="mt-4">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="biometrics" className="mt-4">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="biometric-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="biometric-email"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center py-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-24 w-24 rounded-full flex flex-col items-center justify-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogin(e);
                      }}
                      disabled={isLoading || !email}
                    >
                      <Fingerprint className="h-10 w-10" />
                      <span className="text-xs">Verify</span>
                    </Button>
                  </div>
                  
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}
                </div>
              </form>
              
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p>You can use biometric authentication if you have previously enabled it</p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {showMfa && (
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfaCode">Two-Factor Authentication Code</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter the 6-digit code from your authenticator app
                </p>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mfaCode"
                    placeholder="123456"
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="pl-10"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>For demo purposes, use code: 123456</p>
                </div>
              </div>
              
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || mfaCode.length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>
        )}

        {!showMfa && hasMfaEnabled && (
          <div className="flex justify-center mt-2">
            <SecurityBadge status="secured" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-center text-xs text-muted-foreground mt-2">
          Protected by SecureVault E2EE Technology
        </div>
      </CardFooter>
    </Card>
  );
};

export default Login;
