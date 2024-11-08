const fs = require('fs');
const path = require('path');

class ImageService {
    saveImage(file) {
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
}

module.exports = new ImageService();