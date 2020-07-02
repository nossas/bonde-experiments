import { ApolloError } from 'apollo-server-express';
import logger from './logger';
import * as activists from './api/activists';
import * as widgets from './api/widgets';
import * as notifications from './api/notifications';

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
      // Update Mailchimp After Action
      const widget: Widget = await widgets.get(args.widget_id);
      logger.child({ widget }).info('select widget');

      if (!widget) throw new ApolloError('Widget Not Found', 'widget_not_found');

      const activist: Activist = await activists.get_or_create(args.activist);
      logger.child({ activist }).info('create or update activist');

      const data = await fn({ action: args.input, activist, widget });

      const { email_subject, sender_email, sender_name, email_text } = widget.settings;

      await notifications.send({
        email_from: `${sender_name} <${sender_email}>`,
        email_to: `${activist.name} <${activist.email}>`,
        subject: email_subject,
        body: email_text
      });
      logger.info('send greetings of post-action');

      return data;
    }
