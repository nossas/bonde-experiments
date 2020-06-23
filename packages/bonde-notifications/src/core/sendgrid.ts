import mail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('Please specify the `SENDGRID_API_KEY` environment variable.');
}

mail.setApiKey(process.env.SENDGRID_API_KEY || 'setup env');

export const send = async (message: any): Promise<void> => {
  const msg: any = { ...message };
  
  if (process.env.NODE_ENV === 'development') {
    // Sandbox MODE
    msg.mail_settings = {
      sandbox_mode: {
        enable: true
      }
    };
  };

  try {
    const [response] = await mail.send(msg);
    console.log(`Send email to ${msg.to} with status code ${response.statusCode}`);

  } catch (error) {
    console.log('err', error);
    if (error.response) {
      // const { message, code, response } = error;
      const { headers, body } = error.response;
      console.log('headers', { headers });
      console.error(body);
    }
  }
};