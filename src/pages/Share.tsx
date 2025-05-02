
import { useState } from "react";
import { useDocuments } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, Share, Lock, Mail } from "lucide-react";
import SecurityBadge from "@/components/SecurityBadge";

// Mock users data
const mockUsers = [
  { id: "user-1", name: "Alice Johnson", email: "alice@example.com", role: "Finance Manager" },
  { id: "user-2", name: "Bob Smith", email: "bob@example.com", role: "Legal Advisor" },
  { id: "user-3", name: "Carol White", email: "carol@example.com", role: "Client Representative" },
  { id: "user-4", name: "David Brown", email: "david@example.com", role: "External Auditor" },
  { id: "user-5", name: "Eva Green", email: "eva@example.com", role: "Compliance Officer" },
];

const SharePage = () => {
  const { documents, shareDocument } = useDocuments();
  const { toast } = useToast();
  
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [externalEmail, setExternalEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleCheckUser = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: checked
    }));
  };

  const handleShare = () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to share.",
        variant: "destructive",
      });
      return;
    }

    const selectedUserIds = Object.keys(selectedUsers).filter(id => selectedUsers[id]);
    if (selectedUserIds.length === 0 && !externalEmail) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    // Simulate sharing process
    setTimeout(() => {
      shareDocument(selectedDocument, selectedUserIds);
      
      if (externalEmail) {
        toast({
          title: "Secure email sent",
          description: `A secure link has been emailed to ${externalEmail}`,
        });
      }
      
      // Reset form
      setSelectedUsers({});
      setExternalEmail("");
      setIsSharing(false);
      
      toast({
        title: "Document shared successfully",
        description: "Recipients now have secure access to the document.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Share Documents</h1>
        <p className="text-muted-foreground">
          Securely share documents with internal and external users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="document">Document</Label>
              <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                <SelectTrigger id="document">
                  <SelectValue placeholder="Select a document to share" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-center pt-4">
              <SecurityBadge status="secured" />
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <div className="flex items-start">
                <Eye className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <p>Recipients will only be able to view the document in their secure portal</p>
              </div>
              <div className="flex items-start mt-2">
                <Lock className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <p>Documents remain encrypted during sharing and in recipient's vault</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Add Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="external-email">Share with External User</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="external-email"
                  type="email"
                  placeholder="Email address"
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  disabled={!externalEmail}
                  onClick={() => {
                    if (externalEmail) {
                      toast({
                        title: "Email added",
                        description: `${externalEmail} added to recipient list.`,
                      });
                    }
                  }}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                External users will receive a secure email link to view the document
              </p>
            </div>
            
            <div className="mt-4">
              <Label className="mb-2 block">Internal Users</Label>
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={!!selectedUsers[user.id]}
                            onCheckedChange={(checked) => handleCheckUser(user.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleShare}
          disabled={isSharing || (!selectedDocument || (Object.keys(selectedUsers).filter(id => selectedUsers[id]).length === 0 && !externalEmail))}
          className="min-w-[150px]"
        >
          {isSharing ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Sharing...
            </>
          ) : (
            <>
              <Share className="mr-2 h-4 w-4" />
              Share Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SharePage;
