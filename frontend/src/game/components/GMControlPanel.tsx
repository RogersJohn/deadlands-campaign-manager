import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';

interface GameState {
  turnNumber: number;
  turnPhase: string;
  currentMap: string | null;
  tokenPositions: any[];
  lastActivity: string;
}

interface GMControlPanelProps {
  onMapChange?: () => void;
  onGameReset?: () => void;
}

const GMControlPanel: React.FC<GMControlPanelProps> = ({ onMapChange, onGameReset }) => {
  const { user, token } = useAuthStore();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newMapId, setNewMapId] = useState('');
  const [showMapInput, setShowMapInput] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Draggable panel state
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  // Check if user is GM
  const isGM = user?.role === 'GAME_MASTER';

  // Load game state
  useEffect(() => {
    if (!token || !isGM) return;

    loadGameState();
  }, [token, isGM]);

  const loadGameState = async () => {
    try {
      const response = await fetch(`${API_URL}/game/state`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGameState(data);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  };

  const handleChangeMap = async () => {
    if (!newMapId.trim()) {
      showNotification('Please enter a map name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/game/map/change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mapId: newMapId }),
      });

      if (response.ok) {
        showNotification(`Map changed to: ${newMapId}. All tokens cleared!`);
        setNewMapId('');
        setShowMapInput(false);
        await loadGameState();
        if (onMapChange) onMapChange();
      } else {
        const error = await response.text();
        showNotification(`Failed to change map: ${error}`);
      }
    } catch (error) {
      console.error('Failed to change map:', error);
      showNotification('Error changing map');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/game/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showNotification('Game reset! All tokens cleared, turn reset to 1.');
        setShowResetConfirm(false);
        await loadGameState();
        if (onGameReset) onGameReset();
      } else {
        const error = await response.text();
        showNotification(`Failed to reset game: ${error}`);
      }
    } catch (error) {
      console.error('Failed to reset game:', error);
      showNotification('Error resetting game');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCollapsed) return; // Don't allow dragging when collapsed header is too small

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep panel within viewport bounds
      const panelWidth = 300;
      const panelHeight = 50; // Minimum draggable area
      const maxX = window.innerWidth - panelWidth;
      const maxY = window.innerHeight - panelHeight;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Don't render if not GM
  if (!isGM) return null;

  return (
    <div
      ref={panelRef}
      style={{
        ...styles.container,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Notification Toast */}
      {notification && (
        <div style={styles.notification}>
          {notification}
        </div>
      )}

      {/* GM Control Panel */}
      <div style={styles.panel}>
        <div
          style={{
            ...styles.header,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
        >
          <h3 style={styles.title}>🎮 GM Controls</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={styles.collapseButton}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <>
            {/* Game State Display */}
            {gameState && (
              <div style={styles.stateDisplay}>
                <div style={styles.stateLine}>
                  <strong>Map:</strong> {gameState.currentMap || 'No map set'}
                </div>
                <div style={styles.stateLine}>
                  <strong>Turn:</strong> {gameState.turnNumber} ({gameState.turnPhase} phase)
                </div>
                <div style={styles.stateLine}>
                  <strong>Tokens:</strong> {gameState.tokenPositions.length} on map
                </div>
              </div>
            )}

            {/* Change Map Section */}
            <div style={styles.section}>
          {!showMapInput ? (
            <button
              onClick={() => setShowMapInput(true)}
              style={styles.button}
              disabled={isLoading}
            >
              🗺️ Change Map
            </button>
          ) : (
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={newMapId}
                onChange={(e) => setNewMapId(e.target.value)}
                placeholder="Enter map name..."
                style={styles.input}
                onKeyPress={(e) => e.key === 'Enter' && handleChangeMap()}
              />
              <button
                onClick={handleChangeMap}
                style={{ ...styles.button, ...styles.confirmButton }}
                disabled={isLoading || !newMapId.trim()}
              >
                {isLoading ? 'Changing...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowMapInput(false);
                  setNewMapId('');
                }}
                style={{ ...styles.button, ...styles.cancelButton }}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
          <div style={styles.helpText}>
            ⚠️ Clears all player tokens (including offline players)
          </div>
        </div>

        {/* Reset Game Section */}
        <div style={styles.section}>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{ ...styles.button, ...styles.dangerButton }}
              disabled={isLoading}
            >
              🔄 Reset Game
            </button>
          ) : (
            <div style={styles.confirmGroup}>
              <div style={styles.warningText}>
                ⚠️ This will clear all tokens and reset turn to 1!
              </div>
              <div style={styles.buttonRow}>
                <button
                  onClick={handleResetGame}
                  style={{ ...styles.button, ...styles.confirmButton }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Yes, Reset'}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{ ...styles.button, ...styles.cancelButton }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div style={styles.helpText}>
            Clears tokens, resets turn to 1 (keeps current map)
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    zIndex: 1000,
    userSelect: 'none', // Prevent text selection while dragging
  },
  panel: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    border: '2px solid #FFD700',
    borderRadius: '8px',
    padding: '16px',
    minWidth: '300px',
    maxWidth: '400px',
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
  },
  header: {
    marginBottom: '12px',
    borderBottom: '1px solid #FFD700',
    paddingBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
  },
  collapseButton: {
    background: 'transparent',
    border: 'none',
    color: '#FFD700',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
    marginLeft: '8px',
  },
  stateDisplay: {
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  stateLine: {
    marginBottom: '6px',
  },
  section: {
    marginBottom: '16px',
  },
  button: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '2px solid #FFD700',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#1a1a1a',
    color: '#FFD700',
    transition: 'all 0.2s',
  },
  confirmButton: {
    backgroundColor: '#2a7a2a',
    borderColor: '#4CAF50',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#7a2a2a',
    borderColor: '#CF4C4C',
    color: '#FFFFFF',
  },
  dangerButton: {
    borderColor: '#FF4444',
    color: '#FF4444',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '8px',
    fontSize: '14px',
    border: '2px solid #FFD700',
    borderRadius: '4px',
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: '11px',
    color: '#AAAAAA',
    marginTop: '4px',
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: '13px',
    color: '#FF6666',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  confirmGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#2a7a2a',
    color: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '4px',
    border: '2px solid #4CAF50',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    maxWidth: '400px',
  },
};

export default GMControlPanel;
