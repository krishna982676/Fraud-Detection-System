import { useState, useEffect } from 'react';
import { initWebSocket, subscribeToStatus, type WsConnectionStatus } from '../lib/websocket';

export function useWebSocket() {
  const [status, setStatus] = useState<WsConnectionStatus>('DISCONNECTED');

  useEffect(() => {
    initWebSocket();
    const unsubscribe = subscribeToStatus(setStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  return { status, isConnected: status === 'CONNECTED' };
}

