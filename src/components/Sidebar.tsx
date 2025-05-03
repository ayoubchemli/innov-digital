import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Archive,
  FileText,
  Home,
  Lock,
  Upload,
  Users,
  Signature,
  File,
  FileQuestion,
  Settings,
  User,
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon: Icon, label, active }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthContext();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-sidebar flex flex-col h-full border-r border-sidebar-border">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">
            Confidex Exchange
          </span>
        </Link>
      </div>

      <div className="px-3 py-2">
        <div className="text-xs font-semibold text-sidebar-foreground/50 mb-2 px-3">
          MENU
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem
            to="/"
            icon={Home}
            label="Dashboard"
            active={isActive("/")}
          />
          <NavItem
            to="/documents"
            icon={FileText}
            label="Documents"
            active={isActive("/documents")}
          />
          <NavItem
            to="/upload"
            icon={Upload}
            label="Upload"
            active={isActive("/upload")}
          />
          <NavItem
            to="/share"
            icon={Users}
            label="Sharing"
            active={isActive("/share")}
          />
          <NavItem
            to="/signatures"
            icon={Signature}
            label="Signatures"
            active={isActive("/signatures")}
          />
          <NavItem
            to="/forms"
            icon={FileQuestion}
            label="Forms"
            active={isActive("/forms")}
          />
        </nav>
      </div>

      <div className="px-3 py-2 mt-2">
        <div className="text-xs font-semibold text-sidebar-foreground/50 mb-2 px-3">
          ACCOUNT
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem
            to="/profile"
            icon={User}
            label="My Profile"
            active={isActive("/profile")}
          />
          <NavItem
            to="/settings"
            icon={Settings}
            label="Settings"
            active={isActive("/settings")}
          />
        </nav>
      </div>

      {user?.role === "admin" && (
        <div className="px-3 py-2 mt-4">
          <div className="text-xs font-semibold text-sidebar-foreground/50 mb-2 px-3">
            ADMIN
          </div>
          <nav className="flex flex-col gap-1">
            <NavItem
              to="/users"
              icon={Users}
              label="User Management"
              active={isActive("/users")}
            />
            <NavItem
              to="/audit"
              icon={Archive}
              label="Audit Logs"
              active={isActive("/audit")}
            />
          </nav>
        </div>
      )}

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="rounded-md bg-sidebar-accent/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-sidebar-accent-foreground" />
            <span className="text-xs font-medium text-sidebar-accent-foreground">
              Security Status
            </span>
          </div>
          <div className="text-xs text-sidebar-foreground/70">
            End-to-end encryption active. Files are securely encrypted.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
