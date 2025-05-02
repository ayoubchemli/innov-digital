
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  File,
  FileQuestion,
  FileUp,
  Filter,
  PlusCircle,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Form type
interface FormData {
  id: string;
  title: string;
  description: string;
  status: "active" | "draft" | "closed" | "archived";
  securityLevel: "public" | "normal" | "confidential" | "restricted";
  createdAt: Date;
  responses: number;
  pendingResponses: number;
}

// Mocked form data
const mockForms: FormData[] = [
  {
    id: "form1",
    title: "KYC Documentation",
    description: "Know Your Customer verification form",
    status: "active",
    securityLevel: "restricted",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    responses: 5,
    pendingResponses: 3,
  },
  {
    id: "form2",
    title: "Loan Application",
    description: "Personal loan application form with document upload",
    status: "active",
    securityLevel: "confidential",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    responses: 12,
    pendingResponses: 0,
  },
  {
    id: "form3",
    title: "Account Opening Request",
    description: "New account registration form",
    status: "draft",
    securityLevel: "normal",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    responses: 0,
    pendingResponses: 0,
  },
];

const Forms = () => {
  const [forms, setForms] = useState<FormData[]>(mockForms);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter forms based on search query and active tab
  const filteredForms = forms.filter(form => {
    // Filter by search query
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        form.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && form.status === "active";
    if (activeTab === "drafts") return matchesSearch && form.status === "draft";
    
    return matchesSearch;
  });

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };
  
  // Handle delete form
  const handleDeleteForm = (formId: string) => {
    setForms(forms.filter(form => form.id !== formId));
    toast.success("Form deleted successfully");
  };
  
  // Handle duplicate form
  const handleDuplicateForm = (formId: string) => {
    const formToDuplicate = forms.find(form => form.id === formId);
    if (formToDuplicate) {
      const duplicatedForm = {
        ...formToDuplicate,
        id: `form${Date.now()}`,
        title: `Copy of ${formToDuplicate.title}`,
        status: "draft" as const,
        createdAt: new Date(),
        responses: 0,
        pendingResponses: 0,
      };
      setForms([...forms, duplicatedForm]);
      toast.success("Form duplicated successfully");
    }
  };
  
  // Get security level badge
  const getSecurityLevelBadge = (level: string) => {
    switch (level) {
      case "restricted":
        return <Badge variant="destructive">Restricted</Badge>;
      case "confidential":
        return <Badge variant="default" className="bg-amber-500">Confidential</Badge>;
      case "normal":
        return <Badge variant="secondary">Normal</Badge>;
      default:
        return <Badge variant="outline">Public</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
        <p className="text-muted-foreground">
          Create, manage and track secure forms for data collection
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search forms..."
            className="w-full pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Date Created</DropdownMenuItem>
              <DropdownMenuItem>Security Level</DropdownMenuItem>
              <DropdownMenuItem>Response Count</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link to="/forms/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Form
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Forms</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredForms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form) => (
                <Card key={form.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle>{form.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {form.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/forms/${form.id}`}>View Form</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/forms/${form.id}/edit`}>Edit Form</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/forms/${form.id}/responses`}>View Responses</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateForm(form.id)}>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteForm(form.id)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant={form.status === "active" ? "default" : "secondary"}>
                        {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                      </Badge>
                      {getSecurityLevelBadge(form.securityLevel)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Responses:</span>
                        <span className="font-medium">{form.responses}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-medium">{form.pendingResponses}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-xs text-muted-foreground">
                      Created {formatDate(form.createdAt)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/forms/${form.id}/share`}>
                          Share
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link to={`/forms/${form.id}`}>
                          Open
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <FileUp className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No forms found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery
                  ? "No forms match your search criteria. Try a different search term."
                  : "You haven't created any forms yet. Create your first form to start collecting data securely."}
              </p>
              <Button asChild>
                <Link to="/forms/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Form
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {/* Same content structure as "all" but filtered for active forms */}
          {filteredForms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Form cards */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {/* Empty state */}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="drafts" className="space-y-4">
          {/* Same content structure as "all" but filtered for draft forms */}
          {filteredForms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Form cards */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {/* Empty state */}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Forms;
