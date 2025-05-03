import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocuments } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import SecurityBadge from "@/components/SecurityBadge";
import {
  FileText,
  Download,
  Share,
  Signature,
  ArrowLeft,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, signDocument } = useDocuments();
  const [document, setDocument] = useState(id ? getDocument(id) : undefined);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (id) {
      const doc = getDocument(id);
      setDocument(doc);

      if (doc) {
        // Simulate decryption process
        setTimeout(() => {
          setIsDecrypting(false);
        }, 1500);
      }
    }
  }, [id, getDocument]);

  const handleSignDocument = () => {
    if (!document) return;

    setIsSigning(true);

    // Simulate signing process
    setTimeout(() => {
      signDocument(document.id, "Current User");
      setIsSigning(false);

      // Update the document in state to reflect changes
      setDocument(getDocument(document.id));
    }, 2000);
  };

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Document Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The document you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/documents")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
      </div>
    );
  }

  const sensitivityColors = {
    public: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    confidential:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    restricted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const statusColors = {
    draft: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    pending_signature:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    signed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation back */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <SecurityBadge status={isDecrypting ? "decrypting" : "secured"} />
      </div>

      {/* Document title and metadata */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          {document.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge
            variant="outline"
            className={sensitivityColors[document.sensitivity]}
          >
            {document.sensitivity.charAt(0).toUpperCase() +
              document.sensitivity.slice(1)}
          </Badge>
          <Badge variant="outline" className={statusColors[document.status]}>
            {document.status
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </Badge>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(document.uploadDate), "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document viewer */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {isDecrypting ? (
                <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-4 text-muted-foreground">
                    Decrypting document...
                  </p>
                </div>
              ) : document.content ? (
                <div className="relative">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 to-transparent z-10"></div>
                  <div className="absolute top-4 left-4 opacity-30 text-lg font-bold select-none pointer-events-none z-20">
                    SECURED BY Confidex Exchange
                  </div>
                  <iframe
                    src={document.content}
                    className="w-full h-[60vh] border-0"
                    title={document.name}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] bg-muted/30">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Preview not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isDecrypting}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isDecrypting}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {document.status === "pending_signature" && (
              <Button
                onClick={handleSignDocument}
                disabled={isDecrypting || isSigning}
              >
                {isSigning ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing...
                  </>
                ) : (
                  <>
                    <Signature className="mr-2 h-4 w-4" />
                    Sign Document
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Document sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Document info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Document Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium">{document.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">
                      {Math.round(document.size / 1024)} KB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {document.fileType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Encrypted</span>
                    <span className="font-medium">
                      {document.isEncrypted ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Metadata</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">
                      {document.category.charAt(0).toUpperCase() +
                        document.category.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client ID</span>
                    <span className="font-medium">
                      {document.metadata.clientId || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">
                      {document.metadata.version || "1.0"}
                    </span>
                  </div>
                  {document.metadata.notes && (
                    <div className="pt-1">
                      <span className="text-muted-foreground">Notes</span>
                      <p className="font-medium mt-1 border-l-2 border-muted pl-2 text-sm">
                        {document.metadata.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity log */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <Eye className="h-3 w-3" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">
                      Viewed by {document.ownerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(Date.now() - 1000 * 60 * 30),
                        "MMM d, h:mm a"
                      )}
                    </p>
                  </div>
                </div>

                {document.status === "signed" && (
                  <div className="flex items-start gap-2">
                    <div className="bg-green-100 dark:bg-green-900 rounded-full p-1">
                      <Signature className="h-3 w-3 text-green-700 dark:text-green-300" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">
                        Signed by {document.signedBy && document.signedBy[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(Date.now() - 1000 * 60 * 60),
                          "MMM d, h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <div className="bg-muted rounded-full p-1">
                    <User className="h-3 w-3" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Shared with Jane Client</p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(Date.now() - 1000 * 60 * 120),
                        "MMM d, h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewDocument;
