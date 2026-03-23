import type { Service } from '@ez4/common';
import type { AnyObject } from '@ez4/utils';
import type { Factory } from './contract';

/**
 * Factory handler function.
 */
export type FactoryHandler<T extends AnyObject> = (context: Service.Context<Factory.Service<T>>) => T;
