import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class ActionTreeItem extends TreeItem {
  constructor(host: string, action: ManifestAction<ObjectSchema>) {
    super(action.name, TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon('run', new ThemeColor('debugIcon.startForeground'));

    this.command = {
      title: 'Use action',
      command: 'ez4.manifest.useAction',
      arguments: [
        {
          host,
          action
        }
      ]
    };
  }
}
