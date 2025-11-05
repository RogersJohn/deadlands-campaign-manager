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
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material'
import {
  Person as PersonIcon,
  Build as BuildIcon,
  Shield as ShieldIcon,
  Backpack as BackpackIcon,
  AutoAwesome as MagicIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import characterService from '../services/characterService'
import referenceDataService from '../services/referenceDataService'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`character-tabpanel-${index}`}
      aria-labelledby={`character-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const CharacterSheet = () => {
  const { id } = useParams<{ id: string }>()
  const [currentTab, setCurrentTab] = useState(0)

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
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
      {/* Header with character name */}
      <Typography variant="h3" gutterBottom fontWeight="bold">
        {character.name}
      </Typography>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="character sheet tabs">
          <Tab icon={<PersonIcon />} label="Overview" iconPosition="start" />
          <Tab icon={<BuildIcon />} label="Skills" iconPosition="start" />
          <Tab icon={<ShieldIcon />} label="Edges & Hindrances" iconPosition="start" />
          <Tab icon={<BackpackIcon />} label="Equipment" iconPosition="start" />
          <Tab icon={<MagicIcon />} label="Arcane Powers" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 1: Overview */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          {/* Left Column: Portrait */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Character Portrait
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '3/4',
                    backgroundColor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    mb: 2,
                    overflow: 'hidden',
                  }}
                >
                  {character.characterImageUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}${character.characterImageUrl}`}
                      alt={`${character.name} portrait`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <PersonIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                  )}
                </Box>
                <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
                  {character.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" textAlign="center" gutterBottom>
                  {character.occupation}
                </Typography>
                {character.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">{character.notes}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Stats */}
          <Grid item xs={12} md={8}>
            {/* Attributes */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Attributes (Savage Worlds)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Agility
                    </Typography>
                    <Typography variant="h6">{character.agilityDie || 'd6'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Smarts
                    </Typography>
                    <Typography variant="h6">{character.smartsDie}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Spirit
                    </Typography>
                    <Typography variant="h6">{character.spiritDie}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Strength
                    </Typography>
                    <Typography variant="h6">{character.strengthDie}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vigor
                    </Typography>
                    <Typography variant="h6">{character.vigorDie}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Derived Stats */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Derived Stats
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pace
                    </Typography>
                    <Typography variant="h6">{character.pace}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Parry
                    </Typography>
                    <Typography variant="h6">{character.parry || 2}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Toughness
                    </Typography>
                    <Typography variant="h6">{character.toughness || 2}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Charisma
                    </Typography>
                    <Typography variant="h6">
                      {(character.charisma || 0) >= 0
                        ? `+${character.charisma || 0}`
                        : character.charisma}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Grit
                    </Typography>
                    <Typography variant="h6">{character.grit}</Typography>
                  </Grid>
                  {character.size !== undefined && character.size !== 0 && (
                    <Grid item xs={6} sm={4} md={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Size
                      </Typography>
                      <Typography variant="h6">
                        {character.size > 0 ? `+${character.size}` : character.size}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Wounds (if any) */}
            {character.wounds && character.wounds.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="error">
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
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Skills */}
      <TabPanel value={currentTab} index={1}>
        {character.skills && character.skills.length > 0 ? (
          <Grid container spacing={2}>
            {[...character.skills]
              .sort((a, b) => {
                const nameA = a.skillReference?.name || a.name
                const nameB = b.skillReference?.name || b.name
                return nameA.localeCompare(nameB)
              })
              .map((skill: any) => {
                const skillRef = skill.skillReference || findSkillReference(skill.name)
                const tooltipContent = skillRef
                  ? `${skillRef.description}\n\nAttribute: ${skillRef.attribute}`
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
                      <Card sx={{ height: '100%', cursor: 'help' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {skill.skillReference?.name || skill.name}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {skill.dieValue}
                          </Typography>
                          {skill.notes && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {skill.notes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </Grid>
                )
              })}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No skills recorded
          </Typography>
        )}
      </TabPanel>

      {/* Tab 3: Edges & Hindrances */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          {/* Edges */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Edges
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {character.edges && character.edges.length > 0 ? (
              <Grid container spacing={2}>
                {[...character.edges]
                  .sort((a, b) => {
                    const nameA = a.edgeReference?.name || a.name
                    const nameB = b.edgeReference?.name || b.name
                    return nameA.localeCompare(nameB)
                  })
                  .map((edge: any) => {
                    const edgeRef = edge.edgeReference || findEdgeReference(edge.name)
                    const tooltipContent = edgeRef
                      ? `${edgeRef.description}\n\nRequirements: ${edgeRef.requirements}\nRank: ${edgeRef.rankRequired}`
                      : edge.description || edge.name

                    return (
                      <Grid item xs={12} key={edge.id}>
                        <Tooltip
                          title={
                            <Box sx={{ whiteSpace: 'pre-line' }}>
                              <Typography variant="body2">{tooltipContent}</Typography>
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <Card sx={{ cursor: 'help' }}>
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {edge.edgeReference?.name || edge.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {edge.edgeReference?.type || edge.type}
                              </Typography>
                              {edge.notes && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {edge.notes}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Tooltip>
                      </Grid>
                    )
                  })}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No edges recorded
              </Typography>
            )}
          </Grid>

          {/* Hindrances */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Hindrances
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {character.hindrances && character.hindrances.length > 0 ? (
              <Grid container spacing={2}>
                {[...character.hindrances]
                  .sort((a, b) => {
                    const nameA = a.hindranceReference?.name || a.name
                    const nameB = b.hindranceReference?.name || b.name
                    return nameA.localeCompare(nameB)
                  })
                  .map((hindrance: any) => {
                    const hindranceRef =
                      hindrance.hindranceReference || findHindranceReference(hindrance.name)
                    const tooltipContent = hindranceRef
                      ? `${hindranceRef.description}\n\nGame Effect: ${hindranceRef.gameEffect}`
                      : hindrance.description || hindrance.name

                    return (
                      <Grid item xs={12} key={hindrance.id}>
                        <Tooltip
                          title={
                            <Box sx={{ whiteSpace: 'pre-line' }}>
                              <Typography variant="body2">{tooltipContent}</Typography>
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <Card sx={{ cursor: 'help' }}>
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {hindrance.hindranceReference?.name || hindrance.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {hindrance.hindranceReference?.severity || hindrance.severity}
                              </Typography>
                              {hindrance.notes && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {hindrance.notes}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Tooltip>
                      </Grid>
                    )
                  })}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No hindrances recorded
              </Typography>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: Equipment */}
      <TabPanel value={currentTab} index={3}>
        {character.equipment && character.equipment.length > 0 ? (
          <Grid container spacing={2}>
            {[...character.equipment]
              .sort((a, b) => {
                const nameA = a.equipmentReference?.name || a.name
                const nameB = b.equipmentReference?.name || b.name
                return nameA.localeCompare(nameB)
              })
              .map((item: any) => {
                const equipRef = item.equipmentReference || findEquipmentReference(item.name)
                const tooltipContent = equipRef
                  ? `${equipRef.description}\n${equipRef.damage ? `\nDamage: ${equipRef.damage}` : ''}${equipRef.range ? `\nRange: ${equipRef.range}` : ''}${equipRef.notes ? `\n\n${equipRef.notes}` : ''}`
                  : item.description || item.name

                return (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Tooltip
                      title={
                        <Box sx={{ whiteSpace: 'pre-line' }}>
                          <Typography variant="body2">{tooltipContent}</Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Card sx={{ height: '100%', cursor: 'help' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.equipmentReference?.name || item.name}
                            {item.quantity > 1 && ` (x${item.quantity})`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.equipmentReference?.type || item.type}
                            {item.isEquipped && ' - Equipped'}
                          </Typography>
                          {item.damage && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Damage:</strong> {item.damage}
                            </Typography>
                          )}
                          {item.range && (
                            <Typography variant="body2">
                              <strong>Range:</strong> {item.range}
                            </Typography>
                          )}
                          {item.notes && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {item.notes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </Grid>
                )
              })}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No equipment recorded
          </Typography>
        )}
      </TabPanel>

      {/* Tab 5: Arcane Powers */}
      <TabPanel value={currentTab} index={4}>
        {character.arcanePowers && character.arcanePowers.length > 0 ? (
          <Grid container spacing={2}>
            {[...character.arcanePowers]
              .sort((a, b) => {
                const nameA = a.powerReference?.name || a.name
                const nameB = b.powerReference?.name || b.name
                return nameA.localeCompare(nameB)
              })
              .map((power: any) => {
                const powerRef = power.powerReference || findPowerReference(power.name)
                const tooltipContent = powerRef
                  ? `${powerRef.description}\n${powerRef.powerPoints ? `\nPower Points: ${powerRef.powerPoints}` : ''}${powerRef.range ? `\nRange: ${powerRef.range}` : ''}${powerRef.duration ? `\nDuration: ${powerRef.duration}` : ''}${powerRef.effect ? `\n\nEffect: ${powerRef.effect}` : ''}`
                  : power.notes || power.name

                return (
                  <Grid item xs={12} sm={6} md={4} key={power.id}>
                    <Tooltip
                      title={
                        <Box sx={{ whiteSpace: 'pre-line' }}>
                          <Typography variant="body2">{tooltipContent}</Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Card sx={{ height: '100%', cursor: 'help' }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {power.powerReference?.name || power.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {power.type}
                          </Typography>
                          {power.trait && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Trait:</strong> {power.trait}
                            </Typography>
                          )}
                          {power.targetNumber && (
                            <Typography variant="body2">
                              <strong>TN:</strong> {power.targetNumber}
                            </Typography>
                          )}
                          {power.range && (
                            <Typography variant="body2">
                              <strong>Range:</strong> {power.range}
                            </Typography>
                          )}
                          {power.duration && (
                            <Typography variant="body2">
                              <strong>Duration:</strong> {power.duration}
                            </Typography>
                          )}
                          {power.notes && (
                            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                              {power.notes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </Grid>
                )
              })}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No arcane powers recorded
          </Typography>
        )}
      </TabPanel>
    </Box>
  )
}

export default CharacterSheet
