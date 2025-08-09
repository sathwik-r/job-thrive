import { eq, and, ilike, or, desc, isNotNull } from "drizzle-orm";
import { db } from "./db";
import { users, jobs, referrals } from "@shared/schema";
import type { User, Job, Referral, InsertUser, InsertJob, InsertReferral } from "@shared/schema";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUsersByCompany(company: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.company, company));
  }

  // Job methods
  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.active, true)).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(jobData).returning();
    return result[0];
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const result = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async searchJobs(query: string): Promise<Job[]> {
    return await db.select().from(jobs).where(
      and(
        eq(jobs.active, true),
        or(
          ilike(jobs.title, `%${query}%`),
          ilike(jobs.company, `%${query}%`),
          ilike(jobs.description, `%${query}%`),
          ilike(jobs.location, `%${query}%`)
        )
      )
    ).orderBy(desc(jobs.createdAt));
  }

  // Referral methods
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const result = await db.insert(referrals).values(referralData).returning();
    return result[0];
  }

  async getReferral(id: number): Promise<Referral | undefined> {
    const result = await db.select().from(referrals).where(eq(referrals.id, id)).limit(1);
    return result[0];
  }

  async updateReferral(id: number, updates: Partial<Referral>): Promise<Referral | undefined> {
    const result = await db.update(referrals).set(updates).where(eq(referrals.id, id)).returning();
    return result[0];
  }

  async getReferralsBySeeker(seekerId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.seekerId, seekerId)).orderBy(desc(referrals.createdAt));
  }

  async getReferralsByReferrer(referrerId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(
      and(
        eq(referrals.referrerId, referrerId),
        isNotNull(referrals.referrerId)
      )
    ).orderBy(desc(referrals.createdAt));
  }

  async getPendingReferrals(): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.status, "pending")).orderBy(desc(referrals.createdAt));
  }
}

// Export a default instance for convenience
export const storage = new DbStorage(); 