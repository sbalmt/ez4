import type { TypeAny } from './type-any';
import type { TypeVoid } from './type-void';
import type { TypeNever } from './type-never';
import type { TypeUnknown } from './type-unknown';
import type { TypeUndefined } from './type-undefined';
import type { TypeNull } from './type-null';
import type { TypeBoolean } from './type-boolean';
import type { TypeNumber } from './type-number';
import type { TypeString } from './type-string';
import type { TypeReference } from './type-reference';
import type { TypeObject } from './type-object';
import type { TypeUnion } from './type-union';
import type { TypeIntersection } from './type-intersection';
import type { TypeArray } from './type-array';
import type { TypeTuple } from './type-tuple';
import type { TypeCallback } from './type-callback';
import type { TypeEnum } from './type-enum';

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
