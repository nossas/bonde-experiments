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
      // Fetch Widget Settings
      const widget: Widget = await widgets.get(args.widget_id);
      logger.child({ widget }).info('select widget');

      if (!widget) throw new ApolloError('Widget Not Found', 'widget_not_found');

      // Create or Update Information about Activist on database
      const activist: Activist = await activists.get_or_create(args.activist);
      logger.child({ activist }).info('create or update activist');

      // Dispatch the Action
      const [data, syncronize] = await fn({ action: args.input, activist, widget });

      // Update Contact on Mailchimp
      const mailchimp = new Mailchimp({ activist, widget });
      mailchimp
        .subscribe()
        .then(syncronize)
        .catch((err: any) => {
          logger.child({ err }).error('BaseAction subscribe error');
        });

      // Post-action
      const { email_subject, sender_email, sender_name, email_text } = widget.settings;

      await notifications.send({
        email_from: `${sender_name} <${sender_email}>`,
        email_to: `${activist.name} <${activist.email}>`,
        subject: email_subject,
        body: email_text
      });
      logger.info('send greetings of post-action');

      // TODO: Make a return model with more sense!
      return { status: `OK ${data.id}!` };
    }
