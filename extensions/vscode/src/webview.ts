import type { WebviewUpdateSignal } from './types/signals';

import { getMainElement } from './utils/webview';
import { SignalType } from './types/signals';

window.onmessage = (event: MessageEvent<WebviewUpdateSignal>) => {
  if (event.data.type === SignalType.WebviewUpdate) {
    handleUpdate();
  }
};

const handleUpdate = () => {
  const main = getMainElement();

  main.innerHTML = 'Under development';
};
