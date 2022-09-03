const fs = require("fs");

const getFiles = (dir, suffix) => {
  const files = fs.readdirSync(process.cwd() + dir, { withFileTypes: true });
  let commandFiles = [];

  for (const file of files) {
    if (file.isDirectory()) commandFiles = [
      ...commandFiles,
      ...getFiles(`${dir}/${file.name}`, suffix),
    ];
    
    else if (file.name.endsWith(suffix)) commandFiles.push(`..${dir.replace("\\", "/")}/${file.name}`);
  }
  return commandFiles;
};
module.exports = getFiles;
