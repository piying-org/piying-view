import { useCallback, useEffect, useMemo, useRef } from 'react';

export function useEffectSync(fn: () => (() => void) | void, deps: any[]) {
  const cb = useCallback(fn, deps);
  const dispose = useRef<(() => void) | void>(undefined);
  useMemo(() => {
    dispose.current = cb();
    return dispose.current;
  }, deps);
  useEffect(() => {
    return () => {
      dispose.current?.();
      dispose.current = undefined;
    };
  }, []);
}
