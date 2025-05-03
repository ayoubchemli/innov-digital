import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { FileText, Fingerprint, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const ClientProfile = () => {
  const { user, updateUserProfile, beginBiometricRegistration } =
    useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    organization: user?.organization || "",
    phone: "+1 555-123-4567",
    address: "123 Main Street, Suite 100\nNew York, NY 10001",
  });

  const [security, setSecurity] = useState({
    mfaEnabled: true,
    biometricsEnabled: user?.biometricsEnabled || false,
    notificationsEnabled: true,
    emailNotifications: true,
  });

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUserProfile({
        name: personalInfo.name,
        organization: personalInfo.organization,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableBiometrics = async () => {
    const success = await beginBiometricRegistration();
    if (success) {
      setSecurity((prev) => ({ ...prev, biometricsEnabled: true }));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground">
            Manage your personal information and security settings
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Avatar and basic info */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="text-4xl">
                {user ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{user?.name}</h3>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-sm">{user?.organization}</p>
            <div className="mt-2 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {user?.role === "admin" ? "Administrator" : "Client"}
            </div>

            <Button variant="outline" className="mt-6 w-full">
              Change Profile Picture
            </Button>

            <Separator className="my-6" />

            <div className="w-full text-left">
              <h4 className="font-medium mb-4">Account Statistics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Documents</span>
                  </div>
                  <span className="text-sm font-medium">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    <span className="text-sm">Forms Submitted</span>
                  </div>
                  <span className="text-sm font-medium">3</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    <span className="text-sm">Pending Signatures</span>
                  </div>
                  <span className="text-sm font-medium">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:w-2/3 space-y-6">
          <Tabs defaultValue="personal-info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="personal-info">
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="personal-info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handlePersonalInfoSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            value={personalInfo.name}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Your full name"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            value={personalInfo.email}
                            className="pl-10"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={personalInfo.organization}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            organization: e.target.value,
                          }))
                        }
                        placeholder="Company or organization name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={personalInfo.phone}
                            onChange={(e) =>
                              setPersonalInfo((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="Your phone number"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={personalInfo.address}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Your address"
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <Label>Password</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Change your account password
                        </p>
                      </div>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-muted-foreground"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          </svg>
                          <Label htmlFor="mfa">
                            Two-Factor Authentication (2FA)
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Require a verification code when logging in
                        </p>
                      </div>
                      <Switch
                        id="mfa"
                        checked={security.mfaEnabled}
                        onCheckedChange={(checked) =>
                          setSecurity((prev) => ({
                            ...prev,
                            mfaEnabled: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="biometrics">
                            Biometric Authentication
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Use fingerprint or face recognition to login
                        </p>
                      </div>
                      {security.biometricsEnabled ? (
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-medium text-green-600 dark:text-green-400">
                            Enabled
                          </div>
                          <Switch
                            id="biometrics"
                            checked={security.biometricsEnabled}
                            onCheckedChange={(checked) =>
                              setSecurity((prev) => ({
                                ...prev,
                                biometricsEnabled: checked,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleEnableBiometrics}
                        >
                          Enable
                        </Button>
                      )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Device Management</Label>
                        <p className="text-sm text-muted-foreground">
                          Manage devices that have access to your account
                        </p>
                      </div>
                      <Button variant="outline">Manage Devices</Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Account Activity</Label>
                        <p className="text-sm text-muted-foreground">
                          View your account activity and login history
                        </p>
                      </div>
                      <Button variant="outline">View Activity</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Email Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="email-security"
                          className="flex flex-col space-y-1"
                        >
                          <span>Security Alerts</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Receive emails about security events
                          </span>
                        </Label>
                        <Switch
                          id="email-security"
                          checked={security.emailNotifications}
                          onCheckedChange={(checked) =>
                            setSecurity((prev) => ({
                              ...prev,
                              emailNotifications: checked,
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="email-documents"
                          className="flex flex-col space-y-1"
                        >
                          <span>Document Sharing</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Get notified when someone shares a document with you
                          </span>
                        </Label>
                        <Switch id="email-documents" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="email-signatures"
                          className="flex flex-col space-y-1"
                        >
                          <span>Signature Requests</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Get notified about signature requests
                          </span>
                        </Label>
                        <Switch id="email-signatures" defaultChecked />
                      </div>
                    </div>

                    <Separator />

                    <h4 className="text-sm font-medium">
                      In-App Notifications
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="app-security"
                          className="flex flex-col space-y-1"
                        >
                          <span>Security Alerts</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Show security notifications in-app
                          </span>
                        </Label>
                        <Switch id="app-security" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="app-documents"
                          className="flex flex-col space-y-1"
                        >
                          <span>Document Updates</span>
                          <span className="font-normal text-xs text-muted-foreground">
                            Show notifications for document changes
                          </span>
                        </Label>
                        <Switch id="app-documents" defaultChecked />
                      </div>
                    </div>

                    <Button>Save Notification Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
