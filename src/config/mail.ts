import sgMail from '@sendgrid/mail';
import { emailConfig } from './config';

sgMail.setApiKey(emailConfig.apiKey);

export const sendGrid = sgMail;