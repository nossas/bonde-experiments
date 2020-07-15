import { IResolvers } from 'graphql-tools';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { pressure, send_form } from './actions';
import { BaseAction } from './resolvers';
import { FormEntryInput } from './types';
import mailchimp from './mailchimp';


const update_mailchimp_settings = async (_: void, args: any): Promise<any> => {
  const { api_key, list_id } = args;
  const widget = {
    block: {
      mobilization: {
        community: { mailchimp_api_key: api_key, mailchimp_list_id: list_id }
      }
    }
  };
  const { merge } = mailchimp<any, any>({ activist: {}, widget });
  
  try {
    await merge();
    return { status: 'Ok!' };
  } catch (err) {
    console.log('err', err);
    throw new Error(err);
  }
};

const resolverMap: IResolvers = {
  // Query: {
  //   helloWorld: (_: void, args: void): string => {
  //     return `Hello Worldddddd!`;
  //   }
  // },
  Mutation: {
    create_email_pressure: BaseAction(pressure),
    create_form_entry: BaseAction<FormEntryInput>(send_form),
    update_mailchimp_settings
  },
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject
};

export default resolverMap;