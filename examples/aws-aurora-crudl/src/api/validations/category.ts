import type { Validation } from '@ez4/validation';
import type { Environment, Service } from '@ez4/common';
import type { Db } from '../../aurora';

import { CategoryNotFound } from '../errors/category';

export declare class CategoryExists extends Validation.Service<string> {
  handler: typeof checkCategoryExists;

  services: {
    db: Environment.Service<Db>;
  };
}

export async function checkCategoryExists(input: Validation.Input<string>, context: Service.Context<CategoryExists>) {
  const { db } = context;

  const total = await db.categories.count({
    where: {
      id: input.value
    }
  });

  if (!total) {
    throw new CategoryNotFound();
  }
}
