import { useRef } from 'react';

export const usePathRef = (path) => {
  const ref = useRef(path);
  ref.current = path;
  return ref;
};

export const useDerivedPathRef = (parentRef, suffix) => {
  const suffixRef = useRef(suffix);
  suffixRef.current = suffix;
  const derivedRef = useRef(null);

  if (!derivedRef.current) {
    derivedRef.current = {
      get current() {
        const base = parentRef?.current || '';
        const currentSuffix = suffixRef.current;
        return base ? `${base}.${currentSuffix}` : currentSuffix;
      }
    };
  }

  return derivedRef.current;
};
