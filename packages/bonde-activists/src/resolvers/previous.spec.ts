import { mocked } from 'ts-jest/utils';
import * as activists from '../api/activists';
import * as widgets from '../api/widgets';
import previous from './previous';
import { IPreviousData } from '../types';

jest.mock('../api/activists', () => ({
  get_or_create: jest.fn()
}));
const mockedActivists = mocked(activists, true);

jest.mock('../api/widgets', () => ({
  get: jest.fn()
}));
const mockedWidgets = mocked(widgets, true);

describe('previous proccess on BaseAction get widget and activist', () => {
  const args = {
    activist: {
      email: 'test@test.org',
      name: 'Test',
      first_name: 'Test',
      last_name: 'Dummy'
    },
    widget_id: 2345
  }

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('throw ApolloError when widget_not_found', async () => {
    mockedWidgets.get.mockResolvedValue(undefined);
    return previous(args)
      .catch((err: any) => {
        expect(err.extensions.code).toEqual('widget_not_found');  
      });
  });

  it('called get_or_create api when widget found', () => {
    const widget = {
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
    };
    mockedWidgets.get.mockResolvedValue(widget);
    const activist = {
      id: 23,
      ...args.activist,
    }
    mockedActivists.get_or_create.mockResolvedValue(activist);

    return previous(args)
      .then((resolved: IPreviousData) => {
        expect(resolved).toEqual({ activist, widget });
      });
  });
});
