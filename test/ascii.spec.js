'use strict'

/*
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const chai = require('chai')
const expect = chai.expect
const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
const AsciiDoc = require('../src/AsciiDoc')

describe('AsciiDoc', function () {
  it('should be able to parse ascii doc string to html', function () {
    const asciidoc = new AsciiDoc()
    const asciiFile = path.join(__dirname, './docs/abc.adoc')
    const doc = asciidoc.convert(fs.readFileSync(asciiFile, 'utf-8'))
    expect(doc).to.have.property('html')
    expect(doc).to.have.property('meta')
    expect(doc.meta.permalink).to.equal('hello-world')
    expect(doc.meta.title).to.equal('Hello World')
    expect(doc.html).to.be.a('string')
  })

  it('should be generate toc for the document', function () {
    const asciidoc = new AsciiDoc()
    const asciiFile = path.join(__dirname, './docs/abc.adoc')
    const doc = asciidoc.convert(fs.readFileSync(asciiFile, 'utf-8'))
    expect(doc).to.have.property('html')
    expect(doc).to.have.property('meta')
    const $ = cheerio.load(doc.html)
    expect($('#toctitle')).to.have.length(1)
  })
})
