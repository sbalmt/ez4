import { TreeItem, TreeItemCollapsibleState } from 'vscode';

export class ResourceTreeItem extends TreeItem {
  constructor(public readonly label: string) {
    super(label, TreeItemCollapsibleState.None);

    this.command = {
      command: 'ez4.manifest.open',
      title: 'Open',
      arguments: [
        {
          name: label
        }
      ]
    };
  }
}
