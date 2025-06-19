import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { updateJobApplicationSchema } from "@shared/schema";
import type { JobApplication } from "@shared/schema";
import { z } from "zod";

const formSchema = updateJobApplicationSchema.extend({
  resume: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditJobModalProps {
  job: JobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJobModal({ job, open, onOpenChange }: EditJobModalProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCustomSource, setShowCustomSource] = useState(false);
  const [showInterviewDetails, setShowInterviewDetails] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      jobRole: "",
      dateApplied: "",
      source: "",
      customSource: "",
      status: "",
      interviewRound: "",
      resultDate: "",
      notes: "",
    },
  });

  // Update form when job changes
  useEffect(() => {
    if (job) {
      form.reset({
        companyName: job.companyName,
        jobRole: job.jobRole,
        dateApplied: job.dateApplied,
        source: job.source,
        customSource: job.customSource || "",
        status: job.status,
        interviewRound: job.interviewRound || "",
        resultDate: job.resultDate || "",
        notes: job.notes || "",
      });
      setShowCustomSource(job.source === "others");
      setShowInterviewDetails(job.status === "interview-scheduled");
    }
  }, [job, form]);

  const updateJobMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "resume" && value) {
          formData.append(key, value);
        }
      });
      
      // Append file if selected
      if (selectedFile) {
        formData.append("resume", selectedFile);
      }

      const response = await fetch(`/api/job-applications/${job.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update job application");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
      toast({
        title: "Success",
        description: "Job application updated successfully",
      });
      onOpenChange(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateJobMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById("edit-resume") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateApplied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Applied</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowCustomSource(value === "others");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="naukri">Naukri</SelectItem>
                        <SelectItem value="company-website">Company Website</SelectItem>
                        <SelectItem value="google-jobs">Google Jobs</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showCustomSource && (
              <FormField
                control={form.control}
                name="customSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Source</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter custom source" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Status</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowInterviewDetails(value === "interview-scheduled");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview-scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="offered">Offered</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showInterviewDetails && (
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-gray-900">Interview Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="interviewRound"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Round</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. HR, Technical, Coding, Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resultDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Result Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Resume Upload */}
            <div>
              <FormLabel>Replace Resume (PDF only)</FormLabel>
              <div className="mt-2">
                {job.resumeFileName && !selectedFile && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-2">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm text-gray-700">Current: {job.resumeFileName}</span>
                    </div>
                  </div>
                )}
                
                {!selectedFile ? (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="edit-resume"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                        >
                          <span>Upload new file</span>
                          <input
                            id="edit-resume"
                            name="resume"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending ? "Updating..." : "Update Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
