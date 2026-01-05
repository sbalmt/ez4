import type { ThemeColor } from '../common/theme';

export const getNodeStyle = (color: ThemeColor) => {
  return `fill:${color}50, stroke:${color}a0`;
};

export const getNodeImportStyle = (color: ThemeColor) => {
  return `fill:${color}25, stroke:${color}a0, stroke-dasharray:5 5`;
};

export const getEdgeStyle = (color: ThemeColor) => {
  return `stroke:${color}`;
};
