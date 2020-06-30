import gql from 'graphql-tag';
import client from './client';

type Activist = {
  email: string
  name: string
  first_name?: string
  last_name?: string
}

export const get_or_create = async (activist: Activist): Promise<any> => {  
  const mutation = gql`
    mutation CreateOrUpdateActivists (
      $activist: [activists_insert_input!]!
    ) {
        insert_activists(
          objects: $activist,
          on_conflict: {
            constraint: activists_email_key,
            update_columns: [name, first_name, last_name, phone, city]
          }
        ) {
          returning {
            id
            first_name
            last_name
            email
          }
        }
    }
  `;
  
  const { data }: any = await client.mutate({ mutation, variables: { activist }});

  return data.insert_activists.returning[0];
}