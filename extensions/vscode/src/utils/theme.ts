import type { ColorTheme } from 'vscode';

import { ColorThemeKind } from 'vscode';

export const getEditorTheme = (color: ColorTheme) => {
  switch (color.kind) {
    case ColorThemeKind.Dark:
      return 'vs-dark';

    case ColorThemeKind.Light:
      return 'vs';

    case ColorThemeKind.HighContrast:
      return 'hc-black';

    default:
      return 'vs-dark';
  }
};
