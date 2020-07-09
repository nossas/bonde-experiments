import { ApolloError } from 'apollo-server-express';
import * as activists from '../api/activists';
import * as widgets from '../api/widgets';
import {
  Activist,
  Widget,
  IBaseActionArgs,
  IPreviousData
} from '../types';


export default async (args: IBaseActionArgs): Promise<IPreviousData> => {
  // Fetch Widget Settings
  const widget: Widget = await widgets.get(args.widget_id);
  // Throw Error Not Found
  if (!widget) throw new ApolloError('Widget Not Found', 'widget_not_found');
  // Create or Update Information about Activist on database
  const activist: Activist = await activists.get_or_create(args.activist);

  return { activist, widget };
};