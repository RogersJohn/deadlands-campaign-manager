const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class SessionsPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.createSessionButton = By.xpath('//button[contains(text(), "Create Session")]');
    this.sessionNameInput = By.css('input[name="sessionName"], input[placeholder*="Session Name" i]');
    this.sessionDescInput = By.css('input[name="description"], textarea[name="description"]');
    this.maxPlayersInput = By.css('input[name="maxPlayers"], input[type="number"]');
    this.submitButton = By.xpath('//button[@type="submit" or contains(text(), "Create")]');

    this.sessionList = By.css('[data-testid="session-list"], .session-list');
    this.sessionCard = (sessionName) => By.xpath(`//div[contains(@class, "session") and contains(., "${sessionName}")]`);
    this.joinButton = (sessionName) => By.xpath(`//div[contains(., "${sessionName}")]//button[contains(text(), "Join")]`);
  }

  async navigate(baseUrl) {
    await this.visit(`${baseUrl}/sessions`);
  }

  async createSession(sessionName, description, maxPlayers) {
    await this.click(this.createSessionButton);
    await this.type(this.sessionNameInput, sessionName);
    await this.type(this.sessionDescInput, description);
    await this.type(this.maxPlayersInput, maxPlayers.toString());
    await this.click(this.submitButton);
    await this.sleep(1000); // Wait for session creation
  }

  async joinSession(sessionName, characterName) {
    await this.click(this.joinButton(sessionName));
    await this.sleep(1000); // Wait for session join
  }
}

module.exports = SessionsPage;
