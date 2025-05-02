
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import NotificationsPopover from "@/components/NotificationsPopover";
import SearchDialog from "@/components/SearchDialog";
import UserProfileDialog from "@/components/UserProfileDialog";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="border-b border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <SearchDialog />
        </div>

        <div className="flex items-center space-x-4">
          <NotificationsPopover />
          
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          <UserProfileDialog />
        </div>
      </div>
    </header>
  );
};

export default Header;
