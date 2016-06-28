'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const EventEmitter = require('events')
const Q = require('q')
const CatLog = require('cat-log')
const logger = new CatLog('docketjs')
const _ = require('lodash')

class DocketManager extends EventEmitter {

  constructor (reader, markdown, writer, menu) {
    super()
    this.reader = reader
    this.writer = writer
    this.markdown = markdown
    this.menu = menu
  }

  /**
   * converts a single markdown doc to HTML
   *
   * @param   {String} docPath
   * @param   {String} markdown
   *
   * @return  {Object}
   *
   * @private
   */
  _convertSingleDoc (docPath, markdown) {
    this.emit('converting', docPath, markdown)
    const doc = this.markdown.convert(markdown)
    this.emit('converted', docPath, doc)
    this._addMenuChild(doc.meta)
    return doc
  }

  /**
   * writes markdown doc meta data to the menu class, which can later
   * be writte to the disk
   *
   * @param   {Object} meta
   *
   * @private
   */
  _addMenuChild (meta) {
    if (this.menu && typeof (this.menu.addChild) === 'function') {
      this.menu.addChild(meta)
      return
    }
    logger.warn('Cannot write doc meta to menu file, since you have not injected the correct menu instance')
  }

  /**
   * writes all HTML files back to disk.
   *
   * @param   {Array} docs
   *
   * @return  {ArrayOfPromises}
   *
   * @private
   */
  _writeToDisk (docs) {
    return Q.all(_.map(docs, (doc) => {
      this.emit('writing', doc)
      return this.writer.writeDoc(`${doc.meta.permalink}.html`, doc.html)
    }))
  }

  /**
   * converts all markdown documents to html, writes them to
   * disk and build a super cool menu file.
   *
   * @return {Promise}
   */
  convert () {
    return new Promise((resolve, reject) => {
      this.reader
        .getDocs()
        .then((docs) => {
          const HTMLdocs = _.map(docs, (doc) => {
            return this._convertSingleDoc(doc.path, doc.contents)
          })
          return this._writeToDisk(HTMLdocs)
        })
        .then(() => this.menu.write())
        .then(resolve)
        .catch(reject)
    })
  }
}

module.exports = DocketManager
