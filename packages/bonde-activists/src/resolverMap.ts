import { IResolvers } from 'graphql-tools';
import { GraphQLJSONObject } from 'graphql-type-json';
import { pressure } from './actions';
import { BaseAction } from './resolvers';

const resolverMap: IResolvers = {
  // Query: {
  //   helloWorld: (_: void, args: void): string => {
  //     return `Hello Worldddddd!`;
  //   }
  // },
  Mutation: {
    create_email_pressure: BaseAction(pressure),
    create_donation: BaseAction(pressure)
  },
  JSON: GraphQLJSONObject
};

export default resolverMap;