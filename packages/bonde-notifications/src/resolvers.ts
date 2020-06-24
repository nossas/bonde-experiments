import Mail from './core/mail';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

let path = './core/smtp';

if (process.env.SENDGRID_API_KEY) {
  path = './core/sendgrid';
}

logger.info(`Core snippet load on ${path}`);

export const notify = async (_: void, { input }: any): Promise<{ status: string }> => {
  logger.child(input).debug('Request notify mutation');
  const { send } = require(path);

  input.forEach(async (settings: any) => {
    const mail = new Mail(settings).json();
    await send(mail);
  });

  return { status: 'ok' };
};
