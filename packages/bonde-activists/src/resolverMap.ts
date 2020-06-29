import { IResolvers } from 'graphql-tools';
import { GraphQLJSONObject } from 'graphql-type-json';
import { create_or_update_activist } from './resolvers';

const resolverMap: IResolvers = {
  // Query: {
  //   helloWorld: (_: void, args: void): string => {
  //     return `Hello Worldddddd!`;
  //   }
  // },
  Mutation: {
    create_email_pressure: create_or_update_activist,
    create_donation: create_or_update_activist
  },
  JSON: GraphQLJSONObject
};

export default resolverMap;