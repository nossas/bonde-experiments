import { IResolverData } from '../types';
import pipeline from './pipeline';

describe('tests to pipeline functions execute', () => {
  const args = {
    activist: {
      email: 'test@test.org',
      name: 'Test',
      first_name: 'Test',
      last_name: 'Dummy'
    },
    input: 'test input',
    widget_id: 2345
  };
  const previousResult = {
    activist: {
      id: 234,
      ...args.activist
    },
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
  };

  it('called functions with correct params', () => {
    const syncronize = jest.fn();
    const previous = jest.fn().mockResolvedValue(previousResult);
    const action = jest.fn().mockResolvedValue({ data: { id: 2 }, syncronize });
    const next = jest.fn().mockResolvedValue({});
    return pipeline(previous, action, next)(jest.fn()(), args)
      .then((result: IResolverData) => {
        expect(previous).toBeCalledWith(args);
        expect(action).toBeCalledWith({ action: args.input, ...previousResult });
        expect(next).toBeCalledWith({ action: args.input, ...previousResult }, syncronize);
        expect(result).toEqual({ data: { id: 2 } });
      });
  })
});