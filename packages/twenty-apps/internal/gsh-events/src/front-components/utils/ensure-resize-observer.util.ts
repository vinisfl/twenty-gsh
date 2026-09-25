/**
 * Front Components execute in a sandbox that does not expose ResizeObserver.
 * react-datepicker uses it only to recalculate the time list height, so a
 * no-op observer keeps the inline calendar functional in that environment.
 */
export const ensureResizeObserver = () => {
  if (typeof globalThis.ResizeObserver !== 'undefined') {
    return;
  }

  class NoopResizeObserver implements ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}

    disconnect() {}

    observe(_target: Element, _options?: ResizeObserverOptions) {}

    unobserve(_target: Element) {}
  }

  globalThis.ResizeObserver = NoopResizeObserver;
};
