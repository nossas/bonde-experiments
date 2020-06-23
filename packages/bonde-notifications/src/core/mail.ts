import nunjucks from 'nunjucks';

export interface MailSettings {
  body: string
  subject: string
  email_to: string
  email_from: string
  context: any
}

class Mail {
  private engine = nunjucks;
  private settings: MailSettings

  constructor(settings: MailSettings) {
    this.settings = settings;
    this.engine.configure({ autoescape: true });
  }

  json (): any {
    const {
      email_to,
      email_from,
      body,
      context,
      subject
    } = this.settings;
    
    return {
      to: email_to,
      from: email_from,
      subject: this.engine.renderString(subject, context),
      html: this.engine.renderString(body, context)
    };
  }
}

export default Mail;