/**
 * Manual Testing Launcher
 *
 * Launches 3 incognito Chrome browsers with auto-login:
 * 1. Game Master
 * 2. Player 1 (Arcane Huckster)
 * 3. Player 2 (Divine Blessed)
 *
 * Usage: node launch-test-scenario.js
 */

const puppeteer = require('puppeteer');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8080/api';

// Test accounts
const accounts = [
  {
    username: 'gamemaster',
    password: 'password',
    role: 'GAME_MASTER',
    displayName: 'GM',
    characterName: null // GM doesn't need a character
  },
  {
    username: 'testplayer1',
    password: 'password',
    role: 'PLAYER',
    displayName: 'Player 1',
    characterName: 'Arcane Huckster'
  },
  {
    username: 'testplayer2',
    password: 'password',
    role: 'PLAYER',
    displayName: 'Player 2',
    characterName: 'Divine Blessed'
  }
];

/**
 * Launch a browser and auto-login
 */
async function launchBrowser(account, index) {
  console.log(`\n[${account.displayName}] Launching browser...`);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--incognito',
      `--window-position=${index * 640},0`,
      '--window-size=640,900',
      '--disable-blink-features=AutomationControlled'
    ],
    defaultViewport: null
  });

  const page = await browser.newPage();

  try {
    // Navigate to login page
    console.log(`[${account.displayName}] Navigating to ${FRONTEND_URL}/login...`);
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0' });

    // Wait for login form
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });

    // Fill in login credentials
    console.log(`[${account.displayName}] Filling login form...`);
    await page.type('input[name="username"]', account.username, { delay: 50 });
    await page.type('input[name="password"]', account.password, { delay: 50 });

    // Click login button
    console.log(`[${account.displayName}] Clicking login button...`);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });

    console.log(`[${account.displayName}] ✅ Logged in successfully!`);

    // Navigate to appropriate page based on role
    if (account.role === 'GAME_MASTER') {
      console.log(`[${account.displayName}] Navigating to dashboard...`);
      await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    } else if (account.characterName) {
      console.log(`[${account.displayName}] Navigating to character selection...`);
      await page.goto(`${FRONTEND_URL}/character-select`, { waitUntil: 'networkidle0' });

      // Wait for character cards to load
      await page.waitForSelector('[role="radiogroup"]', { timeout: 10000 });

      // Try to find and select the character
      console.log(`[${account.displayName}] Looking for character: ${account.characterName}...`);

      // Wait a bit for cards to fully render
      await page.waitForTimeout(1000);

      // Find all character cards
      const characterCards = await page.$$('[role="radio"]');
      let foundCharacter = false;

      for (const card of characterCards) {
        const cardText = await card.evaluate(el => el.textContent);
        if (cardText.includes(account.characterName)) {
          console.log(`[${account.displayName}] Found character, clicking...`);
          await card.click();
          foundCharacter = true;

          // Wait for select button to be enabled
          await page.waitForTimeout(500);

          // Click the "Select Character" button
          const selectButton = await page.$('button:not([disabled])');
          if (selectButton) {
            const buttonText = await selectButton.evaluate(el => el.textContent);
            if (buttonText.includes('Select')) {
              console.log(`[${account.displayName}] Clicking Select Character button...`);
              await selectButton.click();
              await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
              console.log(`[${account.displayName}] ✅ Character selected!`);
            }
          }
          break;
        }
      }

      if (!foundCharacter) {
        console.log(`[${account.displayName}] ⚠️  Character "${account.characterName}" not found. You may need to run the setup SQL first.`);
      }
    }

    console.log(`[${account.displayName}] 🎮 Ready for testing!`);

  } catch (error) {
    console.error(`[${account.displayName}] ❌ Error:`, error.message);
    console.log(`[${account.displayName}] Browser left open for manual investigation.`);
  }

  // Keep browser open - don't close it
  console.log(`[${account.displayName}] Browser will stay open. Close manually when done testing.`);
}

/**
 * Main execution
 */
async function main() {
  console.log('========================================');
  console.log('  Deadlands Manual Testing Launcher');
  console.log('========================================');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`API URL: ${API_URL}`);
  console.log('');
  console.log('Launching 3 browsers...');
  console.log('- Browser 1: Game Master');
  console.log('- Browser 2: Player 1 (Arcane Huckster)');
  console.log('- Browser 3: Player 2 (Divine Blessed)');
  console.log('');
  console.log('⚠️  IMPORTANT: Make sure you have run the setup SQL first!');
  console.log('   Run: psql -U deadlands -d deadlands -f test/manual-testing/setup-test-characters.sql');
  console.log('');

  // Launch all browsers in parallel
  try {
    await Promise.all(
      accounts.map((account, index) => launchBrowser(account, index))
    );

    console.log('\n========================================');
    console.log('✅ All browsers launched successfully!');
    console.log('========================================');
    console.log('\nBrowsers will stay open for testing.');
    console.log('Close them manually when done.');
    console.log('\nPress Ctrl+C to exit this script (browsers will remain open).\n');

  } catch (error) {
    console.error('\n❌ Error launching browsers:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { launchBrowser };
