const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class SessionRoomPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.sessionTitle = By.css('[data-testid="session-title"], h1, h2');
    this.playerList = By.css('[data-testid="player-list"], .player-list');
    this.playerCount = By.xpath('//*[contains(text(), "players") or contains(text(), "Players")]');
    this.startGameButton = By.xpath('//button[contains(text(), "Start Game")]');
    this.leaveSessionButton = By.xpath('//button[contains(text(), "Leave")]');
    this.connectionStatus = By.css('[data-testid="connection-status"], .connection-status');
    this.chatMessages = By.css('[data-testid="chat-messages"], .chat-messages');
  }

  async isSessionRoomLoaded() {
    return await this.isElementPresent(this.sessionTitle, 5000);
  }

  async getSessionTitle() {
    return await this.getText(this.sessionTitle);
  }

  async getPlayerCount() {
    const text = await this.getText(this.playerCount);
    const match = text.match(/(\d+)\/(\d+)/);
    if (match) {
      return {
        current: parseInt(match[1]),
        max: parseInt(match[2])
      };
    }
    return { current: 0, max: 0 };
  }

  async isStartGameButtonVisible() {
    return await this.isElementPresent(this.startGameButton, 2000);
  }

  async isStartGameButtonEnabled() {
    try {
      const button = await this.findElement(this.startGameButton);
      return await button.isEnabled();
    } catch (error) {
      return false;
    }
  }

  async clickStartGame() {
    await this.click(this.startGameButton);
    await this.sleep(2000); // Wait for game to start
  }

  async isConnected() {
    try {
      const statusText = await this.getText(this.connectionStatus);
      return statusText.toLowerCase().includes('connected');
    } catch (error) {
      return false;
    }
  }

  async waitForPlayerToJoin(username, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const playerListText = await this.getText(this.playerList);
      if (playerListText.includes(username)) {
        return true;
      }
      await this.sleep(500);
    }
    return false;
  }

  async getOnlinePlayersCount() {
    const playerListText = await this.getText(this.playerList);
    // Count online indicators or player entries
    const onlineMatches = playerListText.match(/online|connected/gi);
    return onlineMatches ? onlineMatches.length : 0;
  }

  async isGMBadgeVisible() {
    try {
      const gmBadge = By.xpath('//*[contains(text(), "GM") or contains(@class, "gm-badge")]');
      return await this.isElementPresent(gmBadge, 2000);
    } catch (error) {
      return false;
    }
  }

  async isWaitingForGM() {
    try {
      const waitingText = By.xpath('//*[contains(text(), "Waiting for GM") or contains(text(), "waiting")]');
      return await this.isElementPresent(waitingText, 2000);
    } catch (error) {
      return false;
    }
  }
}

module.exports = SessionRoomPage;
