import Mail from './core/mail';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

let path = './core/smtp';

if (process.env.SENDGRID_API_KEY) {
  path = './core/sendgrid';
}

logger.info(`Core snippet load on ${path}`);

export const notify = async (_: void, args: any): Promise<{ status: string }> => {
  const { send } = require(path);

  args.input.forEach(async (settings: any) => {
    const mail = new Mail(settings).json();
    await send(mail);
  });

  logger.child({ args }).info('Email sent to');
  return { status: 'ok' };
};
