import { IBaseAction } from '../types';
import pipeline from './pipeline';
import previous from './previous';
import next from './next';

export const BaseAction = <T>(fn: (args: IBaseAction<any>) => Promise<any>) =>
  pipeline<T>(previous, fn, next)
;