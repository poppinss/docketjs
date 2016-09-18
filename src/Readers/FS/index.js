'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const fsExtra = require('fs-extra')
const path = require('path')

class FS {

  constructor (fromPath, docsExtension) {
    this.docsExtension = docsExtension || ['.md', '.adoc']
    this.fromPath = fromPath
    this.docs = []
  }

  /**
   * push a file to the docs array only if is ends with .md
   *
   * @param   {String} file
   *
   * @private
   */
  _grabMarkdownFile (file) {
    if (file.stats.isFile() && this.docsExtension.includes(path.extname(file.path))) {
      this.docs.push({path: file.path, contents: fsExtra.readFileSync(file.path, 'utf-8')})
    }
  }

  /**
   * returns an array of docs paths
   *
   * @return {Promise}
   */
  getDocs () {
    return new Promise((resolve, reject) => {
      fsExtra
        .walk(this.fromPath)
        .on('data', (file) => this._grabMarkdownFile(file))
        .on('end', () => resolve(this.docs))
        .on('error', reject)
    })
  }

}

module.exports = FS
