const axios = require('axios');
const assertEqual = require('assert').strictEqual;

describe('Race Condition Test', function() {
  it('should handle concurrent user registrations correctly', async function() {
    const user = {
      name: 'Test',
      surname: 'Testanovic',
      username: 'test123',
      password: 'test123',
      email: 'test123@gmail.com',
      address: {
          latitude: 0.0,
          longitude: 0.0
      }
    };

    const requests = Array.from({ length: 10 },
      () => axios.post('http://localhost:3000/api/user/register', user, 'user'));

    const responses = await Promise.all(requests.map(p => p.catch(e => e.response)));

    const successCount = responses.filter(res => res.status === 201).length;
    const conflictCount = responses.filter(res => res.status === 500).length;

    assertEqual(successCount, 1);
    assertEqual(conflictCount, 9);
  });
});

