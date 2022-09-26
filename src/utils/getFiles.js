const fs = require("fs");
const path = require("path");

function getFiles(dpath, suffix) {
	const commandFiles = fs.readdirSync(dpath, { withFileTypes: true });
  const files = [];

	for (const file of commandFiles) {
    try {
      if (file.isDirectory()) {
        files.push(...getFiles(path.join(dpath, file.name), suffix));
        continue;
      }

      if (file.name.endsWith(suffix)) files.push(path.join(dpath, file.name));
    } catch (error) {}
	}

  return files;
}

module.exports = getFiles;
