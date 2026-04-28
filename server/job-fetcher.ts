import axios from "axios";
import { db } from "./db";
import { jobs } from "@shared/schema";
import { eq, and, ilike } from "drizzle-orm";
import cron from "node-cron";

interface FetchedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string | null;
  remote: boolean;
  sourceUrl?: string;
}

// ── Free API Sources (no API key needed) ──────────────────────────

async function fetchFromRemoteOK(): Promise<FetchedJob[]> {
  try {
    const { data } = await axios.get("https://remoteok.com/api", {
      headers: { "User-Agent": "JobThrive/1.0" },
      timeout: 15000,
    });

    // First element is metadata, skip it
    const listings = Array.isArray(data) ? data.slice(1) : [];
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return listings
      .filter((j: any) => {
        const postedAt = j.epoch ? j.epoch * 1000 : 0;
        return postedAt > thirtyDaysAgo && j.position && j.company;
      })
      .slice(0, 50) // limit per run to stay safe
      .map((j: any) => ({
        title: j.position?.trim() || "Unknown",
        company: j.company?.trim() || "Unknown",
        location: j.location?.trim() || "Remote",
        description: (j.description || "").replace(/<[^>]*>/g, "").trim().slice(0, 2000) || `${j.position} at ${j.company}`,
        salary: j.salary || null,
        remote: true,
        sourceUrl: j.url || null,
      }));
  } catch (err) {
    console.error("[JobFetcher] RemoteOK error:", (err as Error).message);
    return [];
  }
}

async function fetchFromArbeitnow(): Promise<FetchedJob[]> {
  try {
    const { data } = await axios.get(
      "https://www.arbeitnow.com/api/job-board-api",
      { timeout: 15000 }
    );

    const listings = data?.data || [];
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return listings
      .filter((j: any) => {
        const createdAt = j.created_at ? new Date(j.created_at * 1000).getTime() : 0;
        return createdAt > thirtyDaysAgo && j.title && j.company_name;
      })
      .slice(0, 50)
      .map((j: any) => ({
        title: j.title?.trim() || "Unknown",
        company: j.company_name?.trim() || "Unknown",
        location: j.location?.trim() || "Remote",
        description: (j.description || "").replace(/<[^>]*>/g, "").trim().slice(0, 2000) || `${j.title} at ${j.company_name}`,
        salary: null,
        remote: j.remote === true,
        sourceUrl: j.url || null,
      }));
  } catch (err) {
    console.error("[JobFetcher] Arbeitnow error:", (err as Error).message);
    return [];
  }
}

// ── Deduplication & Insert ────────────────────────────────────────

async function isDuplicate(title: string, company: string): Promise<boolean> {
  const existing = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(ilike(jobs.title, title.trim()), ilike(jobs.company, company.trim())))
    .limit(1);
  return existing.length > 0;
}

async function insertJobs(fetchedJobs: FetchedJob[]): Promise<number> {
  let inserted = 0;

  for (const job of fetchedJobs) {
    if (!job.title || !job.company) continue;

    const duplicate = await isDuplicate(job.title, job.company);
    if (duplicate) continue;

    try {
      await db.insert(jobs).values({
        title: job.title,
        company: job.company,
        location: job.location || "Remote",
        description: job.description || `${job.title} position at ${job.company}`,
        salary: job.salary,
        referralFee: "499.00", // Platform standard fee
        remote: job.remote,
        active: true,
      });
      inserted++;
    } catch (err) {
      // Skip insert errors (e.g. constraint violations)
      console.error(`[JobFetcher] Insert error for "${job.title}":`, (err as Error).message);
    }
  }

  return inserted;
}

// ── Main Fetch ────────────────────────────────────────────────────

export async function fetchAndStoreJobs(): Promise<{ total: number; inserted: number }> {
  console.log("[JobFetcher] Starting job fetch...");

  // Fetch from all free sources in parallel
  const [remoteOKJobs, arbeitnowJobs] = await Promise.all([
    fetchFromRemoteOK(),
    fetchFromArbeitnow(),
  ]);

  const allJobs = [...remoteOKJobs, ...arbeitnowJobs];
  console.log(`[JobFetcher] Fetched ${remoteOKJobs.length} from RemoteOK, ${arbeitnowJobs.length} from Arbeitnow`);

  const inserted = await insertJobs(allJobs);
  console.log(`[JobFetcher] Inserted ${inserted} new jobs (${allJobs.length} total fetched, ${allJobs.length - inserted} duplicates skipped)`);

  return { total: allJobs.length, inserted };
}

// ── Cron Schedule ─────────────────────────────────────────────────
// Runs once daily at 3:00 AM IST (21:30 UTC previous day)
// This keeps us well within free tier limits

let cronTask: ReturnType<typeof cron.schedule> | null = null;

export function startJobFetchCron() {
  if (cronTask) return; // Already started

  // Run every day at 03:00 AM IST = 21:30 UTC
  cronTask = cron.schedule("30 21 * * *", async () => {
    try {
      const result = await fetchAndStoreJobs();
      console.log(`[JobFetcher CRON] Completed: ${result.inserted} new jobs added`);
    } catch (err) {
      console.error("[JobFetcher CRON] Error:", err);
    }
  });

  console.log("[JobFetcher] Cron scheduled: daily at 03:00 AM IST");

  // Also run immediately on first startup to seed data
  fetchAndStoreJobs().catch((err) =>
    console.error("[JobFetcher] Initial fetch error:", err)
  );
}

export function stopJobFetchCron() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
}
