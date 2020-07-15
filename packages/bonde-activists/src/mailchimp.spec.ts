import { mocked } from 'ts-jest/utils';
import Mailchimp from 'mailchimp-api-v3';
import crypto from 'crypto';
import { Activist, Widget } from './types';
import mailchimp, { tags, hash } from './mailchimp';

const mockPut = jest.fn();
const mockPost = jest.fn();
jest.mock('mailchimp-api-v3', () =>
  jest.fn().mockImplementation(() => {
    return {
      put: mockPut,
      post: mockPost
    }
  })
);
mocked(Mailchimp, true);

describe('mailchimp function tests', () => {
  const activist: Activist = {
    id: 345,
    email: 'activist@test.org',
    name: 'Activist Name'
  }
  const widget: Widget = {
    id: 38,
    kind: 'pressure',
    settings: {},
    block: {
      mobilization: {
        id: 6,
        community: {
          id: 1,
          mailchimp_api_key: 'xxx-us10',
          mailchimp_list_id: 'xxx'
        }
      }
    }
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hash function should be return a md5 of email with lower case', () => {
    const email = 'Activist@test.org';
    expect(hash(email)).toEqual(
      crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex')
    );
  });

  it('tags function should be return a COMMUNITY, MOBILIZATION and ACTION tags', () => {
    const { id, kind, block: { mobilization } } = widget;
    const expected = [
      { name: 'C' + mobilization.community.id, status: 'active' },
      { name: 'M' + mobilization.id, status: 'active' },
      { name: kind.toUpperCase().substring(0, 1) + '' + id, status: 'active' }
    ];

    expect(tags(widget)).toEqual(expected);
  });

  it('subscribe Mailchimp put an activist', async () => {
    mockPut.mockResolvedValue({ last_changed: '' });

    const { mailchimp_list_id } = widget.block.mobilization.community
    const activistEntity = {
      ...activist,
      first_name: 'Activist',
      last_name: 'Name'
    }
    const expected = {
      path: `/lists/${mailchimp_list_id}/members/${hash(activist.email)}`,
      body: {
        email_address: activistEntity.email,
        status: "subscribed",
        merge_fields: {
          FNAME: activistEntity.first_name,
          LNAME: activistEntity.last_name
        }
      }
    };
    const { subscribe } = mailchimp({ widget, activist: activistEntity });
    
    return subscribe()
      .then(() => {
        expect(mockPut).toBeCalledWith(expected);
      });
  });

  it('subscribe Mailchimp merge_fields activist with name by default', async () => {
    mockPut.mockResolvedValue({ last_changed: '' });

    const { mailchimp_list_id } = widget.block.mobilization.community
    const expected = {
      path: `/lists/${mailchimp_list_id}/members/${hash(activist.email)}`,
      body: {
        email_address: activist.email,
        status: "subscribed",
        merge_fields: {
          FNAME: activist.name,
          LNAME: activist.name
        }
      }
    };
    const { subscribe } = mailchimp({ widget, activist });

    return subscribe()
      .then(() => {
        expect(mockPut).toBeCalledWith(expected);
      });
  });

  it('subscribe Mailchimp merge_fields activist like a city or phone', async () => {
    mockPut.mockResolvedValue({ last_changed: '' });

    const activistEntity = {
      ...activist,
      city: 'Rio de Janeiro',
      phone: '021999999999'
    };
    const { mailchimp_list_id } = widget.block.mobilization.community;
    const expected = {
      path: `/lists/${mailchimp_list_id}/members/${hash(activistEntity.email)}`,
      body: {
        email_address: activist.email,
        status: "subscribed",
        merge_fields: {
          FNAME: activistEntity.name,
          LNAME: activistEntity.name,
          CITY: activistEntity.city,
          PHONE: activistEntity.phone
        }
      }
    };
    const { subscribe } = mailchimp({ widget, activist: activistEntity });

    return subscribe()
      .then(() => {
        expect(mockPut).toBeCalledWith(expected);
      });
  });

  it('merge Mailchimp to create extra fields settings', async () => {
    mockPost.mockResolvedValue({});

    const { mailchimp_list_id } = widget.block.mobilization.community;
    const expected = {
      path: `/lists/${mailchimp_list_id}/merge-fields`,
      body: {
        tag: 'CITY',
        name: "City",
        type: 'text',
        required: false,
        public: true
      }
    };
    const { merge } = mailchimp({ widget, activist });

    return merge()
      .then(() => {
        expect(mockPost).toBeCalledWith(expected);
      });
  });
});