import { mocked } from 'ts-jest/utils';
import * as activists from './api/activists';
import * as notifications from './api/notifications';
import * as widgets from './api/widgets';
import { BaseAction } from './resolvers';

/* jest.mock('./api/client', () => ({
  mutation: jest.fn(),
  query: jest.fn(),
})); */

jest.mock('./api/widgets', () => ({
  get: jest.fn(),
}));
const mockedWidgets = mocked(widgets, true);

jest.mock('./api/activists', () => ({
  get_or_create: jest.fn(),
}));
const mockedActivists = mocked(activists, true);

jest.mock('./api/notifications', () => ({
  send: jest.fn(),
}));
const mockedNotificaations = mocked(notifications, true);


describe('tests to action resolvers', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throw ApolloError when widget_not_found', async () => {
    const fn = jest.fn(async () => {
      return { fn_id: 3 };
    });
    const args = {
      input: { field: 'Value!' },
      activist: {
        name: 'Activist Test Name',
        email: 'activist@nossas.org'
      },
      widget_id: 3
    };

    expect.assertions(1);
    try {
      await BaseAction(fn)((() => { })(), args);
    } catch (err) {
      expect(err.extensions.code).toEqual('widget_not_found');
    }
  });

  it('called order methods to BaseAction', () => {
    const fn = jest.fn(async () => {
      return { fn_id: 3 };
    });
    const args = {
      input: { field: 'Value!' },
      activist: {
        name: 'Activist Test Name',
        email: 'activist@nossas.org'
      },
      widget_id: 3
    }

    const widget = {
      id: 3,
      settings: {
        email_text: 'ThankYou Text',
        email_subject: 'ThankYou Subject',
        sender_name: 'Mobilizer Name',
        sender_email: 'mobilizer@nossas.org'
      },
      block: { mobilization: { id: 1, community_id: 1 } }
    };
    mockedWidgets.get.mockReturnValue(widget as any);
    
    const activist = { id: 1, name: '', email: '' }
    mockedActivists.get_or_create.mockReturnValue(activist as any);

    BaseAction(fn)((() => {})(), args)
      .then((result) => {
        expect(widgets.get).toBeCalledTimes(1);
        expect(activists.get_or_create).toBeCalledTimes(1);
        expect(notifications.send).toBeCalledTimes(1);

        expect(result).toEqual({ fn_id: 3 });
      })
  });
});