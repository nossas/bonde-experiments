import gql from 'graphql-tag';
import client from './client';

interface NotifyInput {
  body: string
  context?: any
  email_from: string
  email_to: string
  subject: string
}

export const send = async (input: NotifyInput): Promise<any> => {
  const mutation = gql`
    mutation Notify($input: [NotifyInput!]!) {
      notify(input: $input) {
        status
      }
    }
  `;

  await client.mutate({ mutation, variables: { input } });
}