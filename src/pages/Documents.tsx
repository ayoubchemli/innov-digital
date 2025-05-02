
import { useState } from "react";
import { useDocuments, DocumentCategory, DocumentSensitivity } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentCard from "@/components/DocumentCard";
import { Link } from "react-router-dom";
import { Upload, Search } from "lucide-react";

const Documents = () => {
  const { documents } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all");
  const [selectedSensitivity, setSelectedSensitivity] = useState<DocumentSensitivity | "all">("all");

  const filteredDocuments = documents.filter(doc => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.metadata.clientId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    
    // Filter by sensitivity
    const matchesSensitivity = selectedSensitivity === "all" || doc.sensitivity === selectedSensitivity;
    
    return matchesSearch && matchesCategory && matchesSensitivity;
  });

  // Divide documents by status
  const allDocuments = filteredDocuments;
  const draftDocuments = filteredDocuments.filter(doc => doc.status === 'draft');
  const pendingDocuments = filteredDocuments.filter(doc => doc.status === 'pending_signature');
  const signedDocuments = filteredDocuments.filter(doc => doc.status === 'signed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          View and manage your secure documents
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as DocumentCategory | "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="contract">Contracts</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="kyc">KYC</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={selectedSensitivity}
            onValueChange={(value) => setSelectedSensitivity(value as DocumentSensitivity | "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sensitivity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sensitivity</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="confidential">Confidential</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button asChild className="shrink-0">
          <Link to="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">All ({allDocuments.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftDocuments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingDocuments.length})</TabsTrigger>
          <TabsTrigger value="signed">Signed ({signedDocuments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {allDocuments.length > 0 ? (
            <div className="grid gap-4">
              {allDocuments.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No documents found</p>
              <Button asChild className="mt-4">
                <Link to="/upload">Upload Document</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="draft" className="space-y-4">
          {draftDocuments.length > 0 ? (
            <div className="grid gap-4">
              {draftDocuments.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No draft documents found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingDocuments.length > 0 ? (
            <div className="grid gap-4">
              {pendingDocuments.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending documents found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="signed" className="space-y-4">
          {signedDocuments.length > 0 ? (
            <div className="grid gap-4">
              {signedDocuments.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No signed documents found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
