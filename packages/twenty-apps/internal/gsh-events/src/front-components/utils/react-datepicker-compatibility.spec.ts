// @vitest-environment happy-dom

import { act, createElement, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import DatePicker from 'react-datepicker';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ensureResizeObserver } from './ensure-resize-observer.util';

type DatePickerTestProps = {
  inline: true;
  onChange: () => void;
  selected: Date;
  showTimeSelect: true;
};

// react-datepicker's declarations are not compatible with React 19's
// createElement overloads, even though the rendered props are valid.
const DatePickerForTest = DatePicker as unknown as ComponentType<DatePickerTestProps>;

const originalResizeObserverDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'ResizeObserver',
);

afterEach(() => {
  if (originalResizeObserverDescriptor) {
    Object.defineProperty(
      globalThis,
      'ResizeObserver',
      originalResizeObserverDescriptor,
    );
  } else {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  }
});

describe('react-datepicker in a Front Component sandbox', () => {
  it('renders when ResizeObserver is unavailable', () => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    ensureResizeObserver();

    const container = document.createElement('div');
    const root = createRoot(container);

    expect(() => {
      act(() => {
        root.render(
          createElement(DatePickerForTest, {
            inline: true,
            onChange: vi.fn(),
            selected: new Date('2026-08-28T16:00:00.000Z'),
            showTimeSelect: true,
          }),
        );
      });
    }).not.toThrow();

    act(() => root.unmount());
  });
});
