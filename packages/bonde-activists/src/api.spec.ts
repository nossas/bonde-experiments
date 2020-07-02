import { mocked } from 'ts-jest/utils';
import client from './api/client';
import * as actions from './api/actions';
import * as activists from './api/activists';
import * as notifications from './api/notifications';
import * as widgets from './api/widgets';

jest.mock('./api/client', () => ({
  mutate: jest.fn(),
  query: jest.fn()
}));
const mockClient = mocked(client, true);

describe('tests on api graphql', () => {
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should notifications.send on api mail', () => {
    const input = {
      email_from: 'from-reply@nossas.org',
      email_to: 'to-reply@nossas.org',
      subject: 'subject',
      body: 'body'
    };

    const graphqQLResponse = { data: { status: 'OK!' } };
    mockClient.mutate.mockResolvedValue(graphqQLResponse);

    return notifications
      .send(input)
      .then(({ data }) => {
        expect(mockClient.mutate).toBeCalledWith({
          mutation: notifications.queries.send,
          variables: { input }
        });
        expect(data).toEqual({ status: 'OK!' });
      });
  });

  it('should activists.get_or_create on api graphql', () => {
    const input = {
      email: 'test@nossas.org',
      name: 'Activist Test Name',
      first_name: 'Activist',
      last_name: 'Test Name'
    };

    const graphqQLResponse = { data: { insert_activists: { returning: [{...input, id: 2}] }}};
    mockClient.mutate.mockResolvedValue(graphqQLResponse);

    return activists
      .get_or_create(input)
      .then((activist) => {
        expect(mockClient.mutate).toBeCalledWith({
          mutation: activists.queries.get_or_create,
          variables: { activist: input }
        });
        expect(activist).toEqual({ ...input, id: 2 });
      });
  });

  it('should widgets.get on api graphql', () => {
    const widgetReturned = {
      id: 2,
      settings: {},
      block: { mobilization: { id: 1, community_id: 1 } }
    }
    const graphqQLResponse = { data: { widgets: [widgetReturned] } };
    mockClient.query.mockResolvedValue(graphqQLResponse as any);

    return widgets
      .get(widgetReturned.id)
      .then((widget) => {
        expect(mockClient.query).toBeCalledWith({
          query: widgets.queries.get,
          variables: { widget_id: widgetReturned.id }
        });
        expect(widget).toEqual(widgetReturned);
      });
  });

  it('should actions.pressure on api graphql', () => {
    const input = {
      activist_id: 2,
      cached_community_id: 1,
      widget_id: 2
    }
    const graphqQLResponse = { data: { insert_activist_pressures: { returning: [{ id: 2 }] } } };
    mockClient.mutate.mockResolvedValue(graphqQLResponse as any);

    return actions
      .pressure(input)
      .then((activist_pressure) => {
        expect(mockClient.mutate).toBeCalledWith({
          mutation: actions.queries.pressure,
          variables: { input }
        });
        expect(activist_pressure).toEqual({ id: 2 });
      });
  });
});