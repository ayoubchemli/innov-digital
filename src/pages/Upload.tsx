import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useDocuments,
  DocumentCategory,
  DocumentSensitivity,
} from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SecurityBadge from "@/components/SecurityBadge";
import { FileText, Lock, Upload as UploadIcon } from "lucide-react";

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { addDocument, isLoading } = useDocuments();

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [sensitivity, setSensitivity] =
    useState<DocumentSensitivity>("confidential");
  const [requireSignature, setRequireSignature] = useState(false);
  const [metadata, setMetadata] = useState({
    clientId: "",
    version: "",
    notes: "",
  });
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !user) return;

    setIsEncrypting(true);

    // For demo, we're encoding the file to base64 to simulate encryption
    const reader = new FileReader();

    reader.onload = () => {
      // Add the document with mock data
      const metadataObj = {
        clientId:
          metadata.clientId ||
          "AUTO-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        version: metadata.version || "1.0",
        notes: metadata.notes || "",
      };

      addDocument({
        name: fileName,
        ownerId: user.id,
        ownerName: user.name,
        category,
        sensitivity,
        uploadDate: new Date(),
        size: selectedFile.size,
        status: requireSignature ? "pending_signature" : "draft",
        sharedWith: [],
        isEncrypted: true,
        fileType: selectedFile.name.split(".").pop() || "",
        metadata: metadataObj,
        signatureRequired: requireSignature,
        content: reader.result as string,
      });

      // Redirect to documents page after upload
      setTimeout(() => {
        setIsEncrypting(false);
        navigate("/documents");
      }, 2000);
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
        <p className="text-muted-foreground">
          Securely upload and encrypt your documents
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>New Secure Document</CardTitle>
            <CardDescription>
              Files will be end-to-end encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-10 text-center">
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(selectedFile.size / 1024)} KB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileName("");
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-muted p-4">
                      <UploadIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF, Word, Excel, and other document formats supported
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Browse Files
                    </Button>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Document Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">Document Name</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as DocumentCategory)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="kyc">KYC</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensitivity">Sensitivity Level</Label>
                  <Select
                    value={sensitivity}
                    onValueChange={(value) =>
                      setSensitivity(value as DocumentSensitivity)
                    }
                  >
                    <SelectTrigger id="sensitivity">
                      <SelectValue placeholder="Select sensitivity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID (Optional)</Label>
                  <Input
                    id="clientId"
                    value={metadata.clientId}
                    onChange={(e) =>
                      setMetadata({ ...metadata, clientId: e.target.value })
                    }
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Document Version (Optional)</Label>
                  <Input
                    id="version"
                    value={metadata.version}
                    onChange={(e) =>
                      setMetadata({ ...metadata, version: e.target.value })
                    }
                    placeholder="1.0"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={metadata.notes}
                    onChange={(e) =>
                      setMetadata({ ...metadata, notes: e.target.value })
                    }
                    placeholder="Add any additional notes or context for this document..."
                    className="resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex items-center space-x-2">
                  <Checkbox
                    id="requireSignature"
                    checked={requireSignature}
                    onCheckedChange={(checked) =>
                      setRequireSignature(!!checked)
                    }
                  />
                  <Label
                    htmlFor="requireSignature"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    This document requires a signature
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <SecurityBadge
                status={isEncrypting ? "encrypting" : "secured"}
                className="inline-flex"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/documents")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isLoading || isEncrypting}
            >
              {isLoading || isEncrypting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Encrypting & Uploading...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Encrypt & Upload
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Upload;
