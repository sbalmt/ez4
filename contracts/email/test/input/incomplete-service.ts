import type { Email } from '@ez4/email';

// @ts-expect-error Missing required email domain.
export declare class TestEmail extends Email.Service {}
