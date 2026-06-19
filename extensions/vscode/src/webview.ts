import type { AnyActionSignal, AnyWebviewSignal, WebviewResultsSignal, WebviewUpdateSignal } from './types/signals';
import type { RequestState } from './webview/types/state';

import { isEmptyObject } from '@ez4/utils';

import { getFirstTab } from './webview/components/tabs';
import { getEditorContent, setEditorContent, setEditorSchema } from './webview/components/editor';
import { getFieldsPayload, setFieldsSchema } from './webview/components/fields';
import { registerLayout } from './webview/components/layout';
import { formatTime } from './webview/utils/time';
import { formatPath } from './webview/utils/path';
import { SignalType } from './types/signals';

const vscode = acquireVsCodeApi<AnyActionSignal, RequestState>();
const elements = registerLayout();

self.onload = () => {
  vscode.postMessage({
    type: SignalType.Ready
  });
};

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
  const { title, description, actionType, actionPath, runAction, tabs, forms, editors } = elements;

  const state = vscode.getState();

  title.textContent = action.name;
  description.textContent = action.description ?? '';

  actionType.textContent = action.type.toUpperCase();
  actionPath.textContent = action.path;

  const hasHeaders = setFieldsSchema(forms.headersForm, 'headers', action.headers, state?.headers);
  const hasParameters = setFieldsSchema(forms.parametersForm, 'parameters', action.parameters, state?.parameters);
  const hasQuery = setFieldsSchema(forms.queryForm, 'query', action.query, state?.query);

  tabs.actionParameters.hidden = !(hasHeaders || hasParameters || hasQuery);
  tabs.actionRequest.hidden = !action.body || isEmptyObject(action.body);

  setEditorSchema(editors.requestEditor, action.body);

  if (!state) {
    getFirstTab()?.click();

    actionPath.onclick = () => {
      getFirstTab()?.click();
    };

    forms.parametersForm.oninput = () => {
      const parameters = getFieldsPayload('parameters', action.parameters);

      actionPath.innerHTML = formatPath(action.path, parameters);
    };

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
        type: SignalType.Run,
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
