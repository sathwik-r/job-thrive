import { storage } from "../server/db-storage";

const dummyJobs = [
  {
    title: "Senior Software Engineer",
    company: "Google",
    location: "Bangalore, India",
    description: `We are looking for a Senior Software Engineer to join our team.

Key Responsibilities:
- Design and implement scalable software solutions
- Lead technical projects and mentor junior engineers
- Collaborate with cross-functional teams
- Write clean, maintainable code with proper testing

Requirements:
- 5+ years of experience in software development
- Strong expertise in Java, Python, or Go
- Experience with distributed systems
- Good understanding of algorithms and data structures`,
    salary: "₹40,00,000 - ₹60,00,000",
    referralFee: "50000.00",
    remote: true,
    active: true
  },
  {
    title: "Product Manager",
    company: "Microsoft",
    location: "Hyderabad, India",
    description: `Microsoft is seeking a Product Manager to drive product strategy and execution.

Key Responsibilities:
- Define product vision and strategy
- Work with engineering teams to deliver features
- Analyze market trends and user feedback
- Drive product launches and go-to-market strategy

Requirements:
- 4+ years of product management experience
- Technical background preferred
- Strong analytical and communication skills
- Experience with Agile methodologies`,
    salary: "₹35,00,000 - ₹55,00,000",
    referralFee: "40000.00",
    remote: false,
    active: true
  },
  {
    title: "Frontend Developer",
    company: "Amazon",
    location: "Bangalore, India",
    description: `Join Amazon as a Frontend Developer and help build amazing user experiences.

Key Responsibilities:
- Build responsive web applications
- Implement UI/UX designs
- Optimize application performance
- Write unit tests and documentation

Requirements:
- 3+ years of frontend development experience
- Expert in React, TypeScript, and modern CSS
- Experience with state management (Redux/MobX)
- Knowledge of web performance optimization`,
    salary: "₹25,00,000 - ₹40,00,000",
    referralFee: "35000.00",
    remote: true,
    active: true
  },
  {
    title: "Data Scientist",
    company: "Flipkart",
    location: "Bangalore, India",
    description: `Looking for a Data Scientist to join our Analytics team.

Key Responsibilities:
- Build and deploy machine learning models
- Analyze large datasets to derive insights
- Create data visualization dashboards
- Collaborate with business teams

Requirements:
- Masters/PhD in Computer Science or related field
- Strong background in ML/AI
- Proficient in Python, SQL, and ML frameworks
- Experience with big data technologies`,
    salary: "₹30,00,000 - ₹45,00,000",
    referralFee: "30000.00",
    remote: false,
    active: true
  },
  {
    title: "DevOps Engineer",
    company: "Swiggy",
    location: "Bangalore, India",
    description: `Join Swiggy as a DevOps Engineer and help scale our infrastructure.

Key Responsibilities:
- Manage cloud infrastructure on AWS
- Implement CI/CD pipelines
- Monitor system performance
- Automate deployment processes

Requirements:
- 4+ years of DevOps experience
- Strong knowledge of AWS services
- Experience with Docker and Kubernetes
- Scripting skills in Python/Shell`,
    salary: "₹28,00,000 - ₹42,00,000",
    referralFee: "25000.00",
    remote: true,
    active: true
  }
];

async function addDummyJobs() {
  console.log("Adding dummy jobs...");
  
  try {
    for (const job of dummyJobs) {
      const newJob = await storage.createJob(job);
      console.log(`Created job: ${newJob.title} at ${newJob.company}`);
    }
    
    console.log("Successfully added all dummy jobs!");
  } catch (error) {
    console.error("Error adding dummy jobs:", error);
  }
}

// Run the function
addDummyJobs().then(() => process.exit(0));
