import MailchimpClient from 'mailchimp-api-v3';

interface MailchimpArgs {
  apiKey: string
  listId: string
}

class Mailchimp {
  protected listId: string;
  protected client: any;

  constructor({ apiKey, listId }: MailchimpArgs) {
    this.listId = listId;
    this.client = new MailchimpClient(apiKey);
  }

  tags (widget: any) {
    return [
      // TAG COMMUNITY
      'C' + widget.block.mobilization.community.id,
      // TAG MOBILIZATION
      'M' + widget.block.mobilization.id,
      // TAG WIDGET KIND
      widget.kind.toUpperCase().substring(0,1) + '' + widget.id
    ]
  }

  subscribe (activist: any, widget: any): Promise<any> {
    const form = {
      "email_address": activist.email,
      "status": "subscribed",
      "merge_fields": {
        "FNAME": activist.first_name || activist.name,
        "LNAME": activist.last_name || activist.name,
        // "ADDRESS": "",
        // "PHONE": "",
        // "BIRTHDAY": ""
      },
      "tags": this.tags(widget)
    }
    
    return this.client.post({
      path: `/lists/${this.listId}/members`,
      body: form
    })
    .then((response: any) => {
      console.log('response', response);
      return 'Teste'
    })
    .catch((err: any) => {
      console.log('err', err);
    })
  }
}

export default Mailchimp;