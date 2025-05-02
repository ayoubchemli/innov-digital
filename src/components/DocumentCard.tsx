
import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FileText, Lock, MoreVertical, Share, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Document, DocumentSensitivity } from "@/contexts/DocumentContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { useToast } from "@/hooks/use-toast";

interface DocumentCardProps {
  document: Document;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const { deleteDocument, shareDocument } = useDocuments();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const sensitivityColors: Record<DocumentSensitivity, string> = {
    public: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    confidential: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    restricted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const handleShare = () => {
    // In a real app, we'd show a sharing dialog
    setIsSharing(true);
    setTimeout(() => {
      shareDocument(document.id, ["user-123"]);
      setIsSharing(false);
      toast({
        title: "Document shared",
        description: `${document.name} has been shared successfully.`,
      });
    }, 1000);
  };

  const handleDelete = () => {
    deleteDocument(document.id);
  };

  const getFileIcon = () => {
    // Would handle different file types with appropriate icons
    return <FileText className="h-10 w-10 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-vault">
      <CardContent className="p-0">
        <div className="flex items-start p-4">
          <div className="flex-shrink-0 mr-4 bg-blue-50 p-2 rounded-md dark:bg-blue-900/20">
            {getFileIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <Link to={`/documents/${document.id}`} className="hover:underline">
              <h3 className="text-lg font-medium text-foreground truncate">
                {document.name}
              </h3>
            </Link>
            
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <span>
                {format(new Date(document.uploadDate), "MMM d, yyyy")}
              </span>
              <span className="mx-2">•</span>
              <span>{formatFileSize(document.size)}</span>
              {document.isEncrypted && (
                <>
                  <span className="mx-2">•</span>
                  <Lock className="h-3 w-3 mr-1" />
                  <span>Encrypted</span>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className={sensitivityColors[document.sensitivity]}>
                {document.sensitivity.charAt(0).toUpperCase() + document.sensitivity.slice(1)}
              </Badge>
              
              <Badge variant="outline">
                {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
              </Badge>
              
              <Badge variant="outline" className={
                document.status === 'signed' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                document.status === 'pending_signature' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              }>
                {document.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/documents/${document.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare} disabled={isSharing}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
