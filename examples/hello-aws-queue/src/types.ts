import type { Queue } from '@ez4/queue';
import type { Validation } from '@ez4/validation';
import type { ValidationExample } from './validation';

/**
 * Message request example.
 */
export declare class MessageRequest implements Queue.Message {
  /**
   * Example of validated `string` property coming from the message
   * request with custom validation.
   */
  foo: string & Validation.Use<ValidationExample>;
}
