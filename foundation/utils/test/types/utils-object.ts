import type { IsObject, IsObjectEmpty, PropertyExists, PropertyType } from '@ez4/utils';

import { assertType } from '@ez4/utils';

// Check is objects
assertType<true, IsObject<{}>>(true);
assertType<true, IsObject<{} | null>>(true);
assertType<true, IsObject<{} | undefined>>(true);
assertType<false, IsObject<{} | string>>(true);
assertType<false, IsObject<[]>>(true);
assertType<false, IsObject<string[]>>(true);
assertType<false, IsObject<never>>(true);
assertType<false, IsObject<any>>(true);

// Check empty objects
assertType<true, IsObjectEmpty<{}>>(true);
assertType<false, IsObjectEmpty<{ foo: boolean }>>(true);
assertType<true, IsObjectEmpty<never>>(true);
assertType<true, IsObjectEmpty<any>>(true);

// Check property exists
assertType<true, PropertyExists<'foo', { foo: boolean }>>(true);
assertType<false, PropertyExists<'bar', { foo: boolean }>>(true);
assertType<false, PropertyExists<'baz', never>>(true);
assertType<false, PropertyExists<'baz', any>>(true);

// Check property type
assertType<boolean, PropertyType<'foo', { foo: boolean }>>(true);
assertType<never, PropertyType<'bar', { foo: boolean }>>(true);
assertType<never, PropertyType<'baz', never>>(true);
assertType<any, PropertyType<'baz', any>>(true);
