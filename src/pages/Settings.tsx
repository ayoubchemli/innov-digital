import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Badge, Fingerprint, Lock, Shield, User } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  const { user, updateUserProfile, beginBiometricRegistration } =
    useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    organization: user?.organization || "",
  });

  const [security, setSecurity] = useState({
    mfaEnabled: true,
    biometricsEnabled: user?.biometricsEnabled || false,
    notificationsEnabled: true,
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

  const handlePhysicalAuthSetup = () => {
    toast.info(
      "Setting up physical authentication... Please tap your NFC badge when prompted",
      {
        duration: 5000,
      }
    );

    // Simulate badge setup
    setTimeout(() => {
      toast.success("Physical authentication device registered successfully", {
        duration: 5000,
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and security preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {user?.role === "admin" && (
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePersonalInfoSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={personalInfo.email}
                        disabled
                        placeholder="your.email@example.com"
                      />
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
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure your account security and authentication preferences
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
                      <Shield className="h-4 w-4 text-muted-foreground" />
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
                      setSecurity((prev) => ({ ...prev, mfaEnabled: checked }))
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
                    <Button variant="outline" onClick={handleEnableBiometrics}>
                      Enable
                    </Button>
                  )}
                </div>

                {user?.role === "admin" && (
                  <>
                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge className="h-4 w-4 text-muted-foreground" />
                          <Label>Physical Authentication</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Configure NFC badge for physical access
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handlePhysicalAuthSetup}
                      >
                        Setup Badge
                      </Button>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">
                      Security Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts about suspicious account activities
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={security.notificationsEnabled}
                    onCheckedChange={(checked) =>
                      setSecurity((prev) => ({
                        ...prev,
                        notificationsEnabled: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "admin" && (
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure system-wide security policies and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Document Retention Policy</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">Configure Policy</Button>
                    <Button variant="outline">View Audit Logs</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>API Keys & Integrations</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline">Manage API Keys</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Backup & Export</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">Configure Backup</Button>
                    <Button variant="outline">Export Data</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
