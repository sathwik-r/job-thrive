# Database Schema Setup for RDS
# This SQL script creates all the tables needed for Job Thrive

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  google_id TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  company TEXT,
  role TEXT DEFAULT 'both' NOT NULL CHECK (role IN ('seeker', 'referrer', 'both')),
  total_earnings DECIMAL(10,2) DEFAULT '0.00' NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT '0.00' NOT NULL,
  successful_referrals INTEGER DEFAULT 0 NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  position TEXT,
  department TEXT,
  work_experience TEXT,
  referrer_score INTEGER DEFAULT 100 NOT NULL,
  last_score_update TIMESTAMP DEFAULT NOW() NOT NULL,
  education TEXT,
  target_domain TEXT,
  target_role TEXT,
  experience TEXT,
  skills TEXT[],
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  salary TEXT,
  referral_fee DECIMAL(10,2) NOT NULL,
  remote BOOLEAN DEFAULT false NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  seeker_id INTEGER NOT NULL REFERENCES users(id),
  referrer_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'assigned', 'in_review', 'completed', 'expired', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL,
  resume_url TEXT,
  proof_url TEXT,
  payment_id TEXT,
  order_id TEXT,
  assigned_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  referral_id INTEGER NOT NULL REFERENCES referrals(id),
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'assigned' NOT NULL CHECK (status IN ('assigned', 'accepted', 'rejected', 'expired', 'completed')),
  assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(active);
CREATE INDEX IF NOT EXISTS idx_referrals_seeker_id ON referrals(seeker_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_assignments_referral_id ON assignments(referral_id);
CREATE INDEX IF NOT EXISTS idx_assignments_referrer_id ON assignments(referrer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_expires_at ON assignments(expires_at);

-- Insert sample data (optional)
INSERT INTO jobs (title, company, location, description, salary, referral_fee, remote) VALUES
('Software Engineer', 'TechCorp India', 'Mumbai', 'Full-stack development role with React and Node.js', '₹12-18 LPA', 5000.00, false),
('Product Manager', 'StartupXYZ', 'Bangalore', 'Lead product development and strategy', '₹15-25 LPA', 7500.00, true),
('Data Scientist', 'AnalyticsPro', 'Delhi', 'Build ML models and data pipelines', '₹18-30 LPA', 10000.00, true)
ON CONFLICT DO NOTHING;
