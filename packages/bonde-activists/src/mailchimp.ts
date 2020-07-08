import MailchimpClient from 'mailchimp-api-v3';
import crypto from 'crypto';
import { Activist, Widget } from './types';

interface MailchimpArgs<T, U> {
  activist: U;
  widget: T;
}

class Mailchimp<T extends Widget, U extends Activist> {
  protected client: any;
  protected activist: any;
  protected widget: any;
  protected listID: string

  constructor({ activist, widget }: MailchimpArgs<T, U>) {  
    const {
      mailchimp_api_key,
      mailchimp_list_id
    } = widget.block.mobilization.community;

    this.client = new MailchimpClient(mailchimp_api_key);
    this.listID = mailchimp_list_id;
    this.activist = activist;
    this.widget = widget;
  }

  get tags () {
    const { id, kind, block: { mobilization } } = this.widget;
    return [
      // TAG COMMUNITY
      'C' + mobilization.community.id,
      // TAG MOBILIZATION
      'M' + mobilization.id,
      // TAG WIDGET KIND
      kind.toUpperCase().substring(0,1) + '' + id
    ]
  }

  get hash () {
    return crypto
      .createHash('md5')
      .update(this.activist.email.toLowerCase())
      .digest('hex');
  }

  async subscribe (): Promise<any> {
    let form: any = {
      "email_address": this.activist.email,
      "status": "subscribed",
      "merge_fields": {
        "FNAME": this.activist.first_name || this.activist.name,
        "LNAME": this.activist.last_name || this.activist.name
      },
      "tags": this.tags
    }

    if (this.activist.city) {
      form.merge_fields['CITY'] = this.activist.city;
    }
    if (this.activist.phone) {
      form.merge_fields['PHONE'] = this.activist.phone;
    }
    console.log('form', form);

    try {
      const response = await this.client.put({
        path: `/lists/${this.listID}/members/${this.hash}`,
        body: form
      });
      return { updated_at: response.last_changed };
    } catch (err) {
      console.log('err', err);
      throw new Error('Subscribe Error');
      
    }
  }

  async merge_fields (): Promise<any> {
    const form: any = {
      tag: 'CITY',
      name: 'City',
      type: 'text',
      required: false,
      public: true
    }
    try {
      const response = await this.client.post({
        path: `/lists/${this.listID}/merge-fields`,
        body: form
      })
      console.log('response', response);
      return {}
    } catch (err) {
      console.log('err', err);
      throw new Error('MergeFields Error');
    }
  }
}

export default Mailchimp;