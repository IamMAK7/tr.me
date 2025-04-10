// WebSocket utility for real-time communication
import { useEffect, useState } from 'react';

type MessageHandler = (message: any) => void;

export function useWebSocket(url: string, onMessage: MessageHandler) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    ws.onerror = (event) => {
      setError('WebSocket error occurred');
      console.error('WebSocket error:', event);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      ws.close();
    };
  }, [url, onMessage]);
  
  // Function to send messages
  const sendMessage = (data: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  };
  
  return { isConnected, error, sendMessage };
}
