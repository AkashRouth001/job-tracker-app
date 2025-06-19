import { users, jobApplications, type User, type InsertUser, type JobApplication, type InsertJobApplication, type UpdateJobApplication } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job Application methods
  getAllJobApplications(): Promise<JobApplication[]>;
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  createJobApplication(jobApp: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: number, updates: UpdateJobApplication): Promise<JobApplication | undefined>;
  deleteJobApplication(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobApplications: Map<number, JobApplication>;
  private currentUserId: number;
  private currentJobAppId: number;

  constructor() {
    this.users = new Map();
    this.jobApplications = new Map();
    this.currentUserId = 1;
    this.currentJobAppId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllJobApplications(): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }

  async createJobApplication(jobApp: InsertJobApplication): Promise<JobApplication> {
    const id = this.currentJobAppId++;
    const now = new Date().toISOString();
    const jobApplication: JobApplication = {
      ...jobApp,
      id,
      createdAt: now,
      updatedAt: now,
      customSource: jobApp.customSource || null,
      interviewRound: jobApp.interviewRound || null,
      resultDate: jobApp.resultDate || null,
      resumeFileName: jobApp.resumeFileName || null,
      resumeFilePath: jobApp.resumeFilePath || null,
      notes: jobApp.notes || null,
    };
    this.jobApplications.set(id, jobApplication);
    return jobApplication;
  }

  async updateJobApplication(id: number, updates: UpdateJobApplication): Promise<JobApplication | undefined> {
    const existing = this.jobApplications.get(id);
    if (!existing) return undefined;

    const updated: JobApplication = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.jobApplications.set(id, updated);
    return updated;
  }

  async deleteJobApplication(id: number): Promise<boolean> {
    return this.jobApplications.delete(id);
  }
}

export const storage = new MemStorage();
