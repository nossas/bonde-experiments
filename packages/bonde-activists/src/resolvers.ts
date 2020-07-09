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

interface IPreviousData {
  activist: Activist
  widget: Widget
}

export interface IActionData {
  data: any
  syncronize: DoneAction
}

type DoneAction = () => Promise<any>;

interface IResolverData {
  data: any
}

type Resolver = (_: void, args: BaseActionArgs) => Promise<IResolverData>;
type Previous = (args: BaseActionArgs) => Promise<IPreviousData>;
type Action = <T>(args: IBaseAction<T>) => Promise<IActionData>;
type Next = <T>(args: IBaseAction<T>, done: DoneAction) => Promise<any>;

export const pipeline = <T extends any>(previous: Previous, action: Action, next: Next): Resolver => 
  async (_: void, args: BaseActionArgs): Promise<IResolverData> => {
    /** Resolver function base */
    const { activist, widget } = await previous(args);

    const opts = { action: args.input, activist, widget };
    const { data, syncronize } = await action<T>(opts);
    await next(opts, syncronize);

    return { data };
  }
;

const _previous = async (args: BaseActionArgs): Promise<IPreviousData> => {
  // Fetch Widget Settings
  const widget: Widget = await widgets.get(args.widget_id);
  // Throw Error Not Found
  if (!widget) throw new ApolloError('Widget Not Found', 'widget_not_found');
  // Create or Update Information about Activist on database
  const activist: Activist = await activists.get_or_create(args.activist);

  return { activist, widget };
}

const _next = async<T>({ activist, widget }: IBaseAction<T>, done: DoneAction): Promise<any> => {
  // Update Contact on Mailchimp
  const mailchimp = new Mailchimp({ activist, widget });
  mailchimp.subscribe().then(done).catch((err: any) => {
    logger.child({ err }).error('subscribe mailchimp');
  });

  // Post-action
  const { email_subject, sender_email, sender_name, email_text } = widget.settings;

  await notifications.send({
    email_from: `${sender_name} <${sender_email}>`,
    email_to: `${activist.name} <${activist.email}>`,
    subject: email_subject,
    body: email_text
  });

  logger.child({ activist, widget }).info('action is done');
}

export const BaseAction = <T>(fn: (args: IBaseAction<any>) => Promise<any>) =>
  pipeline<T>(_previous, fn, _next)
;