import dotenv from 'dotenv';
dotenv.config();

import AWS from 'aws-sdk';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface NotificationTemplate {
  name: string;
  subject: string;
  htmlTemplate: string;
}

export interface NotificationVariables {
  [key: string]: string | number | boolean;
}

export interface SendNotificationOptions {
  to: string | string[];
  template: string;
  variables: NotificationVariables;
  from?: string;
}

// SES Configuration
const ses = new AWS.SES({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
});

// Default sender email
const DEFAULT_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@jobthrive.com';

/**
 * Load HTML template from file system
 */
function loadTemplate(templateName: string): string {
  try {
    const templatePath = join(__dirname, 'templates', `${templateName}.html`);
    return readFileSync(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(`Template '${templateName}' not found: ${error}`);
  }
}


function replaceVariables(template: string, variables: NotificationVariables): string {
  let processedTemplate = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, String(value));
  });
  
  return processedTemplate;
}

/**
 * Main notification method
 * Sends email using SES with HTML template and variable substitution
 */
export async function sendNotification(options: SendNotificationOptions): Promise<void> {
  const { to, template, variables, from = DEFAULT_FROM_EMAIL } = options;
  
  try {
    // Load HTML template
    const htmlTemplate = loadTemplate(template);
    
    // Replace variables in template
    const processedHtml = replaceVariables(htmlTemplate, variables);
    
    // Prepare email addresses
    const toAddresses = Array.isArray(to) ? to : [to];
    
    // Create SES parameters
    const params = {
      Source: from,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: variables.subject as string || 'Notification from JobThrive',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: processedHtml,
            Charset: 'UTF-8',
          },
        },
      },
    };
    
    // Send email
    const result = await ses.sendEmail(params).promise();
    console.log('Email sent successfully:', result.MessageId);
    
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw new Error(`Failed to send notification: ${error}`);
  }
}

/**
 * Send notification with predefined template
 */
export async function sendTemplateNotification(
  to: string | string[],
  templateName: string,
  variables: NotificationVariables,
  from?: string
): Promise<void> {
  return sendNotification({
    to,
    template: templateName,
    variables,
    from,
  });
}

// Types are already exported above
