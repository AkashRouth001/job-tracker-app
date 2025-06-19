import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Briefcase, User, Search, Calendar, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/job-card";
import { StatsCards } from "@/components/stats-cards";
import { StatusBadge } from "@/components/status-badge";
import { JobCardSkeleton, StatsCardSkeleton } from "@/components/loading-skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import type { JobApplication } from "@shared/schema";

type StatusFilter = "all" | "applied" | "interview-scheduled" | "rejected" | "offered";

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: jobApplications = [], isLoading } = useQuery<JobApplication[]>({
    queryKey: ["/api/job-applications"],
  });

  const filteredJobs = jobApplications.filter((job) => {
    const matchesFilter = activeFilter === "all" || job.status === activeFilter;
    const matchesSearch = 
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterButtons = [
    { value: "all" as const, label: "All" },
    { value: "applied" as const, label: "Applied" },
    { value: "interview-scheduled" as const, label: "Interview Scheduled" },
    { value: "offered" as const, label: "Offered" },
    { value: "rejected" as const, label: "Rejected" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Briefcase className="text-primary h-8 w-8" />
                <span className="ml-2 text-xl font-bold text-gray-900">JobTracker Pro</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="text-white h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Statistics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>

            {/* Filters Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Job Cards Skeleton */}
            {[...Array(3)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="text-primary h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">JobTracker Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/add-job">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </Link>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Statistics */}
          <StatsCards jobApplications={jobApplications} />

          {/* Quick Actions */}
          {jobApplications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/add-job">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Job
                </Button>
                </Link>
                {jobApplications.filter(job => job.status === "interview-scheduled" && job.resultDate).length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const upcomingInterviews = jobApplications.filter(job => 
                        job.status === "interview-scheduled" && 
                        job.resultDate && 
                        new Date(job.resultDate) > new Date()
                      );
                      if (upcomingInterviews.length > 0) {
                        const job = upcomingInterviews[0];
                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview%20Result%20-%20${encodeURIComponent(job.companyName)}&dates=${new Date(job.resultDate!).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(new Date(job.resultDate!).getTime() + 60*60*1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Expected result announcement for ${job.interviewRound || 'interview'} at ${job.companyName}`)}`;
                        window.open(calendarUrl, '_blank');
                      }
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Next Interview to Calendar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                {filterButtons.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={activeFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.value)}
                    className={activeFilter === filter.value ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search companies or roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Job Applications */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {jobApplications.length === 0 ? "Welcome to JobTracker Pro!" : "No job applications found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {jobApplications.length === 0 
                    ? "Start tracking your job applications to stay organized and never miss an opportunity. Add your first application to get started."
                    : searchQuery || activeFilter !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by adding your first job application."}
                </p>
                {jobApplications.length === 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">Track everything in one place:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Company details and job roles</li>
                      <li>• Application status and progress</li>
                      <li>• Interview schedules with calendar integration</li>
                      <li>• Resume uploads and document management</li>
                      <li>• Personal notes and reminders</li>
                    </ul>
                  </div>
                )}
                <Link href="/add-job">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {jobApplications.length === 0 ? "Add Your First Job" : "Add Job Application"}
                  </Button>
                </Link>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
