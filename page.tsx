// Home page component
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button, Card, Input } from '@/components/ui';

export default function Home() {
  const router = useRouter();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create room
      const roomResponse = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName })
      });

      if (!roomResponse.ok) {
        throw new Error('Failed to create room');
      }

      const roomData = await roomResponse.json();

      // Create host user
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `host_${Date.now()}`,
          displayName: hostName,
          isHost: true,
          roomId: roomData.id
        })
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create host user');
      }

      const userData = await userResponse.json();

      // Store room and user info in localStorage
      localStorage.setItem('triviaRoom', JSON.stringify(roomData));
      localStorage.setItem('triviaUser', JSON.stringify(userData));

      // Redirect to host room page
      router.push(`/host/${roomData.roomCode}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if room exists
      const roomResponse = await fetch(`/api/rooms?code=${roomCode}`);
      
      if (!roomResponse.ok) {
        throw new Error('Room not found');
      }

      const roomData = await roomResponse.json();

      // Create guest user
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `guest_${Date.now()}`,
          displayName: guestName,
          isHost: false,
          roomId: roomData.id
        })
      });

      if (!userResponse.ok) {
        throw new Error('Failed to join room');
      }

      const userData = await userResponse.json();

      // Store room and user info in localStorage
      localStorage.setItem('triviaRoom', JSON.stringify(roomData));
      localStorage.setItem('triviaUser', JSON.stringify(userData));

      // Redirect to guest room page
      router.push(`/guest/${roomCode}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please check the room code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Trivia Master</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create or join a trivia game room to start playing with friends and family.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Create a Room" className="h-full">
            {!isCreatingRoom ? (
              <div className="text-center py-8">
                <p className="mb-4 text-gray-600">
                  Create a new trivia room as a host and invite others to join.
                </p>
                <Button onClick={() => setIsCreatingRoom(true)}>
                  Create Room
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateRoom}>
                <Input
                  label="Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="My Trivia Room"
                  required
                />
                <Input
                  label="Your Name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Host Name"
                  required
                />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsCreatingRoom(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading || !roomName || !hostName}
                  >
                    {loading ? 'Creating...' : 'Create Room'}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card title="Join a Room" className="h-full">
            {!isJoiningRoom ? (
              <div className="text-center py-8">
                <p className="mb-4 text-gray-600">
                  Join an existing trivia room with a room code.
                </p>
                <Button 
                  variant="secondary"
                  onClick={() => setIsJoiningRoom(true)}
                >
                  Join Room
                </Button>
              </div>
            ) : (
              <form onSubmit={handleJoinRoom}>
                <Input
                  label="Room Code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  required
                />
                <Input
                  label="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your display name"
                  required
                />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsJoiningRoom(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading || !roomCode || !guestName}
                  >
                    {loading ? 'Joining...' : 'Join Room'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
