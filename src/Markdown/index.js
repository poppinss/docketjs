'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const marked = require('marked')
const toc = require('markdown-toc')
const meta = require('gray-matter')
const li = require('list-item')()
const _ = require('lodash')

class Markdown {

  constructor (markedOptions, tocOptions) {
    this.marked = marked.setOptions(markedOptions)
    this.tocOptions = _.merge({
      minDepth: 1,
      maxDepth: 6
    }, tocOptions)
  }

  /**
   * filters out headings based on min and max depth
   * and do not make them the part of toc
   *
   * @param   {Object} heading
   *
   * @return  {Boolean}
   *
   * @private
   */
  _filterHeadingsForToc (heading) {
    return heading.lvl >= this.tocOptions.minDepth && heading.lvl <= this.tocOptions.maxDepth
  }

  /**
   * makes the heading li for a given level
   *
   * @param   {Object} heading
   *
   * @return  {String}
   *
   * @private
   */
  _makeTocHeading (heading) {
    return `${li((heading.lvl - 1), toc.linkify(heading).content)}`
  }

  /**
   * generates toc from markdown by
   *
   * @param   {String} markdown
   *
   * @return  {String}
   *
   * @private
   */
  _getToc (markdown) {
    const generatedToc = toc(markdown, this.tocOptions)
    return _(generatedToc.json)
    .filter((heading) => this._filterHeadingsForToc(heading))
    .map((heading) => this._makeTocHeading(heading))
    .value().join('\n')
  }

  /**
   * converts a markdown document to a html
   * with yaml front matter parser and
   * toc
   *
   * @param  {String} contents
   *
   * @return {Object}
   *
   * @public
   */
  convert (contents) {
    contents = contents.trim()
    const parsedDoc = meta(contents)
    const markdown = parsedDoc.content.replace(/{{\s*TOC\s*}}/, this._getToc(parsedDoc.content))
    const html = this.marked(markdown)
    return {html, meta: parsedDoc.data}
  }

}

module.exports = Markdown
