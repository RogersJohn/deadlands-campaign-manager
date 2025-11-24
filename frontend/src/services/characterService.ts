import api from './api'
import { Skill, Edge, Hindrance, Equipment, ArcanePower } from './referenceService'

export interface Character {
  id?: number
  name: string
  occupation: string
  pace: number
  size: number
  wind: number
  grit: number
  // Savage Worlds Attributes
  agilityDie: string
  smartsDie: string
  spiritDie: string
  strengthDie: string
  vigorDie: string
  // Derived Stats (Savage Worlds)
  parry: number
  toughness: number
  charisma: number
  // XP Tracking
  totalXp?: number
  spentXp?: number
  // Power Points and Fate Chips (Savage Worlds)
  currentPowerPoints?: number
  maxPowerPoints?: number
  fateChips?: number
  // Legacy Deadlands Classic Attributes (deprecated)
  cognitionDie?: string
  deftnessDie?: string
  nimblenessDie?: string
  quicknessDie?: string
  notes?: string
  characterImageUrl?: string
  isNpc: boolean
  // Nested entities
  skills?: Skill[]
  edges?: Edge[]
  hindrances?: Hindrance[]
  equipment?: Equipment[]
  arcanePowers?: ArcanePower[]
}

const characterService = {
  getAll: async (): Promise<Character[]> => {
    const response = await api.get('/characters')
    return response.data
  },

  getById: async (id: number): Promise<Character> => {
    const response = await api.get(`/characters/${id}`)
    return response.data
  },

  create: async (character: Character): Promise<Character> => {
    const response = await api.post('/characters', character)
    return response.data
  },

  update: async (id: number, character: Partial<Character>): Promise<Character> => {
    const response = await api.put(`/characters/${id}`, character)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/characters/${id}`)
  },

  // Power Points management
  spendPowerPoints: async (id: number, amount: number): Promise<{currentPowerPoints: number, maxPowerPoints: number}> => {
    const response = await api.post(`/characters/${id}/power-points/spend`, { amount })
    return response.data
  },

  restorePowerPoints: async (id: number, amount: number): Promise<{currentPowerPoints: number, maxPowerPoints: number}> => {
    const response = await api.post(`/characters/${id}/power-points/restore`, { amount })
    return response.data
  },

  // Fate Chips management
  spendFateChip: async (id: number): Promise<{fateChips: number}> => {
    const response = await api.post(`/characters/${id}/fate-chips/spend`)
    return response.data
  },

  gainFateChip: async (id: number): Promise<{fateChips: number}> => {
    const response = await api.post(`/characters/${id}/fate-chips/gain`)
    return response.data
  },
}

export default characterService
