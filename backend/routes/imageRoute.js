const ImageService = require('../services/imageService');

const express = require('express');
const router = express.Router();

router.get('/get/uploads/:filename', async (req, res) => {
	try {
		const filename = req.params.filename;
		const imagePath = await ImageService.getImage(filename); 
		res.sendFile(imagePath);
	} catch (error) {
		console.error("Error sending file:", error);
		res.status(500).send("Failed to load image");
	}
});

module.exports = router;