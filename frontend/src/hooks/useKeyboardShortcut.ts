import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: { meta?: boolean; ctrl?: boolean; alt?: boolean } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) &&
        !options.meta &&
        !options.ctrl
      ) {
        return;
      }

      const matchMeta = options.meta ? e.metaKey || e.ctrlKey : true;
      const matchKey = e.key.toLowerCase() === key.toLowerCase();

      if (matchKey && matchMeta) {
        callback(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options.meta, options.ctrl, options.alt]);
}

