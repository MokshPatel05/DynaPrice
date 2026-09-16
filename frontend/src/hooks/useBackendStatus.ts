import { useState, useEffect, useCallback } from 'react';
import { healthCheck } from '../lib/api';

const POLL_INTERVAL_MS = 300_000; // poll every 5 minutes

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
