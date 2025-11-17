import { Box, Typography, Avatar, LinearProgress, Button, Tooltip, MenuItem, Select, Popover, IconButton } from '@mui/material';
import { Favorite as HeartIcon, DirectionsRun as RunIcon, Settings as SettingsIcon, Psychology as AIIcon } from '@mui/icons-material';
import { GameCharacter, Equipment, CombatAction, Illumination } from '../types/GameTypes';
import { ActionMenu } from './ActionMenu';
import { SettingsMenu } from './SettingsMenu';
import { useState } from 'react';

interface ActionBarProps {
  character: GameCharacter;
  playerHealth: number;
  playerMaxHealth: number;
  playerWounds: number;
  movementBudget: { current: number; max: number };
  selectedWeapon: Equipment | undefined;
  weapons: Equipment[];
  onSelectWeapon: (weapon: Equipment) => void;
  onSelectAction: (action: CombatAction, power?: string) => void;
  remainingActions: number;
  cameraFollowEnabled: boolean;
  setCameraFollowEnabled: (enabled: boolean) => void;
  showWeaponRanges: boolean;
  setShowWeaponRanges: (show: boolean) => void;
  showMovementRanges: boolean;
  setShowMovementRanges: (show: boolean) => void;
  illumination: Illumination;
  setIllumination: (level: Illumination) => void;
  onOpenAIAssistant?: () => void;
  isGM?: boolean;
}

