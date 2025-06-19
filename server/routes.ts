import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobApplicationSchema, updateJobApplicationSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all job applications
  app.get("/api/job-applications", async (req, res) => {
    try {
      const jobApps = await storage.getAllJobApplications();
      res.json(jobApps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  // Get single job application
  app.get("/api/job-applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobApp = await storage.getJobApplication(id);
      if (!jobApp) {
        return res.status(404).json({ message: "Job application not found" });
      }
      res.json(jobApp);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job application" });
    }
  });

  // Create new job application with file upload
  app.post("/api/job-applications", upload.single('resume'), async (req, res) => {
    try {
      const validatedData = insertJobApplicationSchema.parse(req.body);
      
      // Handle file upload
      if (req.file) {
        validatedData.resumeFileName = req.file.originalname;
        validatedData.resumeFilePath = req.file.path;
      }

      const jobApp = await storage.createJobApplication(validatedData);
      res.status(201).json(jobApp);
    } catch (error) {
      if (req.file) {
        // Clean up uploaded file if validation fails
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Update job application
  app.patch("/api/job-applications/:id", upload.single('resume'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateJobApplicationSchema.parse(req.body);
      
      // Handle file upload
      if (req.file) {
        const existing = await storage.getJobApplication(id);
        // Delete old file if it exists
        if (existing?.resumeFilePath && fs.existsSync(existing.resumeFilePath)) {
          fs.unlinkSync(existing.resumeFilePath);
        }
        
        validatedData.resumeFileName = req.file.originalname;
        validatedData.resumeFilePath = req.file.path;
      }

      const updatedJobApp = await storage.updateJobApplication(id, validatedData);
      if (!updatedJobApp) {
        return res.status(404).json({ message: "Job application not found" });
      }
      res.json(updatedJobApp);
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  // Delete job application
  app.delete("/api/job-applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getJobApplication(id);
      
      // Delete associated file
      if (existing?.resumeFilePath && fs.existsSync(existing.resumeFilePath)) {
        fs.unlinkSync(existing.resumeFilePath);
      }
      
      const deleted = await storage.deleteJobApplication(id);
      if (!deleted) {
        return res.status(404).json({ message: "Job application not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job application" });
    }
  });

  // Download resume file
  app.get("/api/job-applications/:id/resume", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobApp = await storage.getJobApplication(id);
      
      if (!jobApp || !jobApp.resumeFilePath) {
        return res.status(404).json({ message: "Resume file not found" });
      }

      if (!fs.existsSync(jobApp.resumeFilePath)) {
        return res.status(404).json({ message: "Resume file not found on disk" });
      }

      res.download(jobApp.resumeFilePath, jobApp.resumeFileName || 'resume.pdf');
    } catch (error) {
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
