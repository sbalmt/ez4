import type { AnyObject } from '@ez4/utils';
import type { ExtensionContext } from 'vscode';

import { getRandomUUID } from '@ez4/utils';

export type ModelData = {
  name: string;
  data: AnyObject;
};

export namespace ModelsService {
  type ModelDataMap = Record<string, ModelData>;

  const getKey = (id: string) => {
    return `${id}_models`;
  };

  export const getModels = (context: ExtensionContext, id: string) => {
    const models = context.workspaceState.get<ModelDataMap>(getKey(id)) || {};

    return Object.entries(models).map(([index, model]) => ({ index, model }));
  };

  export const createModel = (context: ExtensionContext, id: string, input: ModelData) => {
    const key = getKey(id);

    const models = context.workspaceState.get<ModelDataMap>(key) || {};

    const index = getRandomUUID();

    const model = (models[index] = {
      name: input.name,
      data: input.data
    });

    context.workspaceState.update(key, models);

    return {
      model,
      index
    };
  };

  export const updateModel = (context: ExtensionContext, id: string, index: string, input: Partial<ModelData>) => {
    const key = getKey(id);

    const models = context.workspaceState.get<ModelDataMap>(key) || {};

    if (models[index]) {
      models[index] = { ...models[index], ...input };

      context.workspaceState.update(key, models);
    }
  };

  export const deleteModel = (context: ExtensionContext, id: string, index: string) => {
    const key = getKey(id);

    const models = context.workspaceState.get<ModelDataMap>(key) || {};

    delete models[index];

    context.workspaceState.update(key, models);
  };
}
