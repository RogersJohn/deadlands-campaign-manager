import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  RadioGroup,
  FormLabel,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { CalledShotTarget } from '../types/GameTypes';

interface CalledShotDialogProps {
  open: boolean;
  onSelect: (target: CalledShotTarget) => void;
  onCancel: () => void;
}

const CALLED_SHOT_OPTIONS = [
  {
    value: 'head',
    label: 'Head Shot',
    penalty: -4,
    bonus: +4,
    description: 'Target the head for extra damage',
  },
  {
    value: 'vitals',
    label: 'Vital Shot',
    penalty: -4,
    bonus: +4,
    description: 'Target vital organs for extra damage',
  },
  {
    value: 'limb',
    label: 'Limb Shot',
    penalty: -2,
    bonus: 0,
    description: 'Target a limb to disarm or knock down',
  },
  {
    value: 'small',
    label: 'Small Target',
    penalty: -2,
    bonus: 0,
    description: 'Target a small object or weak point',
  },
  {
    value: 'tiny',
    label: 'Tiny Target',
    penalty: -4,
    bonus: 0,
    description: 'Target a very small object',
  },
];

export const CalledShotDialog: React.FC<CalledShotDialogProps> = ({
  open,
  onSelect,
  onCancel,
}) => {
  const [selectedTarget, setSelectedTarget] = React.useState<string>('head');

  const handleConfirm = () => {
    onSelect(selectedTarget as CalledShotTarget);
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          backgroundColor: '#2d1b0e',
          border: '2px solid #8b4513',
          minWidth: 400,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: '#f5e6d3',
          fontFamily: 'Rye, serif',
          fontSize: '20px',
          borderBottom: '1px solid #8b4513',
          pb: 1,
        }}
      >
        🎯 Called Shot
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel
            component="legend"
            sx={{
              color: '#d4b896',
              fontSize: '12px',
              mb: 1,
            }}
          >
            Select target area:
          </FormLabel>
          <RadioGroup
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
          >
            {CALLED_SHOT_OPTIONS.map((option) => (
              <Box
                key={option.value}
                sx={{
                  mb: 1,
                  p: 1.5,
                  backgroundColor: selectedTarget === option.value ? 'rgba(65, 105, 225, 0.2)' : '#1a0f08',
                  border: '1px solid #4a3425',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.2)',
                  },
                }}
                onClick={() => setSelectedTarget(option.value)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      color: '#f5e6d3',
                      fontSize: '13px',
                      fontWeight: 'bold',
                    }}
                  >
                    {option.label}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography
                      sx={{
                        color: '#ff6666',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {option.penalty} to hit
                    </Typography>
                    {option.bonus > 0 && (
                      <Typography
                        sx={{
                          color: '#44ff44',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        +{option.bonus} damage
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography
                  sx={{
                    color: '#8b7355',
                    fontSize: '10px',
                    mt: 0.5,
                  }}
                >
                  {option.description}
                </Typography>
              </Box>
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            fullWidth
            sx={{
              color: '#d4b896',
              borderColor: '#8b4513',
              '&:hover': {
                borderColor: '#a0522d',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            fullWidth
            sx={{
              backgroundColor: '#8b4513',
              color: '#f5e6d3',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#a0522d',
              },
            }}
          >
            Confirm
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
