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
