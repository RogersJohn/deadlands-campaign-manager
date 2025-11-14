import { Box, Alert, AlertTitle } from '@mui/material';
import AIAssistantPanel from '../components/ai/AIAssistantPanel';

/**
 * Standalone AI Assistant Window
 * Opens in a popup for better screen real estate
 */
export default function AIAssistantWindow() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1a1410',
        overflow: 'hidden',
      }}
    >
      {/* Human GM Authority Notice */}
      <Alert
        severity="info"
        sx={{
          m: 1,
          bgcolor: '#2c1810',
          border: '2px solid #FFD700',
          '& .MuiAlert-icon': { color: '#FFD700' },
          '& .MuiAlert-message': { color: '#f5deb3' }
        }}
      >
        <AlertTitle sx={{ color: '#FFD700', fontWeight: 'bold', fontFamily: 'Rye, serif' }}>
          ⚠️ HUMAN GAME MASTER HAS FINAL AUTHORITY ⚠️
        </AlertTitle>
        <strong>The HUMAN GM is the ultimate authority at this table.</strong>
        <br />
        The AI is a TOOL to assist gameplay - it provides suggestions based on Savage Worlds rules,
        but the HUMAN GM can overrule ANY suggestion, even if it contradicts official rules.
        <br />
        <strong>Your table, your rules. The AI serves YOU.</strong>
      </Alert>

      {/* AI Panel */}
      <Box sx={{ flex: 1, m: 1, overflow: 'hidden' }}>
        <AIAssistantPanel />
      </Box>
    </Box>
  );
}
