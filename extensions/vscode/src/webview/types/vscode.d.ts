declare function acquireVsCodeApi<T, U>(): {
  postMessage: (message: T) => void;
  getState: () => U | undefined;
  setState: (state: U) => void;
};
