import { db } from "../db";
import { users, referrals, assignments, jobs } from "../../shared/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { addHours, isAfter, isBefore } from "date-fns";

export interface MatchMakingResult {
  success: boolean;
  assignmentId?: number;
  message: string;
}

export interface ReferrerScore {
  id: number;
  referrerScore: number;
}

export async function getReferrerScores(): Promise<ReferrerScore[]> {
  const result = await db
    .select({
      id: users.id,
      referrerScore: users.referrerScore
    })
    .from(users)
    .where(
      and(
        eq(users.active, true),
        sql`${users.role} IN ('referrer', 'both')`
      )
    )
    .orderBy(desc(users.referrerScore));

  return result;
}

export async function findBestReferrer(referralId: number): Promise<number | null> {
  // Get referral and job info directly without relations
  console.log("Finding best referrer for referral:", referralId);
  const referral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.id, referralId))
    .limit(1);

  if (!referral.length) {
    console.log("Referral not found");
    throw new Error("Referral not found");
  }

  const referralData = referral[0];
  
  // Fetch job to normalize company (trim and lowercase)
  const jobRow = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, referralData.jobId))
    .limit(1);
    
  const jobCompanyNormalized = (jobRow[0]?.company || "").trim().toLowerCase();

  if (!jobCompanyNormalized) {
    return null;
  }

  // Select best referrer whose company matches the job company (trim/lowercase), ordered by score
  const candidates = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.active, true),
        sql`${users.role} IN ('referrer', 'both')`,
        // Compare LOWER(TRIM(users.company)) to normalized job company
        sql`LOWER(BTRIM(${users.company})) = ${jobCompanyNormalized}`
      )
    )
    .orderBy(desc(users.referrerScore))
    .limit(1);

  if (!candidates.length) {
    return null;
  }

  return candidates[0].id;
}

export async function assignReferral(referralId: number): Promise<MatchMakingResult> {
  try {
    // Check if referral is already assigned
    const referral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.id, referralId))
    .limit(1)

    if (referral[0].referrerId !== null) {
      console.log("Referral is already assigned");
      return {
        success: false,
        message: "Referral is already assigned"
      };
    }

    // Find the best referrer
    const referrerId = await findBestReferrer(referralId);
    
    if (!referrerId) {
      console.log("No available referrers found");
      return {
        success: false,
        message: "No available referrers found"
      };
    }

    // Create assignment with 12-hour SLA
    const expiresAt = addHours(new Date(), 12);
    
    const [assignment] = await db
      .insert(assignments)
      .values({
        referralId,
        referrerId,
        expiresAt,
        status: "assigned"
      })
      .returning();

    // Decrease referrer score by 10 for active assignment
    await db
      .update(users)
      .set({ 
        referrerScore: sql`${users.referrerScore} - 10`,
        lastScoreUpdate: new Date()
      })
      .where(eq(users.id, referrerId));

    // Update referral status
    await db
      .update(referrals)
      .set({ 
        status: "assigned",
        assignedAt: new Date(),
        referrerId: referrerId
      })
      .where(eq(referrals.id, referralId));

    return {
      success: true,
      assignmentId: assignment.id,
      message: "Referral assigned successfully"
    };
  } catch (error) {
    console.error("Error assigning referral:", error);
    return {
      success: false,
      message: "Failed to assign referral"
    };
  }
}

export async function handleExpiredAssignments(): Promise<void> {
  const now = new Date();
  
  // Find expired assignments
  const expiredAssignments = await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.status, "assigned"),
        lte(assignments.expiresAt, now)
      )
    );

  for (const assignment of expiredAssignments) {
    // Mark assignment as expired
    await db
      .update(assignments)
      .set({ status: "expired" })
      .where(eq(assignments.id, assignment.id));

    // Add 10 points back to referrer's score (restore the deduction from active assignment)
    await db
      .update(users)
      .set({ 
        referrerScore: sql`${users.referrerScore} + 10`,
        lastScoreUpdate: new Date()
      })
      .where(eq(users.id, assignment.referrerId));

    // Reset referral status to pending
    await db
      .update(referrals)
      .set({ 
        status: "pending",
        assignedAt: null,
        referrerId: null
      })
      .where(eq(referrals.id, assignment.referralId));

    // Try to reassign to another referrer
    await assignReferral(assignment.referralId);
  }
}

