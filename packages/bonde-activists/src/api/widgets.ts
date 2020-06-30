import gql from 'graphql-tag';
import client from './client';

export const get = async (widget_id: number): Promise<any> => {
  const query = gql`
    query Widgets($widget_id: Int!) {
      widgets(where: { id: { _eq: $widget_id } }) {
        id
        settings
        block {
          mobilization {
            id
            community_id
          }
        }
      }
    }
  `;

  const { data } = await client.query({ query, variables: { widget_id } });

  return data.widgets[0];
}