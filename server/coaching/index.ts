import { eq } from "drizzle-orm";
import { db } from "../db";
import { coachingRequests, type InsertCoachingRequest, type CoachingRequest  } from "@shared/schema";

export const CoachingService = {
  createCoachingRequest: async (request: InsertCoachingRequest) => {
    const coachingRequest = await db.insert(coachingRequests).values(request).returning();
    return coachingRequest;
  },
  getCoachingRequest: async (id: number): Promise<CoachingRequest | null> => {
    const coachingRequest = await db.select().from(coachingRequests).where(eq(coachingRequests.id, id)).limit(1);
    return coachingRequest[0] || null;
  },
  updateCoachingRequest: async (request_id: number, request: Partial<CoachingRequest>) => {
    const coachingRequest = await db.update(coachingRequests).set(request).where(eq(coachingRequests.id, request_id)).returning();
    return coachingRequest;
  },
  getCoachingRequestsByMentor: async (mentorId: number) => {
    const requests = await db.select().from(coachingRequests).where(eq(coachingRequests.mentorId, mentorId));
    return requests;
  },
  getCoachingRequestsByMentee: async (menteeId: number) => {
    const requests = await db.select().from(coachingRequests).where(eq(coachingRequests.menteeId, menteeId));
    return requests;
  },
  getCoachingRequestsByStatus: async (status: "pending" | "accepted" | "declined" | "completed" | "cancelled") => {
    const requests = await db.select().from(coachingRequests).where(eq(coachingRequests.status, status));
    return requests;
  },
  getCoachingRequestsBySessionType: async (sessionType: "career-advice" | "mock-interview" | "technical-review" | "project-guidance") => {
        const requests = await db.select().from(coachingRequests).where(eq(coachingRequests.sessionType, sessionType));
    return requests;
  },
};