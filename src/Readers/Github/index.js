'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const shelljs = require('shelljs')
const FsReader = require('../FS')

class GithubReader {

  constructor (repo, branch, fromPath, docExtensions) {
    this.branch = branch || 'master'
    docExtensions = docExtensions || ['.md', '.adoc']
    /**
     * Temporary cloning the repo for reading content
     * recursively.
     */
    this.tmpPath = path.join(__dirname, '../../../tmp')
    this.fsReader = new FsReader(path.join(this.tmpPath, fromPath), docExtensions)
    this.cloneUrl = process.env.GH_TOKEN ? `https://${process.env.GH_TOKEN}@github.com/${repo}` : `https://github.com/${repo}`
  }

  /**
   * Clones repo to a temporary path
   *
   * @return  {Promise}
   *
   * @private
   */
  _cloneRepo () {
    return new Promise((resolve, reject) => {
      shelljs.exec(`git clone -b ${this.branch} --single-branch ${this.cloneUrl} ${this.tmpPath}`, (error) => {
        if (error) {
          return reject(error)
        }
        resolve()
      })
    })
  }

  /**
   * Removes the repo from the temporary path using
   * rm -rf command.
   *
   * @return  {Promise}
   *
   * @private
   */
  _removeClonedRepo () {
    return new Promise((resolve, reject) => {
      shelljs.exec(`rm -rf ${this.tmpPath}`, (error) => {
        if (error) {
          return reject(error)
        }
        resolve()
      })
    })
  }

  /**
   * Read docs by cloning a repo#branch to a temporary path and
   * then makes use of FsReader to recursively read the
   * contents and removes the cloned repo.
   *
   * @return {Array}
   */
  getDocs () {
    let _contents = []
    return new Promise((resolve, reject) => {
      this
        ._cloneRepo()
        .then(() => this.fsReader.getDocs())
        .then((contents) => {
          _contents = contents
          return this._removeClonedRepo()
        })
        .then(() => resolve(_contents))
        .catch(reject)
    })
  }

}

module.exports = GithubReader
