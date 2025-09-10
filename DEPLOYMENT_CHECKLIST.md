# Quick Setup Checklist for Job Thrive AWS Deployment

## ✅ Pre-deployment Checklist

### 1. AWS Account Setup
- [ ] AWS CLI configured with appropriate permissions
- [ ] Account ID noted for task definition updates
- [ ] Region set to ap-south-1 (Mumbai)

### 2. GitHub Repository Setup
- [ ] Repository exists and code is pushed
- [ ] GitHub Actions enabled
- [ ] OIDC provider configured (or AWS access keys ready)

### 3. Domain & SSL (Optional)
- [ ] Domain name registered
- [ ] ACM certificate requested for domain
- [ ] Route 53 hosted zone created

### 4. External Services
- [ ] AWS Cognito User Pool created
- [ ] Razorpay account configured
- [ ] Database credentials ready (if using external DB)

## 🚀 Deployment Steps

### Phase 1: Infrastructure Setup
1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name job-thrive --region ap-south-1
   ```

2. **Create IAM Roles**
   - ECS Task Execution Role
   - ECS Task Role (for S3 access)
   - GitHub Actions Role (for CI/CD)

3. **Create VPC & Networking**
   - VPC with public/private subnets
   - Security groups for ALB, ECS, RDS
   - Internet Gateway & NAT Gateway

4. **Create RDS PostgreSQL**
   - db.t3.micro instance
   - 20GB storage
   - Backup retention enabled
   - Deletion protection enabled

5. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://jobthrive --region ap-south-1
   ```

### Phase 2: Application Setup
1. **Store Secrets in SSM**
   - DATABASE_URL
   - COGNITO_CLIENT_SECRET
   - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET

2. **Initialize Database**
   ```bash
   # Run the schema script
   PGPASSWORD="YOUR_PASSWORD" psql -h RDS_ENDPOINT -U jobthrive -d jobthrive -f scripts/schema.sql
   ```

3. **Create ALB & Target Group**
   - Health check path: `/healthz`
   - Target group port: 5000

4. **Create ECS Cluster & Service**
   - Fargate launch type
   - Task definition with proper ARNs

### Phase 3: CI/CD Setup
1. **Update Task Definition**
   - Replace `ACCOUNT_ID` placeholders
   - Verify all ARNs are correct

2. **Add GitHub Secret**
   - `AWS_ROLE_TO_ASSUME`: ARN of GitHub Actions role

3. **Test Deployment**
   - Push to main branch
   - Monitor GitHub Actions workflow
   - Verify application is accessible

## 🔧 Post-deployment Verification

### Health Checks
- [ ] `/healthz` endpoint returns 200
- [ ] ALB health checks passing
- [ ] ECS service stable

### Application Features
- [ ] User registration/login works
- [ ] Job listing displays correctly
- [ ] File uploads to S3 work
- [ ] Payment integration functional
- [ ] Database operations working

### Monitoring
- [ ] CloudWatch logs accessible
- [ ] RDS metrics visible
- [ ] ALB metrics available
- [ ] Error tracking configured

## 📊 Expected Costs (Monthly)

| Service | Cost Range |
|---------|------------|
| ECS Fargate | $15-25 |
| ALB | $20 |
| RDS PostgreSQL | $15-25 |
| CloudWatch Logs | $5-10 |
| ECR | $1-5 |
| S3 | $1-5 |
| **Total** | **$55-90** |

## 🚨 Important Notes

1. **Security**: All secrets stored in SSM Parameter Store (SecureString)
2. **Backup**: RDS has 7-day backup retention
3. **Scaling**: Start with 1 ECS task, scale as needed
4. **Monitoring**: Set up CloudWatch alarms for critical metrics
5. **Cost Control**: Monitor usage and set billing alerts

## 🔗 Useful Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster job-thrive-cluster --services job-thrive-service --region ap-south-1

# View application logs
aws logs tail /ecs/job-thrive --follow --region ap-south-1

# Check RDS status
aws rds describe-db-instances --db-instance-identifier job-thrive-db --region ap-south-1

# Update ECS service
aws ecs update-service --cluster job-thrive-cluster --service job-thrive-service --force-new-deployment --region ap-south-1
```
