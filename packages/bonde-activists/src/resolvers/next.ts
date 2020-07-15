import logger from '../logger';
import mailchimp from '../mailchimp';
import { DoneAction, IBaseAction } from '../types';
import * as notifications from '../api/notifications';


export default async <T>({ activist, widget }: IBaseAction<T>, done: DoneAction): Promise<any> => {
  // Update Contact on Mailchimp
  const { subscribe } = mailchimp({ activist, widget });
  subscribe().then(done).catch((err: any) => {
    logger.child({ err }).error('subscribe mailchimp');
  });

  // Post-action
  const { email_subject, sender_email, sender_name, email_text } = widget.settings;

  // TODO: Required fields to Notify "Pós-Ação"
  await notifications.send({
    email_from: `${sender_name} <${sender_email}>`,
    email_to: `${activist.name} <${activist.email}>`,
    subject: email_subject,
    body: email_text
  });

  logger.child({ activist, widget }).info('action is done');
};