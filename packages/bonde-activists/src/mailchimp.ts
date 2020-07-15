import Mailchimp from 'mailchimp-api-v3';
import crypto from 'crypto';
import { Activist, Widget } from './types';

interface MailchimpArgs<T, U> {
  activist: U;
  widget: T;
}

interface MailchimpResolve {
  subscribe: () => Promise<any>
  merge: () => Promise<any>
}

export const tags = (widget: Widget) => {
  const { id, kind, block: { mobilization } } = widget;
  const status = 'active';
  return [
    // TAG COMMUNITY
    { name: 'C' + mobilization.community.id, status },
    // TAG MOBILIZATION
    { name: 'M' + mobilization.id, status },
    // TAG WIDGET KIND
    { name: kind.toUpperCase().substring(0, 1) + '' + id, status }
  ];
};

export const hash = (email: string) => crypto
  .createHash('md5')
  .update(email.toLowerCase())
  .digest('hex')
;

export default <T extends Widget, U extends Activist>(args: MailchimpArgs<T, U>): MailchimpResolve => {
  // Properties
  const { activist, widget } = args;
  const {
    mailchimp_api_key,
    mailchimp_list_id
  } = widget.block.mobilization.community;

  const client = new Mailchimp(mailchimp_api_key);
  const listID = mailchimp_list_id;

  // Mailchimp Functions
  return {
    subscribe: async (): Promise<any> => {
      let body: any = {
        "email_address": activist.email,
        "status": "subscribed",
        "merge_fields": {
          "FNAME": activist.first_name || activist.name,
          "LNAME": activist.last_name || activist.name
        }
      }

      if (activist.city) {
        body.merge_fields['CITY'] = activist.city;
      }
      if (activist.phone) {
        body.merge_fields['PHONE'] = activist.phone;
      }

      const path: string = `/lists/${listID}/members/${hash(activist.email)}`;
      // Create or Update Member
      const response = await client.put({ path, body });
      // Add tags
      await client.post({ path: path + '/tags', body: { tags: tags(widget) } });

      return { updated_at: response.last_changed };
    },
    merge: async (): Promise<any> => {
      const form: any = {
        tag: 'CITY',
        name: 'City',
        type: 'text',
        required: false,
        public: true
      }

      await client.post({
        path: `/lists/${listID}/merge-fields`,
        body: form
      })
      return { status: 'ok' }
    }
  }
}