/**
 * Update referrer score after successful referral
 */
export async function updateReferrerScore(
  referrerId: number, 
  action: "success" | "expiry" | "completion"
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, referrerId)
  });

  if (!user) return;

  let scoreChange = 0;
  
  switch (action) {
    case "success":
      scoreChange = 7; // +7 for successful referral
      break;
    case "expiry":
      scoreChange = 10; // +10 back after expiry (removes the -10 from active assignment)
      break;
    case "completion":
      scoreChange = 10; // +10 back after completion (removes the -10 from active assignment)
      break;
  }

  if (scoreChange !== 0) {
    await db
      .update(users)
      .set({ 
        referrerScore: user.referrerScore + scoreChange,
        lastScoreUpdate: new Date()
      })
      .where(eq(users.id, referrerId));
  }
}

/**
 * Daily score decay (to be called by cron job)
 * Decreases all referrer scores by 5 points daily
 */
export async function dailyScoreDecay(): Promise<void> {
  await db
    .update(users)
    .set({ 
      referrerScore: sql`GREATEST(${users.referrerScore} - 5, 0)`,
      lastScoreUpdate: new Date()
    })
    .where(
      and(
        eq(users.active, true),
        sql`${users.role} IN ('referrer', 'both')`
      )
    );
}

/**
 * Get active assignments for a referrer
 */
export async function getReferrerActiveAssignments(referrerId: number) {
  return await db
    .select()
    .from(assignments)
    .where(
      and(
        eq(assignments.referrerId, referrerId),
        sql`${assignments.status} IN ('assigned', 'accepted')`
      )
    );
}

export async function acceptAssignment(assignmentId: number): Promise<boolean> {
  try {
    const assignment = await db.query.assignments.findFirst({
      where: eq(assignments.id, assignmentId)
    });

    if (!assignment) return false;

    // Update assignment status
    await db
      .update(assignments)
      .set({ 
        status: "accepted",
        acceptedAt: new Date()
      })
      .where(eq(assignments.id, assignmentId));

    // Add 10 points back to referrer's score (restore the deduction from active assignment)
    await db
      .update(users)
      .set({ 
        referrerScore: sql`${users.referrerScore} + 10`,
        lastScoreUpdate: new Date()
      })
      .where(eq(users.id, assignment.referrerId));

    return true;
  } catch (error) {
    console.error("Error accepting assignment:", error);
    return false;
  }
}


export async function rejectAssignment(assignmentId: number): Promise<boolean> {
  try {
    const assignment = await db.query.assignments.findFirst({
      where: eq(assignments.id, assignmentId)
    });

    if (!assignment) return false;

    // Mark assignment as rejected
    await db
      .update(assignments)
      .set({ status: "rejected" })
      .where(eq(assignments.id, assignmentId));

    // Add 10 points back to referrer's score (restore the deduction from active assignment)
    await db
      .update(users)
      .set({ 
        referrerScore: sql`${users.referrerScore} + 10`,
        lastScoreUpdate: new Date()
      })
      .where(eq(users.id, assignment.referrerId));

    // Reset referral status
    await db
      .update(referrals)
      .set({ 
        status: "pending",
        assignedAt: null,
        referrerId: null
      })
      .where(eq(referrals.id, assignment.referralId));

    // Try to reassign
    await assignReferral(assignment.referralId);

    return true;
  } catch (error) {
    console.error("Error rejecting assignment:", error);
    return false;
  }
}



handleExpiredAssignments()