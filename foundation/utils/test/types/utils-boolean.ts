import type { IsAllFalse, IsAllTrue, IsFalse, IsTrue } from '@ez4/utils';

import { assertType } from '@ez4/utils';

// Check type is true
assertType<true, IsTrue<true>>(true);
assertType<false, IsTrue<boolean>>(true);
assertType<false, IsTrue<false>>(true);

// Check type is false
assertType<true, IsFalse<false>>(true);
assertType<false, IsFalse<boolean>>(true);
assertType<false, IsFalse<true>>(true);

// Check all types are true
assertType<true, IsAllTrue<[true, true, true]>>(true);
assertType<false, IsAllTrue<[true, boolean, true]>>(true);
assertType<false, IsAllTrue<[true, false, true]>>(true);

// Check all types are false
assertType<true, IsAllFalse<[false, false, false]>>(true);
assertType<false, IsAllFalse<[false, boolean, false]>>(true);
assertType<false, IsAllFalse<[false, true, false]>>(true);
