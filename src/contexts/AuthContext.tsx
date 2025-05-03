import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import {
  AuthorizerProvider,
  useAuthorizer,
} from "@authorizerdev/authorizer-react";
import { AuthToken, User } from "@authorizerdev/authorizer-js";

export type UserRole = "admin" | "client";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl: string;
  hasMfaEnabled: boolean;
}

interface AuthContextType {
  user: Partial<LocalUser> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthToken | void) => Promise<void>;
  logout: () => void;
  hasMfaEnabled: boolean;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUserProfile: (userData: Partial<LocalUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: LocalUser[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@securevault.com",
    role: "admin",
    organization: "Secure Vault Inc.",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    hasMfaEnabled: false,
  },
  {
    id: "2",
    name: "Jane Client",
    email: "client@example.com",
    role: "client",
    organization: "Example Corp",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    hasMfaEnabled: true,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Partial<LocalUser> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast: uiToast } = useToast();
  const [hasMfaEnabled] = useState<boolean>(true); // For demo, always require MFA

  const { loading, user: authUser, token } = useAuthorizer();

  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        name: authUser.family_name
          ? authUser.family_name + " " + authUser.given_name
            ? authUser.given_name
            : authUser.preferred_username
          : authUser.preferred_username,
        email: authUser.email,
        // role: "client",
        // organization: "Example Corp",
        avatarUrl: "https://i.pravatar.cc/150?img=5",
        hasMfaEnabled: false,
      });
    }
    setIsLoading(false);
  }, [authUser]);
  const login = async (data: AuthToken | void) => {
    setIsLoading(true);
    if (!data) {
      uiToast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid credentials",
      });
      setIsLoading(false);
      return;
    }
    if (!data.user) {
      uiToast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid credentials",
      });
      setIsLoading(false);
      return;
    }
    setUser({
      id: data.user.id,
      name: data.user.family_name
        ? data.user.family_name + " " + data.user.given_name
          ? data.user.given_name
          : data.user.preferred_username
        : data.user.preferred_username,
      email: data.user.email,
    });
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  // Password reset functionality
  const requestPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if email exists
      const userExists = mockUsers.some((u) => u.email === email);
      if (!userExists) {
        throw new Error("No account found with this email address");
      }

      toast.success(
        "Password reset email sent. Check your inbox for instructions"
      );
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

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate token (in a real app, this would be server-side)
      if (token !== "valid-token") {
        throw new Error("Invalid or expired password reset token");
      }

      // In a real app, we would update the user's password in the database

      toast.success(
        "Password has been reset successfully. You can now login with your new password"
      );
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
    <AuthorizerProvider
      config={{
        authorizerURL: import.meta.env.VITE_AUTH_URL,
        redirectURL: "/auth",
        clientID: import.meta.env.VITE_CLIENT_ID,
      }}
    >
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          isLoading,
          login,
          logout,
          hasMfaEnabled,
          requestPasswordReset,
          resetPassword,
          updateUserProfile,
        }}
      >
        {children}
      </AuthContext.Provider>
    </AuthorizerProvider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
