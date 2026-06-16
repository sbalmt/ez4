import type { AnyActionSignal, AnyWebviewSignal, WebviewResultsSignal, WebviewUpdateSignal } from './types/signals';
import type { RequestState } from './webview/types/state';

import { isEmptyObject } from '@ez4/utils';

import { getFirstTab } from './webview/components/tabs';
import { getEditorContent, setEditorContent } from './webview/components/editor';
import { getFieldsPayload, setFieldsSchema } from './webview/components/fields';
import { registerLayout } from './webview/components/layout';
import { formatTime } from './webview/utils/time';
import { SignalType } from './types/signals';

const vscode = acquireVsCodeApi<AnyActionSignal, RequestState>();
const elements = registerLayout();

self.onmessage = ({ data }: MessageEvent<AnyWebviewSignal>) => {
  switch (data.type) {
    case SignalType.WebviewUpdate: {
      handleActionUpdate(data);
      break;
    }

    case SignalType.WebviewResults: {
      handleActionResults(data);
      break;
    }
  }
};

const handleActionUpdate = ({ action }: WebviewUpdateSignal) => {
  const { title, description, actionType, actionPath, runAction, tabs, editors, fields } = elements;

  const state = vscode.getState();

  title.textContent = action.name;
  description.textContent = action.description ?? '';

  actionType.textContent = action.type.toUpperCase();
  actionPath.textContent = action.path ?? '/';

  tabs.actionHeaders.hidden = !setFieldsSchema(fields.headersInputs, 'headers', action.headers, state?.headers);
  tabs.actionParameters.hidden = !setFieldsSchema(fields.parametersInputs, 'parameters', action.parameters, state?.parameters);
  tabs.actionQuery.hidden = !setFieldsSchema(fields.queryInputs, 'query', action.query, state?.query);
  tabs.actionBody.hidden = !action.body || isEmptyObject(action.body);

  if (!state) {
    getFirstTab()?.click();

    runAction.onclick = () => {
      runAction.disabled = true;

      const payload = {
        headers: getFieldsPayload('headers', action.headers),
        parameters: getFieldsPayload('parameters', action.parameters),
        query: getFieldsPayload('query', action.query),
        body: getEditorContent(editors.requestEditor)
      };

      vscode.setState({
        ...payload
      });

      vscode.postMessage({
        type: SignalType.RunAction,
        payload
      });
    };
  }
};

const handleActionResults = ({ success, status, time, results }: WebviewResultsSignal) => {
  const { runAction, editors, badges, tabs } = elements;

  badges.responseTime.textContent = time ? formatTime(time) : '';
  badges.responseStatus.textContent = status ?? '';

  badges.responseStatus.classList.remove(success ? 'response-error' : 'response-success');
  badges.responseStatus.classList.add(success ? 'response-success' : 'response-error');

  tabs.actionResponse.click();

  setEditorContent(editors.responseEditor, JSON.stringify(results, undefined, 2));

  runAction.disabled = false;
};
