import logger from '../logger';
import { createTransport, SendMailOptions } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SMTP_HOST) throw new Error('Please specify the `SMTP_HOST` environment variable.');
if (!process.env.SMTP_PORT) throw new Error('Please specify the `SMTP_PORT` environment variable.');
if (!process.env.SMTP_USER) throw new Error('Please specify the `SMTP_USER` environment variable.');
if (!process.env.SMTP_PASS) throw new Error('Please specify the `SMTP_PASS` environment variable.');

export const send = async (message: any): Promise<void> => {
  const mailer = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASS // generated ethereal password
    }
  } as SendMailOptions);

  try {
    await mailer.sendMail(message);
  } catch (error) {
    logger.error(error);
    // if (error.response) {
    //   // const { message, code, response } = error;
    //   const { headers, body } = error.response;
    //   console.log('headers', { headers });
    //   console.error(body);
    // }
  }
};