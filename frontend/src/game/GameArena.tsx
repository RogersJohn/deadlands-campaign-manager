import { useState, useCallback, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, CircularProgress, Alert, Grid, Card, CardContent, CardMedia, CardActionArea, Radio, RadioGroup, FormControlLabel, IconButton, Tooltip } from '@mui/material';
import { WbSunny as SunIcon, WbTwilight as TwilightIcon, Brightness3 as MoonIcon, Brightness1 as DarkIcon, Psychology as AIIcon } from '@mui/icons-material';
import { GameCanvas } from './components/GameCanvas';
import { WeaponSelection } from './components/WeaponSelection';
import { ActionMenu } from './components/ActionMenu';
import { StatusEffects } from './components/StatusEffects';
import { CalledShotDialog } from './components/CalledShotDialog';
import { SettingsMenu } from './components/SettingsMenu';
import { ActionBar } from './components/ActionBar';
import InitiativeTracker from './components/InitiativeTracker';
import { CombatLog } from './components/CombatLog';
import { DiceRollPopup } from './components/DiceRollPopup';
import { GameCharacter, CombatLogEntry, DiceRollEvent, Equipment, CombatAction, CalledShotTarget, Illumination } from './types/GameTypes';
import { TurnPhase } from './engine/CombatManager';
import { characterService } from './services/characterService';
import { wrapGameEvents, TypedGameEvents } from './events/GameEvents';
import { useAuthStore } from '../store/authStore';

interface CombatState {
  playerHealth: number;
  playerMaxHealth: number;
  turnNumber: number;
  phase: TurnPhase;
  combatLog: CombatLogEntry[];
}

