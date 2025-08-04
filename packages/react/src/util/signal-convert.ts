import { effect } from 'static-injector';

import { InjectorToken } from '../token';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

// signal=>ref
export function useSignalToRef<I, R>(listen: I, value: (fn: I) => R) {
  const injector = useContext(InjectorToken)!;
  const [result, setResult] = useState(useMemo(() => value(listen), []));
  const resultRef = useRef(result);
  useEffect(() => {
    const currentValue = value(listen);
    if (!Object.is(resultRef.current, currentValue)) {
      setResult(currentValue);
      resultRef.current = currentValue;
    }
    const ref = effect(
      () => {
        const currentValue = value(listen);
        if (!Object.is(resultRef.current, currentValue)) {
          setResult(currentValue!);
          resultRef.current = currentValue;
        }
      },
      { injector: injector },
    );
    return () => {
      ref.destroy();
    };
  }, [listen, useMemo(() => value, [])]);
  return result;
}
