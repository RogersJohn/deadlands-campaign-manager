/**
 * Setup Test Accounts for Multiplayer Testing
 *
 * Creates:
 * - 1 Game Master account
 * - 2 Player accounts
 * - 2 Characters (one for each player)
 *
 * Run: node test/setup-test-accounts.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:8080';

const testAccounts = {
  gm: {
    username: 'testgm',
    email: 'testgm@test.com',
    password: 'testpassword',
  },
  player1: {
    username: 'testplayer1',
    email: 'testplayer1@test.com',
    password: 'testpassword',
  },
  player2: {
    username: 'testplayer2',
    email: 'testplayer2@test.com',
    password: 'testpassword',
  },
};

async function setupAccounts() {
  console.log('🚀 Setting up test accounts...\n');
  console.log(`API URL: ${API_URL}\n`);

  try {
    // 1. Register GM account
    console.log('1. Creating Game Master account...');
    try {
      await axios.post(`${API_URL}/auth/register`, testAccounts.gm);
      console.log(`   ✅ GM account created: ${testAccounts.gm.username}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.includes('already')) {
        console.log(`   ℹ️  GM account already exists: ${testAccounts.gm.username}`);
      } else {
        throw error;
      }
    }

    // 2. Register Player 1
    console.log('2. Creating Player 1 account...');
    try {
      await axios.post(`${API_URL}/auth/register`, testAccounts.player1);
      console.log(`   ✅ Player 1 account created: ${testAccounts.player1.username}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.includes('already')) {
        console.log(`   ℹ️  Player 1 account already exists: ${testAccounts.player1.username}`);
      } else {
        throw error;
      }
    }

    // 3. Register Player 2
    console.log('3. Creating Player 2 account...');
    try {
      await axios.post(`${API_URL}/auth/register`, testAccounts.player2);
      console.log(`   ✅ Player 2 account created: ${testAccounts.player2.username}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.includes('already')) {
        console.log(`   ℹ️  Player 2 account already exists: ${testAccounts.player2.username}`);
      } else {
        throw error;
      }
    }

    // 4. Login as Player 1 and create character
    console.log('4. Creating character for Player 1...');
    const player1Login = await axios.post(`${API_URL}/auth/login`, {
      username: testAccounts.player1.username,
      password: testAccounts.player1.password,
    });
    const player1Token = player1Login.data.token;

    try {
      const char1 = await axios.post(
        `${API_URL}/characters`,
        {
          name: 'Gunslinger Joe',
          agilityDie: 'd8',
          smartsDie: 'd6',
          spiritDie: 'd6',
          strengthDie: 'd6',
          vigorDie: 'd8',
          parry: 5,
          toughness: 6,
          pace: 6,
        },
        { headers: { Authorization: `Bearer ${player1Token}` } }
      );
      console.log(`   ✅ Character created: Gunslinger Joe (ID: ${char1.data.id})`);
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        console.log(`   ℹ️  Character may already exist for Player 1`);
      } else {
        throw error;
      }
    }

    // 5. Login as Player 2 and create character
    console.log('5. Creating character for Player 2...');
    const player2Login = await axios.post(`${API_URL}/auth/login`, {
      username: testAccounts.player2.username,
      password: testAccounts.player2.password,
    });
    const player2Token = player2Login.data.token;

    try {
      const char2 = await axios.post(
        `${API_URL}/characters`,
        {
          name: 'Sheriff Sarah',
          agilityDie: 'd6',
          smartsDie: 'd8',
          spiritDie: 'd8',
          strengthDie: 'd6',
          vigorDie: 'd6',
          parry: 4,
          toughness: 5,
          pace: 6,
        },
        { headers: { Authorization: `Bearer ${player2Token}` } }
      );
      console.log(`   ✅ Character created: Sheriff Sarah (ID: ${char2.data.id})`);
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        console.log(`   ℹ️  Character may already exist for Player 2`);
      } else {
        throw error;
      }
    }

    // 6. Display credentials
    console.log('\n' + '='.repeat(60));
    console.log('✅ Setup Complete!');
    console.log('='.repeat(60));
    console.log('\n📋 Test Account Credentials:\n');
    console.log('Game Master:');
    console.log(`  Username: ${testAccounts.gm.username}`);
    console.log(`  Password: ${testAccounts.gm.password}`);
    console.log(`  Role: GAME_MASTER (requires manual DB update)`);
    console.log('');
    console.log('Player 1:');
    console.log(`  Username: ${testAccounts.player1.username}`);
    console.log(`  Password: ${testAccounts.player1.password}`);
    console.log(`  Character: Gunslinger Joe`);
    console.log('');
    console.log('Player 2:');
    console.log(`  Username: ${testAccounts.player2.username}`);
    console.log(`  Password: ${testAccounts.player2.password}`);
    console.log(`  Character: Sheriff Sarah`);
    console.log('\n' + '='.repeat(60));
    console.log('\n⚠️  IMPORTANT: GM Role Assignment');
    console.log('='.repeat(60));
    console.log('\nThe GM account was created as PLAYER role (default).');
    console.log('To promote it to GAME_MASTER, run this SQL command:\n');
    console.log("UPDATE users SET role = 'GAME_MASTER' WHERE username = 'testgm';\n");
    console.log('Or use a database tool to manually update the role field.');
    console.log('='.repeat(60));
    console.log('\n🎮 Testing Instructions:');
    console.log('1. Open 3 browser windows/tabs');
    console.log('2. Window 1: Login as testgm → Create session');
    console.log('3. Window 2: Login as testplayer1 → Join session with Gunslinger Joe');
    console.log('4. Window 3: Login as testplayer2 → Join session with Sheriff Sarah');
    console.log('5. Move characters in any window → See movement in all windows!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.status, error.response.data);
    }
    process.exit(1);
  }
}

setupAccounts();
