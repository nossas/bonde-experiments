import gql from 'graphql-tag';
import client from './client';

interface NotifyInput {
  body: string
  context?: any
  email_from: string
  email_to: string
  subject: string
}

export const queries = {
  send: gql`
    mutation Notify($input: [NotifyInput!]!) {
      notify(input: $input) {
        status
      }
    }
  `
}

export const send = async (input: NotifyInput): Promise<any> => {
  return await client.mutate({ mutation: queries.send, variables: { input } });
}