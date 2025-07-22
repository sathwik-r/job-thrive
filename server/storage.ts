import { users, jobs, referrals, type User, type InsertUser, type Job, type InsertJob, type Referral, type InsertReferral } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getUsersByCompany(company: string): Promise<User[]>;
  
  // Job methods
  getAllJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  searchJobs(query: string): Promise<Job[]>;
  
  // Referral methods
  getReferral(id: number): Promise<Referral | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: number, updates: Partial<Referral>): Promise<Referral | undefined>;
  getReferralsBySeeker(seekerId: number): Promise<Referral[]>;
  getReferralsByReferrer(referrerId: number): Promise<Referral[]>;
  getPendingReferrals(): Promise<Referral[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private referrals: Map<number, Referral>;
  private currentUserId: number;
  private currentJobId: number;
  private currentReferralId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.referrals = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentReferralId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample jobs
    const sampleJobs: Job[] = [
      {
        id: this.currentJobId++,
        title: "Senior React Developer",
        company: "Airbnb",
        location: "San Francisco, CA",
        description: "We're looking for a Senior React Developer to join our growing team and help build the next generation of our platform. You'll work with cutting-edge technologies and collaborate with talented engineers.",
        salary: "$120k - $180k",
        referralFee: "150.00",
        remote: true,
        active: true,
        createdAt: new Date(),
      },
      {
        id: this.currentJobId++,
        title: "Product Designer",
        company: "Stripe",
        location: "New York, NY",
        description: "Design and ship beautiful, functional interfaces that millions of people use every day. You'll be part of a world-class design team.",
        salary: "$100k - $140k",
        referralFee: "200.00",
        remote: false,
        active: true,
        createdAt: new Date(),
      },
      {
        id: this.currentJobId++,
        title: "DevOps Engineer",
        company: "Spotify",
        location: "Stockholm, Sweden",
        description: "Help us scale our infrastructure to serve hundreds of millions of users worldwide. Work with Kubernetes, AWS, and modern DevOps tools.",
        salary: "$90k - $130k",
        referralFee: "180.00",
        remote: true,
        active: true,
        createdAt: new Date(),
      }
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email,
      name: insertUser.name,
      googleId: insertUser.googleId,
      photoUrl: insertUser.photoUrl || null,
      company: insertUser.company || null,
      role: insertUser.role || "both",
      totalEarnings: insertUser.totalEarnings || "0.00",
      totalSpent: insertUser.totalSpent || "0.00",
      successfulReferrals: insertUser.successfulReferrals || 0,
      active: insertUser.active !== undefined ? insertUser.active : true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByCompany(company: string): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.company === company && user.active)
      .sort((a, b) => parseFloat(a.totalEarnings) - parseFloat(b.totalEarnings));
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.active)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = {
      id,
      title: insertJob.title,
      company: insertJob.company,
      location: insertJob.location,
      description: insertJob.description,
      salary: insertJob.salary || null,
      referralFee: insertJob.referralFee,
      remote: insertJob.remote || false,
      active: insertJob.active !== undefined ? insertJob.active : true,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async searchJobs(query: string): Promise<Job[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.jobs.values())
      .filter(job => 
        job.active && 
        (job.title.toLowerCase().includes(lowercaseQuery) || 
         job.company.toLowerCase().includes(lowercaseQuery))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReferral(id: number): Promise<Referral | undefined> {
    return this.referrals.get(id);
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = this.currentReferralId++;
    const referral: Referral = {
      id,
      jobId: insertReferral.jobId,
      seekerId: insertReferral.seekerId,
      referrerId: insertReferral.referrerId || null,
      status: insertReferral.status || "pending",
      amount: insertReferral.amount,
      resumeUrl: insertReferral.resumeUrl || null,
      proofUrl: insertReferral.proofUrl || null,
      paymentId: insertReferral.paymentId || null,
      orderId: insertReferral.orderId || null,
      assignedAt: insertReferral.assignedAt || null,
      completedAt: insertReferral.completedAt || null,
      createdAt: new Date(),
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async updateReferral(id: number, updates: Partial<Referral>): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const updatedReferral = { ...referral, ...updates };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }

  async getReferralsBySeeker(seekerId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(referral => referral.seekerId === seekerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReferralsByReferrer(referrerId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(referral => referral.referrerId === referrerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingReferrals(): Promise<Referral[]> {
    return Array.from(this.referrals.values())
      .filter(referral => referral.status === "pending");
  }
}

export const storage = new MemStorage();
