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
} from '@mui/material'
import { Add as AddIcon, Person as PersonIcon } from '@mui/icons-material'
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Characters
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/character/new')}>
          New Character
        </Button>
      </Box>

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
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/character/${character.id}`)}>
                  View
                </Button>
                <Button size="small" color="secondary">
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
