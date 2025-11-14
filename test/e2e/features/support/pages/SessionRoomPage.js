const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class SessionRoomPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.sessionTitle = By.xpath('//h4[contains(@class, "MuiTypography-h4")]');
    this.playerList = By.css('.MuiList-root');
    this.playerListItems = By.xpath('//li[contains(@class, "MuiListItem-root")]');
    this.playerCount = By.xpath('//h6[contains(text(), "Players")]');
    this.startGameButton = By.xpath('//button[contains(text(), "Start Game")]');
    this.leaveSessionButton = By.xpath('//button[contains(text(), "Leave Session")]');
    this.chatMessages = By.css('.MuiBox-root');
    this.chatInput = By.css('input[placeholder*="Type a message"]');
    this.sendButton = By.xpath('//button[contains(@aria-label, "send") or .//svg]');
    this.connectionStatus = By.xpath('//span[contains(text(), "Connected") or contains(text(), "Connecting")]');
    this.gmBadge = By.xpath('//span[contains(text(), "GM")]');
    this.waitingMessage = By.xpath('//*[contains(text(), "Waiting for Game Master")]');
  }

  async navigate(baseUrl, sessionId) {
    await this.visit(`${baseUrl}/session/${sessionId}`);
    // Wait for player list to load
    await this.waitForElement(this.playerList, 10000);
  }

  async isSessionRoomLoaded() {
    try {
      await this.waitForElement(this.playerList, 5000);
      return true;
    } catch (error) {
      return false;
    }
  }

  async clickStartGame() {
    // Wait for button to be enabled
    await this.waitForElementVisible(this.startGameButton, 10000);
    await this.click(this.startGameButton);

    // Wait for navigation to arena (1 second delay + some buffer)
    await this.sleep(1500);
  }

  async getPlayerCount() {
    const text = await this.getText(this.playerCount);
    // Extract number from "Players (2/5)" format
    const match = text.match(/Players \((\d+)\/(\d+)\)/);
    if (match) {
      return {
        current: parseInt(match[1]),
        max: parseInt(match[2]),
      };
    }
    return null;
  }

  async isPlayerListed(username) {
    const locator = By.xpath(`//span[contains(text(), "${username}")]`);
    return await this.isElementPresent(locator);
  }

  async isStartGameButtonEnabled() {
    try {
      const button = await this.findElement(this.startGameButton);
      const disabled = await button.getAttribute('disabled');
      return disabled === null || disabled === 'false';
    } catch (error) {
      return false;
    }
  }

  async isStartGameButtonVisible() {
    return await this.isElementPresent(this.startGameButton);
  }

  async sendChatMessage(message) {
    await this.type(this.chatInput, message);
    await this.click(this.sendButton);
    await this.sleep(200);
  }

  async getChatMessages() {
    const messages = await this.driver.findElements(
      By.xpath('//div[contains(@class, "MuiBox-root")]//span[contains(@class, "MuiTypography")]')
    );

    const messageTexts = [];
    for (const msg of messages) {
      const text = await msg.getText();
      if (text) {
        messageTexts.push(text);
      }
    }
    return messageTexts;
  }

  async isConnected() {
    try {
      const statusElement = await this.findElement(this.connectionStatus);
      const text = await statusElement.getText();
      return text.includes('Connected');
    } catch (error) {
      return false;
    }
  }

  async isGMBadgeVisible() {
    return await this.isElementPresent(this.gmBadge);
  }

  async isWaitingForGM() {
    return await this.isElementPresent(this.waitingMessage);
  }

  async leaveSession() {
    await this.click(this.leaveSessionButton);
    // Handle confirmation dialog if present
    await this.sleep(500);
  }

  async waitForPlayerToJoin(username, timeout = 10000) {
    const locator = By.xpath(`//span[contains(text(), "${username}")]`);
    try {
      await this.waitForElement(locator, timeout);
      return true;
    } catch (error) {
      return false;
    }
  }

  async waitForSystemMessage(message, timeout = 5000) {
    const locator = By.xpath(`//*[contains(text(), "${message}")]`);
    try {
      await this.waitForElement(locator, timeout);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSessionTitle() {
    return await this.getText(this.sessionTitle);
  }

  async getOnlinePlayersCount() {
    const onlineChips = await this.driver.findElements(
      By.xpath('//span[contains(@class, "MuiChip-label") and contains(text(), "Online")]')
    );
    return onlineChips.length;
  }

  async getOfflinePlayersCount() {
    const offlineChips = await this.driver.findElements(
      By.xpath('//span[contains(@class, "MuiChip-label") and contains(text(), "Offline")]')
    );
    return offlineChips.length;
  }
}

module.exports = SessionRoomPage;
