import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material'
import characterService from '../services/characterService'

const CharacterSheet = () => {
  const { id } = useParams<{ id: string }>()

  const { data: character, isLoading } = useQuery({
    queryKey: ['character', id],
    queryFn: () => characterService.getById(Number(id)),
    enabled: !!id && id !== 'new',
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!character) {
    return <Typography>Character not found</Typography>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {character.name}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {character.occupation}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Attributes
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Cognition
            </Typography>
            <Typography variant="h6">{character.cognitionDie}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Deftness
            </Typography>
            <Typography variant="h6">{character.deftnessDie}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Nimbleness
            </Typography>
            <Typography variant="h6">{character.nimblenessDie}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Quickness
            </Typography>
            <Typography variant="h6">{character.quicknessDie}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Smarts
            </Typography>
            <Typography variant="h6">{character.smartsDie}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Spirit
            </Typography>
            <Typography variant="h6">{character.spiritDie}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Strength
            </Typography>
            <Typography variant="h6">{character.strengthDie}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Vigor
            </Typography>
            <Typography variant="h6">{character.vigorDie}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Derived Stats
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Pace
            </Typography>
            <Typography variant="h6">{character.pace}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Size
            </Typography>
            <Typography variant="h6">{character.size}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Wind
            </Typography>
            <Typography variant="h6">{character.wind}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Grit
            </Typography>
            <Typography variant="h6">{character.grit}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {character.notes && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>{character.notes}</Typography>
        </Paper>
      )}
    </Box>
  )
}

export default CharacterSheet
