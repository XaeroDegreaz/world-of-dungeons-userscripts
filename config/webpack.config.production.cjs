const path = require('path')
const { merge } = require('webpack-merge')
const UserScriptMetaDataPlugin = require('userscript-metadata-webpack-plugin')

const userScriptDirs = require('./userScriptDirs.cjs')
const webpackConfig = require('./webpack.config.base.cjs')

const cfg = userScriptDirs.map(script => {
  const metadata = require(`../src/${script}/metadata.cjs`)
  return merge(webpackConfig, {
    mode: 'production',
    entry: `./src/${script}/index.ts`,
    output: {
      filename: `${script}.prod.user.js`,
      path: path.resolve(__dirname, '../release')
    },
    plugins: [
      new UserScriptMetaDataPlugin({
        metadata,
      }),
    ],
  })
})

module.exports = cfg
