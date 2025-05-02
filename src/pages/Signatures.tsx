
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocuments } from "@/contexts/DocumentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertCircle, Signature, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const SignaturesPage = () => {
  const { documents, signDocument } = useDocuments();
  const { user } = useAuth();
  const [signingId, setSigningId] = useState<string | null>(null);
  
  // Get documents that need signatures
  const pendingSignatures = documents.filter(doc => 
    doc.status === "pending_signature" && doc.sharedWith.includes(user?.id || "")
  );
  
  // Get documents that have been signed
  const signedDocuments = documents.filter(doc => 
    doc.status === "signed" && doc.signedBy && doc.signedBy.includes(user?.name || "")
  );
  
  // Get documents sent for signature
  const sentForSignature = documents.filter(doc => 
    doc.ownerId === user?.id && doc.status === "pending_signature"
  );

  const handleSign = (documentId: string) => {
    setSigningId(documentId);
    
    // Simulate signature process
    setTimeout(() => {
      signDocument(documentId, user?.name || "");
      setSigningId(null);
    }, 2000);
  };

  // Render signature card for documents that need signing
  const renderSignatureCard = (document: typeof documents[0]) => {
    return (
      <Card key={document.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                {document.name}
              </CardTitle>
              <CardDescription className="mt-1">
                From {document.ownerName} • {format(new Date(document.uploadDate), "MMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              Awaiting Signature
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex items-center text-muted-foreground mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>Requested on {format(new Date(document.uploadDate), "MMMM d, yyyy")}</span>
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/30">
            <p className="font-medium text-foreground">Document Information:</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{document.category.charAt(0).toUpperCase() + document.category.slice(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client ID:</span>
                <span className="font-medium">{document.metadata.clientId || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium">{document.metadata.version || "1.0"}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to={`/documents/${document.id}`}>
              View Document
            </Link>
          </Button>
          <Button 
            onClick={() => handleSign(document.id)}
            disabled={signingId === document.id}
          >
            {signingId === document.id ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing...
              </>
            ) : (
              <>
                <Signature className="h-4 w-4 mr-2" />
                Sign Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Render card for signed documents
  const renderCompletedCard = (document: typeof documents[0]) => {
    return (
      <Card key={document.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                {document.name}
              </CardTitle>
              <CardDescription className="mt-1">
                From {document.ownerName} • {format(new Date(document.uploadDate), "MMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Signed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-green-600 dark:text-green-400 mb-4">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Signed on {format(new Date(Date.now() - 1000 * 60 * 60 * 24 * Math.floor(Math.random() * 7)), "MMMM d, yyyy")}</span>
          </div>
          
          <Link 
            to={`/documents/${document.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View signed document
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </CardContent>
      </Card>
    );
  };

  // Render tracking card for documents sent for signature
  const renderTrackingCard = (document: typeof documents[0]) => {
    return (
      <Card key={document.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                {document.name}
              </CardTitle>
              <CardDescription className="mt-1">
                Sent for signature • {format(new Date(document.uploadDate), "MMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              Awaiting Signature
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>Sent {format(new Date(document.uploadDate), "MMMM d, yyyy")}</span>
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="font-medium mb-2">Sent to:</div>
            <div className="space-y-2">
              {document.sharedWith.map((recipientId, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>
                    {recipientId === "2" ? "Jane Client" : `Recipient ${index + 1}`}
                  </span>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to={`/documents/${document.id}`}>
              View Document
            </Link>
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              // In a real app, this would send a reminder
              alert("Reminder sent to recipients");
            }}
          >
            Send Reminder
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Digital Signatures</h1>
        <p className="text-muted-foreground">
          Securely sign and track document signatures
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Signatures ({pendingSignatures.length})
          </TabsTrigger>
          <TabsTrigger value="tracking">
            Signature Tracking ({sentForSignature.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({signedDocuments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingSignatures.length > 0 ? (
              pendingSignatures.map(renderSignatureCard)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mb-2 font-semibold">No Documents Pending Your Signature</p>
                  <p className="text-muted-foreground text-sm">
                    When someone requests your signature on a document, it will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <div className="space-y-4">
            {sentForSignature.length > 0 ? (
              sentForSignature.map(renderTrackingCard)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mb-2 font-semibold">No Signature Requests Sent</p>
                  <p className="text-muted-foreground text-sm">
                    When you send a document for signature, you can track its status here.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/upload">
                      <Signature className="mr-2 h-4 w-4" />
                      Upload Document for Signature
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {signedDocuments.length > 0 ? (
              signedDocuments.map(renderCompletedCard)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mb-2 font-semibold">No Signed Documents</p>
                  <p className="text-muted-foreground text-sm">
                    Documents that you've signed will appear here for your reference.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignaturesPage;
