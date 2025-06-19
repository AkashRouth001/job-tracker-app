import { Send, Calendar, Trophy, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { JobApplication } from "@shared/schema";

interface StatsCardsProps {
  jobApplications: JobApplication[];
}

export function StatsCards({ jobApplications }: StatsCardsProps) {
  const stats = {
    totalApplied: jobApplications.length,
    interviews: jobApplications.filter(job => job.status === "interview-scheduled").length,
    offers: jobApplications.filter(job => job.status === "offered").length,
    rejected: jobApplications.filter(job => job.status === "rejected").length,
  };

  const statCards = [
    {
      icon: Send,
      label: "Total Applied",
      value: stats.totalApplied,
      color: "bg-blue-50 text-blue-500",
    },
    {
      icon: Calendar,
      label: "Interviews",
      value: stats.interviews,
      color: "bg-yellow-50 text-yellow-500",
    },
    {
      icon: Trophy,
      label: "Offers",
      value: stats.offers,
      color: "bg-green-50 text-green-500",
    },
    {
      icon: X,
      label: "Rejected",
      value: stats.rejected,
      color: "bg-red-50 text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
