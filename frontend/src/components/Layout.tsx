import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  MenuBook as WikiIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  SportsEsports as GameIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

const Layout = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'My Characters', icon: <PersonIcon />, path: '/dashboard' },
    { text: 'Game', icon: <GameIcon />, path: '/game/arena' },
    { text: 'Wiki', icon: <WikiIcon />, path: '/wiki' },
    { text: 'Change Password', icon: <LockIcon />, path: '/change-password' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Deadlands Campaign Manager
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.username} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path)
                    setDrawerOpen(false)
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 3, mt: 'auto' }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            Deadlands Campaign Manager © 2024
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout
