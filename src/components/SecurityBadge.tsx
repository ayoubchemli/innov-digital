
import { Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityBadgeProps {
  status: "secured" | "encrypting" | "decrypting" | "warning" | "expired";
  className?: string;
}

const StatusMessages = {
  secured: "End-to-end encryption active",
  encrypting: "Encrypting document...",
  decrypting: "Decrypting document...",
  warning: "Security check required",
  expired: "Certificate expired"
};

const SecurityBadge = ({ status, className }: SecurityBadgeProps) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
        status === "secured" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        status === "encrypting" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 animate-pulse",
        status === "decrypting" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 animate-pulse",
        status === "warning" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        status === "expired" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        className
      )}
    >
      {status === "secured" ? (
        <ShieldCheck className="h-3.5 w-3.5" />
      ) : (
        <Lock className="h-3.5 w-3.5" />
      )}
      <span>{StatusMessages[status]}</span>
    </div>
  );
};

export default SecurityBadge;
