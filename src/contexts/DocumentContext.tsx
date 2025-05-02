
import { createContext, useState, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export type DocumentSensitivity = "public" | "confidential" | "restricted";
export type DocumentCategory = "contract" | "financial" | "legal" | "kyc" | "other";
export type DocumentStatus = "draft" | "pending_signature" | "signed" | "expired";

export interface Document {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  category: DocumentCategory;
  sensitivity: DocumentSensitivity;
  uploadDate: Date;
  size: number;
  status: DocumentStatus;
  sharedWith: string[];
  isEncrypted: boolean;
  fileType: string;
  metadata: Record<string, string>;
  signatureRequired: boolean;
  signedBy?: string[];
  content?: string; // Base64 data or URL (only for prototype)
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id">) => void;
  getDocument: (id: string) => Document | undefined;
  shareDocument: (id: string, userIds: string[]) => void;
  deleteDocument: (id: string) => void;
  signDocument: (id: string, signerName: string) => void;
  isLoading: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Mock documents for demo
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Client Agreement.pdf",
    ownerId: "1",
    ownerName: "John Admin",
    category: "contract",
    sensitivity: "confidential",
    uploadDate: new Date("2023-04-15T10:30:00"),
    size: 2500000,
    status: "signed",
    sharedWith: ["2"],
    isEncrypted: true,
    fileType: "pdf",
    metadata: {
      clientId: "ABC123",
      version: "1.2",
      departmentCode: "LEGAL-01"
    },
    signatureRequired: true,
    signedBy: ["2"],
    content: "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvWE9iamVjdCAvU3VidHlwZSAvSW1hZ2UgL1dpZHRoIDIwMCAvSGVpZ2h0IDIwMCAvQml0c1BlckNvbXBvbmVudCA4IC9Db2xvclNwYWNlIC9EZXZpY2VSR0IgL0ZpbHRlciAvRmxhdGVEZWNvZGUgL0xlbmd0aCA2NiA+PgpzdHJlYW0KeJztwSEBAAAAjKD/p8sZ2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmAkVUAABCgo="
  },
  {
    id: "doc-2",
    name: "Financial Report Q1.xlsx",
    ownerId: "1",
    ownerName: "John Admin",
    category: "financial",
    sensitivity: "restricted",
    uploadDate: new Date("2023-05-02T14:15:00"),
    size: 1800000,
    status: "draft",
    sharedWith: [],
    isEncrypted: true,
    fileType: "xlsx",
    metadata: {
      quarter: "Q1",
      year: "2023",
      departmentCode: "FIN-02"
    },
    signatureRequired: false
  },
  {
    id: "doc-3",
    name: "KYC Documentation.docx",
    ownerId: "1",
    ownerName: "John Admin",
    category: "kyc",
    sensitivity: "confidential",
    uploadDate: new Date("2023-06-10T09:45:00"),
    size: 3200000,
    status: "pending_signature",
    sharedWith: ["2"],
    isEncrypted: true,
    fileType: "docx",
    metadata: {
      clientId: "XYZ789",
      validUntil: "2024-06-10",
      departmentCode: "COMP-03"
    },
    signatureRequired: true
  }
];

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const addDocument = (doc: Omit<Document, "id">) => {
    setIsLoading(true);
    
    // Simulate encryption and processing delay
    setTimeout(() => {
      const newDocument: Document = {
        ...doc,
        id: `doc-${Date.now()}`,
        isEncrypted: true, // In a real app, we would actually encrypt the document
      };
      
      setDocuments(prev => [...prev, newDocument]);
      
      toast({
        title: "Document uploaded",
        description: `${newDocument.name} has been encrypted and stored securely.`,
      });
      
      setIsLoading(false);
    }, 2000);
  };

  const getDocument = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  const shareDocument = (id: string, userIds: string[]) => {
    setDocuments(prev => 
      prev.map(doc => {
        if (doc.id === id) {
          // Create a new set from existing and new user IDs to avoid duplicates
          const sharedWithSet = new Set([...doc.sharedWith, ...userIds]);
          return {
            ...doc,
            sharedWith: Array.from(sharedWithSet)
          };
        }
        return doc;
      })
    );
    
    toast({
      title: "Document shared",
      description: `Document has been securely shared with ${userIds.length} recipient(s).`,
    });
  };

  const deleteDocument = (id: string) => {
    const docToDelete = documents.find(doc => doc.id === id);
    
    if (docToDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: "Document deleted",
        description: `${docToDelete.name} has been permanently deleted.`,
      });
    }
  };

  const signDocument = (id: string, signerName: string) => {
    setIsLoading(true);
    
    // Simulate digital signature processing
    setTimeout(() => {
      setDocuments(prev => 
        prev.map(doc => {
          if (doc.id === id) {
            const signedBy = doc.signedBy ? [...doc.signedBy, signerName] : [signerName];
            const newStatus = "signed" as DocumentStatus;
            
            return {
              ...doc,
              status: newStatus,
              signedBy
            };
          }
          return doc;
        })
      );
      
      toast({
        title: "Document signed",
        description: `Document has been digitally signed by ${signerName}.`,
      });
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      addDocument,
      getDocument,
      shareDocument,
      deleteDocument,
      signDocument,
      isLoading
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};
