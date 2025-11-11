import { useState, useCallback, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, CircularProgress, Alert, Grid, Card, CardContent, CardMedia, CardActionArea, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { GameCanvas } from './components/GameCanvas';
import { WeaponSelection } from './components/WeaponSelection';
import { ActionMenu } from './components/ActionMenu';
import { StatusEffects } from './components/StatusEffects';
import { CalledShotDialog } from './components/CalledShotDialog';
import { GameCharacter, CombatLogEntry, DiceRollEvent, Equipment, CombatAction, CalledShotTarget } from './types/GameTypes';
import { TurnPhase } from './engine/CombatManager';
import { characterService } from './services/characterService';
import { wrapGameEvents, TypedGameEvents } from './events/GameEvents';

interface CombatState {
  playerHealth: number;
  playerMaxHealth: number;
  turnNumber: number;
  phase: TurnPhase;
  combatLog: CombatLogEntry[];
}

export function GameArena() {
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

  // PHASE 1: Called shot dialog state
  const [calledShotDialogOpen, setCalledShotDialogOpen] = useState(false);


  const handleCombatStateUpdate = useCallback((state: CombatState) => {
    setCombatState(state);
  }, []);

  const handleDiceRoll = useCallback((roll: DiceRollEvent) => {
    setDiceRolls(prev => [...prev, roll]);
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
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, maxWidth: '100%' }}>
      {/* Header */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          backgroundColor: '#3d2817',
          borderBottom: '4px solid #8b4513',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Rye, serif',
            color: '#f5e6d3',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          Combat Test Arena
        </Typography>
      </Paper>

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
        /* Game Canvas */
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {/* Left Column - Weapons & Dice Log */}
          <Box sx={{ width: 220, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            {/* Weapon Selection */}
            <Paper sx={{ p: 2, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#f5e6d3',
                  mb: 1,
                  fontFamily: 'Rye, serif',
                }}
              >
                ⚔️ Weapons
              </Typography>
              <WeaponSelection
                weapons={selectedCharacter?.equipment || []}
                selectedWeapon={selectedWeapon}
                onSelectWeapon={handleSelectWeapon}
              />
            </Paper>

            {/* Dice Log */}
            <Paper sx={{ p: 2, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#f5e6d3',
                  mb: 1,
                  fontFamily: 'Rye, serif',
                }}
              >
                🎲 Dice Rolls
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {diceRolls.slice(-5).map((rollEvent) => (
                    <Box
                      key={rollEvent.id}
                      sx={{
                        backgroundColor: '#1a0f08',
                        border: '1px solid #4a3425',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: '11px', color: '#d4b896', mb: 0.5 }}>
                        <strong>{rollEvent.roller}</strong> - {rollEvent.purpose}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '10px', color: '#8b7355', mr: 0.5 }}>
                          {rollEvent.dieType}:
                        </Typography>
                        {rollEvent.rolls.map((roll, index) => (
                          <Box
                            key={`${rollEvent.id}-${index}`}
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              backgroundColor: rollEvent.exploded && index > 0 ? '#ffaa00' : '#4ecdc4',
                              border: '2px solid #000',
                              borderRadius: 1,
                              position: 'relative',
                            }}
                          >
                            <Typography sx={{ fontSize: '16px', color: '#000', fontWeight: 'bold' }}>
                              {roll}
                            </Typography>
                            {rollEvent.exploded && index > 0 && (
                              <Box sx={{ position: 'absolute', top: -5, right: -5, fontSize: '12px' }}>
                                💥
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                      <Typography sx={{ fontSize: '12px', color: '#44ff44', mt: 0.5, fontWeight: 'bold' }}>
                        Total: {rollEvent.total}
                      </Typography>
                    </Box>
                  ))}
                  {diceRolls.length === 0 && (
                    <Typography sx={{ fontSize: '11px', color: '#8b7355', textAlign: 'center', py: 2 }}>
                      No rolls yet...
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>

            {/* Controls */}
            <Paper sx={{ p: 2, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <Typography variant="h6" sx={{ color: '#f5e6d3', mb: 1, fontSize: '14px', fontFamily: 'Rye, serif' }}>
                Controls
              </Typography>
              <Box sx={{ color: '#d4b896', fontSize: '11px' }}>
                <Typography sx={{ fontSize: '11px' }}>• Arrow Keys / Click: Move</Typography>
                <Typography sx={{ fontSize: '11px' }}>• A / Click Enemy: Attack</Typography>
                <Typography sx={{ fontSize: '11px' }}>• Spacebar: End turn</Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setGameStarted(false)}
                sx={{
                  mt: 1,
                  borderColor: '#8b4513',
                  color: '#f5e6d3',
                  fontSize: '10px',
                  '&:hover': {
                    borderColor: '#a0522d',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                  },
                }}
              >
                Back to Menu
              </Button>
            </Paper>
          </Box>

          {/* Center Column - Game Canvas */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Camera Follow Toggle */}
            <Paper sx={{ p: 1, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <RadioGroup
                row
                value={cameraFollowEnabled ? 'follow' : 'manual'}
                onChange={(e) => setCameraFollowEnabled(e.target.value === 'follow')}
              >
                <FormControlLabel
                  value="follow"
                  control={<Radio size="small" sx={{ color: '#8b4513', '&.Mui-checked': { color: '#4169e1' } }} />}
                  label={<Typography sx={{ fontSize: '12px', color: '#f5e6d3' }}>Follow Player</Typography>}
                />
                <FormControlLabel
                  value="manual"
                  control={<Radio size="small" sx={{ color: '#8b4513', '&.Mui-checked': { color: '#4169e1' } }} />}
                  label={<Typography sx={{ fontSize: '12px', color: '#f5e6d3' }}>Manual Camera</Typography>}
                />
              </RadioGroup>
            </Paper>

            {/* Range Display Toggles */}
            <Paper sx={{ p: 1, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {/* Weapon Ranges Toggle */}
                <Box>
                  <Typography sx={{ fontSize: '10px', color: '#d4b896', mb: 0.5 }}>Weapon Ranges:</Typography>
                  <RadioGroup
                    row
                    value={showWeaponRanges ? 'show' : 'hide'}
                    onChange={(e) => setShowWeaponRanges(e.target.value === 'show')}
                  >
                    <FormControlLabel
                      value="show"
                      control={<Radio size="small" sx={{ color: '#8b4513', '&.Mui-checked': { color: '#44ff44' } }} />}
                      label={<Typography sx={{ fontSize: '11px', color: '#f5e6d3' }}>Show</Typography>}
                    />
                    <FormControlLabel
                      value="hide"
                      control={<Radio size="small" sx={{ color: '#8b4513', '&.Mui-checked': { color: '#ff4444' } }} />}
                      label={<Typography sx={{ fontSize: '11px', color: '#f5e6d3' }}>Hide</Typography>}
                    />
                  </RadioGroup>
                </Box>

                {/* Movement Ranges Toggle */}
                <Box>
                  <Typography sx={{ fontSize: '10px', color: '#d4b896', mb: 0.5 }}>Movement Ranges:</Typography>
                  <RadioGroup
                    row
                    value={showMovementRanges ? 'show' : 'hide'}
                    onChange={(e) => setShowMovementRanges(e.target.value === 'show')}
                  >
                    <FormControlLabel
                      value="show"
                      control={<Radio size="small" sx={{ color: '#8b4513', '&.Mui-checked': { color: '#4169e1' } }} />}
                      label={<Typography sx={{ fontSize: '11px', color: '#f5e6d3' }}>Show</Typography>}
                    />
                    <FormControlLabel
                      value="hide"
                      control={<Radio size="small" sx={{ color: '#8b4513', '&.Mui-checked': { color: '#ff4444' } }} />}
                      label={<Typography sx={{ fontSize: '11px', color: '#f5e6d3' }}>Hide</Typography>}
                    />
                  </RadioGroup>
                </Box>
              </Box>
            </Paper>

            {/* Scrollable Map Container */}
            <Box
              sx={{
                maxWidth: '90vw',
                maxHeight: '72vh',
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '12px',
                  height: '12px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#1a0f08',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#8b4513',
                  borderRadius: '6px',
                },
              }}
            >
              <Paper sx={{ p: 2, backgroundColor: '#2d1b0e', border: '4px solid #8b4513' }}>
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
              </Paper>
            </Box>
          </Box>

          {/* Right Column - Combat HUD */}
          <Box sx={{ width: 220, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            {/* Turn Indicator */}
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#2d1b0e',
                border: `3px solid ${
                  combatState.phase === 'player'
                    ? '#4169e1'
                    : combatState.phase === 'enemy'
                    ? '#ff4444'
                    : combatState.phase === 'victory'
                    ? '#44ff44'
                    : '#888888'
                }`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color:
                    combatState.phase === 'player'
                      ? '#4169e1'
                      : combatState.phase === 'enemy'
                      ? '#ff4444'
                      : combatState.phase === 'victory'
                      ? '#44ff44'
                      : '#888888',
                  textAlign: 'center',
                  fontFamily: 'Rye, serif',
                }}
              >
                {combatState.phase === 'player'
                  ? 'YOUR TURN'
                  : combatState.phase === 'enemy'
                  ? 'ENEMY TURN'
                  : combatState.phase === 'victory'
                  ? 'VICTORY!'
                  : 'DEFEAT'}
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#d4b896',
                  textAlign: 'center',
                  mt: 0.5,
                }}
              >
                Turn {combatState.turnNumber}
              </Typography>
            </Paper>

            {/* Status Effects (Wounds & Shaken) */}
            <Paper sx={{ p: 2, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <StatusEffects
                wounds={playerWounds}
                maxWounds={3}
                isShaken={playerShaken}
                woundPenalty={-playerWounds}
              />
            </Paper>

            {/* Movement Budget */}
            <Paper sx={{ p: 1.5, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#f5e6d3',
                  mb: 0.5,
                  fontFamily: 'Rye, serif',
                }}
              >
                Movement
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#d4b896', mb: 0.5 }}>
                {movementBudget.current} / {movementBudget.max} squares
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 16,
                  backgroundColor: '#1a0f08',
                  border: '1px solid #4a3425',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: movementBudget.max > 0 ? `${(movementBudget.current / movementBudget.max) * 100}%` : '0%',
                    height: '100%',
                    backgroundColor: movementBudget.current > 0 ? '#4169e1' : '#888888',
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Paper>

            {/* Action Menu */}
            <Paper sx={{ p: 2, backgroundColor: '#2d1b0e', border: '2px solid #8b4513' }}>
              <ActionMenu
                onSelectAction={handleSelectAction}
                disabled={combatState.phase !== 'player'}
                remainingActions={remainingActions}
                character={selectedCharacter}
              />
            </Paper>

            {/* Health Bar */}
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: '#2d1b0e',
                border: '2px solid #8b4513',
              }}
            >
              <Typography sx={{ fontSize: '12px', color: '#f5e6d3', mb: 0.5 }}>
                Your Health: {combatState.playerHealth} / {combatState.playerMaxHealth}
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 20,
                  backgroundColor: '#1a0f08',
                  border: '1px solid #4a3425',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${(combatState.playerHealth / combatState.playerMaxHealth) * 100}%`,
                    height: '100%',
                    backgroundColor:
                      (combatState.playerHealth / combatState.playerMaxHealth) * 100 > 66
                        ? '#44ff44'
                        : (combatState.playerHealth / combatState.playerMaxHealth) * 100 > 33
                        ? '#ffaa44'
                        : '#ff4444',
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                  }}
                />
              </Box>
            </Paper>

            {/* Combat Log */}
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#2d1b0e',
                border: '2px solid #8b4513',
                flexGrow: 1,
                maxHeight: 400,
                overflow: 'auto',
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
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#f5e6d3',
                  mb: 1,
                  fontFamily: 'Rye, serif',
                }}
              >
                Combat Log
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {combatState.combatLog.slice(-8).map((log) => (
                  <Typography
                    key={log.id}
                    sx={{
                      fontSize: '11px',
                      color:
                        log.type === 'info'
                          ? '#f5e6d3'
                          : log.type === 'success'
                          ? '#44ff44'
                          : log.type === 'damage'
                          ? '#ff8844'
                          : '#888888',
                      fontFamily: 'monospace',
                      lineHeight: 1.3,
                    }}
                  >
                    {log.message}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {/* PHASE 1: Called Shot Dialog */}
      <CalledShotDialog
        open={calledShotDialogOpen}
        onSelect={handleCalledShotSelect}
        onCancel={handleCalledShotCancel}
      />
    </Container>
  );
}
