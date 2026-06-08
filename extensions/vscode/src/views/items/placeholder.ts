import { TreeItem, TreeItemCollapsibleState } from 'vscode';

export class PlaceholderTreeItem extends TreeItem {
  constructor(public readonly label: string) {
    super(label, TreeItemCollapsibleState.None);
  }
}
