import gql from 'graphql-tag';
import client from './client';

interface Pressure {
  activist_id: number
  cached_community_id: number
  widget_id: number
}

export const queries = {
  pressure: gql`
    mutation InsertActivistPressure($input: [activist_pressures_insert_input!]!) {
      insert_activist_pressures(objects: $input) {
        returning {
          id
        }
      }
    }
  `
}

export const pressure = async (input: Pressure): Promise<any> => {
  const mutation = gql`
    mutation InsertActivistPressure($input: [activist_pressures_insert_input!]!) {
      insert_activist_pressures(objects: $input) {
        returning {
          id
        }
      }
    }
  `;

  const { data } = await client.mutate({ mutation: queries.pressure, variables: { input } });

  return data.insert_activist_pressures.returning[0];
}