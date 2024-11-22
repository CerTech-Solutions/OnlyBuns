const fs = require('fs');
const path = require('path');
const jimp = require('jimp').default || require('jimp');

class ImageService {
	async saveImage(file) {
		return new Promise((resolve, reject) => {
			const timestamp = Date.now();
			const extension = path.extname(file.originalname);
			const filename = `${timestamp}${extension}`;

			const relativePath = path.join('uploads', filename);
			const absolutePath = path.join(__dirname, '..', relativePath);

			fs.mkdir(path.dirname(absolutePath), { recursive: true }, (err) => {
				if (err) return reject("Failed to create directory");

				fs.writeFile(absolutePath, file.buffer, (err) => {
					if (err) return reject("Failed to save file");

					resolve(relativePath);
				});
			});
		});
	}

	async getImage(filename) {
		let imagePath = path.join(__dirname, '..', 'uploads', filename);

		if (!fs.existsSync(imagePath)) {
			const parsedPath = path.parse(imagePath);
			imagePath = path.join(parsedPath.dir, `${parsedPath.name}_compressed${parsedPath.ext}`);
		}

    return imagePath
	}

	async compressOldImages() {
		const uploadsDir = path.join(__dirname, '..', 'uploads');
		const oneMonthAgo = Date.now() - process.env.COMPRESS_THRESHOLD;

		fs.readdir(uploadsDir, (err, files) => {
			if (err) {
				console.error("Error reading directory:", err);
				return;
			}

			files.forEach((file) => {
				const filePath = path.join(uploadsDir, file);

				if (file.includes('_compressed')) {
					return;
				}

				const fileStats = fs.statSync(filePath);

				if (fileStats.mtime.getTime() < oneMonthAgo) {
					fs.readFile(filePath, (err, buffer) => {
						if (err) {
							console.error(`Error reading file ${file}:`, err);
							return;
						}

						jimp.read(buffer)
							.then((image) => {
								const { name, ext } = path.parse(filePath);
								const compressedFilePath = path.join(uploadsDir, `${name}_compressed${ext}`);

								return image.quality(60).writeAsync(compressedFilePath);
							})
							.then(() => {
								fs.unlink(filePath, (err) => {
									if (err) {
										console.error(`Error deleting original file ${file}:`, err);
									} else {
										console.log(`Compressed and replaced image: ${file}`);
									}
								});
							})
							.catch((error) => {
								console.error(`Failed to compress image ${file}:`, error);
							});
					});
				}
			});
		});
	}
}

module.exports = new ImageService();