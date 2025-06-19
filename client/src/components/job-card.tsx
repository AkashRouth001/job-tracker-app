import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Building, Calendar, ExternalLink, FileText, Download, Edit, Trash2, UserCheck, Clock, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { EditJobModal } from "./edit-job-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createGoogleCalendarUrl } from "@/lib/calendar";
import type { JobApplication } from "@shared/schema";

interface JobCardProps {
  job: JobApplication;
}

export function JobCard({ job }: JobCardProps) {
  const { toast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);

  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/job-applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
      toast({
        title: "Success",
        description: "Job application deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownloadResume = () => {
    if (job.resumeFileName) {
      window.open(`/api/job-applications/${job.id}/resume`, '_blank');
    }
  };

  const handleAddToCalendar = () => {
    if (job.resultDate) {
      const calendarUrl = createGoogleCalendarUrl({
        title: `Interview Result - ${job.companyName}`,
        startDate: new Date(job.resultDate),
        description: `Expected result announcement for ${job.interviewRound || 'interview'} at ${job.companyName}`,
      });
      window.open(calendarUrl, '_blank');
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job application?")) {
      deleteJobMutation.mutate(job.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{job.jobRole}</h3>
                <StatusBadge status={job.status} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{job.companyName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Applied: {formatDate(job.dateApplied)}</span>
                </div>
                <div className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>{job.customSource || job.source}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {job.resumeFileName && (
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">{job.resumeFileName}</span>
                  <Button variant="ghost" size="sm" onClick={handleDownloadResume}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteJobMutation.isPending}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Interview Details */}
          {job.status === "interview-scheduled" && (job.interviewRound || job.resultDate) && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  {job.interviewRound && (
                    <div className="flex items-center text-sm">
                      <UserCheck className="h-4 w-4 mr-2 text-yellow-600" />
                      <span className="font-medium">Round:</span>
                      <span className="ml-1">{job.interviewRound}</span>
                    </div>
                  )}
                  {job.resultDate && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                      <span className="font-medium">Result Expected:</span>
                      <span className="ml-1">{formatDateTime(job.resultDate)}</span>
                    </div>
                  )}
                </div>
                {job.resultDate && (
                  <Button
                    size="sm"
                    onClick={handleAddToCalendar}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {job.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {job.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <EditJobModal
        job={job}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </>
  );
}
