'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const octonode = require('octonode')
const Q = require('q')
const _ = require('lodash')

class GithubReader {

  constructor (repo, branch, fromPath) {
    this.branch = branch
    this.fromPath = fromPath || ''
    this.repo = octonode.client(process.env.GH_TOKEN).repo(repo)
  }

  _readRemoteContents (fromPath, callback) {
    return new Promise((resolve, reject) => {
      this.repo.contents(fromPath, this.branch, (error, contents) => {
        if (error) { return reject(error) }
        resolve(callback(contents))
      })
    })
  }

  _getDocsTree () {
    return this._readRemoteContents(this.fromPath, (contents) => {
      return _(contents)
        .filter((item) => item.download_url && item.path.endsWith('.md'))
        .map((item) => item.path)
        .value()
    })
  }

  _getDocContent (fromPath) {
    return this._readRemoteContents(fromPath, (contents) => {
      return {path: fromPath, contents: new Buffer(contents.content, 'base64').toString('utf-8')}
    })
  }

  getDocs () {
    return new Promise((resolve, reject) => {
      this
        ._getDocsTree()
        .then((files) => {
          return Q.all(_.map(files, (file) => this._getDocContent(file)))
        })
        .then(resolve)
        .catch(reject)
    })
  }

}

module.exports = GithubReader
