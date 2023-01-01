const fs = require("fs");
const path = require("path");

function getFiles(dpath) {
  const commandFiles = fs.readdirSync(dpath, { withFileTypes: true });
  const files = [];

  for (const file of commandFiles) files.push(path.join(dpath, file.name));
  return files;
}

function getColor(hue) {
  const h = hue + 15 * Math.random();
  let s = 100;
  let l = 50 + 25 * Math.random();

  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function randomise(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function requireReload(name) {
  (moduleName => {
    const mp = require.resolve(moduleName);
    if (require.cache[mp]) delete require.cache[mp];
  })(name);
  return require(name);
}

module.exports = { getColor, getFiles, randomise, requireReload };
