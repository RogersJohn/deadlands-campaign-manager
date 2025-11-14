import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
} from '@mui/material';
import {
  ExitToApp as LeaveIcon,
  PlayArrow as StartIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import sessionService from '../services/sessionService';
import { websocketService } from '../services/websocketService';
import { useAuthStore } from '../store/authStore';
import {
  GameSession,
  SessionPlayer,
  PlayerJoinedMessage,
  PlayerLeftMessage,
  PlayerConnectedMessage,
  PlayerDisconnectedMessage,
  GameStartedMessage,
} from '../types/session';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export default function SessionRoom() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();
  const isGM = user?.role === 'GAME_MASTER';

  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch session details
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionService.getSession(Number(sessionId)),
    enabled: !!sessionId,
  });

  // Fetch session players
  const { data: sessionPlayers, isLoading: playersLoading } = useQuery({
    queryKey: ['session-players', sessionId],
    queryFn: () => sessionService.getSessionPlayers(Number(sessionId)),
    enabled: !!sessionId,
    refetchInterval: 5000, // Poll every 5 seconds as backup
  });

  // Leave session mutation
  const leaveSessionMutation = useMutation({
    mutationFn: () => sessionService.leaveSession(Number(sessionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate('/sessions');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to leave session');
    },
  });

  // Initialize players from query
  useEffect(() => {
    if (sessionPlayers) {
      setPlayers(sessionPlayers);
    }
  }, [sessionPlayers]);

  // WebSocket connection
  useEffect(() => {
    if (!sessionId || !token) {
      return;
    }

    const connectWebSocket = async () => {
      try {
        await websocketService.connect(Number(sessionId), token);
        setWsConnected(true);
        console.log('WebSocket connected to session room');

        // Subscribe to player events
        const unsubJoined = websocketService.onPlayerJoined(handlePlayerJoined);
        const unsubLeft = websocketService.onPlayerLeft(handlePlayerLeft);
        const unsubConnected = websocketService.onPlayerConnected(handlePlayerConnected);
        const unsubDisconnected = websocketService.onPlayerDisconnected(handlePlayerDisconnected);
        const unsubGameStarted = websocketService.onGameStarted(handleGameStarted);

        // Cleanup on unmount
        return () => {
          unsubJoined();
          unsubLeft();
          unsubConnected();
          unsubDisconnected();
          unsubGameStarted();
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setError('Failed to connect to session. Please refresh the page.');
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
      setWsConnected(false);
    };
  }, [sessionId, token]);

  // Handle player joined event
  const handlePlayerJoined = useCallback((message: PlayerJoinedMessage) => {
    console.log('Player joined:', message);
    addChatMessage('System', `${message.playerName} (${message.characterName}) joined the session`);

    // Refetch players list
    queryClient.invalidateQueries({ queryKey: ['session-players', sessionId] });
  }, [queryClient, sessionId]);

  // Handle player left event
  const handlePlayerLeft = useCallback((message: PlayerLeftMessage) => {
    console.log('Player left:', message);
    addChatMessage('System', `${message.playerName} left the session`);

    // Refetch players list
    queryClient.invalidateQueries({ queryKey: ['session-players', sessionId] });
  }, [queryClient, sessionId]);

  // Handle player connected event
  const handlePlayerConnected = useCallback((message: PlayerConnectedMessage) => {
    console.log('Player connected:', message);
    setPlayers((prev) =>
      prev.map((p) =>
        p.player.id === message.playerId ? { ...p, connected: true } : p
      )
    );
  }, []);

  // Handle player disconnected event
  const handlePlayerDisconnected = useCallback((message: PlayerDisconnectedMessage) => {
    console.log('Player disconnected:', message);
    setPlayers((prev) =>
      prev.map((p) =>
        p.player.id === message.playerId ? { ...p, connected: false } : p
      )
    );
  }, []);

  // Handle game started event
  const handleGameStarted = useCallback((message: GameStartedMessage) => {
    console.log('Game started by:', message.startedBy);
    addChatMessage('System', `Game starting! Entering the arena...`);

    // Navigate to game arena after brief delay
    setTimeout(() => {
      navigate(`/session/${sessionId}/arena`);
    }, 1000);
  }, [sessionId, navigate]);

  // Add chat message helper
  const addChatMessage = (username: string, message: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        username,
        message,
        timestamp: Date.now(),
      },
    ]);
  };

  // Handle send chat message
  const handleSendChat = () => {
    if (!chatInput.trim() || !user) {
      return;
    }

    addChatMessage(user.username, chatInput);
    setChatInput('');

    // TODO: Send chat message via WebSocket
    // websocketService.sendChatMessage(chatInput);
  };

  // Handle leave session
  const handleLeaveSession = () => {
    if (window.confirm('Are you sure you want to leave this session?')) {
      leaveSessionMutation.mutate();
    }
  };

  // Handle start game (GM only)
  const handleStartGame = async () => {
    if (!sessionId) {
      return;
    }

    try {
      // Call backend to start the game (this will broadcast to all players)
      await sessionService.startGame(Number(sessionId));

      // GM will also navigate via the game-started event
      addChatMessage('System', 'Starting game...');
    } catch (error: any) {
      console.error('Failed to start game:', error);
      setError(error.response?.data?.message || 'Failed to start game');
    }
  };

  if (sessionLoading || playersLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress sx={{ color: '#8b4513' }} />
        </Box>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Session not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, bgcolor: '#2d1b0e', border: '2px solid #8b4513' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" sx={{ color: '#f5e6d3', fontFamily: 'Rye, serif', mb: 1 }}>
              {session.name}
            </Typography>
            {session.description && (
              <Typography variant="body2" sx={{ color: '#d4b896' }}>
                {session.description}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<LeaveIcon />}
            onClick={handleLeaveSession}
            disabled={leaveSessionMutation.isPending}
            sx={{
              color: '#f5deb3',
              borderColor: '#8b4513',
              '&:hover': { borderColor: '#CD853F', bgcolor: '#3c2415' },
            }}
          >
            Leave Session
          </Button>
        </Box>

        <Divider sx={{ bgcolor: '#8b4513', mb: 3 }} />

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Connection Status */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <StatusIcon
            sx={{
              fontSize: 12,
              color: wsConnected ? '#44ff44' : '#ff4444',
            }}
          />
          <Typography variant="caption" sx={{ color: '#d4b896' }}>
            {wsConnected ? 'Connected' : 'Connecting...'}
          </Typography>
        </Box>

        <Box display="flex" gap={3}>
          {/* Left Column - Players List */}
          <Box flex={1}>
            <Paper sx={{ p: 2, bgcolor: '#1a0f08', border: '1px solid #8b4513' }}>
              <Typography variant="h6" sx={{ color: '#f5e6d3', mb: 2, fontFamily: 'Rye, serif' }}>
                Players ({players.length}
                {session.maxPlayers && `/${session.maxPlayers}`})
              </Typography>

              <List>
                {/* Game Master */}
                <ListItem
                  sx={{
                    bgcolor: '#3c2415',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid #CD853F',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#CD853F' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: '#f5e6d3', fontWeight: 'bold' }}>
                        {session.gameMaster.username}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: '#d4b896', fontSize: '0.875rem' }}>
                        Game Master
                      </Typography>
                    }
                  />
                  <Chip label="GM" size="small" sx={{ bgcolor: '#CD853F', color: '#1a0f08' }} />
                </ListItem>

                {/* Players */}
                {players.map((player) => (
                  <ListItem
                    key={player.id}
                    sx={{
                      bgcolor: '#2c1810',
                      borderRadius: 1,
                      mb: 1,
                      border: '1px solid #654321',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: player.connected ? '#4169e1' : '#888' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography sx={{ color: '#f5e6d3' }}>
                            {player.player.username}
                          </Typography>
                          <StatusIcon
                            sx={{
                              fontSize: 10,
                              color: player.connected ? '#44ff44' : '#ff4444',
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography sx={{ color: '#d4b896', fontSize: '0.875rem' }}>
                          {player.character.name}
                        </Typography>
                      }
                    />
                    <Chip
                      label={player.connected ? 'Online' : 'Offline'}
                      size="small"
                      sx={{
                        bgcolor: player.connected ? '#2d5016' : '#4a3030',
                        color: player.connected ? '#90ee90' : '#ff8888',
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              {/* Start Game Button (GM Only) */}
              {isGM && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<StartIcon />}
                  onClick={handleStartGame}
                  disabled={players.length === 0}
                  sx={{
                    mt: 2,
                    bgcolor: '#4169e1',
                    color: '#fff',
                    fontFamily: 'Rye, serif',
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: '#3158d0' },
                    '&:disabled': { bgcolor: '#555', color: '#888' },
                  }}
                >
                  Start Game
                </Button>
              )}

              {!isGM && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Waiting for Game Master to start the game...
                </Alert>
              )}
            </Paper>
          </Box>

          {/* Right Column - Chat */}
          <Box flex={1}>
            <Paper sx={{ p: 2, bgcolor: '#1a0f08', border: '1px solid #8b4513', height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ color: '#f5e6d3', mb: 2, fontFamily: 'Rye, serif' }}>
                Pre-Game Chat
              </Typography>

              {/* Chat Messages */}
              <Box
                flex={1}
                sx={{
                  overflowY: 'auto',
                  mb: 2,
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#1a0f08',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#8b4513',
                    borderRadius: '4px',
                  },
                }}
              >
                {chatMessages.length === 0 && (
                  <Typography variant="body2" sx={{ color: '#888', textAlign: 'center', mt: 2 }}>
                    No messages yet. Say hello to your fellow adventurers!
                  </Typography>
                )}

                {chatMessages.map((msg) => (
                  <Box key={msg.id} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#CD853F', fontWeight: 'bold' }}>
                      {msg.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#f5e6d3', ml: 1 }}>
                      {msg.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888', display: 'block', ml: 1 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Chat Input */}
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  sx={{
                    '& .MuiInputBase-root': {
                      bgcolor: '#2c1810',
                      color: '#f5e6d3',
                    },
                    '& .MuiInputBase-input': {
                      color: '#f5e6d3',
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  sx={{
                    bgcolor: '#4169e1',
                    color: '#fff',
                    '&:hover': { bgcolor: '#3158d0' },
                    '&:disabled': { bgcolor: '#555', color: '#888' },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
