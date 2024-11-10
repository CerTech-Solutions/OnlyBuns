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
        imagePath: path,
        comments: [],
        likes: []
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

router.put('/update',jwtParser.extractTokenUser, async (req, res) => {
  if (req.user === null) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const post = req.body;
  const username = req.user.username;

  const result = await PostService.updatePost(username, post.postId, post.caption);

  return res.status(result.code).json(result.data);
});



router.put("/like", jwtParser.extractTokenUser, async (req, res) => {
  if (req.user === null) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const post = req.body;

  const username = req.user.username;
  
  const result = await PostService.likePost(username, post.id, post.isLiked);


  return res.status(result.code).json(result.data);
}
);

router.delete("/delete", jwtParser.extractTokenUser, async (req, res) => {
  if (req.user === null) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const postId = req.body.postId;
  const username = req.user.username;

  const result = await PostService.deletePost(username,postId);

  return res.status(result.code).json(result.data);
}
);


router.post('/comment/add', jwtParser.extractTokenUser, async (req, res) => {
  if (req.user === null) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if(req.body.content === null || req.body.content === undefined){
    return res.status(400).json({message: "Content is required"});
  }

  const postId = req.body.postId;
  console.log("Testiranje" ,req.body);
  const username = req.user.username;
  const content = req.body.content;

  const result = await PostService.postComment(username, postId, content);

  return res.status(result.code).json(result.data);
});


router.get('/followed-posts',
  jwtParser.extractTokenUser,
  async (req, res) => {
    if (req.user === null) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

   const username = req.user.username; 


    // This is a security check to ensure that the user can only view their own posts
    //But anyways this code is not needed because we are getting the username from the token
    //So this is useless
    // if (paramUsername !== reqUser.username) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const result = await PostService.findFollowedPosts(username);

    if (result.status === StatusEnum.FAIL) {
      return res.status(result.code).json({ errors: result.errors });
    }
    
    return res.status(result.code).json(result.data);
  });
  
module.exports = router;