export function ActionBar({
  character,
  playerHealth,
  playerMaxHealth,
  playerWounds,
  movementBudget,
  selectedWeapon,
  weapons,
  onSelectWeapon,
  onSelectAction,
  remainingActions,
  cameraFollowEnabled,
  setCameraFollowEnabled,
  showWeaponRanges,
  setShowWeaponRanges,
  showMovementRanges,
  setShowMovementRanges,
  illumination,
  setIllumination,
  onOpenAIAssistant,
  isGM = false,
}: ActionBarProps) {
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const actionsOpen = Boolean(actionsAnchorEl);

  const healthPercent = (playerHealth / playerMaxHealth) * 100;
  const movePercent = (movementBudget.current / movementBudget.max) * 100;

  const handleActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionsAnchorEl(event.currentTarget);
  };

  const handleActionsClose = () => {
    setActionsAnchorEl(null);
  };

  const handleActionSelect = (action: CombatAction, power?: string) => {
    onSelectAction(action, power);
    handleActionsClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        px: 3,
        py: 1.5,
        backgroundColor: '#2d1b0e',
        borderTop: '3px solid #8b4513',
        boxShadow: '0 -4px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* Character Portrait & Name */}
      <Tooltip title="View Character Details">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          <Avatar
            src={character.characterImageUrl}
            sx={{
              width: 56,
              height: 56,
              border: '2px solid #8b4513',
              backgroundColor: '#1a0f08',
            }}
          >
            🤠
          </Avatar>
          <Box>
            <Typography
              sx={{
                fontFamily: 'Rye, serif',
                color: '#f5e6d3',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {character.name}
            </Typography>
            <Typography sx={{ color: '#d4b896', fontSize: '11px' }}>
              {character.occupation || 'Wanderer'}
            </Typography>
          </Box>
        </Box>
      </Tooltip>

      {/* Health Bar */}
      <Box sx={{ minWidth: 160 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <HeartIcon sx={{ fontSize: '14px', color: '#ff4444' }} />
          <Typography sx={{ fontSize: '11px', color: '#f5e6d3', fontWeight: 'bold' }}>
            Health: {playerHealth}/{playerMaxHealth}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={healthPercent}
          sx={{
            height: 8,
            borderRadius: 1,
            backgroundColor: '#1a0f08',
            '& .MuiLinearProgress-bar': {
              backgroundColor: healthPercent > 50 ? '#44ff44' : healthPercent > 25 ? '#ff8800' : '#ff4444',
              borderRadius: 1,
            },
          }}
        />
        <Typography sx={{ fontSize: '10px', color: '#d4b896', mt: 0.5 }}>
          Wounds: {playerWounds}/3
        </Typography>
      </Box>

      {/* Movement Bar */}
      <Box sx={{ minWidth: 140 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <RunIcon sx={{ fontSize: '14px', color: '#4169e1' }} />
          <Typography sx={{ fontSize: '11px', color: '#f5e6d3', fontWeight: 'bold' }}>
            Movement: {movementBudget.current}/{movementBudget.max}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={movePercent}
          sx={{
            height: 8,
            borderRadius: 1,
            backgroundColor: '#1a0f08',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4169e1',
              borderRadius: 1,
            },
          }}
        />
        <Typography sx={{ fontSize: '10px', color: '#d4b896', mt: 0.5 }}>
          {movementBudget.current} squares remaining
        </Typography>
      </Box>

      {/* Weapon Selector */}
      <Box sx={{ minWidth: 200 }}>
        <Typography sx={{ fontSize: '11px', color: '#d4b896', mb: 0.5 }}>
          Selected Weapon
        </Typography>
        <Select
          value={selectedWeapon?.name || ''}
          onChange={(e) => {
            const weapon = weapons.find((w) => w.name === e.target.value);
            if (weapon) onSelectWeapon(weapon);
          }}
          sx={{
            width: '100%',
            height: 32,
            backgroundColor: '#1a0f08',
            color: '#f5e6d3',
            fontSize: '12px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8b4513',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d4b896',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d4b896',
            },
          }}
        >
          {weapons.map((weapon) => (
            <MenuItem
              key={weapon.name}
              value={weapon.name}
              sx={{
                backgroundColor: '#2d1b0e',
                color: '#f5e6d3',
                '&:hover': {
                  backgroundColor: '#3d2b1e',
                },
              }}
            >
              {weapon.name}
            </MenuItem>
          ))}
        </Select>
        {selectedWeapon && (
          <Typography sx={{ fontSize: '10px', color: '#d4b896', mt: 0.5 }}>
            DMG: {selectedWeapon.damage} | RNG: {selectedWeapon.range} | ROF: {selectedWeapon.rof || 1}
          </Typography>
        )}
      </Box>

      {/* Actions Button & Settings */}
      <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* Actions Button */}
        <Button
          variant="contained"
          onClick={handleActionsClick}
          disabled={remainingActions <= 0}
          sx={{
            backgroundColor: remainingActions > 0 ? '#8b4513' : '#4a3520',
            color: '#f5e6d3',
            fontFamily: 'Rye, serif',
            fontSize: '14px',
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: remainingActions > 0 ? '#a0522d' : '#4a3520',
            },
            '&:disabled': {
              color: '#8b7355',
            },
          }}
        >
          {remainingActions > 0 ? `Actions (${remainingActions} left)` : 'No Actions Left'}
        </Button>

        {/* Actions Menu Popover */}
        <Popover
          open={actionsOpen}
          anchorEl={actionsAnchorEl}
          onClose={handleActionsClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              backgroundColor: '#2d1b0e',
              border: '2px solid #8b4513',
              p: 2,
              minWidth: 320,
            },
          }}
        >
          <ActionMenu
            onSelectAction={handleActionSelect}
            remainingActions={remainingActions}
            character={character}
          />
        </Popover>

        {/* AI Assistant Button (GM only) */}
        {isGM && onOpenAIAssistant && (
          <Tooltip title="AI Game Master Assistant">
            <IconButton
              onClick={onOpenAIAssistant}
              sx={{
                color: '#f5e6d3',
                backgroundColor: '#2d1b0e',
                border: '2px solid #8b4513',
                '&:hover': {
                  backgroundColor: '#3d2b1e',
                  borderColor: '#d4af37',
                },
              }}
            >
              <AIIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Settings Menu */}
        <SettingsMenu
          cameraFollowEnabled={cameraFollowEnabled}
          setCameraFollowEnabled={setCameraFollowEnabled}
          showWeaponRanges={showWeaponRanges}
          setShowWeaponRanges={setShowWeaponRanges}
          showMovementRanges={showMovementRanges}
          setShowMovementRanges={setShowMovementRanges}
          illumination={illumination}
          setIllumination={setIllumination}
        />
      </Box>
    </Box>
  );
}
