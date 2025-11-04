import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material'
import characterService from '../services/characterService'
import referenceDataService from '../services/referenceDataService'

const CharacterSheet = () => {
  const { id } = useParams<{ id: string }>()

  const { data: character, isLoading } = useQuery({
    queryKey: ['character', id],
    queryFn: () => characterService.getById(Number(id)),
    enabled: !!id && id !== 'new',
  })

  // Fetch reference data for tooltips
  const { data: skillReferences = [] } = useQuery({
    queryKey: ['skillReferences'],
    queryFn: () => referenceDataService.getAllSkills(),
  })

  const { data: edgeReferences = [] } = useQuery({
    queryKey: ['edgeReferences'],
    queryFn: () => referenceDataService.getAllEdges(),
  })

  const { data: hindranceReferences = [] } = useQuery({
    queryKey: ['hindranceReferences'],
    queryFn: () => referenceDataService.getAllHindrances(),
  })

  const { data: equipmentReferences = [] } = useQuery({
    queryKey: ['equipmentReferences'],
    queryFn: () => referenceDataService.getAllEquipment(),
  })

  const { data: powerReferences = [] } = useQuery({
    queryKey: ['powerReferences'],
    queryFn: () => referenceDataService.getAllPowers(),
  })

  // Helper functions to find reference data
  const findSkillReference = (skillName: string) => {
    return skillReferences.find((ref) => ref.name === skillName)
  }

  const findEdgeReference = (edgeName: string) => {
    return edgeReferences.find((ref) => ref.name === edgeName)
  }

  const findHindranceReference = (hindranceName: string) => {
    return hindranceReferences.find((ref) => ref.name === hindranceName)
  }

  const findEquipmentReference = (equipmentName: string) => {
    return equipmentReferences.find((ref) => ref.name === equipmentName)
  }

  const findPowerReference = (powerName: string) => {
    return powerReferences.find((ref) => ref.name === powerName)
  }

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

      {character.skills && character.skills.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Skills
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...character.skills].sort((a, b) => {
              const nameA = a.skillReference?.name || a.name
              const nameB = b.skillReference?.name || b.name
              return nameA.localeCompare(nameB)
            }).map((skill: any) => {
              const skillRef = skill.skillReference || findSkillReference(skill.name)
              const tooltipContent = skillRef
                ? `${skillRef.description}\n\nAttribute: ${skillRef.attribute}\nDefault: ${skillRef.defaultValue}`
                : skill.name

              return (
                <Grid item xs={12} sm={6} md={4} key={skill.id}>
                  <Tooltip
                    title={
                      <Box sx={{ whiteSpace: 'pre-line' }}>
                        <Typography variant="body2">{tooltipContent}</Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box sx={{ mb: 1, cursor: 'help' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {skill.skillReference?.name || skill.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {skill.dieValue}
                        {skill.category && ` - ${skill.category}`}
                      </Typography>
                      {skill.notes && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {skill.notes}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Grid>
              )
            })}
          </Grid>
        </Paper>
      )}

      {character.edges && character.edges.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Edges
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...character.edges].sort((a, b) => {
              const nameA = a.edgeReference?.name || a.name
              const nameB = b.edgeReference?.name || b.name
              return nameA.localeCompare(nameB)
            }).map((edge: any) => {
              const edgeRef = edge.edgeReference || findEdgeReference(edge.name)
              const tooltipContent = edgeRef
                ? `${edgeRef.description}\n\nRequirements: ${edgeRef.requirements}\nRank: ${edgeRef.rankRequired}`
                : edge.description || edge.name

              return (
                <Grid item xs={12} sm={6} key={edge.id}>
                  <Tooltip
                    title={
                      <Box sx={{ whiteSpace: 'pre-line' }}>
                        <Typography variant="body2">{tooltipContent}</Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box sx={{ mb: 1, cursor: 'help' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {edge.edgeReference?.name || edge.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {edge.edgeReference?.type || edge.type}
                      </Typography>
                      {edge.notes && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {edge.notes}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Grid>
              )
            })}
          </Grid>
        </Paper>
      )}

      {character.hindrances && character.hindrances.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Hindrances
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...character.hindrances].sort((a, b) => {
              const nameA = a.hindranceReference?.name || a.name
              const nameB = b.hindranceReference?.name || b.name
              return nameA.localeCompare(nameB)
            }).map((hindrance: any) => {
              const hindranceRef =
                hindrance.hindranceReference || findHindranceReference(hindrance.name)
              const tooltipContent = hindranceRef
                ? `${hindranceRef.description}\n\nGame Effect: ${hindranceRef.gameEffect}`
                : hindrance.description || hindrance.name

              return (
                <Grid item xs={12} sm={6} key={hindrance.id}>
                  <Tooltip
                    title={
                      <Box sx={{ whiteSpace: 'pre-line' }}>
                        <Typography variant="body2">{tooltipContent}</Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box sx={{ mb: 1, cursor: 'help' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {hindrance.hindranceReference?.name || hindrance.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hindrance.hindranceReference?.severity || hindrance.severity}
                      </Typography>
                      {hindrance.notes && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {hindrance.notes}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Grid>
              )
            })}
          </Grid>
        </Paper>
      )}

      {character.equipment && character.equipment.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Equipment
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...character.equipment].sort((a, b) => {
              const nameA = a.equipmentReference?.name || a.name
              const nameB = b.equipmentReference?.name || b.name
              return nameA.localeCompare(nameB)
            }).map((item: any) => {
              const equipRef =
                item.equipmentReference || findEquipmentReference(item.name)
              const tooltipContent = equipRef
                ? `${equipRef.description}\n${equipRef.damage ? `\nDamage: ${equipRef.damage}` : ''}${equipRef.range ? `\nRange: ${equipRef.range}` : ''}${equipRef.notes ? `\n\n${equipRef.notes}` : ''}`
                : item.description || item.name

              return (
                <Grid item xs={12} sm={6} key={item.id}>
                  <Tooltip
                    title={
                      <Box sx={{ whiteSpace: 'pre-line' }}>
                        <Typography variant="body2">{tooltipContent}</Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box sx={{ mb: 1, cursor: 'help' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.equipmentReference?.name || item.name}{' '}
                        {item.quantity > 1 && `(x${item.quantity})`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.equipmentReference?.type || item.type}
                        {item.isEquipped && ' - Equipped'}
                      </Typography>
                      {item.damage && (
                        <Typography variant="body2">
                          Damage: {item.damage}
                        </Typography>
                      )}
                      {item.range && (
                        <Typography variant="body2">Range: {item.range}</Typography>
                      )}
                      {item.notes && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {item.notes}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Grid>
              )
            })}
          </Grid>
        </Paper>
      )}

      {character.arcanePowers && character.arcanePowers.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Arcane Powers
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...character.arcanePowers].sort((a, b) => {
              const nameA = a.powerReference?.name || a.name
              const nameB = b.powerReference?.name || b.name
              return nameA.localeCompare(nameB)
            }).map((power: any) => {
              const powerRef =
                power.powerReference || findPowerReference(power.name)
              const tooltipContent = powerRef
                ? `${powerRef.description}\n${powerRef.powerPoints ? `\nPower Points: ${powerRef.powerPoints}` : ''}${powerRef.range ? `\nRange: ${powerRef.range}` : ''}${powerRef.duration ? `\nDuration: ${powerRef.duration}` : ''}${powerRef.effect ? `\n\nEffect: ${powerRef.effect}` : ''}`
                : power.notes || power.name

              return (
                <Grid item xs={12} sm={6} key={power.id}>
                  <Tooltip
                    title={
                      <Box sx={{ whiteSpace: 'pre-line' }}>
                        <Typography variant="body2">{tooltipContent}</Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box sx={{ mb: 1, cursor: 'help' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {power.powerReference?.name || power.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {power.type}
                      </Typography>
                      {power.trait && (
                        <Typography variant="body2">Trait: {power.trait}</Typography>
                      )}
                      {power.targetNumber && (
                        <Typography variant="body2">
                          TN: {power.targetNumber}
                        </Typography>
                      )}
                      {power.range && (
                        <Typography variant="body2">Range: {power.range}</Typography>
                      )}
                      {power.duration && (
                        <Typography variant="body2">
                          Duration: {power.duration}
                        </Typography>
                      )}
                      {power.notes && (
                        <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                          {power.notes}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Grid>
              )
            })}
          </Grid>
        </Paper>
      )}

      {character.wounds && character.wounds.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Wounds
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {character.wounds.map((wound: any) => (
              <Grid item xs={12} sm={6} key={wound.id}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {wound.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {wound.severity}
                    {wound.isHealed && ' - Healed'}
                  </Typography>
                  {wound.description && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {wound.description}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  )
}

export default CharacterSheet
