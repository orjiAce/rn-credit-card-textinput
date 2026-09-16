import React from 'react';

type HostProps = Record<string, unknown> & { children?: React.ReactNode };

const hostComponent = (name: string) =>
  React.forwardRef<unknown, HostProps>(({ children, ...props }, ref) =>
    React.createElement(name, { ...props, ref }, children),
  );

export const Text = hostComponent('Text');
export const TextInput = hostComponent('TextInput');
export const View = hostComponent('View');
export const Image = hostComponent('Image');

export const StyleSheet = {
  create: <T,>(styles: T): T => styles,
};

export const Dimensions = {
  get: () => ({ width: 414, height: 896, scale: 2, fontScale: 1 }),
};

export const PixelRatio = {
  roundToNearestPixel: (value: number) => value,
};
