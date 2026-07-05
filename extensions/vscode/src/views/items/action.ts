import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';
import type { ActionInput } from '../../types/action';
import type { ModelInput } from '../../types/model';

import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

import { toKebabCase } from '@ez4/utils';

import { ModelTreeItem } from './model';

export class ActionTreeItem extends TreeItem {
  public readonly children: ModelTreeItem[];

  public readonly actionInput: ActionInput;

  constructor(id: string, host: string, location: string, action: ManifestAction<ObjectSchema>, models: ModelInput[]) {
    super(toKebabCase(action.name), models.length ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon('run', new ThemeColor('debugIcon.startForeground'));

    this.contextValue = 'actionItem';

    this.actionInput = {
      id,
      location,
      action,
      host
    };

    this.children = models.flatMap(({ index, model }) => {
      return model ? new ModelTreeItem(this, index, model) : [];
    });

    this.command = {
      title: 'Open action',
      command: 'ez4.actionItem.open',
      arguments: [this]
    };
  }

  getTreeItem(element: ActionTreeItem) {
    return element;
  }

  getChildren(element?: ActionTreeItem) {
    return element?.children ?? [];
  }
}
