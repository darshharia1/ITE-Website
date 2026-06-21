// src/utils/mailer.js
const { SendEmailCommand } = require('@aws-sdk/client-ses');
const { ses } = require('../config/aws');
const logger = require('./logger');

const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;

/**
 * Reusable utility function to send HTML emails via AWS SES
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.htmlBody - HTML email content
 */
async function sendEmail({ to, subject, htmlBody }) {
  if (!SES_FROM_EMAIL) {
    logger.error('Email dispatch failed: SES_FROM_EMAIL environment variable is not defined.');
    throw new Error('SES_FROM_EMAIL is not configured.');
  }

  const params = {
    Source: SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await ses.send(command);
    logger.info(`📧 Email successfully sent to ${to}. MessageId: ${result.MessageId}`);
    return result;
  } catch (error) {
    // Log failures without crashing the application thread
    logger.error(`❌ Failed to send email to ${to}: ${error.message}`, { error });
    throw error;
  }
}

module.exports = {
  sendEmail
};
