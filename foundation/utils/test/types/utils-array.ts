import type { ArrayRest, ArrayType, IsArray, IsArrayEmpty, TryArrayType } from '@ez4/utils';

import { assertType } from '@ez4/utils';

// Check is array
assertType<true, IsArray<[]>>(true);
assertType<true, IsArray<[string, boolean]>>(true);
assertType<true, IsArray<string[]>>(true);
assertType<true, IsArray<never[]>>(true);
assertType<true, IsArray<any[]>>(true);
assertType<false, IsArray<string[] | boolean>>(true);
assertType<false, IsArray<never>>(true);
assertType<false, IsArray<any>>(true);

// Check empty arrays
assertType<true, IsArrayEmpty<[]>>(true);
assertType<false, IsArrayEmpty<[string, boolean]>>(true);
assertType<true, IsArrayEmpty<string[]>>(true);
assertType<true, IsArrayEmpty<any[]>>(true);
assertType<true, IsArrayEmpty<never>>(true);
assertType<true, IsArrayEmpty<any>>(true);

// Check array rest
assertType<[], ArrayRest<[]>>(true);
assertType<[boolean, number], ArrayRest<[string, boolean, number]>>(true);
assertType<never, ArrayRest<never>>(true);
assertType<[], ArrayRest<any>>(true);

// Check array type
assertType<never, ArrayType<[]>>(true);
assertType<string | boolean, ArrayType<[string, boolean]>>(true);
assertType<never, ArrayType<never>>(true);
assertType<never, ArrayType<any>>(true);

// Check try array type
assertType<never, TryArrayType<[]>>(true);
assertType<string | boolean, TryArrayType<[string, boolean]>>(true);
assertType<string, TryArrayType<string>>(true);
assertType<never, TryArrayType<never>>(true);
assertType<never, TryArrayType<any>>(true);
