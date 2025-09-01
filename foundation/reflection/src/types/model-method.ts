import type { AllType } from './common';
import type { TypeParameter } from './type-parameter';
import type { EveryType } from './types';

import { TypeName } from './common';

export type MethodModifiers = {
  abstract?: boolean;
  override?: boolean;
  private?: boolean;
  protected?: boolean;
  public?: boolean;
  async?: boolean;
};

export type ModelMethod = {
  type: TypeName.Method;
  name: string;
  description?: string;
  modifiers?: MethodModifiers;
  parameters?: TypeParameter[];
  return?: EveryType;
};

/**
 * Determines whether or not the given type is a `method` type.
 *
 * @param type Type reflection object.
 */
export const isModelMethod = (type: AllType): type is ModelMethod => {
  return type.type === TypeName.Method;
};
