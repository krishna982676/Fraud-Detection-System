import { useState, useEffect } from 'react';

export function useCountUp(endVal: number, durationMs = 800): number {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (isNaN(endVal)) return;
    const start = current;
    const range = endVal - start;
    if (range === 0) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // Ease out quad
      const ease = 1 - (1 - progress) * (1 - progress);
      setCurrent(start + range * ease);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrent(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [endVal, durationMs]);

  return current;
}

