const { readdirSync } = require('fs')
const path = require('path')
const scriptDirs = readdirSync(path.resolve(__dirname, '../src/userscripts'), { withFileTypes: true })
  .filter(x => x.isDirectory())
  .map(x => x.name)
module.exports = scriptDirs
