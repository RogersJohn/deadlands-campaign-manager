const axios = require('axios');

const API_URL = 'https://deadlands-campaign-manager-production-053e.up.railway.app/api';

async function checkDatabase() {
  console.log('🔍 Checking Production Database Status...\n');

  // Try to login with known accounts
  const testAccounts = [
    { username: 'e2e_testgm', password: 'Test123!' },
    { username: 'e2e_player1', password: 'Test123!' },
    { username: 'e2e_player2', password: 'Test123!' },
  ];

  for (const account of testAccounts) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, account);
      console.log(`✅ ${account.username} exists and can login`);

      // Try to get user data
      const token = response.data.token;
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   User ID: ${userResponse.data.id}`);
      console.log(`   Role: ${userResponse.data.role}`);

    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`❌ ${account.username} login failed - wrong password or doesn't exist`);
      } else if (error.response?.status === 404) {
        console.log(`❌ ${account.username} not found in database`);
      } else {
        console.log(`❌ ${account.username} - Error: ${error.message}`);
      }
    }
  }

  // Try to register a test user to see if DB is writable
  console.log('\n🧪 Testing database write capability...');
  try {
    await axios.post(`${API_URL}/auth/register`, {
      username: 'db_test_' + Date.now(),
      password: 'Test123!',
      role: 'PLAYER'
    });
    console.log('✅ Database is writable - can create new users');
  } catch (error) {
    console.log(`❌ Database write failed: ${error.response?.data?.message || error.message}`);
  }
}

checkDatabase().catch(console.error);
