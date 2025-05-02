
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Types for notifications
type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string;
  relatedType?: string;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Document Shared",
    message: "Jane Client shared 'Q3 Financial Report.pdf' with you",
    type: "info",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "2",
    title: "Signature Request",
    message: "You have a pending signature request for 'Client Agreement.pdf'",
    type: "warning",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
  {
    id: "3",
    title: "Form Submitted",
    message: "Jane Client has submitted the KYC form",
    type: "success",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: "4",
    title: "Security Alert",
    message: "New device used to login to your account",
    type: "error",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  }
];

const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    ));
    
    // Show toast with action info
    toast.info(`Opening ${notification.title}`, {
      description: notification.message,
      duration: 3000,
    });
    
    // Close popover
    setOpen(false);
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Get notification icon color based on type
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "info": return "text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
      case "success": return "text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "warning": return "text-amber-500 bg-amber-100 dark:bg-amber-900 dark:text-amber-300";
      case "error": return "text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <div className="font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          <div className="space-y-1 p-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted ${
                    !notification.isRead ? "bg-muted/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getNotificationColor(notification.type)}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-20 items-center justify-center">
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="outline" size="sm" className="w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
