// WebSocket server implementation for Cloudflare Workers
import { WebSocketPair } from '@cloudflare/workers-types';

// Map to store active WebSocket connections by room
const roomConnections = new Map<string, Set<WebSocket>>();

export async function handleWebSocketConnection(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const roomCode = url.searchParams.get('roomCode');
  
  if (!roomCode) {
    return new Response('Room code is required', { status: 400 });
  }
  
  // Create a new WebSocket pair
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  
  // Add this connection to the room's set of connections
  if (!roomConnections.has(roomCode)) {
    roomConnections.set(roomCode, new Set());
  }
  roomConnections.get(roomCode)?.add(server);
  
  // Handle WebSocket events
  server.accept();
  
  server.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data as string);
      
      // Add roomCode to the message
      message.roomCode = roomCode;
      
      // Broadcast the message to all clients in the room
      const connections = roomConnections.get(roomCode);
      if (connections) {
        for (const conn of connections) {
          if (conn.readyState === 1) { // OPEN
            conn.send(JSON.stringify(message));
          }
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
  
  server.addEventListener('close', () => {
    // Remove this connection from the room
    const connections = roomConnections.get(roomCode);
    if (connections) {
      connections.delete(server);
      
      // If the room is empty, remove it from the map
      if (connections.size === 0) {
        roomConnections.delete(roomCode);
      }
    }
  });
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
