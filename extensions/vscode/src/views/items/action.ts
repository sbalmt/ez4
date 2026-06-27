import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';
import type { RequestInput } from '../../types/request';

import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

import { toKebabCase } from '@ez4/utils';

export class ActionTreeItem extends TreeItem {
  constructor(host: string, workspace: string, action: ManifestAction<ObjectSchema>) {
    super(toKebabCase(action.name), TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon('run', new ThemeColor('debugIcon.startForeground'));

    this.command = {
      title: 'Use action',
      command: 'ez4.manifest.useAction',
      arguments: [
        {
          host,
          workspace,
          action
        } satisfies RequestInput
      ]
    };
  }
}
