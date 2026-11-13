import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Fix Node/JSDOM undici Request signal incompatibility
if (typeof globalThis.Request !== 'undefined') {
  const OriginalRequest = globalThis.Request;
  globalThis.Request = class Request extends OriginalRequest {
    constructor(input: any, init?: any) {
      let cleanInit = init;
      if (init && 'signal' in init) {
        try {
          new OriginalRequest(input, init);
        } catch {
          const { signal: _unused, ...rest } = init;
          cleanInit = rest;
        }
      }
      super(input, cleanInit);
    }
  } as any;
}

// Mock HTMLCanvasElement getContext for JSDOM
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => {},
    putImageData: () => {},
    createImageData: () => {},
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  } as any);
}

// Polyfill window.matchMedia if not present in jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Polyfill localStorage if needed in Node/jsdom
  if (!window.localStorage) {
    let store: Record<string, string> = {};
    const storageMock = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() {
        return Object.keys(store).length;
      },
    };
    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
    });
  }
}
