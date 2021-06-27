const path = require('path')
const { merge } = require('webpack-merge')
const LiveReloadPlugin = require('webpack-livereload-plugin')
const UserScriptMetaDataPlugin = require('userscript-metadata-webpack-plugin')

const userScriptDirs = require('./userScriptDirs.cjs')
const webpackConfig = require('./webpack.config.base.cjs')

const cfg = userScriptDirs.map(script => {
  const metadata = require(`../src/${script}/metadata.cjs`)
  const prodPath = `../dist/${script}/index.prod.user.js`
  metadata.require.push(`file://${path.resolve(__dirname, prodPath)}`)
  metadata.name += ' - DEV'
  return merge(webpackConfig, {
    entry: {
      prod: `./src/${script}/index.ts`,
      dev: path.resolve(__dirname, './empty.cjs'),
    },
    output: {
      filename: `index.[name].user.js`,
      path: path.resolve(__dirname, `../dist/${script}`),
    },
    devtool: 'inline-source-map',
    watch: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    plugins: [
      new LiveReloadPlugin({
        delay: 500,
      }),
      new UserScriptMetaDataPlugin({
        metadata
      }),
    ],
  })
})

module.exports = cfg
