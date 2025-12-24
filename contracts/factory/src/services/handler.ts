import type { Service } from '@ez4/common';
import type { Factory } from './contract';

/**
 * Factory handler function.
 */
export type FactoryHandler<T> = (context: Service.Context<Factory.Service<T>>) => T;
