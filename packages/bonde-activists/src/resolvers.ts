import logger from './logger';

export const create_or_update_activist = async (_: void, args: any, context: any): Promise<{ status: string }> => {
  const { input, activist, widget_id } = args;

  logger.child({ widget_id }).info('fetch widget data');
  logger.child({ activist }).info('create or update activist');
  logger.child({ input }).info('execute action input');

  return { status: 'ok' };
};
