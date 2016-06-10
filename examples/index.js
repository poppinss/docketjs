'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Docket = require('../index')
const path = require('path')
const reader = new Docket.FSReader(path.join(__dirname, 'docs/markdown'))
const menu = new Docket.Menu(path.join(__dirname, 'docs/menu.json'))
const writer = new Docket.FSWriter(path.join(__dirname, 'docs/html'))
const markdown = new Docket.Markdown({}, {maxDepth: 4})
const docket = new Docket.Manager(reader, markdown, writer, menu)

docket.on('converting', (docPath) => {
  console.log(`converting ${docPath}`)
})
docket.on('converted', (docPath) => {
  console.log(`converted ${docPath}`)
})
docket.on('writing', (doc) => {
  console.log(`writing ${doc.meta.permalink}`)
})

docket
  .convert()
  .then(() => {
    console.log('All went good')
  })
  .catch((error) => {
    console.log(error.stack)
  })
