import { Client } from '@stomp/stompjs';
import { deduplicateAndAddTransaction, addAlert } from '../store/transactionStore';
import type { Alert, AnalysisResponse } from '../types/api';

export type WsConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

type StatusListener = (status: WsConnectionStatus) => void;
const statusListeners = new Set<StatusListener>();

let stompClient: Client | null = null;
let currentStatus: WsConnectionStatus = 'DISCONNECTED';

function updateStatus(status: WsConnectionStatus) {
  currentStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

export function subscribeToStatus(fn: StatusListener): () => void {
  statusListeners.add(fn);
  fn(currentStatus);
  return () => statusListeners.delete(fn);
}

function getWsUrl(): string {
  if (typeof window === 'undefined') return 'ws://localhost:8080/ws/alerts';
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // In dev (port 3000), point directly to 8080 if not proxied or through proxy
  const host = window.location.port === '3000' ? `${window.location.hostname}:8080` : window.location.host;
  return `${proto}//${host}/ws/alerts`;
}

export function initWebSocket(): Client {
  if (stompClient && stompClient.active) {
    return stompClient;
  }

  updateStatus('CONNECTING');

  stompClient = new Client({
    brokerURL: getWsUrl(),
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: () => {
      // Silence noisy STOMP debug
    },
    onConnect: () => {
      updateStatus('CONNECTED');

      // Subscribe to real-time transactions
      stompClient?.subscribe('/topic/transactions', (message) => {
        try {
          const txn = JSON.parse(message.body) as AnalysisResponse;
          deduplicateAndAddTransaction(txn);
        } catch (e) {
          console.error('Error parsing transaction WS message', e);
        }
      });

      // Subscribe to live security alerts
      stompClient?.subscribe('/topic/alerts', (message) => {
        try {
          const alert = JSON.parse(message.body) as Alert;
          addAlert(alert);
        } catch (e) {
          console.error('Error parsing alert WS message', e);
        }
      });
    },
    onDisconnect: () => {
      updateStatus('DISCONNECTED');
    },
    onStompError: () => {
      updateStatus('RECONNECTING');
    },
    onWebSocketClose: () => {
      updateStatus('RECONNECTING');
    },
  });

  try {
    stompClient.activate();
  } catch (err) {
    console.error('WebSocket activation error:', err);
    updateStatus('DISCONNECTED');
  }

  return stompClient;
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    updateStatus('DISCONNECTED');
  }
}
