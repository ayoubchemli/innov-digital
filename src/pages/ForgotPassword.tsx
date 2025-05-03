import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { ArrowLeft, Mail } from "lucide-react";
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

const ForgotPassword = () => {
  const { requestPasswordReset, isLoading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to request password reset");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-vault">
      <CardHeader className="space-y-1">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/login">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <CardTitle className="text-xl font-bold text-center flex-grow">
            Reset Password
          </CardTitle>
        </div>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!submitted ? (
          <form onSubmit={handleSubmit}>
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

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="text-lg font-medium mb-2">Check your email</h3>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to {email}. Please check your
              inbox and follow the instructions.
            </p>
            <Button variant="outline" asChild>
              <Link to="/login">Return to Login</Link>
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col">
        <div className="text-center text-xs text-muted-foreground mt-2">
          Protected by Confidex Exchange E2EE Technology
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;
