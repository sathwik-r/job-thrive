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
    this.initializeSampleUser();
  }

  private initializeSampleData() {
    // Sample jobs with detailed descriptions
    const sampleJobs: Job[] = [
      {
        id: this.currentJobId++,
        title: "Senior React Developer",
        company: "Airbnb",
        location: "San Francisco, CA",
        description: "Join Airbnb's Host Platform team to build tools that empower millions of hosts worldwide. You'll work on React applications that handle complex booking flows, payment processing, and real-time messaging. Our tech stack includes React, TypeScript, GraphQL, and Node.js. We're looking for someone with 5+ years of React experience who can mentor junior developers and drive technical decisions. You'll collaborate with product managers, designers, and backend engineers to deliver features that impact our global community.",
        salary: "$120k - $180k",
        referralFee: "150.00",
        remote: true,
        active: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: this.currentJobId++,
        title: "Product Designer",
        company: "Stripe",
        location: "New York, NY",
        description: "Design the future of online payments at Stripe. You'll work on our Dashboard, Connect platform, and mobile SDKs used by millions of businesses worldwide. We're seeking a designer with expertise in complex B2B interfaces, data visualization, and user research. You'll collaborate with engineers, PMs, and other designers to solve challenging problems like multi-party marketplace flows and global compliance requirements. Strong skills in Figma, prototyping, and user testing are essential.",
        salary: "$100k - $140k",
        referralFee: "200.00",
        remote: false,
        active: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: this.currentJobId++,
        title: "DevOps Engineer",
        company: "Spotify",
        location: "Stockholm, Sweden",
        description: "Scale Spotify's music streaming platform that serves 400+ million users globally. You'll work with Kubernetes, Google Cloud Platform, and our custom deployment tools. We're looking for someone experienced in container orchestration, monitoring systems (Prometheus, Grafana), and infrastructure as code (Terraform). You'll help teams deploy safely at scale, improve our CI/CD pipelines, and ensure 99.9% uptime for music streaming. Experience with microservices architecture and distributed systems is highly valued.",
        salary: "$90k - $130k",
        referralFee: "180.00",
        remote: true,
        active: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: this.currentJobId++,
        title: "Machine Learning Engineer",
        company: "OpenAI",
        location: "San Francisco, CA",
        description: "Help build the next generation of AI systems that will transform how humans interact with technology. You'll work on large language models, training infrastructure, and deployment pipelines for models like GPT and DALL-E. We need someone with deep expertise in PyTorch, distributed training, and model optimization. You'll collaborate with researchers to bring cutting-edge AI from papers to production, handling challenges like model alignment, safety, and scalability. PhD in ML/AI or equivalent industry experience required.",
        salary: "$200k - $300k",
        referralFee: "500.00",
        remote: true,
        active: true,
        createdAt: new Date(), // Today
      },
      {
        id: this.currentJobId++,
        title: "Full Stack Engineer",
        company: "Notion",
        location: "San Francisco, CA",
        description: "Build the collaborative workspace that millions of teams rely on daily. You'll work across our entire stack: React/TypeScript frontend, Node.js backend, and PostgreSQL database. We're looking for someone who can ship features end-to-end, from database schema design to pixel-perfect UI components. You'll work on real-time collaboration, block-based editing, and performance optimization for large documents. Experience with operational transforms, WebSockets, and database optimization is a plus.",
        salary: "$130k - $200k",
        referralFee: "175.00",
        remote: true,
        active: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        id: this.currentJobId++,
        title: "iOS Engineer",
        company: "Instagram",
        location: "Menlo Park, CA",
        description: "Shape how billions of people share and connect through visual storytelling. You'll work on Instagram's main iOS app, building features for Stories, Reels, and the main feed. We're seeking an iOS engineer with expertise in Swift, UIKit, and performance optimization for media-heavy applications. You'll collaborate with product teams to experiment with new formats, work on camera and video processing, and ensure smooth scrolling for infinite feeds. Experience with Core Animation, AVFoundation, and large-scale iOS apps is essential.",
        salary: "$140k - $220k",
        referralFee: "250.00",
        remote: false,
        active: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      }
    ];

    sampleJobs.forEach(job => this.jobs.set(job.id, job));
  }

  private initializeSampleUser() {
    // Create a sample user that hasn't completed onboarding to test the flow
    const sampleUser: User = {
      id: this.currentUserId++,
      email: "john.doe@gmail.com",
      name: "John Doe",
      googleId: "mock-google-id-1",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      company: null,
      role: "both",
      totalEarnings: "0.00",
      totalSpent: "0.00",
      successfulReferrals: 0,
      active: true,
      onboardingCompleted: false, // Set to false to test onboarding flow
      position: null,
      department: null,
      workExperience: null,
      education: null,
      targetDomain: null,
      targetRole: null,
      experience: null,
      skills: null,
      referrerScore: 100,
      lastScoreUpdate: new Date(),
      createdAt: new Date(),
    };
    
    this.users.set(sampleUser.id, sampleUser);
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
      // Onboarding/Profile fields
      onboardingCompleted: insertUser.onboardingCompleted || false,
      position: insertUser.position || null,
      department: insertUser.department || null,
      workExperience: insertUser.workExperience || null,
      education: insertUser.education || null,
      targetDomain: insertUser.targetDomain || null,
      targetRole: insertUser.targetRole || null,
      experience: insertUser.experience || null,
      skills: insertUser.skills || null,
      referrerScore: 100,
      lastScoreUpdate: new Date(),
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
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.status === "pending"
    );
  }
}

// Legacy memory storage - replaced with database storage (DbStorage)
// export const storage = new MemStorage();
