import type { Queue } from '@ez4/queue';
import type { Validation } from '@ez4/validation';
import type { ValidationExample } from './validation';

/**
 * Message request example.
 */
export declare class MessageRequest implements Queue.Message {
  foo: string & Validation.Use<ValidationExample>;
}

/**
 * Message request example with deduplication.
 */
export declare class DedupMessageRequest implements Queue.Message {
  foo: string & Validation.Use<ValidationExample>;
  baz: string;
}
