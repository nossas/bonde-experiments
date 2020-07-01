import logger from './logger';
import * as activists from './api/activists';
import * as widgets from './api/widgets';

type Activist = {
  id: number
  name: string
  email: string
}

type Mobilization = {
  id: number
  community_id: number
}

type Block = {
  mobilization: Mobilization
}

type Widget = {
  id: number
  settings: any
  block: Block
}

export interface IBaseAction<T> {
  action: T
  activist: Activist
  widget: Widget
}

type ActivistInput = {
  email: string
  name: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
}

interface BaseActionArgs {
  input: any
  activist: ActivistInput
  widget_id: number
}

export const BaseAction =
  (fn: (args: IBaseAction<any>) => Promise<any>) =>
    async (_: void, args: BaseActionArgs): Promise<any> => {
      // TODO
      // Widget Not Found
      // Update Mailchimp After Action
      const widget: Widget = await widgets.get(args.widget_id);
      logger.child({ widget }).info('select widget');

      const activist: Activist = await activists.get_or_create(args.activist);
      logger.child({ activist }).info('create or update activist');

      return await fn({ action: args.input, activist, widget });
    }
