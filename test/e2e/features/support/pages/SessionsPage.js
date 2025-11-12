const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class SessionsPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.createSessionButton = By.css('button:contains("Create Session"), button[aria-label="Create Session"]');
    this.sessionNameInput = By.css('input[name="name"], input[placeholder*="Session Name"]');
    this.sessionDescriptionInput = By.css('textarea[name="description"], textarea[placeholder*="Description"]');
    this.maxPlayersInput = By.css('input[name="maxPlayers"], input[type="number"]');
    this.submitButton = By.css('button[type="submit"]');
    this.sessionList = By.css('.session-list, [data-testid="session-list"]');
    this.joinButton = (sessionName) => By.xpath(`//div[contains(text(),'${sessionName}')]//ancestor::*//button[contains(text(),'Join')]`);
    this.characterSelect = By.css('select[name="character"], select[name="characterId"]');
    this.confirmJoinButton = By.css('button:contains("Join"), button:contains("Confirm")');
  }

  async navigate(baseUrl) {
    await this.visit(`${baseUrl}/sessions`);
  }

  async createSession(name, description, maxPlayers) {
    await this.click(this.createSessionButton);
    await this.sleep(500);

    await this.type(this.sessionNameInput, name);
    if (description) {
      await this.type(this.sessionDescriptionInput, description);
    }
    if (maxPlayers) {
      await this.type(this.maxPlayersInput, maxPlayers.toString());
    }

    await this.click(this.submitButton);
    await this.sleep(1000);
  }

  async joinSession(sessionName, characterName) {
    // Click join button for specific session
    await this.click(this.joinButton(sessionName));
    await this.sleep(500);

    // Select character
    if (characterName) {
      const selectElement = await this.findElement(this.characterSelect);
      await selectElement.sendKeys(characterName);
    }

    // Confirm join
    await this.click(this.confirmJoinButton);
    await this.sleep(1000);
  }

  async isSessionListed(sessionName) {
    const locator = By.xpath(`//div[contains(text(),'${sessionName}')]`);
    return await this.isElementPresent(locator);
  }

  async getSessionCount() {
    const sessions = await this.driver.findElements(By.css('.session-item, [data-testid="session-item"]'));
    return sessions.length;
  }
}

module.exports = SessionsPage;
