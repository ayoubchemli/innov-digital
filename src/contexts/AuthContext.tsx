
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export type UserRole = "admin" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl: string;
  biometricsEnabled: boolean;
  hasMfaEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, mfaCode?: string, useBiometrics?: boolean) => Promise<void>;
  logout: () => void;
  hasMfaEnabled: boolean;
  hasBiometricsEnabled: boolean;
  beginBiometricRegistration: () => Promise<boolean>;
  verifyBiometrics: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@securevault.com",
    role: "admin",
    organization: "Secure Vault Inc.",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    biometricsEnabled: false,
    hasMfaEnabled: true
  },
  {
    id: "2",
    name: "Jane Client",
    email: "client@example.com",
    role: "client",
    organization: "Example Corp",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    biometricsEnabled: false,
    hasMfaEnabled: true
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast: uiToast } = useToast();
  const [hasMfaEnabled] = useState<boolean>(true); // For demo, always require MFA
  const [hasBiometricsEnabled, setHasBiometricsEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check for saved auth session
    const savedUser = localStorage.getItem("vault_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        
        // Check if biometrics is available
        if ('PublicKeyCredential' in window) {
          setHasBiometricsEnabled(true);
        }
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        localStorage.removeItem("vault_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, mfaCode?: string, useBiometrics: boolean = false) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation - in a real app this would be a secure API call
      const mockUser = mockUsers.find(u => u.email === email);
      
      if (!mockUser || password !== "password") {
        throw new Error("Invalid credentials");
      }
      
      // If MFA is enabled and no code provided, prompt for MFA
      if (hasMfaEnabled && !mfaCode && !useBiometrics) {
        setIsLoading(false);
        return Promise.reject({ needsMfa: true });
      }
      
      // If using MFA code and it's incorrect
      if (hasMfaEnabled && mfaCode && mfaCode !== "123456") {
        throw new Error("Invalid MFA code");
      }

      // If using biometrics, verify
      if (useBiometrics) {
        try {
          const biometricsVerified = await verifyBiometrics();
          if (!biometricsVerified) {
            throw new Error("Biometric verification failed");
          }
        } catch (error) {
          throw new Error("Biometric verification failed");
        }
      }
      
      // Set the user in state and localStorage
      setUser(mockUser);
      localStorage.setItem("vault_user", JSON.stringify(mockUser));
      
      uiToast({
        title: "Login successful",
        description: `Welcome back, ${mockUser.name}!`,
      });
      
      return Promise.resolve();
      
    } catch (error) {
      let message = "An error occurred during login";
      if (error instanceof Error) {
        message = error.message;
      }
      uiToast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vault_user");
    uiToast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // WebAuthn biometrics implementation (demo)
  const beginBiometricRegistration = async (): Promise<boolean> => {
    if (!('PublicKeyCredential' in window)) {
      toast.error("Your browser doesn't support WebAuthn/FIDO2");
      return false;
    }
    
    try {
      // Simulate registration
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would:
      // 1. Make an API call to get registration challenge from server
      // 2. Call navigator.credentials.create() with the challenge
      // 3. Send the result back to the server to verify and store
      
      // For demo purposes, just simulate success
      if (user) {
        const updatedUser = { ...user, biometricsEnabled: true };
        setUser(updatedUser);
        localStorage.setItem("vault_user", JSON.stringify(updatedUser));
        
        toast.success("Biometric authentication enabled");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Biometric registration failed:", error);
      toast.error("Failed to register biometrics");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBiometrics = async (): Promise<boolean> => {
    if (!('PublicKeyCredential' in window)) {
      toast.error("Your browser doesn't support WebAuthn/FIDO2");
      return false;
    }
    
    try {
      // Simulate verification
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would:
      // 1. Make an API call to get authentication challenge from server
      // 2. Call navigator.credentials.get() with the challenge
      // 3. Send the result back to the server to verify
      
      // For demo purposes, just simulate success
      return true;
    } catch (error) {
      console.error("Biometric verification failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset functionality
  const requestPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email exists
      const userExists = mockUsers.some(u => u.email === email);
      if (!userExists) {
        throw new Error("No account found with this email address");
      }
      
      toast.success("Password reset email sent. Check your inbox for instructions");
    } catch (error) {
      let message = "Failed to request password reset";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate token (in a real app, this would be server-side)
      if (token !== "valid-token") {
        throw new Error("Invalid or expired password reset token");
      }
      
      // In a real app, we would update the user's password in the database
      
      toast.success("Password has been reset successfully. You can now login with your new password");
    } catch (error) {
      let message = "Failed to reset password";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem("vault_user", JSON.stringify(updatedUser));
        
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      let message = "Failed to update profile";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasMfaEnabled,
      hasBiometricsEnabled,
      beginBiometricRegistration,
      verifyBiometrics,
      requestPasswordReset,
      resetPassword,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
