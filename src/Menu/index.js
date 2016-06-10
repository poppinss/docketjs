'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const Q = require('q')
const fsExtra = require('fs-extra')

class Menu {

  constructor (menuFile) {
    this.items = {}
    this.menuFile = menuFile
  }

  /**
   * adds a new child to the menu items
   *
   * @param {String} title
   * @param {String} permalink
   * @param {Array} [categories]
   * @param {Number} [weight]
   *
   * @public
   */
  addChild (title, permalink, categories, weight) {
    categories = categories || ['root']
    weight = weight || 0
    _.each(categories, (category) => {
      this.items[category] = this.items[category] || []
      this.items[category].push({title, permalink, weight})
    })
  }

  /**
   * loads a .json menu file from disk
   *
   * @param  {String} [fromPath]
   *
   * @return {Promise}
   *
   * @public
   */
  load (fromPath) {
    fromPath = fromPath || this.menuFile
    this.items = require(fromPath)
  }

  /**
   * writes the file menu tree as json to a file
   *
   * @return {Promise}
   *
   * @public
   */
  write () {
    return Q.nfcall(fsExtra.writeJson, this.menuFile, this.items, {spaces: 2})
  }

  /**
   * returns child for a given permalink
   *
   * @param  {String} permalink
   *
   * @return {Object|Undefined}
   *
   * @public
   */
  getChild (permalink) {
    return _(this.items)
      .map((childs) => _.find(childs, {permalink}))
      .compact()
      .first()
  }

  /**
   * returns a sorted tree of optionally filtered or
   * sorted categories
   *
   * @param  {Array} [categories]
   *
   * @return {Array}
   *
   * @public
   */
  tree (categories) {
    categories = categories || _.keys(this.items)
    return _.reduce(categories, (result, category) => {
      const childs = this.items[category]
      result[category] = _.sortBy(childs, (child) => child.weight)
      return result
    }, {})
  }

}

module.exports = Menu
