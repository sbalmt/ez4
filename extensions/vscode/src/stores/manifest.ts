import type { WorkspaceManifest } from '../services/manifest';

import * as vscode from 'vscode';

import { ManifestService } from '../services/manifest';

export class ManifestStore {
  private eventEmitter = new vscode.EventEmitter<WorkspaceManifest[]>();

  readonly onDidChange = this.eventEmitter.event;

  async refresh() {
    const manifests = await ManifestService.fetchAll();

    this.eventEmitter.fire(manifests);
  }
}
