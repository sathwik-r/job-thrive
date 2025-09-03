# AWS Production Deployment Guide

This guide covers deploying Job Thrive to AWS ECS in the ap-south-1 (Mumbai) region for optimal performance with Indian users.

## Architecture Overview

- **Single ECS Fargate Service**: Serves both API (`/api/*`) and React client from one container
- **Application Load Balancer**: Routes traffic to ECS service with health checks
- **ECR Repository**: Stores Docker images
- **SSM Parameter Store**: Securely stores environment variables
- **CloudWatch Logs**: Application logging
- **Route 53**: DNS management (optional)

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. GitHub repository with OIDC setup (or AWS access keys)
3. Domain name (optional, for custom domain)

## Step-by-Step Setup

### 1. Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name job-thrive \
  --region ap-south-1
```

### 2. Create IAM Roles

#### ECS Task Execution Role
```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### ECS Task Role (for S3 access)
```bash
aws iam create-role \
  --role-name job-thrive-task-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Create policy for S3 access
aws iam put-role-policy \
  --role-name job-thrive-task-role \
  --policy-name S3Access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::jobthrive/*"
      }
    ]
  }'
```

### 3. Create S3 Bucket for File Uploads

```bash
aws s3 mb s3://jobthrive --region ap-south-1
```

### 4. Create RDS PostgreSQL Database

```bash
# Create subnet group for RDS
aws rds create-db-subnet-group \
  --db-subnet-group-name job-thrive-db-subnet-group \
  --db-subnet-group-description "Subnet group for Job Thrive RDS" \
  --subnet-ids SUBNET_ID_3 SUBNET_ID_4 \
  --region ap-south-1

# Create security group for RDS
aws ec2 create-security-group \
  --group-name job-thrive-rds-sg \
  --description "Security group for RDS PostgreSQL" \
  --vpc-id VPC_ID \
  --region ap-south-1

# Allow PostgreSQL traffic from ECS security group
aws ec2 authorize-security-group-ingress \
  --group-id RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group ECS_SG_ID \
  --region ap-south-1

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier job-thrive-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username jobthrive \
  --master-user-password "YOUR_STRONG_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --db-subnet-group-name job-thrive-db-subnet-group \
  --vpc-security-group-ids RDS_SG_ID \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00" \
  --deletion-protection \
  --region ap-south-1

# Wait for RDS to be available (this may take 5-10 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier job-thrive-db \
  --region ap-south-1

# Get the RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier job-thrive-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-south-1)

echo "RDS Endpoint: $RDS_ENDPOINT"
```

### 5. Store Secrets in SSM Parameter Store

```bash
# Database URL (replace with your actual values)
aws ssm put-parameter \
  --name "/job-thrive/database-url" \
  --value "postgresql://jobthrive:YOUR_STRONG_PASSWORD@$RDS_ENDPOINT:5432/jobthrive" \
  --type "SecureString" \
  --region ap-south-1

# Cognito Client Secret
aws ssm put-parameter \
  --name "/job-thrive/cognito-client-secret" \
  --value "your-cognito-client-secret" \
  --type "SecureString" \
  --region ap-south-1

# Razorpay Keys
aws ssm put-parameter \
  --name "/job-thrive/razorpay-key-id" \
  --value "your-razorpay-key-id" \
  --type "SecureString" \
  --region ap-south-1

aws ssm put-parameter \
  --name "/job-thrive/razorpay-key-secret" \
  --value "your-razorpay-key-secret" \
  --type "SecureString" \
  --region ap-south-1
```

### 5. Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --region ap-south-1

# Create subnets (replace VPC_ID with actual VPC ID)
# Public subnets for ECS (with internet access)
aws ec2 create-subnet \
  --vpc-id VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ap-south-1a \
  --region ap-south-1

aws ec2 create-subnet \
  --vpc-id VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone ap-south-1b \
  --region ap-south-1

# Private subnets for RDS (no internet access needed)
aws ec2 create-subnet \
  --vpc-id VPC_ID \
  --cidr-block 10.0.3.0/24 \
  --availability-zone ap-south-1a \
  --region ap-south-1

aws ec2 create-subnet \
  --vpc-id VPC_ID \
  --cidr-block 10.0.4.0/24 \
  --availability-zone ap-south-1b \
  --region ap-south-1

# Create Internet Gateway and attach to VPC
aws ec2 create-internet-gateway \
  --region ap-south-1

aws ec2 attach-internet-gateway \
  --vpc-id VPC_ID \
  --internet-gateway-id IGW_ID \
  --region ap-south-1

# Create route table for public subnets
aws ec2 create-route-table \
  --vpc-id VPC_ID \
  --region ap-south-1

aws ec2 create-route \
  --route-table-id PUBLIC_RT_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id IGW_ID \
  --region ap-south-1

# Associate public subnets with public route table
aws ec2 associate-route-table \
  --subnet-id PUBLIC_SUBNET_1_ID \
  --route-table-id PUBLIC_RT_ID \
  --region ap-south-1

aws ec2 associate-route-table \
  --subnet-id PUBLIC_SUBNET_2_ID \
  --route-table-id PUBLIC_RT_ID \
  --region ap-south-1

