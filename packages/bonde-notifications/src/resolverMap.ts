import { IResolvers } from 'graphql-tools';
import { GraphQLJSONObject } from 'graphql-type-json';
import { send } from './sendgrid';
import Mail from './sendgrid/mail';

const resolverMap: IResolvers = {
  // Query: {
  //   helloWorld: (_: void, args: void): string => {
  //     return `Hello Worldddddd!`;
  //   }
  // },
  Mutation: {
    notify: async (_: void, { input }: any): Promise<{ status: string }> => {
      input.forEach(
        async (settings: any) => {
          const mail = new Mail(settings).json();
          await send(mail);
        }
      );
      return { status: 'successfully' };
    }
  },
  JSON: GraphQLJSONObject
};

export default resolverMap;