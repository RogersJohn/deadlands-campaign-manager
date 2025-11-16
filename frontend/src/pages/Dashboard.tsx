import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material'
import { Add as AddIcon, Person as PersonIcon, SportsEsports as GameIcon } from '@mui/icons-material'
import characterService from '../services/characterService'
import { useAuthStore } from '../store/authStore'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const { data: characters, isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: characterService.getAll,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.dark' }}>
        <Typography variant="h5" gutterBottom color="primary.contrastText">
          Welcome back, {user?.username}!
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            color="success"
            startIcon={<GameIcon />}
            onClick={() => navigate('/arena')}
          >
            Play Game
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/character/new')}
            sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
          >
            New Character
          </Button>
        </Box>
      </Paper>

      {/* Characters Section */}
      <Typography variant="h5" gutterBottom>
        Your Characters
      </Typography>

      <Grid container spacing={3}>
        {characters?.map((character) => (
          <Grid item xs={12} sm={6} md={4} key={character.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{character.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {character.occupation || 'Wanderer'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Grit: {character.grit}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  XP: {(character.totalXp || 0) - (character.spentXp || 0)} / {character.totalXp || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/character/${character.id}`)}>
                  View
                </Button>
                <Button size="small" color="secondary" onClick={() => navigate(`/character/${character.id}/edit`)}>
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!characters?.length && (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No characters yet. Create your first character!
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default Dashboard
