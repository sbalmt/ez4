import * as vscode from 'vscode';

import { fetchWorkspaceManifests, type WorkspaceManifest } from '../services/manifest';

export class ManifestStore {
  private eventEmitter = new vscode.EventEmitter<WorkspaceManifest[]>();

  readonly onDidChange = this.eventEmitter.event;

  async refresh() {
    const manifests = await fetchWorkspaceManifests();

    this.eventEmitter.fire(manifests);
  }
}
