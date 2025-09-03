import dotenv from 'dotenv';
dotenv.config();

import { sendNotification, sendTemplateNotification } from './index.js';

// Example usage of the notification module

async function exampleUsage() {
  // Debug: Check if environment variables are loaded
  console.log('Environment variables check:');
  console.log('AWS_REGION:', 'ap-south-1');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
  console.log('SES_FROM_EMAIL:', process.env.SES_FROM_EMAIL);
  console.log('---');
  
  try {
    // Example 1: Send welcome email
    await sendTemplateNotification(
      'sathwikbollu@gmail.com',
      'welcome',
      {
        name: 'Rehan Yadav',
        email: 'sathwikbollu@gmail.com',
        dashboardUrl: 'https://jobthrive.com/dashboard',
        subject: 'Welcome to JobThrive!'
      }
    );

    // Example 2: Send job alert
    // await sendTemplateNotification(
    //   ['sathwikbollu@gmail.com', 'user2@example.com'],
    //   'job-alert',
    //   {
    //     jobTitle: 'Senior Software Engineer',
    //     companyName: 'Tech Corp',
    //     location: 'San Francisco, CA',
    //     jobDescription: 'We are looking for a talented senior software engineer to join our team...',
    //     salary: '$120,000 - $150,000',
    //     experience: '5+ years',
    //     jobType: 'Full-time',
    //     jobUrl: 'https://jobthrive.com/jobs/123',
    //     preferenceType: 'Software Engineering',
    //     unsubscribeUrl: 'https://jobthrive.com/unsubscribe',
    //     preferencesUrl: 'https://jobthrive.com/preferences',
    //     subject: 'New Job Alert: Senior Software Engineer at Tech Corp'
    //   }
    // );

    // // Example 3: Send password reset email
    // await sendNotification({
    //   to: 'user@example.com',
    //   template: 'password-reset',
    //   variables: {
    //     name: 'John Doe',
    //     email: 'user@example.com',
    //     resetUrl: 'https://jobthrive.com/reset-password?token=abc123',
    //     expiryTime: '24',
    //     requestTime: new Date().toLocaleString(),
    //     subject: 'Password Reset Request'
    //   },
    //   from: 'security@jobthrive.com'
    // });

    console.log('All notifications sent successfully!');
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

// Uncomment to run the example
exampleUsage();

export { exampleUsage };
