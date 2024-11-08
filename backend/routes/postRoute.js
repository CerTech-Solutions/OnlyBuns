const { Result, StatusEnum } = require('../utils/result');
const PostService = require('../services/postService');
const jwtParser = require('../utils/jwtParser');
const ImageService = require('../services/imageService');
const multer = require('multer');

const express = require('express');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/create',
  jwtParser.extractTokenUser,
  upload.single('image'),
  async (req, res) => {
    if (req.user === null) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      let path = null;

      if (req.file) {
        path = await ImageService.saveImage(req.file);
      }

      const post = {
        caption: req.body.caption,
        location: req.body.location,
        username: req.user.username,
        imagePath: path
      };

      const result = await PostService.create(post);

      if (result.status === StatusEnum.FAIL) {
        return res.status(result.code).json({ errors: result.errors });
      }

      res.status(201).json(new Result(StatusEnum.SUCCESS, result));
    } catch (error) {
      console.error("Error saving post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  }
);

router.get('/followed-posts/:username',
  jwtParser.extractTokenUser,
  async (req, res) => {
    if (req.user === null) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const paramUsername = req.params.username;
    const reqUser = req.user;

    if (paramUsername !== reqUser.username) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await PostService.findFollowedPosts(paramUsername);

    if (result.status === StatusEnum.FAIL) {
      return res.status(result.code).json({ errors: result.errors });
    }

    return res.status(result.code).json(result.data);
  });

module.exports = router;