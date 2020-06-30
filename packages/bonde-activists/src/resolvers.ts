import logger from './logger';
import * as activists from './api/activists';
import * as widgets from './api/widgets';

export const create_or_update_activist = async (_: void, args: any): Promise<{ status: string }> => {
  const { input } = args;
  const widget = await widgets.get(args.widget_id);
  const activist = await activists.get_or_create(args.activist);

  logger.child({ widget }).info('fetch widget data');
  logger.child({ activist }).info('create or update activist');
  logger.child({ input }).info('execute action input');

  return { status: 'ok' };
};
