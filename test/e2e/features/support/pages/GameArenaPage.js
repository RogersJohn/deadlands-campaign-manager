const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class GameArenaPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.canvas = By.css('canvas');
    this.playerToken = By.css('[data-token-type="player-local"]');
    this.remoteToken = (username) => By.css(`[data-token-username="${username}"]`);
    this.wsStatusIndicator = By.css('[data-testid="ws-status"], .websocket-status');
  }

  async navigate(baseUrl, sessionId) {
    await this.visit(`${baseUrl}/session/${sessionId}`);
    // Wait for canvas to load
    await this.waitForElement(this.canvas, 15000);
  }

  async isArenaLoaded() {
    const canvasPresent = await this.isElementPresent(this.canvas);
    if (!canvasPresent) return false;

    // Check if Phaser game is initialized
    const gameInitialized = await this.executeScript(`
      return window.game && window.game.scene && window.game.scene.isActive('ArenaScene');
    `);

    return gameInitialized;
  }

  async moveTokenTo(gridX, gridY) {
    // Get canvas element
    const canvas = await this.findElement(this.canvas);

    // Calculate pixel position from grid coordinates
    // Assuming TILE_SIZE = 32
    const TILE_SIZE = 32;
    const pixelX = gridX * TILE_SIZE + TILE_SIZE / 2;
    const pixelY = gridY * TILE_SIZE + TILE_SIZE / 2;

    // Click on canvas at position
    const actions = this.driver.actions({ async: true });
    await actions.move({ origin: canvas, x: pixelX, y: pixelY }).click().perform();

    // Wait for movement animation
    await this.sleep(300);
  }

  async getPlayerTokenPosition() {
    const position = await this.executeScript(`
      const scene = window.game.scene.getScene('ArenaScene');
      if (scene && scene.player) {
        return {
          x: scene.playerGridX,
          y: scene.playerGridY
        };
      }
      return null;
    `);
    return position;
  }

  async getRemoteTokenPosition(username) {
    const position = await this.executeScript(`
      const scene = window.game.scene.getScene('ArenaScene');
      if (scene && scene.remotePlayerSprites) {
        for (const [tokenId, sprite] of scene.remotePlayerSprites.entries()) {
          const nameText = sprite.getData('nameText');
          if (nameText && nameText.text === '${username}') {
            // Get grid position from pixel position
            const TILE_SIZE = 32;
            const gridX = Math.floor((sprite.x - TILE_SIZE / 2) / TILE_SIZE);
            const gridY = Math.floor((sprite.y - TILE_SIZE / 2) / TILE_SIZE);
            return { x: gridX, y: gridY };
          }
        }
      }
      return null;
    `);
    return position;
  }

  async getRemoteTokenColor(username) {
    const color = await this.executeScript(`
      const scene = window.game.scene.getScene('ArenaScene');
      if (scene && scene.remotePlayerSprites) {
        for (const [tokenId, sprite] of scene.remotePlayerSprites.entries()) {
          const nameText = sprite.getData('nameText');
          if (nameText && nameText.text === '${username}') {
            return sprite.fillColor;
          }
        }
      }
      return null;
    `);
    return color;
  }

  async getRemoteTokenOpacity(username) {
    const opacity = await this.executeScript(`
      const scene = window.game.scene.getScene('ArenaScene');
      if (scene && scene.remotePlayerSprites) {
        for (const [tokenId, sprite] of scene.remotePlayerSprites.entries()) {
          const nameText = sprite.getData('nameText');
          if (nameText && nameText.text === '${username}') {
            return sprite.alpha;
          }
        }
      }
      return null;
    `);
    return opacity;
  }

  async getWebSocketStatus() {
    const status = await this.executeScript(`
      return window.websocketStatus || 'unknown';
    `);
    return status;
  }

  async isWebSocketConnected() {
    const consoleLogs = await this.getConsoleLogs();
    return consoleLogs.some(log => log.includes('WebSocket connected'));
  }

  async getRemoteTokenCount() {
    const count = await this.executeScript(`
      const scene = window.game.scene.getScene('ArenaScene');
      if (scene && scene.remotePlayerSprites) {
        return scene.remotePlayerSprites.size;
      }
      return 0;
    `);
    return count;
  }

  async waitForRemoteToken(username, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const position = await this.getRemoteTokenPosition(username);
      if (position !== null) {
        return true;
      }
      await this.sleep(200);
    }
    return false;
  }

  async makeRapidMovements(positions) {
    for (const pos of positions) {
      await this.moveTokenTo(pos.x, pos.y);
      await this.sleep(50); // Very short delay for "rapid" movements
    }
  }
}

module.exports = GameArenaPage;
