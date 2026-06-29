import type { AnyObject } from '@ez4/utils';
import type { ExtensionContext } from 'vscode';

export type ModelData = {
  name: string;
  data: AnyObject;
};

export namespace ModelsService {
  const getKey = (id: string) => {
    return `${id}_models`;
  };

  export const getModels = (context: ExtensionContext, id: string) => {
    return context.workspaceState.get<(ModelData | null)[]>(getKey(id)) || [];
  };

  export const createModel = (context: ExtensionContext, id: string, input: ModelData) => {
    const key = getKey(id);

    const models = context.workspaceState.get<ModelData[]>(key) || [];

    const index = models.findIndex((model) => !model);

    const model = {
      name: input.name,
      data: input.data
    };

    if (index > -1) {
      models[index] = model;
    } else {
      models.push(model);
    }

    context.workspaceState.update(key, models);

    return {
      index: models.length,
      model: input
    };
  };

  export const updateModel = (context: ExtensionContext, id: string, index: number, input: Partial<ModelData>) => {
    const key = getKey(id);

    const models = context.workspaceState.get<ModelData[]>(key) || [];

    if (models[index]) {
      models[index] = { ...models[index], ...input };

      context.workspaceState.update(key, models);
    }
  };

  export const deleteModel = (context: ExtensionContext, id: string, index: number) => {
    const key = getKey(id);

    const models = context.workspaceState.get<ModelData[]>(key) || [];

    delete models[index];

    context.workspaceState.update(key, models);
  };
}
