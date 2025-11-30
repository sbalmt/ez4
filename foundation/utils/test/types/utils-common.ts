import type { IsAny, IsNever, IsNullable, IsNullish, IsUndefined, IsUnknown } from '@ez4/utils';

import { assertType } from '@ez4/utils';

// Check any types
assertType<true, IsAny<string | any>>(true);
assertType<false, IsAny<string>>(true);
assertType<false, IsAny<never>>(true);
assertType<true, IsAny<any>>(true);

// Check never types
assertType<false, IsNever<string | never>>(true);
assertType<false, IsNever<string>>(true);
assertType<true, IsNever<never>>(true);
assertType<false, IsNever<any>>(true);

// Check unknown types
assertType<true, IsUnknown<string | unknown>>(true);
assertType<false, IsUnknown<string>>(true);
assertType<false, IsUnknown<never>>(true);
assertType<false, IsUnknown<any>>(true);

// Check nullable types
assertType<true, IsNullable<string | null>>(true);
assertType<false, IsNullable<string>>(true);
assertType<false, IsNullable<never>>(true);
assertType<false, IsNullable<any>>(true);

// Check undefined types
assertType<true, IsUndefined<string | undefined>>(true);
assertType<false, IsUndefined<string>>(true);
assertType<false, IsUndefined<never>>(true);
assertType<false, IsUndefined<any>>(true);

// Check nullish types
assertType<true, IsNullish<string | null>>(true);
assertType<true, IsNullish<string | undefined>>(true);
assertType<true, IsNullish<string | undefined | null>>(true);
assertType<false, IsUndefined<string>>(true);
assertType<false, IsUndefined<never>>(true);
assertType<false, IsUndefined<any>>(true);
