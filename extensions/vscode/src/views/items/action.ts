import type { ManifestAction } from '@ez4/project/library';

import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class ActionTreeItem extends TreeItem {
  constructor(host: string, action: ManifestAction) {
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
