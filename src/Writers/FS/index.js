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
const Q = require('q')
const path = require('path')

class FSWriter {

  constructor (basePath) {
    this.basePath = basePath
  }

	/**
	 * write a single file to a given path with its
	 * contents
	 *
	 * @param   {String} toPath
	 * @param   {String} contents
	 *
	 * @return  {Promise}
	 *
	 * @private
	 */
  writeDoc (toPath, contents) {
    const writeToPath = path.join(this.basePath, toPath)
    return Q.nfcall(fsExtra.outputFile, writeToPath, contents)
  }
}

module.exports = FSWriter
