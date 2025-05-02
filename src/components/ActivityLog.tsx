
import { format } from "date-fns";
import { 
  Eye, 
  Upload, 
  Download, 
  Signature, 
  Share, 
  Trash, 
  User
} from "lucide-react";

// Types for activity log
interface Activity {
  id: string;
  type: "view" | "upload" | "download" | "signature" | "share" | "delete" | "login";
  documentId?: string;
  documentName?: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: Record<string, string>;
}

interface ActivityLogProps {
  activities: Activity[];
}

const ActivityLog = ({ activities }: ActivityLogProps) => {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "view":
        return <Eye className="h-5 w-5 text-blue-500" />;
      case "upload":
        return <Upload className="h-5 w-5 text-green-500" />;
      case "download":
        return <Download className="h-5 w-5 text-purple-500" />;
      case "signature":
        return <Signature className="h-5 w-5 text-amber-500" />;
      case "share":
        return <Share className="h-5 w-5 text-indigo-500" />;
      case "delete":
        return <Trash className="h-5 w-5 text-red-500" />;
      case "login":
        return <User className="h-5 w-5 text-gray-500" />;
      default:
        return <Eye className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case "view":
        return `${activity.userName} viewed document "${activity.documentName}"`;
      case "upload":
        return `${activity.userName} uploaded document "${activity.documentName}"`;
      case "download":
        return `${activity.userName} downloaded document "${activity.documentName}"`;
      case "signature":
        return `${activity.userName} signed document "${activity.documentName}"`;
      case "share":
        return `${activity.userName} shared document "${activity.documentName}" ${
          activity.metadata?.recipient ? `with ${activity.metadata.recipient}` : ""
        }`;
      case "delete":
        return `${activity.userName} deleted document "${activity.documentName}"`;
      case "login":
        return `${activity.userName} logged in`;
      default:
        return "Unknown activity";
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activities to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id}
          className="flex items-start p-3 rounded-lg border border-border bg-card"
        >
          <div className="flex-shrink-0 mr-3 p-2 rounded-full bg-muted">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {getActivityDescription(activity)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(activity.timestamp, "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLog;