export function GameArena() {
  const { token, user } = useAuthStore();
  const isGameMaster = user?.role === 'GAME_MASTER';

  const [selectedCharacter, setSelectedCharacter] = useState<GameCharacter | undefined>();
  const [gameStarted, setGameStarted] = useState(false);
  const [characters, setCharacters] = useState<GameCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [combatState, setCombatState] = useState<CombatState>({
    playerHealth: 0,
    playerMaxHealth: 0,
    turnNumber: 1,
    phase: 'player',
    combatLog: [],
  });
  const [diceRolls, setDiceRolls] = useState<DiceRollEvent[]>([]);
  const [currentDiceRoll, setCurrentDiceRoll] = useState<DiceRollEvent | null>(null);
  const [playerWounds, setPlayerWounds] = useState(0);
  const [playerShaken, setPlayerShaken] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<Equipment | undefined>();
  const [remainingActions, setRemainingActions] = useState(1);
  const [phaserGameRef, setPhaserGameRef] = useState<any>(null);
  const [gameEvents, setGameEvents] = useState<TypedGameEvents | null>(null);
  const [cameraFollowEnabled, setCameraFollowEnabled] = useState(true);
  const [showWeaponRanges, setShowWeaponRanges] = useState(true);
  const [showMovementRanges, setShowMovementRanges] = useState(true);
  const [movementBudget, setMovementBudget] = useState({ current: 0, max: 0 });
  const [illumination, setIllumination] = useState<Illumination>(Illumination.BRIGHT);

  // PHASE 1: Called shot dialog state
  const [calledShotDialogOpen, setCalledShotDialogOpen] = useState(false);


  const handleCombatStateUpdate = useCallback((state: CombatState) => {
    setCombatState(state);
  }, []);

  const handleDiceRoll = useCallback((roll: DiceRollEvent) => {
    setDiceRolls(prev => [...prev, roll]);
    setCurrentDiceRoll(roll); // Show animated popup
  }, []);

  const handleWoundsUpdate = useCallback((wounds: number, maxWounds: number) => {
    setPlayerWounds(wounds);
  }, []);

  const handleShakenUpdate = useCallback((isShaken: boolean) => {
    setPlayerShaken(isShaken);
  }, []);

  const handleMovementBudgetUpdate = useCallback((current: number, max: number) => {
    setMovementBudget({ current, max });
  }, []);

  const handlePhaserGameReady = useCallback((game: any) => {
    console.log('Phaser game ready');
    setPhaserGameRef(game);
    // Wrap game events with type-safe wrapper
    setGameEvents(wrapGameEvents(game));
  }, []);

  // Emit weapon changes to Phaser when weapon or game ref changes (TYPE-SAFE)
  useEffect(() => {
    if (gameEvents && selectedWeapon) {
      console.log('Emitting weapon to Phaser:', selectedWeapon.name);
      gameEvents.emit('weaponSelected', { weapon: selectedWeapon });
    }
  }, [gameEvents, selectedWeapon]);

  // Emit camera follow changes to Phaser (TYPE-SAFE)
  useEffect(() => {
    if (gameEvents) {
      console.log('Emitting camera follow to Phaser:', cameraFollowEnabled);
      gameEvents.emit('cameraFollowToggle', { enabled: cameraFollowEnabled });
    }
  }, [gameEvents, cameraFollowEnabled]);

  // Emit weapon ranges toggle changes to Phaser (TYPE-SAFE)
  useEffect(() => {
    if (gameEvents) {
      console.log('Emitting weapon ranges toggle to Phaser:', showWeaponRanges);
      gameEvents.emit('weaponRangesToggle', { enabled: showWeaponRanges });
    }
  }, [gameEvents, showWeaponRanges]);

  // Emit movement ranges toggle changes to Phaser (TYPE-SAFE)
  useEffect(() => {
    if (gameEvents) {
      console.log('Emitting movement ranges toggle to Phaser:', showMovementRanges);
      gameEvents.emit('movementRangesToggle', { enabled: showMovementRanges });
    }
  }, [gameEvents, showMovementRanges]);

  // Emit illumination changes to Phaser (TYPE-SAFE)
  useEffect(() => {
    if (gameEvents) {
      console.log('Emitting illumination to Phaser:', illumination);
      gameEvents.emit('illuminationChange', { level: illumination });
    }
  }, [gameEvents, illumination]);

  // WebSocket logic removed - single player game for now
  // Can be re-added later for real-time GM/player synchronization

  // Fetch characters on component mount
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoading(true);
        const fetchedCharacters = await characterService.fetchCharacters();
        setCharacters(fetchedCharacters);
        setError(null);
      } catch (err) {
        setError('Failed to load characters. Please try again.');
        console.error('Error loading characters:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const handleSelectCharacter = (character: GameCharacter) => {
    setSelectedCharacter(character);
    setGameStarted(true);

    // Auto-select first weapon if available
    const weapons = character.equipment?.filter(eq =>
      eq.type === 'WEAPON_MELEE' || eq.type === 'WEAPON_RANGED'
    );
    if (weapons && weapons.length > 0) {
      setSelectedWeapon(weapons[0]);
      // The useEffect will handle emitting to Phaser
    }

    // Reset combat state
    setPlayerWounds(0);
    setPlayerShaken(false);
    setRemainingActions(1);
  };

  const handleSelectWeapon = (weapon: Equipment) => {
    console.log('handleSelectWeapon called with:', weapon.name);
    setSelectedWeapon(weapon);
    // The useEffect will handle emitting to Phaser
  };

  const handleSelectAction = (action: CombatAction, power?: string) => {
    console.log('Action selected:', action.name, power ? `Power: ${power}` : '');

    // PHASE 1: Handle called shot - open dialog for target selection
    if (action.type === 'called_shot') {
      setCalledShotDialogOpen(true);
      return;
    }

    // Emit action event to Phaser game (TYPE-SAFE)
    if (gameEvents && remainingActions > 0) {
      gameEvents.emit('playerActionSelected', { action, power });
      setRemainingActions(prev => prev - 1);
    }
  };

  // PHASE 1: Handle called shot target selection (TYPE-SAFE)
  const handleCalledShotSelect = (target: CalledShotTarget) => {
    setCalledShotDialogOpen(false);

    // Send target to Phaser game via CombatManager
    if (gameEvents) {
      gameEvents.emit('calledShotSelected', { target });
    }

    console.log('Called shot target selected:', target);
  };

  const handleCalledShotCancel = () => {
    setCalledShotDialogOpen(false);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {!gameStarted ? (
        /* Character Selection Screen */
        <Paper sx={{ p: 4, backgroundColor: '#2d1b0e' }}>
          <Typography variant="h5" sx={{ color: '#f5e6d3', mb: 2, textAlign: 'center' }}>
            Select Your Character
          </Typography>
          <Typography sx={{ color: '#d4b896', mb: 4, textAlign: 'center' }}>
            Choose a character to test in the combat arena
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress sx={{ color: '#8b4513' }} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && characters.length === 0 && (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              No characters found. Please create a character first from the main character sheet page.
            </Alert>
          )}

          {!loading && !error && characters.length > 0 && (
            <Grid container spacing={3}>
              {characters.map((character) => (
                <Grid item xs={12} sm={6} md={4} key={character.id}>
                  <Card
                    sx={{
                      backgroundColor: '#1a0f08',
                      border: '2px solid #8b4513',
                      '&:hover': {
                        border: '2px solid #a0522d',
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleSelectCharacter(character)}>
                      {character.characterImageUrl ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={character.characterImageUrl}
                          alt={character.name}
                          sx={{
                            objectFit: 'cover',
                            objectPosition: 'top',
                            backgroundColor: '#1a0f08',
                          }}
                          onError={(e: any) => {
                            // Hide broken image on error
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            backgroundColor: '#1a0f08',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                          }}
                        >
                          🤠
                        </Box>
                      )}
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#f5e6d3',
                            fontFamily: 'Rye, serif',
                            mb: 1,
                          }}
                        >
                          {character.name}
                        </Typography>
                        <Box sx={{ color: '#d4b896', fontSize: '0.875rem' }}>
                          <Typography sx={{ fontSize: '0.75rem' }}>
                            Pace: {character.pace} | Parry: {character.parry} | Toughness: {character.toughness}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                            Str: {character.strengthDie} | Agi: {character.agilityDie} | Vig: {character.vigorDie}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      ) : (
        /* ARENA LAYOUT: 15% Initiative | 65% Map | 15% Combat Log | 5% Spacing */
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
          {/* Main Content Area - Initiative Tracker + Map + Combat Log */}
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', gap: '2.5%' }}>
            {/* Left: Initiative Tracker (15% of screen width) */}
            <Box sx={{ width: '15%', minWidth: 150, p: 2 }}>
              <InitiativeTracker />
            </Box>

            {/* Center: Game Canvas (65% of screen width) */}
            <Box sx={{ width: '65%', position: 'relative', overflow: 'hidden', p: 1 }}>
              <GameCanvas
                character={selectedCharacter}
                selectedWeapon={selectedWeapon}
                onCombatStateUpdate={handleCombatStateUpdate}
                onDiceRoll={handleDiceRoll}
                onWoundsUpdate={handleWoundsUpdate}
                onShakenUpdate={handleShakenUpdate}
                onMovementBudgetUpdate={handleMovementBudgetUpdate}
                onPhaserGameReady={handlePhaserGameReady}
              />
              {/* Dice Roll Popup - Positioned absolutely over the canvas */}
              <DiceRollPopup
                roll={currentDiceRoll}
                onComplete={() => setCurrentDiceRoll(null)}
              />
            </Box>

            {/* Right: Combat Log (15% of screen width) */}
            <Box sx={{ width: '15%', minWidth: 150, p: 2 }}>
              <CombatLog logs={combatState.combatLog} />
            </Box>
          </Box>

          {/* Bottom Action Bar */}
          {selectedCharacter && (
            <ActionBar
              character={selectedCharacter}
              playerHealth={combatState.playerHealth}
              playerMaxHealth={combatState.playerMaxHealth}
              playerWounds={playerWounds}
              movementBudget={movementBudget}
              selectedWeapon={selectedWeapon}
              weapons={selectedCharacter.equipment?.filter(
                (eq) => eq.type === 'WEAPON_MELEE' || eq.type === 'WEAPON_RANGED'
              ) || []}
              onSelectWeapon={handleSelectWeapon}
              onSelectAction={() => {
                // TODO: Open action menu in modal/overlay
                console.log('Actions button clicked');
              }}
              remainingActions={remainingActions}
            />
          )}
        </Box>
      )}

      {/* PHASE 1: Called Shot Dialog */}
      <CalledShotDialog
        open={calledShotDialogOpen}
        onSelect={handleCalledShotSelect}
        onCancel={handleCalledShotCancel}
      />
    </Box>
  );
}
