import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePaintTransition(matrix: string) {
  const ref = useRef<SVGFEColorMatrixElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current, {
      attr: { values: matrix },
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.3,
      ease: 'power1.inOut',
    });
    return () => { tween.kill(); };
  }, [matrix]);

  return ref;
}