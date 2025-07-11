const axios = require('axios');
const assertEqual = require('assert').strictEqual;
const { Post } = require('../models');
const { time } = require('console');

describe('Simultaneous user registration', function () {
	it('should handle concurrent user registrations correctly', async function () {
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

describe('Simultaneous Likes', function () {
	it('should resolve conflicts when multiple users like the same post concurrently', async function () {
		const credentials = [
			{
				email: 'kule123@gmail.com',
				password: 'kule123'
			},
			{
				email: 'cico123@gmail.com',
				password: 'cico123'
			},
			{
				email: 'kico123@gmail.com',
				password: 'kico123'
			}
		];

		const postId = 5;

		const requests = Array.from({ length: 3 }, async (_, i) => {
			const token = await getToken(credentials[i]);
			const axiosInstance = createAxiosInstance(token);

			return axiosInstance.put('/api/post/like', { id: postId }, {
				withCredentials: true,
			});
		});

		await Promise.all(requests);

		const post = await Post.findByPk(postId);
		assertEqual(post.likes.length, 3);
	});
});

async function getToken(credentials) {
	const loginResponse = await axios.post('http://localhost:3000/api/user/login', credentials, {
		withCredentials: true,
	});

	const cookies = loginResponse.headers['set-cookie'];
	const tokenCookie = cookies.find((cookie) => cookie.startsWith('token='));
	const token = tokenCookie.split('=')[1].split(';')[0];

	return token;
}

function createAxiosInstance(token) {
	return axios.create({
		baseURL: 'http://localhost:3000',
		headers: {
			Cookie: `token=${token}`,
		},
		withCredentials: true,
	});
}
