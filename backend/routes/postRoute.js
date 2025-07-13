const { Result, StatusEnum } = require('../utils/result');
const PostService = require('../services/postService');
const { publishAdMessage } = require('../services/messageService');
const jwtParser = require('../utils/jwtParser');
const rateLimiter = require('../utils/rateLimiter');
const ImageService = require('../services/imageService');
const { httpRequestDurationSeconds } = require('../utils/metrics');
const multer = require('multer');

const express = require('express');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/create',
  jwtParser.extractTokenUser,
  upload.single('image'),
  async (req, res) => {
    const start = process.hrtime();

    if (req.user === null) {
      const end = process.hrtime(start);
      const duration = end[0] + end[1] / 1e9;
      httpRequestDurationSeconds.labels(req.method, req.route.path, "401").observe(duration);
      return res.status(401).json({ message: 'Unauthorized' });
    }

		try {
			let path = null;

			if (req.file) {
				path = await ImageService.saveImage(req.file);
			}

			const post = {
				caption: req.body.caption,
				location: JSON.parse(req.body.location),
				username: req.user.username,
				imagePath: path,
				comments: [],
				likes: []
			};

			const result = await PostService.create(post);

      const end = process.hrtime(start);
      const duration = end[0] + end[1] / 1e9;
      httpRequestDurationSeconds.labels(req.method, req.route.path, result.status === StatusEnum.FAIL ? `${result.code}` : "201").observe(duration);

      if (result.status === StatusEnum.FAIL) {
        return res.status(result.code).json({ errors: result.errors });
      }

      res.status(201).json(new Result(StatusEnum.SUCCESS, result));
    } catch (error) {
      console.error("Error saving post:", error);

      const end = process.hrtime(start);
      const duration = end[0] + end[1] / 1e9;
      httpRequestDurationSeconds.labels(req.method, req.route.path, "500").observe(duration);

      res.status(500).json({ message: "Failed to create post" });
    }
  }
);

router.put('/update',
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const post = req.body;
		const username = req.user.username;

		const result = await PostService.updatePost(username, post.postId, post.caption);

		return res.status(result.code).json(result.data);
	});

router.put("/like",
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const post = req.body;
		const username = req.user.username;
		const result = await PostService.likePost(username, post.id);

		return res.status(result.code).json(result.data);
	});

router.delete("/delete",
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const postId = req.body.postId;
		const username = req.user.username;
		const role = req.user.role;


		const result = await PostService.deletePost(username, postId, role);

		return res.status(result.code).json(result.data);
	});

router.post('/comment/add',
	jwtParser.extractTokenUser,
	rateLimiter.rateLimit(60, 60 * 60 * 1000),
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		if (req.body.content === null || req.body.content === undefined) {
			return res.status(400).json({ message: "Content is required" });
		}

		const postId = req.body.postId;
		const username = req.user.username;
		const content = req.body.content;

		const result = await PostService.postComment(username, postId, content);

		return res.status(result.code).json(result.data);
	});

router.get('/guest-posts',
	async (req, res) => {
		const result = await PostService.findGuestPosts();
		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	});

router.get('/followed-posts',
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const username = req.user.username;

		const result = await PostService.findSortedPosts(username);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	});

router.get('/user/:username',
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const username = req.params.username;

		const result = await PostService.findPostsByUsername(username);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	});

router.put('/advertise',
	jwtParser.extractTokenUser,
	async (req, res) => {
		if (req.user === null) {
			return res.status(401).json({ message: 'Unauthorized. Authentication required.' });
		}
		if (req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden. Administrator role required.' });
		}
		
		const { postId } = req.body;
		if (!postId) {
			return res.status(400).json({ message: 'Bad Request. Post ID is required.' });
		}

		const result = await PostService.advertisePost(postId);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ message: result.errors.message });
		}
		
		try {
			const advertisedPost = result.data;
			const messagePayload = {
				description: advertisedPost.caption,
				createdAt: advertisedPost.createdAt,
				username: advertisedPost.username
			};
			
			await publishAdMessage(messagePayload);
			console.log(`[+] Successfully published ad message for post ID: ${postId}`);

		} catch (error) {

			console.error(`[!] Failed to publish ad message for post ID: ${postId}`, error);
		}

		return res.status(result.code).json(result.data);
	}
);

module.exports = router;