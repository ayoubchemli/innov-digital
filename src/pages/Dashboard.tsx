
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Lock, Upload, Signature, Eye, Download, User } from "lucide-react";
import SecurityBadge from "@/components/SecurityBadge";
import ActivityLog from "@/components/ActivityLog";
import DocumentCard from "@/components/DocumentCard";

// Mock activities data
const generateMockActivities = () => {
  const activities = [
    {
      id: "act-1",
      type: "view" as const,
      documentId: "doc-1",
      documentName: "Client Agreement.pdf",
      userId: "1",
      userName: "John Admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      id: "act-2",
      type: "upload" as const,
      documentId: "doc-3",
      documentName: "KYC Documentation.docx",
      userId: "1",
      userName: "John Admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: "act-3",
      type: "signature" as const,
      documentId: "doc-1",
      documentName: "Client Agreement.pdf",
      userId: "2",
      userName: "Jane Client",
      timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
      id: "act-4",
      type: "share" as const,
      documentId: "doc-3",
      documentName: "KYC Documentation.docx",
      userId: "1",
      userName: "John Admin",
      metadata: { recipient: "Jane Client" },
      timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    },
    {
      id: "act-5",
      type: "login" as const,
      userId: "1",
      userName: "John Admin",
      timestamp: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
    }
  ];
  
  return activities;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { documents } = useDocuments();
  const [activities, setActivities] = useState(generateMockActivities());
  
  // Get pending documents that need signatures
  const pendingDocuments = documents.filter(doc => doc.status === "pending_signature");
  
  // Get recently uploaded documents
  const recentDocuments = [...documents].sort((a, b) => {
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  }).slice(0, 3);

  const stats = [
    {
      title: "Documents",
      value: documents.length,
      icon: FileText,
      color: "text-blue-500"
    },
    {
      title: "Pending Signatures",
      value: pendingDocuments.length,
      icon: Signature,
      color: "text-amber-500"
    },
    {
      title: "Recent Views",
      value: 12, // Mock data
      icon: Eye,
      color: "text-green-500"
    },
    {
      title: "Downloads",
      value: 5, // Mock data
      icon: Download,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">
          Your secure document management dashboard
        </p>
      </div>

      <div className="flex items-center justify-between">
        <SecurityBadge status="secured" />
        <Button asChild>
          <Link to="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-2 bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          {recentDocuments.length > 0 ? (
            <div className="grid gap-4">
              {recentDocuments.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No documents found</p>
                <Button asChild className="mt-4">
                  <Link to="/upload">Upload your first document</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          {recentDocuments.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" asChild>
                <Link to="/documents">View All Documents</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Security audit log of document interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityLog activities={activities} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Documents Pending Approval</CardTitle>
              <CardDescription>
                Documents requiring your signature or approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDocuments.length > 0 ? (
                <div className="grid gap-4">
                  {pendingDocuments.map(document => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Signature className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
