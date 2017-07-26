const path = require('path')
const config = require('./base')
 
config.devServer = {
  host: 'localhost',
  port: '3001'
}
 
const index = path.resolve(__dirname, '../client/__tests__/index.js')
 
config.entry = {
  test: [`mocha!${index}`]
}
 
config.output.publicPath = 'http://localhost:3001/'
 
module.exports = config