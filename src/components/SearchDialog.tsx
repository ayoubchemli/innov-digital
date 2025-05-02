
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { File, FileSearch, FileText, Search, User } from "lucide-react";
import { useDocuments } from "@/contexts/DocumentContext";

// Result type
type SearchResultType = "document" | "user" | "form";

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  url: string;
}

const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { documents } = useDocuments();
  const navigate = useNavigate();

  // Mock users for search
  const mockUsers = [
    { id: "u1", name: "John Admin", email: "admin@securevault.com", role: "admin" },
    { id: "u2", name: "Jane Client", email: "client@example.com", role: "client" },
    { id: "u3", name: "Alice Manager", email: "alice@example.com", role: "admin" },
    { id: "u4", name: "Bob Analyst", email: "bob@company.net", role: "client" },
  ];

  // Mock forms for search
  const mockForms = [
    { id: "f1", title: "KYC Documentation", description: "Know Your Customer form" },
    { id: "f2", title: "Account Opening", description: "New account application" },
    { id: "f3", title: "Loan Application", description: "Personal loan request form" },
  ];

  // Search function
  const performSearch = (searchQuery: string) => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      const query = searchQuery.toLowerCase();
      
      // Search documents
      const docResults: SearchResult[] = documents
        .filter(doc => doc.name.toLowerCase().includes(query))
        .map(doc => ({
          id: doc.id,
          type: "document",
          title: doc.name,
          subtitle: `${doc.fileType} • ${new Date(doc.uploadDate).toLocaleDateString()}`,
          url: `/documents/${doc.id}`
        }));
      
      // Search users
      const userResults: SearchResult[] = mockUsers
        .filter(user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
        )
        .map(user => ({
          id: user.id,
          type: "user",
          title: user.name,
          subtitle: `${user.email} • ${user.role}`,
          url: `/users/${user.id}`
        }));
      
      // Search forms
      const formResults: SearchResult[] = mockForms
        .filter(form => 
          form.title.toLowerCase().includes(query) || 
          form.description.toLowerCase().includes(query)
        )
        .map(form => ({
          id: form.id,
          type: "form",
          title: form.title,
          subtitle: form.description,
          url: `/forms/${form.id}`
        }));
      
      // Combine and limit results
      setResults([...docResults, ...userResults, ...formResults].slice(0, 10));
      setLoading(false);
    }, 300);
  };

  // Search when query changes
  useEffect(() => {
    performSearch(query);
  }, [query]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    navigate(result.url);
  };

  // Get icon for result type
  const getResultIcon = (type: SearchResultType) => {
    switch (type) {
      case "document": return <FileText className="h-4 w-4" />;
      case "user": return <User className="h-4 w-4" />;
      case "form": return <File className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative max-w-md cursor-pointer" onClick={() => setOpen(true)}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents, users..."
            className="w-full bg-background pl-9 cursor-pointer"
            readOnly
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents, users, forms..."
              className="w-full bg-background pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {query && (
            <div>
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                </div>
              ) : (
                <ScrollArea className="h-72">
                  <div className="space-y-1">
                    {results.length > 0 ? (
                      results.map((result) => (
                        <Button
                          key={`${result.type}-${result.id}`}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="mr-2 rounded-full bg-muted p-1">
                            {getResultIcon(result.type)}
                          </div>
                          <div>
                            <div className="font-medium">{result.title}</div>
                            {result.subtitle && (
                              <div className="text-xs text-muted-foreground">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileSearch className="h-8 w-8 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">No results found</p>
                        <p className="text-xs text-muted-foreground pt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
