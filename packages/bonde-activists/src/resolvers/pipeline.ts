import {
  Action,
  Previous,
  Next,
  Resolver,
  IBaseActionArgs,
  IResolverData
} from '../types';

export default <T extends any>(previous: Previous, action: Action, next: Next): Resolver =>
  async (_: void, args: IBaseActionArgs): Promise<IResolverData> => {
    /** Resolver function base */
    const { activist, widget } = await previous(args);

    const opts = { action: args.input, activist, widget };
    const { data, syncronize } = await action<T>(opts);
    await next(opts, syncronize);

    return { data };
  }
;