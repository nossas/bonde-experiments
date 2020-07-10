import { mocked } from 'ts-jest/utils';
import * as actions from './api/actions';
import * as notifications from './api/notifications';
import { Activist, Widget } from './types';
import { pressure } from './actions';

jest.mock('./api/actions', () => ({
  pressure: jest.fn(),
  pressure_sync_done: jest.fn()
}))
const mockedActions = mocked(actions, true);

jest.mock('./api/notifications', () => ({
  send: jest.fn()
}))
const mockedNotifications = mocked(notifications, true);

describe('actions functions tests', () => {
  const activist: Activist = {
    id: 35,
    email: 'activist@test.org',
    name: 'Activist Test'
  };
  const widget: Widget = {
    id: 2,
    kind: 'pressure',
    settings: {
      pressure_subject: 'Lorem Ipsum Subject',
      pressure_body: 'Lorem Ipsum Body',
      targets: 'Target1 <target1@test.org>;Target2 <target2@test.org>'
    },
    block: {
      mobilization: {
        id: 1,
        community: {
          id: 1,
          mailchimp_api_key: 'xxx-us10',
          mailchimp_list_id: 'xxx'
        }
      }
    }
  };

  it('pressure called notifications.send with widget.settings params', () => {
    mockedActions.pressure.mockResolvedValue({ id: 3, created_at: new Date().toISOString() });
    mockedNotifications.send.mockResolvedValue({});
    
    return pressure({ widget, activist })
      .then(() => {
        const expectedMail = widget.settings.targets.split(';').map((target: string) => ({
          context: { activist, widget },
          body: widget.settings.pressure_body,
          subject: widget.settings.pressure_subject,
          email_from: `${activist.name} <${activist.email}>`,
          email_to: target
        }));
        expect(mockedNotifications.send).toBeCalledWith(expectedMail);

        const expectedPressure = {
          activist_id: activist.id,
          widget_id: widget.id,
          cached_community_id: widget.block.mobilization.community.id
        };
        expect(mockedActions.pressure).toBeCalledWith(expectedPressure);
      });
  });

  it('pressure should be return syncronize function to mark activist_pressure', () => {
    const activist_pressure_id = 3;
    const activist_pressure_created_at = new Date().toISOString();
    mockedActions.pressure.mockResolvedValue({
      id: activist_pressure_id,
      created_at: activist_pressure_created_at
    });
    mockedNotifications.send.mockResolvedValue({});

    return pressure({ widget, activist })
      .then(async ({ data, syncronize }) => {
        await syncronize();

        expect(data).toEqual({ activist_pressure_id });
        expect(mockedActions.pressure_sync_done).toBeCalledWith({
          id: activist_pressure_id,
          sync_at: activist_pressure_created_at
        });
      });
  });
});