# Create security groups
aws ec2 create-security-group \
  --group-name job-thrive-alb-sg \
  --description "Security group for ALB" \
  --vpc-id VPC_ID \
  --region ap-south-1

aws ec2 create-security-group \
  --group-name job-thrive-ecs-sg \
  --description "Security group for ECS service" \
  --vpc-id VPC_ID \
  --region ap-south-1

aws ec2 create-security-group \
  --group-name job-thrive-rds-sg \
  --description "Security group for RDS PostgreSQL" \
  --vpc-id VPC_ID \
  --region ap-south-1

# Allow ALB to ECS traffic
aws ec2 authorize-security-group-ingress \
  --group-id ECS_SG_ID \
  --protocol tcp \
  --port 5000 \
  --source-group ALB_SG_ID \
  --region ap-south-1

# Allow ECS to RDS traffic
aws ec2 authorize-security-group-ingress \
  --group-id RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group ECS_SG_ID \
  --region ap-south-1
```

### 6. Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name job-thrive-alb \
  --subnets SUBNET_ID_1 SUBNET_ID_2 \
  --security-groups ALB_SG_ID \
  --region ap-south-1

# Create target group
aws elbv2 create-target-group \
  --name job-thrive-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id VPC_ID \
  --health-check-path /healthz \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-south-1

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=TARGET_GROUP_ARN \
  --region ap-south-1
```

### 7. Create ECS Cluster and Service

```bash
# Create cluster
aws ecs create-cluster \
  --cluster-name job-thrive-cluster \
  --region ap-south-1

# Create service (after updating task definition with correct ARNs)
aws ecs create-service \
  --cluster job-thrive-cluster \
  --service-name job-thrive-service \
  --task-definition job-thrive:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[PUBLIC_SUBNET_ID_1,PUBLIC_SUBNET_ID_2],securityGroups=[ECS_SG_ID],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=TARGET_GROUP_ARN,containerName=job-thrive,containerPort=5000" \
  --region ap-south-1
```

### 8. Create CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /ecs/job-thrive \
  --region ap-south-1
```

## GitHub Actions Setup

### 1. Create OIDC Provider (Recommended)

```bash
# Create OIDC provider
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  --region ap-south-1

# Create role for GitHub Actions
aws iam create-role \
  --role-name github-actions-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          },
          "StringLike": {
            "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/job-thrive:*"
          }
        }
      }
    ]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name github-actions-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name github-actions-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS-FullAccess
```

### 2. Add GitHub Secret

Add this secret to your GitHub repository:
- `AWS_ROLE_TO_ASSUME`: `arn:aws:iam::ACCOUNT_ID:role/github-actions-role`

## Environment Variables

The following environment variables are automatically injected from SSM Parameter Store:

- `DATABASE_URL`: PostgreSQL connection string
- `COGNITO_CLIENT_SECRET`: AWS Cognito client secret
- `RAZORPAY_KEY_ID`: Razorpay public key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key

Additional environment variables set in task definition:
- `NODE_ENV`: production
- `PORT`: 5000
- `AWS_REGION`: ap-south-1

## Deployment

1. Push to main branch
2. GitHub Actions will:
   - Build Docker image
   - Push to ECR
   - Update ECS service
   - Wait for deployment to complete

## Monitoring

- **CloudWatch Logs**: `/ecs/job-thrive`
- **ECS Service**: Monitor CPU/Memory usage
- **ALB**: Monitor request count, response times
- **Health Checks**: `/healthz` endpoint

## Scaling

- **Horizontal**: Increase `desired-count` in ECS service
- **Vertical**: Update task definition CPU/Memory
- **Auto Scaling**: Configure based on CPU/Memory metrics

## Cost Optimization

- Use Spot instances for non-critical workloads
- Right-size CPU/Memory allocation
- Monitor and optimize database queries
- Use CloudFront for global CDN (if needed)
- **RDS**: Use t3.micro for development, scale up as needed
- **Storage**: Monitor RDS storage usage and enable auto-scaling

## Troubleshooting

1. **Container fails to start**: Check CloudWatch logs
2. **Health check failures**: Verify `/healthz` endpoint
3. **Database connection issues**: Verify DATABASE_URL in SSM
4. **S3 upload failures**: Check task role permissions
5. **RDS connection issues**: Check security groups and subnet configuration
6. **Database performance**: Monitor RDS CloudWatch metrics

## Estimated Monthly Costs (ap-south-1)

- **ECS Fargate**: ~$15-25/month (512 CPU, 1GB RAM, minimal usage)
- **ALB**: ~$20/month
- **CloudWatch Logs**: ~$5-10/month
- **ECR**: ~$1-5/month (depending on image size/frequency)
- **SSM Parameter Store**: ~$0.05/month
- **RDS PostgreSQL**: ~$15-25/month (t3.micro, 20GB storage)
- **S3**: ~$1-5/month (depending on file uploads)
- **Internet Gateway**: ~$0/month (free)
- **Total**: ~$55-90/month for basic setup

**Note**: This setup avoids NAT Gateway (~$45/month) by using public subnets for ECS with public IPs.
