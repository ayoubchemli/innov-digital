import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const UserProfileDialog = () => {
  const { user, updateUserProfile, isLoading, logout } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    organization: user?.organization || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateUserProfile({
        name: profileData.name,
        organization: profileData.organization,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };
  function handleLogOut() {
    logout();
    navigate("/auth");
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>
              {user ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
              <AvatarFallback className="text-xl">
                {getInitials(profileData.name)}
              </AvatarFallback>
            </Avatar>

            <Button variant="outline" size="sm" type="button">
              Change Avatar
            </Button>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profileData.email} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={profileData.organization}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    organization: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
              <div className="rounded-full bg-primary/10 p-1">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium">Role: </span>
                {user?.role === "admin" ? "Administrator" : "Client"}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded- p-3">
              <Button
                variant="destructive"
                type="button"
                className="w-full"
                onClick={handleLogOut}
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
