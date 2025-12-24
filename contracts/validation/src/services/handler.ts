import type { Service } from '@ez4/common';
import type { Validation } from './contract';
import type { ValidationInput } from './input';

/**
 * Validation handler function.
 */
export type ValidationHandler<T> = (input: ValidationInput<T>, context: Service.Context<Validation.Service<T>>) => Promise<void> | void;
