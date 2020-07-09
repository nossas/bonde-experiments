import { mocked } from 'ts-jest/utils';
import logger from '../logger';
import * as notifications from '../api/notifications';
import mailchimp from '../mailchimp';
import next from './next';

jest.mock('../api/notifications', () => ({
  send: jest.fn().mockResolvedValue({})
}));
const mockedNotifications = mocked(notifications, true);

jest.mock('../mailchimp');
const mockedMailchimp = mocked(mailchimp, true);

jest.mock('../logger', () => ({
  child: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
    info: jest.fn()
  }))
}));
const mockedLogger = mocked(logger, true);

describe('next proccess on BaseAction mailchimp tests', () => {
  const opts = {
    activist: { id: 3456, email: 'test@test.org', name: 'Test' },
    widget: {
      id: 2345,
      kind: 'pressure',
      block: {
        mobilization: {
          id: 234,
          community: {
            id: 103,
            mailchimp_api_key: 'xxxxx-us10',
            mailchimp_list_id: 'xxxxx',
          }
        }
      },
      settings: {
        email_subject: 'Post Action Subject',
        sender_email: 'mobilizer@test.org',
        sender_name: 'Mobilizer',
        email_text: 'Post Action Body'
      }
    }
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('call done function on subscribe successfully', () => {
    mockedMailchimp.mockReturnValue({
      subscribe: jest.fn().mockResolvedValue({ updated_at: new Date().toISOString() }),
      merge: jest.fn()
    });
    const syncronize = jest.fn();
    return next(opts, syncronize)
      .then(() => {
        expect(syncronize).toBeCalledTimes(1);
        expect(mockedNotifications.send).toBeCalledTimes(1);
      });
  });

  it('not done function on subscribe failed', () => {
    mockedMailchimp.mockReturnValue({
      subscribe: jest.fn().mockRejectedValue('internal server error'),
      merge: jest.fn()
    });
    const syncronize = jest.fn();
    return next(opts, syncronize)
      .then(() => {
        expect(syncronize).toBeCalledTimes(0);
        expect(mockedLogger.child).toBeCalledWith({ err: 'internal server error' });
        expect(mockedNotifications.send).toBeCalledTimes(1);
      });
  });

  it('send notifications with widget.settings params for post-action', () => {
    mockedMailchimp.mockReturnValue({
      subscribe: jest.fn().mockResolvedValue({ updated_at: new Date().toISOString() }),
      merge: jest.fn()
    });
    const syncronize = jest.fn();
    return next(opts, syncronize)
      .then(() => {
        expect(notifications.send).toBeCalledWith({
          email_from: `${opts.widget.settings.sender_name} <${opts.widget.settings.sender_email}>`,
          email_to: `${opts.activist.name} <${opts.activist.email}>`,
          subject: opts.widget.settings.email_subject,
          body: opts.widget.settings.email_text
        })
      });
  });
});
