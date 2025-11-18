const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

/**
 * Page Object for GM Control Panel component
 *
 * The GM Control Panel is only visible to users with GAME_MASTER role.
 * It provides game state information and controls for:
 * - Viewing current map, turn number, and token count
 * - Changing the map (clears all tokens)
 * - Resetting the game state
 */
class GMControlPanelPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Main panel container
    this.panel = By.css('[data-testid="gm-control-panel"], .gm-control-panel');

    // Game state display elements
    this.currentMapDisplay = By.xpath('//*[contains(text(), "Map:")]/following-sibling::*[1]');
    this.turnNumberDisplay = By.xpath('//*[contains(text(), "Turn:")]/following-sibling::*[1]');
    this.tokenCountDisplay = By.xpath('//*[contains(text(), "Tokens:")]/following-sibling::*[1]');

    // Map change controls
    this.changeMapButton = By.xpath('//button[contains(text(), "Change Map")]');
    this.mapNameInput = By.css('input[placeholder*="map" i], input[placeholder*="Enter map"]');
    this.confirmMapChangeButton = By.xpath('//button[contains(text(), "Confirm")]');
    this.cancelMapChangeButton = By.xpath('//button[contains(text(), "Cancel")]');

    // Game reset controls
    this.resetGameButton = By.xpath('//button[contains(text(), "Reset Game")]');
    this.confirmResetButton = By.xpath('//button[contains(text(), "Yes, Reset") or contains(text(), "Confirm")]');
    this.cancelResetButton = By.xpath('//button[contains(text(), "Cancel")]');

    // Notification toast
    this.notification = By.css('[data-testid="notification"], .notification, [role="alert"]');
  }

  /**
   * Check if GM Control Panel is visible
   * @returns {Promise<boolean>}
   */
  async isVisible() {
    return await this.isElementPresent(this.panel, 5000);
  }

  /**
   * Wait for panel to be visible
   * @param {number} timeout
   * @returns {Promise<boolean>}
   */
  async waitForPanel(timeout = 10000) {
    try {
      await this.waitForElement(this.panel, timeout);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the current map name displayed
   * @returns {Promise<string|null>}
   */
  async getCurrentMap() {
    try {
      // Try multiple approaches to find the map name
      const mapText = await this.executeScript(`
        const panel = document.querySelector('[data-testid="gm-control-panel"]') ||
                     document.querySelector('.gm-control-panel') ||
                     Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Map:'));

        if (panel) {
          const mapLine = panel.textContent.split('\\n').find(line => line.includes('Map:'));
          if (mapLine) {
            const mapName = mapLine.replace('Map:', '').trim();
            return mapName === 'No map set' ? null : mapName;
          }
        }
        return null;
      `);
      return mapText;
    } catch (error) {
      console.warn('Failed to get current map:', error.message);
      return null;
    }
  }

  /**
   * Get the current turn number
   * @returns {Promise<number>}
   */
  async getTurnNumber() {
    try {
      const turnText = await this.executeScript(`
        const panel = document.querySelector('[data-testid="gm-control-panel"]') ||
                     document.querySelector('.gm-control-panel') ||
                     Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Turn:'));

        if (panel) {
          const turnLine = panel.textContent.split('\\n').find(line => line.includes('Turn:'));
          if (turnLine) {
            const match = turnLine.match(/Turn: (\\d+)/);
            return match ? parseInt(match[1]) : 1;
          }
        }
        return 1;
      `);
      return turnText;
    } catch (error) {
      console.warn('Failed to get turn number:', error.message);
      return 1;
    }
  }

  /**
   * Get the number of tokens on the map
   * @returns {Promise<number>}
   */
  async getTokenCount() {
    try {
      const tokenCount = await this.executeScript(`
        const panel = document.querySelector('[data-testid="gm-control-panel"]') ||
                     document.querySelector('.gm-control-panel') ||
                     Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Tokens:'));

        if (panel) {
          const tokenLine = panel.textContent.split('\\n').find(line => line.includes('Tokens:'));
          if (tokenLine) {
            const match = tokenLine.match(/(\\d+) on map/);
            return match ? parseInt(match[1]) : 0;
          }
        }
        return 0;
      `);
      return tokenCount;
    } catch (error) {
      console.warn('Failed to get token count:', error.message);
      return 0;
    }
  }

  /**
   * Click the "Change Map" button
   */
  async clickChangeMap() {
    const button = await this.findElement(this.changeMapButton);
    await button.click();
    await this.sleep(300);
  }

  /**
   * Enter a new map name in the input field
   * @param {string} mapName
   */
  async enterMapName(mapName) {
    const input = await this.findElement(this.mapNameInput);
    await input.clear();
    await input.sendKeys(mapName);
  }

  /**
   * Click confirm button for map change
   */
  async confirmMapChange() {
    const button = await this.findElement(this.confirmMapChangeButton);
    await button.click();
    await this.sleep(500); // Wait for change to process
  }

  /**
   * Click cancel button for map change
   */
  async cancelMapChange() {
    const button = await this.findElement(this.cancelMapChangeButton);
    await button.click();
    await this.sleep(300);
  }

  /**
   * Complete map change workflow
   * @param {string} mapName
   * @returns {Promise<boolean>} True if successful
   */
  async changeMap(mapName) {
    try {
      await this.clickChangeMap();
      await this.enterMapName(mapName);
      await this.confirmMapChange();

      // Wait for notification
      await this.waitForNotification(5000);

      return true;
    } catch (error) {
      console.error('Failed to change map:', error.message);
      return false;
    }
  }

  /**
   * Click the "Reset Game" button
   */
  async clickResetGame() {
    const button = await this.findElement(this.resetGameButton);
    await button.click();
    await this.sleep(300);
  }

  /**
   * Click confirm button for game reset
   */
  async confirmReset() {
    const button = await this.findElement(this.confirmResetButton);
    await button.click();
    await this.sleep(500); // Wait for reset to process
  }

  /**
   * Click cancel button for game reset
   */
  async cancelReset() {
    const button = await this.findElement(this.cancelResetButton);
    await button.click();
    await this.sleep(300);
  }

  /**
   * Complete game reset workflow
   * @returns {Promise<boolean>} True if successful
   */
  async resetGame() {
    try {
      await this.clickResetGame();
      await this.confirmReset();

      // Wait for notification
      await this.waitForNotification(5000);

      return true;
    } catch (error) {
      console.error('Failed to reset game:', error.message);
      return false;
    }
  }

  /**
   * Wait for notification toast to appear
   * @param {number} timeout
   * @returns {Promise<boolean>}
   */
  async waitForNotification(timeout = 5000) {
    try {
      await this.waitForElement(this.notification, timeout);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the notification message
   * @returns {Promise<string|null>}
   */
  async getNotificationMessage() {
    try {
      const element = await this.findElement(this.notification);
      return await element.getText();
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a notification contains specific text
   * @param {string} expectedText
   * @param {number} timeout
   * @returns {Promise<boolean>}
   */
  async waitForNotificationContaining(expectedText, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const message = await this.getNotificationMessage();
      if (message && message.includes(expectedText)) {
        return true;
      }
      await this.sleep(200);
    }
    return false;
  }

  /**
   * Get full game state info from panel
   * @returns {Promise<{map: string, turn: number, tokenCount: number}>}
   */
  async getGameState() {
    return {
      map: await this.getCurrentMap(),
      turn: await this.getTurnNumber(),
      tokenCount: await this.getTokenCount()
    };
  }
}

module.exports = GMControlPanelPage;
