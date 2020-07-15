import logger from './logger';
import { IBaseAction, IActionData, FormEntryInput } from './types';
import * as actions from './api/actions';
import * as notifications from './api/notifications';


export const pressure = async ({ widget, activist }: IBaseAction<any>): Promise<IActionData> => {
  const { targets, pressure_subject, pressure_body, } = widget.settings;

  const mailInput = targets.split(';').map((target: string) => ({
    context: { activist, widget },
    body: pressure_body,
    subject: pressure_subject,
    email_from: `${activist.name} <${activist.email}>`,
    email_to: target
  }));

  await notifications.send(mailInput);
  // logger.child({ mailInput }).info('send pressure mail to targerts')

  const { id, created_at } = await actions.pressure({
    activist_id: activist.id,
    widget_id: widget.id,
    cached_community_id: widget.block.mobilization.community.id
  });
  // logger.child({ id }).info('save pressure on database');

  return {
    data: { activist_pressure_id: id },
    syncronize: async () => await actions.pressure_sync_done({ id, sync_at: created_at })
  };
};

export const send_form = async ({ action, activist, widget }: IBaseAction<FormEntryInput>): Promise<IActionData> => {
  const { id, created_at } = await actions.send_form({
    activist_id: activist.id,
    widget_id: widget.id,
    cached_community_id: widget.block.mobilization.community.id,
    fields: JSON.stringify(action?.fields || []),
  });

  logger.child({ id, created_at }).info('send_form');
  
  return {
    data: { form_entry_id: id },
    syncronize: async () => await actions.send_form_sync_done({ id, sync_at: created_at })
  };
};