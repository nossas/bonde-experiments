import { ApolloError } from 'apollo-server-express';
import logger from './logger';
import Mailchimp from './mailchimp';
import * as activists from './api/activists';
import * as widgets from './api/widgets';
import * as notifications from './api/notifications';
import { Activist, ActivistInput, Widget } from './types';

export interface IBaseAction<T> {
  action: T
  activist: Activist
  widget: Widget
}

interface BaseActionArgs {
  input: any
  activist: ActivistInput
  widget_id: number
}

export const BaseAction =
  (fn: (args: IBaseAction<any>) => Promise<any>) =>
    async (_: void, args: BaseActionArgs): Promise<any> => {
      const widget: Widget = await widgets.get(args.widget_id);
      logger.child({ widget }).info('select widget');

      if (!widget) throw new ApolloError('Widget Not Found', 'widget_not_found');

      const activist: Activist = await activists.get_or_create(args.activist);
      logger.child({ activist }).info('create or update activist');

      // Dispatch generic action
      const [data, syncronize] = await fn({ action: args.input, activist, widget });

      // Update Mailchimp after action
      const mailchimp = new Mailchimp({ activist, widget });
      
      await syncronize();
      
      // TODO: Update action with mailchimp_syncronized_at
      const { email_subject, sender_email, sender_name, email_text } = widget.settings;

      await notifications.send({
        email_from: `${sender_name} <${sender_email}>`,
        email_to: `${activist.name} <${activist.email}>`,
        subject: email_subject,
        body: email_text
      });
      logger.info('send greetings of post-action');

      return { status: `OK ${data.id}!` };
    }
