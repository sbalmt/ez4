import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';
import type { ExtensionContext, LogOutputChannel, Webview, WebviewPanel } from 'vscode';
import type { ActionPayload, AnyActionSignal } from '../types/signals';

import { prepareRequestBody, prepareRequestUrl } from '@ez4/http';

import { ThemeIcon, Uri, ViewColumn, window } from 'vscode';

import { TemplateUtils } from '../utils/template';
import { SignalType } from '../types/signals';

const ALL_PANELS: Record<string, WebviewPanel | undefined> = {};

export namespace RequestWebView {
  export type Input = {
    host: string;
    action: ManifestAction<ObjectSchema>;
  };

  export const open = (input: Input, context: ExtensionContext, logger: LogOutputChannel) => {
    const { action } = input;
    const { name } = action;

    if (!ALL_PANELS[name]) {
      ALL_PANELS[name] = create(input, context, logger);
    } else {
      const { webview } = ALL_PANELS[name];

      ALL_PANELS[name].reveal(ViewColumn.One);

      webview.postMessage({
        type: SignalType.WebviewUpdate,
        action
      });
    }
  };

  const create = (input: Input, context: ExtensionContext, logger: LogOutputChannel) => {
    const { action } = input;
    const { name } = action;

    const panel = window.createWebviewPanel('ez4.livePanel', name, ViewColumn.One, {
      retainContextWhenHidden: true,
      enableScripts: true
    });

    panel.iconPath = new ThemeIcon('run');

    const { webview } = panel;

    webview.html = TemplateUtils.getHtml(context, 'media/request.html', {
      STYLES_PATH: webview.asWebviewUri(Uri.joinPath(context.extensionUri, 'media')).toString(),
      SCRIPT_PATH: webview.asWebviewUri(Uri.joinPath(context.extensionUri, 'dist')).toString()
    });

    webview.onDidReceiveMessage((signal: AnyActionSignal) => {
      if (signal.type === SignalType.Run) {
        sendActionRequest(webview, logger, input, signal.payload);
      } else {
        webview.postMessage({
          type: SignalType.WebviewUpdate,
          action
        });
      }
    });

    panel.onDidDispose(() => {
      delete ALL_PANELS[name];
    });

    return panel;
  };

  const sendActionRequest = async (webview: Webview, logger: LogOutputChannel, input: Input, payload: ActionPayload) => {
    const { headers, parameters, query, body } = payload;
    const { host, action } = input;
    const { type, path } = action;

    try {
      const method = type.toUpperCase();

      const requestUri = prepareRequestUrl(`http://${host}`, path, {
        querySchema: action.query as any,
        parameters,
        query
      });

      logger.info(`${method} ${requestUri}`, {
        headers,
        body
      });

      const start = Date.now();

      const response = await fetch(requestUri, {
        method,
        ...(body
          ? {
              ...prepareRequestBody(body, action.body as any),
              headers: {
                ...headers,
                'content-type': 'application/json'
              }
            }
          : {
              headers
            })
      });

      const results = await response.json();
      const elapsed = Date.now() - start;
      const success = response.ok;

      if (!success) {
        logger.error('Response', results);
      } else {
        logger.info('Response', results);
      }

      webview.postMessage({
        type: SignalType.WebviewResults,
        status: `${response.status} ${response.statusText}`,
        time: elapsed,
        success,
        results
      });
    } catch (error: any) {
      logger.error(error);

      webview.postMessage({
        type: SignalType.WebviewResults,
        success: false,
        results: {
          error: error instanceof Error ? error.message : `${error}`
        }
      });
    }
  };
}
