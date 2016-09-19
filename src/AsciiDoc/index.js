'use strict'

/*
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const asciidoctor = require('asciidoctor.js')()
const matter = require('gray-matter')
const opal = asciidoctor.Opal
const processor = asciidoctor.Asciidoctor(true)

class AsciiDoc {

  constructor (attributes) {
    attributes = attributes || ['icon=font', 'skip-front-matter', 'sectlinks', 'sectanchors', 'toc=macro']
    this.options = opal.hash({doctype: 'article', attributes})
  }

  /**
   * Converts an ascii doc to HTML.
   *
   * @param  {String} content
   *
   * @return {Object}
   */
  convert (content) {
    const doc = processor.$load(content, this.options)
    const frontMatter = doc.$attr('front-matter')
    const meta = typeof (frontMatter) === 'string' ? matter(`---\n${frontMatter}\n---`) : {}
    if (!meta.title) {
      meta.title = doc.$attr('doctitle')
    }
    return {meta: meta.data, html: doc.$content()}
  }

}

module.exports = AsciiDoc
