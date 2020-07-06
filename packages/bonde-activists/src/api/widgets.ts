import gql from 'graphql-tag';
import client from './client';

export const queries = {
  get: gql`
    query Widgets($widget_id: Int!) {
      widgets(where: { id: { _eq: $widget_id } }) {
        id
        settings
        kind
        block {
          mobilization {
            id
            community {
              id
              mailchimp_api_key
              mailchimp_list_id
            }
          }
        }
      }
    }
  `
}

export const get = async (widget_id: number): Promise<any> => {
  const { data } = await client.query({ query: queries.get, variables: { widget_id } });

  return data.widgets[0];
}