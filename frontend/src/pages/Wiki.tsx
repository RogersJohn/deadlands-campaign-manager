import { Box, Typography, Paper } from '@mui/material'

const Wiki = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Campaign Wiki
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Wiki functionality coming soon. This will contain information about:
        </Typography>
        <ul>
          <li>Campaign lore and history</li>
          <li>NPCs and locations</li>
          <li>Session notes</li>
          <li>Rules and house rules</li>
        </ul>
      </Paper>
    </Box>
  )
}

export default Wiki
