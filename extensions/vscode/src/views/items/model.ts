import type { ModelData } from '../../services/models';
import type { ModelInput } from '../../types/model';
import type { ActionTreeItem } from './action';

import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class ModelTreeItem extends TreeItem {
  public readonly modelInput: ModelInput;

  constructor(
    public readonly parentItem: ActionTreeItem,
    index: number,
    model: ModelData
  ) {
    super(model.name, TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon('json');

    this.contextValue = 'modelItem';

    this.modelInput = {
      model,
      index
    };

    this.command = {
      title: 'Select model',
      command: 'ez4.modelItem.select',
      arguments: [this]
    };
  }
}
