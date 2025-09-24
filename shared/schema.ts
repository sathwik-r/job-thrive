import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  googleId: text("google_id").notNull().unique(),
  photoUrl: text("photo_url"),
  company: text("company"),
  role: text("role", { enum: ["seeker", "referrer", "both"] }).default("both").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00").notNull(),
  successfulReferrals: integer("successful_referrals").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  // Onboarding/Profile fields
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  // Referrer specific fields
  position: text("position"),
  department: text("department"),
  workExperience: text("work_experience"),
  // Match-making algorithm fields
  referrerScore: integer("referrer_score").default(100).notNull(),
  lastScoreUpdate: timestamp("last_score_update").defaultNow().notNull(),
  // Seeker specific fields
  education: text("education"),
  targetDomain: text("target_domain"),
  targetRole: text("target_role"),
  experience: text("experience"),
  skills: text("skills").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  salary: text("salary"),
  referralFee: decimal("referral_fee", { precision: 10, scale: 2 }).notNull(),
  remote: boolean("remote").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  seekerId: integer("seeker_id").references(() => users.id).notNull(),
  referrerId: integer("referrer_id").references(() => users.id),
  status: text("status", { 
    enum: ["pending", "assigned", "verification_pending", "completed", "expired", "cancelled", "verification_pending"] 
  }).default("pending").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  resumeUrl: text("resume_url"),
  proofUrl: text("proof_url"),
  paymentId: text("payment_id"),
  orderId: text("order_id"),
  assignedAt: timestamp("assigned_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  referralId: integer("referral_id").references(() => referrals.id).notNull(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  status: text("status", { 
    enum: ["assigned", "accepted", "rejected", "expired", "completed"] 
  }).default("assigned").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(), // 12 hours from assignment
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coachingRequests = pgTable("coaching_requests", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").references(() => users.id).notNull(),
  menteeId: integer("mentee_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "accepted", "declined", "completed", "cancelled"] }).default("pending").notNull(),
  sessionType: text("session_type", { enum: ["career-advice", "mock-interview", "technical-review", "project-guidance"] }).notNull(),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").notNull(),
  cost: integer("cost").notNull(),
  paymentId: text("payment_id"),
  orderId: text("order_id"),
  cancelledAt: timestamp("cancelled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mentorProfiles = pgTable("mentor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
  sessions: integer("sessions").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertCoachingRequestSchema = createInsertSchema(coachingRequests).omit({
  id: true,
  createdAt: true,
});

export const insertMentorProfileSchema = createInsertSchema(mentorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type CoachingRequest = typeof coachingRequests.$inferSelect;
export type InsertCoachingRequest = z.infer<typeof insertCoachingRequestSchema>;

export type MentorProfile = typeof mentorProfiles.$inferSelect;
export type InsertMentorProfile = z.infer<typeof insertMentorProfileSchema>;