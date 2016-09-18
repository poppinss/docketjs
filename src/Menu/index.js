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
   * @param {Object} child
   *
   * @note - A child is expected to have title and permalink
   *
   * @public
   */
  addChild (child) {
    child.categories = child.categories || ['root']
    child.weight = child.weight || 0
    _.each(child.categories, (category) => {
      this.items[category] = this.items[category] || []
      this.items[category].push(child)
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
    return Q.nfcall(fsExtra.outputJson, this.menuFile, this.items, {spaces: 2})
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
   * returns nearest child from a leaf or a fallback leaf
   * in a given direction
   *
   * @param   {Array} childs
   * @param   {String} permalink
   * @param   {Array} fallbackChilds
   * @param   {String} direction [prev, next]
   *
   * @return  {Object|Null}
   *
   * @private
   */
  _getNearestChild (childs, permalink, fallbackChilds, direction) {
    const childIndex = _.findIndex(childs, {permalink})
    if (childIndex < 0) {
      return null
    }
    if (direction === 'prev' && childIndex === 0) {
      return fallbackChilds ? _.last(fallbackChilds) : null
    }
    if (direction === 'next' && (childIndex + 1) === _.size(childs)) {
      return fallbackChilds ? _.first(fallbackChilds) : null
    }
    return direction === 'prev' ? childs[childIndex - 1] : childs[childIndex + 1]
  }

  /**
   * returns previous child for a given permalink
   *
   * @param  {Object} tree
   * @param  {String} permalink
   *
   * @return {Object}
   *
   * @public
   */
  getPreviousChild (tree, permalink) {
    const treeLeafs = _.keys(tree)
    return _(treeLeafs)
    .map((leaf, index) => {
      const childs = tree[leaf]
      const previousChilds = tree[treeLeafs[index - 1]]
      return this._getNearestChild(childs, permalink, previousChilds, 'prev')
    }).compact().first() || null
  }

  /**
   * returns next child for a given permalink
   *
   * @param  {Object} tree
   * @param  {String} permalink
   *
   * @return {Object}
   *
   * @public
   */
  getNextChild (tree, permalink) {
    const treeLeafs = _.keys(tree)
    return _(treeLeafs)
    .map((leaf, index) => {
      const childs = tree[leaf]
      const previousChilds = tree[treeLeafs[index + 1]]
      return this._getNearestChild(childs, permalink, previousChilds, 'next')
    }).compact().first() || null
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
