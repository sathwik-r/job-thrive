# Environment Variables Reference

This document lists all environment variables required for Job Thrive production deployment.

## Required Environment Variables

### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://username:password@host:port/database`
  - Example: `postgresql://jobthrive:password@job-thrive-db.xyz.ap-south-1.rds.amazonaws.com:5432/jobthrive`

### AWS Configuration
- `AWS_REGION`: AWS region (set to `ap-south-1`)
- `AWS_ACCESS_KEY_ID`: AWS access key (if not using IAM roles)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (if not using IAM roles)

### Authentication (AWS Cognito)
- `COGNITO_CLIENT_SECRET`: Client secret from Cognito User Pool
- `COGNITO_USER_POOL_ID`: User Pool ID (optional, for additional features)
- `COGNITO_CLIENT_ID`: Client ID (optional, for additional features)

### Payment Gateway (Razorpay)
- `RAZORPAY_KEY_ID`: Razorpay public key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key

### Application Configuration
- `NODE_ENV`: Environment (`production`)
- `PORT`: Server port (`5000`)

## Optional Environment Variables

### S3 Configuration
- `S3_BUCKET_NAME`: S3 bucket for file uploads (default: `jobthrive`)

### Logging
- `LOG_LEVEL`: Logging level (`info`, `debug`, `warn`, `error`)

### Security
- `SESSION_SECRET`: Session secret for express-session
- `CORS_ORIGIN`: Allowed CORS origins (comma-separated)

## SSM Parameter Store Setup

All sensitive environment variables should be stored in AWS SSM Parameter Store:

```bash
# Database URL
aws ssm put-parameter \
  --name "/job-thrive/database-url" \
  --value "postgresql://jobthrive:password@host:5432/jobthrive" \
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

## Task Definition Configuration

The ECS task definition automatically injects these variables:

```json
{
  "environment": [
    {
      "name": "NODE_ENV",
      "value": "production"
    },
    {
      "name": "PORT",
      "value": "5000"
    },
    {
      "name": "AWS_REGION",
      "value": "ap-south-1"
    }
  ],
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:ssm:ap-south-1:ACCOUNT_ID:parameter/job-thrive/database-url"
    },
    {
      "name": "COGNITO_CLIENT_SECRET",
      "valueFrom": "arn:aws:ssm:ap-south-1:ACCOUNT_ID:parameter/job-thrive/cognito-client-secret"
    },
    {
      "name": "RAZORPAY_KEY_ID",
      "valueFrom": "arn:aws:ssm:ap-south-1:ACCOUNT_ID:parameter/job-thrive/razorpay-key-id"
    },
    {
      "name": "RAZORPAY_KEY_SECRET",
      "valueFrom": "arn:aws:ssm:ap-south-1:ACCOUNT_ID:parameter/job-thrive/razorpay-key-secret"
    }
  ]
}
```

## Local Development

For local development, create a `.env` file:

```env
DATABASE_URL=postgresql://localhost:5432/jobthrive
COGNITO_CLIENT_SECRET=your-dev-secret
RAZORPAY_KEY_ID=your-dev-key-id
RAZORPAY_KEY_SECRET=your-dev-key-secret
NODE_ENV=development
PORT=5000
```

## Security Best Practices

1. **Never commit secrets to version control**
2. **Use SSM Parameter Store for production secrets**
3. **Rotate secrets regularly**
4. **Use IAM roles instead of access keys when possible**
5. **Enable CloudTrail for audit logging**
6. **Set up CloudWatch alarms for security events**
