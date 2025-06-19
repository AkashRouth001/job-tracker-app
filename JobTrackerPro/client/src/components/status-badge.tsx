import { Badge } from "@/components/ui/badge";
import { Send, Calendar, Trophy, X } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "applied":
        return {
          icon: Send,
          label: "Applied",
          className: "bg-blue-50 text-blue-700 hover:bg-blue-100",
        };
      case "interview-scheduled":
        return {
          icon: Calendar,
          label: "Interview Scheduled",
          className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        };
      case "offered":
        return {
          icon: Trophy,
          label: "Offered",
          className: "bg-green-50 text-green-700 hover:bg-green-100",
        };
      case "rejected":
        return {
          icon: X,
          label: "Rejected",
          className: "bg-red-50 text-red-700 hover:bg-red-100",
        };
      default:
        return {
          icon: Send,
          label: status,
          className: "bg-gray-50 text-gray-700 hover:bg-gray-100",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
