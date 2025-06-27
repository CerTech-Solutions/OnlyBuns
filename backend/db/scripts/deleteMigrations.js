const fs = require('fs');
const path = require('path');

// Define the folder path
const folderPath = './db/migrations';

// Read the contents of the folder
fs.readdir(folderPath, (err, files) => {
	if (err) {
		return console.error('Unable to scan directory: ' + err);
	}

	// Filter the files to get only .js and .json files
	const filesToDelete = files.filter(file => file.endsWith('.js') || file.endsWith('.json'));

	// Loop through the filtered files and delete each one
	filesToDelete.forEach(file => {
		const filePath = path.join(folderPath, file);
		fs.unlink(filePath, err => {
			if (err) {
				console.error(`Error deleting file ${filePath}: ` + err);
			} else {
				console.log(`Deleted file: ${filePath}`);
			}
		});
	});
});