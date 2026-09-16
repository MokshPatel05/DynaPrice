import { useState, useEffect, useCallback } from 'react';
import { healthCheck } from '../lib/api';

const POLL_INTERVAL_MS = 15_000; // poll every 15 seconds

export function useBackendStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const check = useCallback(async () => {
    const ok = await healthCheck();
    setIsOnline(ok);
  }, []);

  useEffect(() => {
    void check(); // immediate check on mount
    const id = setInterval(() => void check(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [check]);

  return isOnline;
}
