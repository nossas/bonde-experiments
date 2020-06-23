import { IResolvers } from 'graphql-tools';
import { GraphQLJSONObject } from 'graphql-type-json';
// import { send } from './core/sendgrid';
// import { send } from './core/smtp';
// import Mail from './core/mail';
import { notify } from './resolvers';

const resolverMap: IResolvers = {
  // Query: {
  //   helloWorld: (_: void, args: void): string => {
  //     return `Hello Worldddddd!`;
  //   }
  // },
  Mutation: {
    notify
  },
  JSON: GraphQLJSONObject
};

export default resolverMap;