import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertReferralSchema } from "@shared/schema";
import { z } from "zod";

const authUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  googleId: z.string(),
  photoUrl: z.string().optional(),
  company: z.string().optional(),
});

const createReferralRequestSchema = z.object({
  jobId: z.number(),
  amount: z.string(),
  resumeUrl: z.string().optional(),
});

const updateReferralSchema = z.object({
  status: z.enum(["pending", "assigned", "in_review", "completed", "expired", "cancelled"]).optional(),
  referrerId: z.number().optional(),
  proofUrl: z.string().optional(),
  paymentId: z.string().optional(),
  orderId: z.string().optional(),
  assignedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/google", async (req, res) => {
    try {
      const userData = authUserSchema.parse(req.body);
      
      let user = await storage.getUserByGoogleId(userData.googleId);
      
      if (!user) {
        user = await storage.createUser({
          email: userData.email,
          name: userData.name,
          googleId: userData.googleId,
          photoUrl: userData.photoUrl,
          company: userData.company,
          role: "both",
          totalEarnings: "0.00",
          totalSpent: "0.00",
          successfulReferrals: 0,
          active: true,
        });
      }
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile update route for current user
  app.put('/api/user/profile', async (req, res) => {
    try {
      const userId = 1; // Mock user ID for testing
      const profileData = req.body;
      
      // Mark onboarding as completed and update profile
      const updates = {
        ...profileData,
        onboardingCompleted: true
      };
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const query = req.query.search as string;
      
      let jobs;
      if (query) {
        jobs = await storage.searchJobs(query);
      } else {
        jobs = await storage.getAllJobs();
      }
      
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Referral routes
  app.post("/api/referrals", async (req, res) => {
    try {
      const referralData = createReferralRequestSchema.parse(req.body);
      const userId = parseInt(req.headers['x-user-id'] as string);
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      // Create referral request
      const referral = await storage.createReferral({
        jobId: referralData.jobId,
        seekerId: userId,
        referrerId: null,
        status: "pending",
        amount: referralData.amount,
        resumeUrl: referralData.resumeUrl,
        proofUrl: null,
        paymentId: null,
        orderId: null,
        assignedAt: null,
        completedAt: null,
      });
      
      // Auto-assign referrer
      const job = await storage.getJob(referralData.jobId);
      if (job) {
        const eligibleReferrers = await storage.getUsersByCompany(job.company);
        const availableReferrer = eligibleReferrers.find(user => 
          user.id !== userId && user.active
        );
        
        if (availableReferrer) {
          await storage.updateReferral(referral.id, {
            referrerId: availableReferrer.id,
            status: "assigned",
            assignedAt: new Date(),
          });
        }
      }
      
      res.json(referral);
    } catch (error) {
      res.status(400).json({ message: "Invalid referral data" });
    }
  });

  app.get("/api/referrals/seeker/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const referrals = await storage.getReferralsBySeeker(userId);
      
      // Populate job data
      const referralsWithJobs = await Promise.all(
        referrals.map(async (referral) => {
          const job = await storage.getJob(referral.jobId);
          return { ...referral, job };
        })
      );
      
      res.json(referralsWithJobs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/referrals/referrer/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const referrals = await storage.getReferralsByReferrer(userId);
      
      // Populate job and seeker data
      const referralsWithData = await Promise.all(
        referrals.map(async (referral) => {
          const job = await storage.getJob(referral.jobId);
          const seeker = await storage.getUser(referral.seekerId);
          return { ...referral, job, seeker };
        })
      );
      
      res.json(referralsWithData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/referrals/:id", async (req, res) => {
    try {
      const referralId = parseInt(req.params.id);
      const updates = updateReferralSchema.parse(req.body);
      
      const referral = await storage.updateReferral(referralId, updates);
      
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      // Update user earnings if completed
      if (updates.status === "completed" && referral.referrerId) {
        const referrer = await storage.getUser(referral.referrerId);
        if (referrer) {
          await storage.updateUser(referrer.id, {
            totalEarnings: (parseFloat(referrer.totalEarnings) + parseFloat(referral.amount)).toString(),
            successfulReferrals: referrer.successfulReferrals + 1,
          });
        }
      }
      
      res.json(referral);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Payment route
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { paymentId, orderId, referralId } = req.body;
      
      // Update referral with payment info
      const referral = await storage.updateReferral(referralId, {
        paymentId,
        orderId,
        status: "assigned", // Move to assigned after payment
      });
      
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      // Update seeker's total spent
      const seeker = await storage.getUser(referral.seekerId);
      if (seeker) {
        await storage.updateUser(seeker.id, {
          totalSpent: (parseFloat(seeker.totalSpent) + parseFloat(referral.amount)).toString(),
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Payment verification failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
