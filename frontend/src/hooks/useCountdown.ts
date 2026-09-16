import { useState, useEffect, useRef, useCallback } from 'react';
import { loadLastTick, saveLastTick } from '../lib/storage';

const TICK_INTERVAL_MS = 60_000; // 60 seconds

interface UseCountdownReturn {
  secondsLeft: number;
  totalSeconds: number;
}

/**
 * 60-second countdown that:
 * - Reads dynaprice:lastTick from localStorage so a page refresh doesn't
 *   reset the countdown.
 * - Calls onTick() whenever the interval fires.
 * - Persists the new lastTick timestamp after each tick.
 */
export function useCountdown(onTick: () => void): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const last = loadLastTick();
    if (!last) return TICK_INTERVAL_MS / 1000;
    const elapsed = Date.now() - last;
    const remaining = TICK_INTERVAL_MS - (elapsed % TICK_INTERVAL_MS);
    return Math.max(1, Math.ceil(remaining / 1000));
  });

  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Store the absolute time when the next tick should fire
  const nextTickAt = useRef<number>(() => {
    const last = loadLastTick();
    if (!last) return Date.now() + TICK_INTERVAL_MS;
    const elapsed = Date.now() - last;
    const remaining = TICK_INTERVAL_MS - (elapsed % TICK_INTERVAL_MS);
    return Date.now() + remaining;
  });
  // initialise nextTickAt on mount
  useEffect(() => {
    const last = loadLastTick();
    if (!last) {
      nextTickAt.current = Date.now() + TICK_INTERVAL_MS;
    } else {
      const elapsed = Date.now() - last;
      const remaining = TICK_INTERVAL_MS - (elapsed % TICK_INTERVAL_MS);
      nextTickAt.current = Date.now() + remaining;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = nextTickAt.current - now;

      if (remaining <= 1000) {
        // Tick!
        const tickTime = Date.now();
        saveLastTick(tickTime);
        nextTickAt.current = tickTime + TICK_INTERVAL_MS;
        setSecondsLeft(TICK_INTERVAL_MS / 1000);
        onTickRef.current();
      } else {
        setSecondsLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return { secondsLeft, totalSeconds: TICK_INTERVAL_MS / 1000 };
}
