const axios = require('axios');
const assertEqual = require('assert').strictEqual;

describe('Race Condition Test', function() {
  it('should handle concurrent user registrations correctly', async function() {
    const user = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
			address: '123 Main St',
    };

    const requests = Array(10).fill(axios.post('http://localhost:3000/api/user/register', user));

    const responses = await Promise.all(requests.map(p => p.catch(e => e.response)));

    console.log(responses);

    const successCount = responses.filter(res => res.status === 201).length;
    const conflictCount = responses.filter(res => res.status === 400).length;

    console.log(responses);
    console.log(successCount);
    console.log(conflictCount);

    assertEqual(successCount, 1);
    assertEqual(conflictCount, 9);
  });
});