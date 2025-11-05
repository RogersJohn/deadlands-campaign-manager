import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Grid,
  Alert,
} from '@mui/material'
import characterService, { Character } from '../services/characterService'

const ATTRIBUTE_OPTIONS = ['d4', 'd6', 'd8', 'd10', 'd12']
const steps = ['Basic Info', 'Attributes', 'Derived Stats', 'Review']

const CharacterCreate = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    occupation: '',
    isNpc: false,
    agilityDie: 'd6',
    smartsDie: 'd6',
    spiritDie: 'd6',
    strengthDie: 'd6',
    vigorDie: 'd6',
    pace: 6,
    size: 0,
    wind: 0,
    grit: 1,
  })

  const createCharacterMutation = useMutation({
    mutationFn: characterService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] })
      navigate(`/character/${data.id}`)
    },
    onError: (error) => {
      setErrors([`Failed to create character: ${error}`])
    },
  })

  const handleNext = () => {
    const validationErrors = validateCurrentStep()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setErrors([])
    setActiveStep((prevStep) => prevStep - 1)
  }

  const validateCurrentStep = (): string[] => {
    const errors: string[] = []

    if (activeStep === 0) {
      if (!formData.name?.trim()) {
        errors.push('Character name is required')
      }
      if (!formData.occupation?.trim()) {
        errors.push('Occupation is required')
      }
    }

    if (activeStep === 1) {
      // Savage Worlds: Characters start with d4 in all attributes
      // They have 5 points to distribute, where:
      // d6 costs 1 point, d8 costs 2 points, d10 costs 3 points, d12 costs 4 points
      const attributePoints: Record<string, number> = {
        'd4': 0,
        'd6': 1,
        'd8': 2,
        'd10': 3,
        'd12': 4,
      }

      const totalPoints =
        attributePoints[formData.agilityDie || 'd4'] +
        attributePoints[formData.smartsDie || 'd4'] +
        attributePoints[formData.spiritDie || 'd4'] +
        attributePoints[formData.strengthDie || 'd4'] +
        attributePoints[formData.vigorDie || 'd4']

      const maxPoints = 5
      if (totalPoints > maxPoints) {
        errors.push(`Too many attribute points used (${totalPoints}/${maxPoints})`)
      }
      if (totalPoints < maxPoints) {
        errors.push(`Not all attribute points used (${totalPoints}/${maxPoints})`)
      }
    }

    return errors
  }

  const handleSubmit = () => {
    createCharacterMutation.mutate(formData as Character)
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Character Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  required
                  helperText="e.g., Gunslinger, Mad Scientist, Huckster, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isNpc}
                      onChange={(e) => setFormData({ ...formData, isNpc: e.target.checked })}
                    />
                  }
                  label="Non-Player Character (NPC)"
                />
              </Grid>
            </Grid>
          </Box>
        )

      case 1:
        const attributePoints: Record<string, number> = {
          'd4': 0,
          'd6': 1,
          'd8': 2,
          'd10': 3,
          'd12': 4,
        }

        const usedPoints =
          attributePoints[formData.agilityDie || 'd4'] +
          attributePoints[formData.smartsDie || 'd4'] +
          attributePoints[formData.spiritDie || 'd4'] +
          attributePoints[formData.strengthDie || 'd4'] +
          attributePoints[formData.vigorDie || 'd4']

        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Attributes (Savage Worlds)
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Characters start with d4 in all attributes. You have <strong>5 points</strong> to distribute.
              <br />
              d6 costs 1 point, d8 costs 2 points, d10 costs 3 points, d12 costs 4 points.
              <br />
              <strong>Points used: {usedPoints}/5</strong>
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Agility</InputLabel>
                  <Select
                    value={formData.agilityDie}
                    onChange={(e) => setFormData({ ...formData, agilityDie: e.target.value })}
                    label="Agility"
                  >
                    {ATTRIBUTE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt} ({attributePoints[opt]} points)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Smarts</InputLabel>
                  <Select
                    value={formData.smartsDie}
                    onChange={(e) => setFormData({ ...formData, smartsDie: e.target.value })}
                    label="Smarts"
                  >
                    {ATTRIBUTE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt} ({attributePoints[opt]} points)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Spirit</InputLabel>
                  <Select
                    value={formData.spiritDie}
                    onChange={(e) => setFormData({ ...formData, spiritDie: e.target.value })}
                    label="Spirit"
                  >
                    {ATTRIBUTE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt} ({attributePoints[opt]} points)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Strength</InputLabel>
                  <Select
                    value={formData.strengthDie}
                    onChange={(e) => setFormData({ ...formData, strengthDie: e.target.value })}
                    label="Strength"
                  >
                    {ATTRIBUTE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt} ({attributePoints[opt]} points)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vigor</InputLabel>
                  <Select
                    value={formData.vigorDie}
                    onChange={(e) => setFormData({ ...formData, vigorDie: e.target.value })}
                    label="Vigor"
                  >
                    {ATTRIBUTE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt} ({attributePoints[opt]} points)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Derived Stats
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Pace"
                  value={formData.pace}
                  onChange={(e) => setFormData({ ...formData, pace: parseInt(e.target.value) })}
                  helperText="Movement rate (default: 6)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                  helperText="Character size modifier (default: 0)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Grit"
                  value={formData.grit}
                  onChange={(e) => setFormData({ ...formData, grit: parseInt(e.target.value) })}
                  helperText="Grit level (default: 1)"
                />
              </Grid>
            </Grid>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Character
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{formData.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Occupation
                </Typography>
                <Typography variant="body1">{formData.occupation}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Character Type
                </Typography>
                <Typography variant="body1">{formData.isNpc ? 'NPC' : 'Player Character'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Attributes
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    Agility: {formData.agilityDie}
                  </Grid>
                  <Grid item xs={4}>
                    Smarts: {formData.smartsDie}
                  </Grid>
                  <Grid item xs={4}>
                    Spirit: {formData.spiritDie}
                  </Grid>
                  <Grid item xs={4}>
                    Strength: {formData.strengthDie}
                  </Grid>
                  <Grid item xs={4}>
                    Vigor: {formData.vigorDie}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Derived Stats
                </Typography>
                <Typography variant="body2">
                  Pace: {formData.pace} | Size: {formData.size} | Grit: {formData.grit}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Character
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={() => navigate('/dashboard')} disabled={createCharacterMutation.isPending}>
            Cancel
          </Button>
          <Box>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createCharacterMutation.isPending}
              >
                {createCharacterMutation.isPending ? 'Creating...' : 'Create Character'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default CharacterCreate
