import type { TypeAny } from './type-any.js';
import type { TypeVoid } from './type-void.js';
import type { TypeNever } from './type-never.js';
import type { TypeUnknown } from './type-unknown.js';
import type { TypeUndefined } from './type-undefined.js';
import type { TypeNull } from './type-null.js';
import type { TypeBoolean } from './type-boolean.js';
import type { TypeNumber } from './type-number.js';
import type { TypeString } from './type-string.js';
import type { TypeReference } from './type-reference.js';
import type { TypeObject } from './type-object.js';
import type { TypeUnion } from './type-union.js';
import type { TypeIntersection } from './type-intersection.js';
import type { TypeArray } from './type-array.js';
import type { TypeTuple } from './type-tuple.js';
import type { TypeCallback } from './type-callback.js';
import type { TypeEnum } from './type-enum.js';

export type EveryType =
  | TypeAny
  | TypeVoid
  | TypeNever
  | TypeUnknown
  | TypeUndefined
  | TypeNull
  | TypeBoolean
  | TypeNumber
  | TypeString
  | TypeReference
  | TypeObject
  | TypeUnion
  | TypeIntersection
  | TypeArray
  | TypeTuple
  | TypeCallback
  | TypeEnum;
