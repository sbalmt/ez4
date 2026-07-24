import type { IsAllFalse, IsAllTrue } from '@ez4/utils';

import { assertType } from '@ez4/utils';

// Check all types are true
assertType<true, IsAllTrue<[true, true, true]>>(true);
assertType<false, IsAllTrue<[true, boolean, true]>>(true);
assertType<false, IsAllTrue<[true, false, true]>>(true);

// Check all types are false
assertType<true, IsAllFalse<[false, false, false]>>(true);
assertType<false, IsAllFalse<[false, boolean, false]>>(true);
assertType<false, IsAllFalse<[false, true, false]>>(true);
