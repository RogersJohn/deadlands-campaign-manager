import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, PlayArrow as PlayIcon, People as PeopleIcon } from '@mui/icons-material';
import sessionService from '../services/sessionService';
import characterService from '../services/characterService';
import { useAuthStore } from '../store/authStore';
import { GameSession, CreateSessionRequest } from '../types/session';

export default function SessionLobby() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isGM = user?.role === 'GAME_MASTER';

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  // Form state for creating session
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [newSessionMaxPlayers, setNewSessionMaxPlayers] = useState<number | ''>('');

  // Fetch all sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionService.getAllSessions,
  });

  // Fetch user's characters (for joining)
  const { data: characters } = useQuery({
    queryKey: ['characters'],
    queryFn: characterService.getAll,
    enabled: !isGM, // Only fetch if player
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (request: CreateSessionRequest) => sessionService.createSession(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setCreateDialogOpen(false);
      setNewSessionName('');
      setNewSessionDescription('');
      setNewSessionMaxPlayers('');
    },
  });

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: ({ sessionId, characterId }: { sessionId: number; characterId: number }) =>
      sessionService.joinSession(sessionId, { characterId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setJoinDialogOpen(false);
      setSelectedSession(null);
      setSelectedCharacterId(null);
      // Navigate to session room
      navigate(`/session/${variables.sessionId}`);
    },
  });

  const handleCreateSession = () => {
    if (!newSessionName) {
      return;
    }

    createSessionMutation.mutate({
      name: newSessionName,
      description: newSessionDescription || undefined,
      maxPlayers: newSessionMaxPlayers ? Number(newSessionMaxPlayers) : undefined,
    });
  };

  const handleJoinSession = (session: GameSession) => {
    setSelectedSession(session);
    setJoinDialogOpen(true);
  };

  const handleConfirmJoin = () => {
    if (!selectedSession || !selectedCharacterId) {
      return;
    }

    joinSessionMutation.mutate({
      sessionId: selectedSession.id,
      characterId: selectedCharacterId,
    });
  };

  if (sessionsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Game Sessions</Typography>
        {isGM && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            aria-label="Create Session"
          >
            Create Session
          </Button>
        )}
      </Box>

      {sessions && sessions.length === 0 && (
        <Alert severity="info">
          No active sessions. {isGM && 'Create one to get started!'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {sessions?.map((session) => (
          <Grid item xs={12} md={6} lg={4} key={session.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" component="div">
                    {session.name}
                  </Typography>
                  {session.active && <Chip label="Active" color="success" size="small" />}
                </Box>

                {session.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {session.description}
                  </Typography>
                )}

                <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PeopleIcon fontSize="small" />
                    <Typography variant="body2">
                      GM: {session.gameMaster.username}
                    </Typography>
                  </Box>
                  {session.maxPlayers && (
                    <Typography variant="body2" color="text.secondary">
                      Max: {session.maxPlayers}
                    </Typography>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Created: {new Date(session.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>

              <CardActions>
                {isGM && session.gameMaster.id === user?.id ? (
                  <Button
                    size="small"
                    startIcon={<PlayIcon />}
                    onClick={() => navigate(`/session/${session.id}`)}
                  >
                    Manage Session
                  </Button>
                ) : (
                  <Button size="small" onClick={() => handleJoinSession(session)}>
                    Join Session
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Session Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Session Name"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              fullWidth
              required
              inputProps={{ name: 'name' }}
            />
            <TextField
              label="Description"
              value={newSessionDescription}
              onChange={(e) => setNewSessionDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              inputProps={{ name: 'description' }}
            />
            <TextField
              label="Max Players (optional)"
              type="number"
              value={newSessionMaxPlayers}
              onChange={(e) => setNewSessionMaxPlayers(e.target.value ? Number(e.target.value) : '')}
              fullWidth
              inputProps={{ min: 1, max: 20, name: 'maxPlayers' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            onClick={handleCreateSession}
            variant="contained"
            disabled={!newSessionName || createSessionMutation.isPending}
          >
            {createSessionMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Session Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Session: {selectedSession?.name}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Select a character to play with:
            </Typography>
            <TextField
              select
              label="Character"
              value={selectedCharacterId || ''}
              onChange={(e) => setSelectedCharacterId(Number(e.target.value))}
              fullWidth
              required
              SelectProps={{ native: true }}
              inputProps={{ name: 'character' }}
            >
              <option value="" disabled>Select a character</option>
              {characters?.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name} - {char.occupation || 'No occupation'}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmJoin}
            variant="contained"
            disabled={!selectedCharacterId || joinSessionMutation.isPending}
          >
            {joinSessionMutation.isPending ? 'Joining...' : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
