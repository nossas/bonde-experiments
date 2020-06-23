import Mail from './core/mail';
import dotenv from 'dotenv';

dotenv.config();

let path = './core/mail';

if (process.env.SENDGRID_API_KEY) {
  path = './core/sendgrid';
}

export const notify = async (_: void, { input }: any): Promise<{ status: string }> => {
  const { send } = require(path);

  input.forEach(async (settings: any) => {
    const mail = new Mail(settings).json();
    await send(mail);
  });

  return { status: 'success' };
};