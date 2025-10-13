import { eq, and, ilike, or, desc, isNotNull, sql, count, inArray, ne } from "drizzle-orm";
import { db } from "./db";
import { users, jobs, referrals, assignments, mentorProfiles } from "@shared/schema";
import type { User, Job, Referral, InsertUser, InsertJob, InsertReferral, Assignment } from "@shared/schema";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUsersByIds(ids: number[]): Promise<User[]> {
    const result = await db.select().from(users).where(inArray(users.id, ids));
    return result;
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

  async getMentors(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getMentorsPaginated(options: {
    page: number;
    pageSize: number;
    search?: string;
    company?: string;
    minExperience?: number;
    skills?: string[];
    sortBy?: "rating" | "sessions" | "recent";
  }): Promise<{ items: (User & { rating: string | null; sessions: number | null })[]; total: number }>{
    const { page, pageSize, search = "", company, minExperience, skills = [], sortBy = "recent" } = options;
    const offset = (page - 1) * pageSize;

    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.company, `%${search}%`),
          ilike(users.position, `%${search}%`)
        )
      );
    }
    if (company) {
      conditions.push(eq(users.company, company));
    }
    if (typeof minExperience === "number" && minExperience > 0) {
      conditions.push(
        sql`COALESCE(NULLIF(regexp_replace(${users.experience}, '[^0-9]', '', 'g'), ''), '0')::int >= ${minExperience}`
      );
    }
    if (skills.length > 0) {
      // Using text[] contains ANY via SQL since drizzle's array helpers are limited
      conditions.push(sql`${users.skills} && ${skills}::text[]`);
    }

    const orderBy =
      sortBy === "rating"
        ? desc(mentorProfiles.rating)
        : sortBy === "sessions"
        ? desc(mentorProfiles.sessions)
        : desc(users.createdAt);

    const whereExpr = and(...conditions) ?? sql`true`;
    const items = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        googleId: users.googleId,
        photoUrl: users.photoUrl,
        company: users.company,
        role: users.role,
        totalEarnings: users.totalEarnings,
        totalSpent: users.totalSpent,
        successfulReferrals: users.successfulReferrals,
        active: users.active,
        onboardingCompleted: users.onboardingCompleted,
        position: users.position,
        department: users.department,
        workExperience: users.workExperience,
        referrerScore: users.referrerScore,
        lastScoreUpdate: users.lastScoreUpdate,
        education: users.education,
        targetDomain: users.targetDomain,
        targetRole: users.targetRole,
        experience: users.experience,
        skills: users.skills,
        createdAt: users.createdAt,
        rating: mentorProfiles.rating,
        sessions: mentorProfiles.sessions,
      })
      .from(users)
      .leftJoin(mentorProfiles, eq(mentorProfiles.userId, users.id))
      .where(whereExpr)
      .orderBy(orderBy)
      .offset(offset)
      .limit(pageSize);

    const totalResult = await db
      .select({ value: count() })
      .from(users)
      .where(whereExpr);

    return { items: items as any, total: Number(totalResult[0]?.value || 0) };
  }

  // Job methods
  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.active, true)).orderBy(desc(jobs.createdAt));
  }

  async getJobsPaginated(offset: number, limit: number, excludeCompanyNormalized?: string): Promise<Job[]> {
    const baseCondition = eq(jobs.active, true);
    const whereExpr = excludeCompanyNormalized
      ? and(
          baseCondition,
          sql`LOWER(BTRIM(${jobs.company})) <> ${excludeCompanyNormalized}`
        )
      : baseCondition;

    return await db
      .select()
      .from(jobs)
      .where(whereExpr)
      .orderBy(desc(jobs.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async getJobsCount(excludeCompanyNormalized?: string): Promise<number> {
    const baseCondition = eq(jobs.active, true);
    const whereExpr = excludeCompanyNormalized
      ? and(
          baseCondition,
          sql`LOWER(BTRIM(${jobs.company})) <> ${excludeCompanyNormalized}`
        )
      : baseCondition;

    const result = await db.select({ value: count() }).from(jobs).where(whereExpr);
    return Number(result[0]?.value || 0);
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
    return await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.active, true),
          or(
            ilike(jobs.title, `%${query}%`),
            ilike(jobs.company, `%${query}%`),
            ilike(jobs.description, `%${query}%`),
            ilike(jobs.location, `%${query}%`)
          )
        )
      )
      .orderBy(desc(jobs.createdAt));
  }

  async searchJobsPaginated(query: string, offset: number, limit: number, excludeCompanyNormalized?: string): Promise<Job[]> {
    const searchCondition = and(
      eq(jobs.active, true),
      or(
        ilike(jobs.title, `%${query}%`),
        ilike(jobs.company, `%${query}%`),
        ilike(jobs.description, `%${query}%`),
        ilike(jobs.location, `%${query}%`)
      )
    );
    const whereExpr = excludeCompanyNormalized
      ? and(searchCondition, sql`LOWER(BTRIM(${jobs.company})) <> ${excludeCompanyNormalized}`)
      : searchCondition;

    return await db
      .select()
      .from(jobs)
      .where(whereExpr)
      .orderBy(desc(jobs.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async searchJobsCount(query: string, excludeCompanyNormalized?: string): Promise<number> {
    const searchCondition = and(
      eq(jobs.active, true),
      or(
        ilike(jobs.title, `%${query}%`),
        ilike(jobs.company, `%${query}%`),
        ilike(jobs.description, `%${query}%`),
        ilike(jobs.location, `%${query}%`)
      )
    );
    const whereExpr = excludeCompanyNormalized
      ? and(searchCondition, sql`LOWER(BTRIM(${jobs.company})) <> ${excludeCompanyNormalized}`)
      : searchCondition;

    const result = await db
      .select({ value: count() })
      .from(jobs)
      .where(whereExpr);
    return Number(result[0]?.value || 0);
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

  async getAssignmentsByReferrerId(referrerId: number): Promise<Assignment[]> {
      const result = await db.select().from(assignments).where(
      and(
        eq(assignments.referrerId, referrerId),
        sql`${assignments.status} IN ('assigned', 'accepted')`
      )
    );
    return result;
  }

  async getAllAssignmentsByReferrerId(): Promise<Assignment[]> {
    const result = await db.select().from(assignments).where(
    and(
      isNotNull(assignments.referrerId)
    )
  );
  return result;
}

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const result = await db.select().from(assignments).where(eq(assignments.id, id));
    return result[0];
  }
}

// Export a default instance for convenience
export const storage = new DbStorage(); 