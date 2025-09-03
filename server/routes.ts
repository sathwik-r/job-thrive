import { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import AWS from "aws-sdk";
dotenv.config();
import { insertUserSchema, insertReferralSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken, optionalAuth, requireRole } from "./auth-middleware";
import { razorpayService } from './razorpay-service';
import { assignReferral } from './match-making';


const authUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  googleId: z.string(),
  photoUrl: z.string().optional(),
  company: z.string().optional(),
});

const cognitoCallbackSchema = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

const createReferralRequestSchema = z.object({
  jobId: z.number(),
  amount: z.string(),
  resumeUrl: z.string().optional(),
});

const updateReferralSchema = insertReferralSchema.partial().extend({
  id: z.number(),
  seekerId: z.number().optional(),
  referrerId: z.number().optional(),
  status: z.enum(["pending", "assigned", "in_review", "completed", "expired", "cancelled"]).optional(),
  proofUrl: z.string().optional(),
  proofDescription: z.string().optional(),
  notes: z.string().optional(),
  assignedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for load balancers and uptime checks
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });
  // Token validation endpoint
  app.get("/api/auth/validate", authenticateToken, async (req, res) => {
    try {
      // If we get here, the token is valid (authenticateToken middleware passed)
      // Return user info to confirm authentication
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json({ valid: true, user });
    } catch (error) {
      res.status(401).json({ message: "Token validation failed" });
    }
  });

  // Cognito callback route
  app.post("/api/auth/cognito-callback", async (req, res) => {
    try {
      const { code, redirectUri } = cognitoCallbackSchema.parse(req.body);
      
      // Use client secret from environment (secure on backend)
      const clientId = '6cmhee7smndjjsl8k1drkjq6tv';
      const clientSecret = process.env.COGNITO_CLIENT_SECRET || 'sm8905e569brs2l26a7kpj9upf57ku7mo756l5ndl7icsorpsl7';
      
      // Exchange authorization code for tokens with client secret
      const tokenResponse = await axios.post(
        'https://us-east-16jz6iuh4j.auth.us-east-1.amazoncognito.com/oauth2/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          code: code,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
        }
      );
      console.log('Token exchange successful, status:', tokenResponse.status);

      const { access_token, id_token } = tokenResponse.data;

      // Get user info from Cognito
      const userInfoResponse = await axios.get(
        'https://us-east-16jz6iuh4j.auth.us-east-1.amazoncognito.com/oauth2/userInfo',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );

      const cognitoUserInfo = userInfoResponse.data;
      
      // Decode ID token to get user ID
      const idTokenPayload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
      
      // Check if user exists in database by email (primary identifier)
      let user;
      try {
        user = await storage.getUserByEmail(cognitoUserInfo.email);
        if (user) {
          // Update existing user with latest info from Cognito
          user = await storage.updateUser(user.id, {
            googleId: idTokenPayload.sub,
            photoUrl: cognitoUserInfo.picture || user.photoUrl,
            name: cognitoUserInfo.name || user.name,
          });
        }
      } catch (error) {
        // User not found by email, will create new user
      }

      if (!user) {
        // Create new user
        user = await storage.createUser({
          email: cognitoUserInfo.email,
          name: cognitoUserInfo.name || `${cognitoUserInfo.given_name || ''} ${cognitoUserInfo.family_name || ''}`.trim(),
          googleId: idTokenPayload.sub,
          photoUrl: cognitoUserInfo.picture,
          company: null,
          role: "both",
          totalEarnings: "0.00",
          totalSpent: "0.00",
          successfulReferrals: 0,
          active: true,
          onboardingCompleted: false,
        });
      }

      // Return user data along with the JWT token
      res.json({
        user,
        token: id_token, // This is the JWT from Cognito
        tokenType: 'Bearer'
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('Cognito callback error:', error.response?.data);
      }
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  // Legacy Google OAuth route (can be removed if not needed)
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

  // User routes - protected
  app.get("/api/user/:id", authenticateToken, async (req, res) => {
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

  app.put("/api/user/:id", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;

      // Users can only update their own data
      if (req.user!.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

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
  app.post("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const profileData = req.body;
      const userId = req.user!.id; // Get from authenticated user

      // Mark onboarding as completed and update profile
      const updates = {
        ...profileData,
        onboardingCompleted: true,
      };
      
      // Remove userId from updates if it exists (shouldn't be updated)
      delete updates.userId;
      
      
      const updatedUser = await storage.updateUser(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Job routes - some public, some protected
  app.get("/api/jobs", optionalAuth, async (req, res) => {
    try {
      const query = (req.query.search as string) || '';
      const pageParam = parseInt((req.query.page as string) || '1', 10);
      const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
      console.log("page is ", page);
      // Hardcoded page size on server
      const pageSize = 2;
      const offset = (page - 1) * pageSize;

      let jobs;
      let total;
      if (query) {
        [jobs, total] = await Promise.all([
          storage.searchJobsPaginated(query, offset, pageSize),
          storage.searchJobsCount(query),
        ]);
      } else {
        [jobs, total] = await Promise.all([
          storage.getJobsPaginated(offset, pageSize),
          storage.getJobsCount(),
        ]);
      }

      res.json({
        items: jobs,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/jobs/:id", optionalAuth, async (req, res) => {
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

  // Referral routes - protected
  app.post("/api/referrals", authenticateToken, async (req, res) => {
    try {
      const referralData = createReferralRequestSchema.parse(req.body);
      const userId = req.user!.id; // Get from authenticated user

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
        const availableReferrer = eligibleReferrers.find(
          (user) => user.id !== userId && user.active,
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

  app.get("/api/referrals/seeker/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Users can only access their own referrals
      if (req.user!.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const referrals = await storage.getReferralsBySeeker(userId);

      // Populate job data
      const referralsWithJobs = await Promise.all(
        referrals.map(async (referral) => {
          const job = await storage.getJob(referral.jobId);
          return { ...referral, job };
        }),
      );

      res.json(referralsWithJobs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/referrals/referrer/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Users can only access their own referrals
      if (req.user!.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const referrals = await storage.getReferralsByReferrer(userId);

      // Populate job and seeker data
      const referralsWithData = await Promise.all(
        referrals.map(async (referral) => {
          const job = await storage.getJob(referral.jobId);
          const seeker = await storage.getUser(referral.seekerId);
          return { ...referral, job, seeker };
        }),
      );

      res.json(referralsWithData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/referrals/:id", authenticateToken, async (req, res) => {
    try {
      const referralId = parseInt(req.params.id);
      const updates = updateReferralSchema.parse(req.body);

      // Check if user has permission to update this referral
      const existingReferral = await storage.getReferral(referralId);
      if (!existingReferral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      // Users can only update referrals they're involved in
      if (existingReferral.seekerId !== req.user!.id && existingReferral.referrerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const referral = await storage.updateReferral(referralId, updates);

      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }

      // Update user earnings if completed
      if (updates.status === "completed" && referral.referrerId) {
        const referrer = await storage.getUser(referral.referrerId);
        if (referrer) {
          await storage.updateUser(referrer.id, {
            totalEarnings: (
              parseFloat(referrer.totalEarnings) + parseFloat(referral.amount)
            ).toString(),
            successfulReferrals: referrer.successfulReferrals + 1,
          });
        }
      }

      res.json(referral);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Create Razorpay order - protected
  app.post("/api/payment/create-order", authenticateToken, async (req, res) => {
    try {
      const { amount, currency = 'INR', jobId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      // Verify job exists and get details
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Verify amount matches job referral fee (no processing fee)
      const expectedAmount = parseFloat(job.referralFee);

      if (Math.abs(amount - expectedAmount) > 0.01) { // Allow small floating point differences
        return res.status(400).json({ message: "Amount mismatch" });
      }

      // Create order with Razorpay
      const order = await razorpayService.createOrder(
        amount,
        currency,
        `job_${jobId}_user_${req.user!.id}_${Date.now()}`
      );

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  // Generate S3 pre-signed URL for resume upload - protected
  app.post("/api/upload/resume-presigned-url", authenticateToken, async (req, res) => {
    try {
      const { fileName, fileType } = req.body;
      
      if (!fileName || !fileType) {
        return res.status(400).json({ message: "Missing fileName or fileType" });
      }

      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(fileType)) {
        return res.status(400).json({ message: "Invalid file type" });
      }

      // Generate unique file path
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const uuid = crypto.randomUUID();
      const fileExtension = fileName.split('.').pop();
      const s3Key = `job-thrive/${monthYear}/${fileName}-${uuid}.${fileExtension}`;

      // Configure S3
      const s3 = new AWS.S3({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      // Generate pre-signed URL for PUT operation
      const presignedUrl = await s3.getSignedUrlPromise('putObject', {
        Bucket: 'jobthrive',
        Key: s3Key,
        ContentType: fileType,
        Expires: 3600, // URL expires in 1 hour
      });

      res.json({
        presignedUrl,
        s3Key,
        expiresIn: 3600,
      });
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Test endpoint for assignReferral (remove in production)
  app.post("/api/test/assign-referral", async (req, res) => {
    try {
      const { referralId } = req.body;
      if (!referralId) {
        return res.status(400).json({ message: "Missing referralId" });
      }
      
      const result = await assignReferral(parseInt(referralId));
      res.json(result);
    } catch (error) {
      console.error("Test assignment error:", error);
      res.status(500).json({ message: "Test assignment failed", error: String(error) });
    }
  });

  // Payment verification - protected
  app.post("/api/payment/verify", authenticateToken, async (req, res) => {
    try {
      const { paymentId, orderId, signature, referralId } = req.body;

      if (!paymentId || !orderId || !signature) {
        return res.status(400).json({ message: "Missing payment details" });
      }

      // Verify payment signature with Razorpay
      const isValidSignature = razorpayService.verifyPaymentSignature(
        orderId,
        paymentId,
        signature
      );

      if (!isValidSignature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }

      // Get payment details from Razorpay to verify status
      const paymentDetails = await razorpayService.getPaymentDetails(paymentId);
      
      if (paymentDetails.status !== 'captured') {
        return res.status(400).json({ message: "Payment not captured" });
      }

      // Check if referral exists and user owns it
      const existingReferral = await storage.getReferral(referralId);
      if (!existingReferral || existingReferral.seekerId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update referral with payment info
      const referral = await storage.updateReferral(referralId, {
        paymentId,
        orderId,
        status: "pending", // Move to assigned after payment
      });

      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }

      // Assign referral to best available referrer using match-making algorithm
      try {
        const assignmentResult = await assignReferral(referralId);
        if (!assignmentResult.success) {
          console.warn(`Failed to assign referral ${referralId}: ${assignmentResult.message}`);
        } else {
          console.log(`Referral ${referralId} assigned successfully to assignment ${assignmentResult.assignmentId}`);
        }
      } catch (error) {
        console.error(`Error assigning referral ${referralId}:`, error);
        // Continue with payment verification even if assignment fails
      }

      // Update seeker's total spent
      const seeker = await storage.getUser(referral.seekerId);
      if (seeker) {
        await storage.updateUser(seeker.id, {
          totalSpent: (
            parseFloat(seeker.totalSpent) + parseFloat(referral.amount)
          ).toString(),
        });
      }

      res.json({ 
        success: true, 
        referral,
        paymentDetails: {
          paymentId: paymentDetails.id,
          amount: Number(paymentDetails.amount) / 100, // Convert from paise
          currency: paymentDetails.currency,
          status: paymentDetails.status,
        }
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(400).json({ message: "Payment verification failed" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
