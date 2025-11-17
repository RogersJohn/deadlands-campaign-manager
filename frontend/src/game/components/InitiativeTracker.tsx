import { Box, Typography, Paper } from '@mui/material';

// Savage Worlds card suits and values
const SUITS = ['♠', '♥', '♦', '♣'] as const;
const VALUES = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

type Suit = typeof SUITS[number];
type Value = typeof VALUES[number];

interface Card {
  suit: Suit;
  value: Value;
  isJoker?: boolean;
  isRed?: boolean; // For red vs black joker
}

interface InitiativeEntry {
  id: string;
  name: string;
  card: Card;
  isPlayer: boolean;
  isActive: boolean; // Currently acting
}

interface InitiativeTrackerProps {
  entries?: InitiativeEntry[];
  currentTurn?: string; // ID of current actor
}

const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({
  entries = [],
  currentTurn
}) => {
  // Use props data instead of demo data
  const initiativeOrder = entries;

  // Card value for sorting (higher = better initiative)
  const getCardValue = (card: Card): number => {
    if (card.isJoker) {
      return card.isRed ? 1000 : -1000; // Red joker best, Black joker last
    }
    const valueScore = VALUES.indexOf(card.value);
    const suitScore = SUITS.indexOf(card.suit) * 0.1;
    return (13 - valueScore) + suitScore;
  };

  // Get color for card based on suit
  const getCardColor = (card: Card): string => {
    if (card.isJoker) {
      return card.isRed ? '#ff0000' : '#000000';
    }
    return card.suit === '♥' || card.suit === '♦' ? '#d32f2f' : '#000000';
  };

  // Get background color for card
  const getCardBackground = (card: Card): string => {
    if (card.isJoker) {
      return card.isRed ? '#ffe0e0' : '#e0e0e0';
    }
    return '#f5e6d3';
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#2d1b0e',
        border: '2px solid #8b4513',
        borderRadius: 1,
        p: 2,
        overflowY: 'auto',
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
      {/* Header */}
      <Typography
        sx={{
          fontFamily: 'Rye, serif',
          color: '#f5e6d3',
          fontSize: '18px',
          fontWeight: 'bold',
          mb: 2,
          textAlign: 'center',
          borderBottom: '2px solid #8b4513',
          pb: 1,
        }}
      >
        INITIATIVE
      </Typography>

      {/* Initiative Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {initiativeOrder.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              color: '#8b7355',
              fontSize: '12px',
              fontStyle: 'italic',
              textAlign: 'center',
              px: 2,
            }}
          >
            Combat not yet started.<br />
            Initiative will be drawn when combat begins.
          </Box>
        ) : (
          initiativeOrder
            .sort((a, b) => getCardValue(b.card) - getCardValue(a.card))
            .map((entry) => (
            <Paper
              key={entry.id}
              elevation={entry.isActive ? 8 : 2}
              sx={{
                p: 1.5,
                backgroundColor: entry.isActive ? '#4a3520' : '#1a0f08',
                border: `2px solid ${
                  entry.isActive
                    ? '#d4af37'
                    : entry.isPlayer
                    ? '#4169e1'
                    : '#8b4513'
                }`,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#4a3520',
                  transform: 'translateX(4px)',
                },
              }}
            >
              {/* Playing Card */}
              <Box
                sx={{
                  width: 50,
                  height: 70,
                  backgroundColor: getCardBackground(entry.card),
                  border: '2px solid #000',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {entry.card.isJoker ? (
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: getCardColor(entry.card),
                    }}
                  >
                    JOKER
                  </Typography>
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: getCardColor(entry.card),
                        lineHeight: 1,
                      }}
                    >
                      {entry.card.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '20px',
                        color: getCardColor(entry.card),
                        lineHeight: 1,
                      }}
                    >
                      {entry.card.suit}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Character Info */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'Rye, serif',
                    color: entry.isPlayer ? '#4169e1' : '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {entry.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#8b7355',
                  }}
                >
                  {entry.isPlayer ? 'Player' : 'Enemy'}
                </Typography>
              </Box>

              {/* Active Indicator */}
              {entry.isActive && (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: '#44ff44',
                    boxShadow: '0 0 8px #44ff44',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
              )}
            </Paper>
          ))
        )}
      </Box>

      {/* Round Info */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: '2px solid #8b4513',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'Rye, serif',
            color: '#d4b896',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          Round 1
        </Typography>
        <Typography
          sx={{
            fontSize: '10px',
            color: '#8b7355',
            textAlign: 'center',
            mt: 0.5,
          }}
        >
          New cards dealt each round
        </Typography>
      </Box>
    </Box>
  );
};

export default InitiativeTracker;
